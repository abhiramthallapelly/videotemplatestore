const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'backend/database.sqlite');

console.log('🔍 DEBUGGING STORE DATABASE ISSUE');
console.log('==================================\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Could not connect to database:', err);
    process.exit(1);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
  }
});

// Check projects table schema
console.log('1. Checking projects table schema...');
db.all("PRAGMA table_info(projects)", (err, columns) => {
  if (err) {
    console.error('❌ Error getting projects table info:', err);
    return;
  }
  
  console.log('   📋 Projects table columns:');
  columns.forEach(col => {
    console.log(`      - ${col.name} (${col.type})`);
  });
  
  // Check if category column exists
  const hasCategory = columns.some(col => col.name === 'category');
  console.log(`   📝 Has category column: ${hasCategory ? 'Yes' : 'No'}`);
  
  // Check categories table
  console.log('\n2. Checking categories table...');
  db.all("PRAGMA table_info(categories)", (err, catColumns) => {
    if (err) {
      console.error('❌ Error getting categories table info:', err);
      return;
    }
    
    console.log('   📋 Categories table columns:');
    catColumns.forEach(col => {
      console.log(`      - ${col.name} (${col.type})`);
    });
    
    // Check if categories table has data
    console.log('\n3. Checking categories data...');
    db.all("SELECT * FROM categories", (err, categories) => {
      if (err) {
        console.error('❌ Error getting categories:', err);
        return;
      }
      
      console.log(`   📝 Number of categories: ${categories.length}`);
      categories.forEach(cat => {
        console.log(`      - ${cat.icon} ${cat.name}`);
      });
      
      // Check projects data
      console.log('\n4. Checking projects data...');
      db.all("SELECT id, title, category, is_free, price FROM projects LIMIT 5", (err, projects) => {
        if (err) {
          console.error('❌ Error getting projects:', err);
          return;
        }
        
        console.log(`   📝 Number of projects: ${projects.length}`);
        projects.forEach(project => {
          console.log(`      - ID: ${project.id}, Title: ${project.title}, Category: ${project.category || 'None'}`);
        });
        
        // Test the problematic query
        console.log('\n5. Testing store query...');
        const query = `
          SELECT p.*, c.name as category_name, c.icon as category_icon 
          FROM projects p 
          LEFT JOIN categories c ON p.category = c.name 
          ORDER BY p.created_at DESC
        `;
        
        db.all(query, (err, results) => {
          if (err) {
            console.error('❌ Store query error:', err);
            console.log('   🔍 This is the issue! The query is failing.');
            
            // Try a simpler query
            console.log('\n6. Testing simpler query...');
            db.all("SELECT * FROM projects ORDER BY created_at DESC", (err, simpleResults) => {
              if (err) {
                console.error('❌ Simple query also failed:', err);
              } else {
                console.log('   ✅ Simple query works!');
                console.log(`   📝 Found ${simpleResults.length} projects`);
                
                // The issue is likely with the JOIN or missing category column
                console.log('\n🔧 FIXING THE ISSUE...');
                
                // Check if we need to add category column to projects
                if (!hasCategory) {
                  console.log('   Adding category column to projects table...');
                  db.run("ALTER TABLE projects ADD COLUMN category TEXT DEFAULT 'template'", (err) => {
                    if (err) {
                      console.error('❌ Error adding category column:', err);
                    } else {
                      console.log('   ✅ Category column added successfully');
                      
                      // Update existing projects with default category
                      db.run("UPDATE projects SET category = 'template' WHERE category IS NULL", (err) => {
                        if (err) {
                          console.error('❌ Error updating projects:', err);
                        } else {
                          console.log('   ✅ Updated existing projects with default category');
                        }
                      });
                    }
                  });
                }
              }
            });
          } else {
            console.log('   ✅ Store query works!');
            console.log(`   📝 Found ${results.length} items`);
          }
        });
      });
    });
  });
});

// Close database after a delay
setTimeout(() => {
  db.close();
  console.log('\n================================');
  console.log('📊 DATABASE DEBUG COMPLETED');
  console.log('================================');
}, 3000);
