const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const logger = require('./logger');

// Backup directory
const backupDir = path.join(__dirname, '../backups');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

/**
 * Create a backup of the database
 */
function createBackup() {
  return new Promise((resolve, reject) => {
    const dbPath = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `database-backup-${timestamp}.sqlite`);

    try {
      // Copy database file
      fs.copyFileSync(dbPath, backupPath);
      logger.info(`Database backup created: ${backupPath}`);
      
      // Clean up old backups (keep last 10)
      cleanupOldBackups();
      
      resolve(backupPath);
    } catch (error) {
      logger.error('Error creating database backup:', error);
      reject(error);
    }
  });
}

/**
 * Clean up old backups, keeping only the most recent ones
 */
function cleanupOldBackups(maxBackups = 10) {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('database-backup-') && file.endsWith('.sqlite'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Sort by time, newest first

    // Delete old backups
    if (files.length > maxBackups) {
      const filesToDelete = files.slice(maxBackups);
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        logger.info(`Deleted old backup: ${file.name}`);
      });
    }
  } catch (error) {
    logger.error('Error cleaning up old backups:', error);
  }
}

/**
 * Restore database from backup
 */
function restoreBackup(backupFileName) {
  return new Promise((resolve, reject) => {
    const dbPath = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');
    const backupPath = path.join(backupDir, backupFileName);

    if (!fs.existsSync(backupPath)) {
      return reject(new Error('Backup file not found'));
    }

    try {
      // Close current database connection
      db.close((err) => {
        if (err) {
          logger.error('Error closing database:', err);
        }

        // Copy backup to database location
        fs.copyFileSync(backupPath, dbPath);
        logger.info(`Database restored from: ${backupPath}`);

        resolve(backupPath);
      });
    } catch (error) {
      logger.error('Error restoring database backup:', error);
      reject(error);
    }
  });
}

/**
 * List all available backups
 */
function listBackups() {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('database-backup-') && file.endsWith('.sqlite'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.created - a.created);

    return files;
  } catch (error) {
    logger.error('Error listing backups:', error);
    return [];
  }
}

module.exports = {
  createBackup,
  restoreBackup,
  listBackups,
  cleanupOldBackups
};

