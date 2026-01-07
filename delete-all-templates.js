/**
 * Script to delete all templates/projects from the database and file system
 * Run with: node delete-all-templates.js
 */

const db = require('./backend/config/db');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  Delete All Templates');
console.log('========================================\n');

// First, get all projects to delete their files
db.all('SELECT id, file_path, image_path FROM projects', [], (err, projects) => {
  if (err) {
    console.error('Error fetching projects:', err);
    process.exit(1);
  }

  console.log(`Found ${projects.length} templates to delete.\n`);

  if (projects.length === 0) {
    console.log('No templates to delete.');
    process.exit(0);
  }

  // Delete files from filesystem
  let filesDeleted = 0;
  let filesNotFound = 0;

  projects.forEach(project => {
    // Delete main file
    if (project.file_path) {
      const filePath = path.join(__dirname, 'backend', 'uploads', project.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        filesDeleted++;
        console.log(`✓ Deleted file: ${project.file_path}`);
      } else {
        filesNotFound++;
        console.log(`⚠ File not found: ${project.file_path}`);
      }
    }

    // Delete image file
    if (project.image_path) {
      const imagePath = path.join(__dirname, 'backend', 'uploads', 'images', project.image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        filesDeleted++;
        console.log(`✓ Deleted image: ${project.image_path}`);
      } else {
        filesNotFound++;
        console.log(`⚠ Image not found: ${project.image_path}`);
      }
    }
  });

  console.log(`\nFiles deleted: ${filesDeleted}`);
  console.log(`Files not found: ${filesNotFound}\n`);

  // Delete all records from database
  db.run('DELETE FROM projects', [], function(err) {
    if (err) {
      console.error('Error deleting projects from database:', err);
      process.exit(1);
    }

    console.log(`✓ Deleted ${this.changes} template(s) from database.`);
    console.log('\n========================================');
    console.log('  All templates deleted successfully!');
    console.log('========================================\n');
    
    // Also clean up related tables
    db.run('DELETE FROM downloads', [], (err) => {
      if (err) console.error('Error cleaning downloads:', err);
      else console.log('✓ Cleaned download history.');
    });

    db.run('DELETE FROM purchases', [], (err) => {
      if (err) console.error('Error cleaning purchases:', err);
      else console.log('✓ Cleaned purchase history.');
      
      process.exit(0);
    });
  });
});

