const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend/database.sqlite');

console.log('🔧 FIXING DATABASE SCHEMA');
console.log('==========================\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Could not connect to database:', err);
    process.exit(1);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
  }
});

// Check if image_path column exists
db.get("PRAGMA table_info(projects)", (err, rows) => {
  if (err) {
    console.error('❌ Error checking table schema:', err);
    return;
  }
  
  console.log('📋 Current projects table columns:');
  db.all("PRAGMA table_info(projects)", (err, columns) => {
    if (err) {
      console.error('❌ Error getting table info:', err);
      return;
    }
    
    columns.forEach(col => {
      console.log(`   - ${col.name} (${col.type})`);
    });
    
    // Check if image_path column exists
    const hasImagePath = columns.some(col => col.name === 'image_path');
    
    if (!hasImagePath) {
      console.log('\n🔧 Adding missing image_path column...');
      
      db.run("ALTER TABLE projects ADD COLUMN image_path TEXT", (err) => {
        if (err) {
          console.error('❌ Error adding image_path column:', err);
        } else {
          console.log('✅ Successfully added image_path column');
          
          // Verify the column was added
          db.all("PRAGMA table_info(projects)", (err, newColumns) => {
            if (err) {
              console.error('❌ Error verifying table schema:', err);
              return;
            }
            
            console.log('\n📋 Updated projects table columns:');
            newColumns.forEach(col => {
              console.log(`   - ${col.name} (${col.type})`);
            });
            
            console.log('\n✅ Database schema fix completed!');
            db.close();
          });
        }
      });
    } else {
      console.log('\n✅ image_path column already exists');
      console.log('✅ Database schema is correct');
      db.close();
    }
  });
});
