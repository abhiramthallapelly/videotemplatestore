const express = require('express');
const db = require('../config/db');
const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const { authenticateToken } = require('../middleware/auth');

// Create a Stripe Checkout session for purchasing a project
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.user.userId;

    if (!projectId) return res.status(400).json({ message: 'projectId is required' });

    db.get('SELECT * FROM projects WHERE id = ?', [projectId], async (err, project) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (!project) return res.status(404).json({ message: 'Project not found' });
      if (project.is_free) return res.status(400).json({ message: 'This item is free' });

      // Create a pending purchase record
      db.run('INSERT INTO purchases (user_id, project_id, amount, payment_status) VALUES (?, ?, ?, ?)',
        [userId, projectId, project.price, 'pending'], function(insertErr) {
        if (insertErr) {
          console.error('Error creating purchase:', insertErr);
          return res.status(500).json({ message: 'Error creating purchase' });
        }

        const purchaseId = this.lastID;

        // If Stripe not configured, fallback to simulated immediate purchase
        if (!process.env.STRIPE_SECRET_KEY) {
          const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html`;
          db.run('UPDATE purchases SET payment_status = ?, stripe_payment_id = ? WHERE id = ?',
            ['completed', 'simulated_payment_' + Date.now(), purchaseId]);
          return res.json({ message: 'Simulated purchase completed', redirectUrl: returnUrl });
        }

        (async () => {
          try {
            const session = await stripe.checkout.sessions.create({
              payment_method_types: ['card'],
              mode: 'payment',
              line_items: [
                {
                  price_data: {
                    currency: 'usd',
                    product_data: { name: project.title },
                    unit_amount: Math.round((project.price || 0) * 100)
                  },
                  quantity: 1
                }
              ],
              success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/store.html?cancelled=1`,
              metadata: { purchaseId: String(purchaseId), userId: String(userId), projectId: String(projectId) }
            });

            // Save stripe session id to purchase
            db.run('UPDATE purchases SET stripe_session_id = ? WHERE id = ?', [session.id, purchaseId]);

            return res.json({ url: session.url });
          } catch (stripeErr) {
            console.error('Stripe session creation error:', stripeErr);
            return res.status(500).json({ message: 'Error creating checkout session' });
          }
        })();
      });
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Webhook endpoint to process Stripe events
router.post('/webhook', express.json(), async (req, res) => {
  try {
    const event = req.body;

    // Handle checkout completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const sessionId = session.id;

      db.get('SELECT * FROM purchases WHERE stripe_session_id = ?', [sessionId], (err, purchase) => {
        if (err) {
          console.error('Webhook DB error:', err);
          return res.status(500).end();
        }

        if (!purchase) {
          console.warn('No purchase found for stripe session:', sessionId);
          return res.status(200).end();
        }

        const paymentIntent = session.payment_intent || null;
        db.run('UPDATE purchases SET payment_status = ?, stripe_payment_id = ? WHERE id = ?',
          ['completed', paymentIntent, purchase.id], (updateErr) => {
          if (updateErr) console.error('Error updating purchase after webhook:', updateErr);
        });
      });
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).end();
  }
});

module.exports = router;
