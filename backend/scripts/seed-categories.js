const { connectDB } = require('../config/mongodb');
const Category = require('../models/Category');

// Default categories
const defaultCategories = [
  { name: 'Video Templates', description: 'Premiere Pro, After Effects, and video editing templates', icon: '🎬' },
  { name: 'Project Files', description: 'Complete project files for various editing software', icon: '📁' },
  { name: 'Fonts', description: 'Typography and font collections', icon: '🔤' },
  { name: 'Effects', description: 'Video effects, transitions, and presets', icon: '✨' },
  { name: 'Graphics', description: 'Logos, overlays, and graphic elements', icon: '🎨' }
];

async function seedCategories() {
  try {
    await connectDB();
    
    console.log('🌱 Seeding default categories...');
    
    for (const category of defaultCategories) {
      await Category.findOneAndUpdate(
        { name: category.name },
        category,
        { upsert: true, new: true }
      );
      console.log(`✅ Category "${category.name}" ready`);
    }
    
    console.log('✅ All categories seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();

