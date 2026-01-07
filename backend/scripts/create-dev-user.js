const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function createDevUser() {
  const username = 'testuser';
  const email = 'testuser@example.com';
  const password = 'Test1234';
  const fullName = 'Test User';

  const hashed = await bcrypt.hash(password, 10);

  db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
    if (err) {
      console.error('DB error checking user:', err);
      process.exit(1);
    }
    if (row) {
      console.log('Dev user already exists:', row.username || row.email);
      process.exit(0);
    }

    db.run('INSERT INTO users (username, email, password, full_name, is_verified, is_active) VALUES (?, ?, ?, ?, 1, 1)',
      [username, email, hashed, fullName], function(err) {
        if (err) {
          console.error('Error creating dev user:', err);
          process.exit(1);
        }
        console.log('Dev user created:');
        console.log('  username:', username);
        console.log('  email:   ', email);
        console.log('  password:', password);
        process.exit(0);
      }
    );
  });
}

createDevUser();
