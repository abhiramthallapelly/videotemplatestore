const express = require('express');
const { createBackup, restoreBackup, listBackups } = require('../utils/dbBackup');
const verifyAdmin = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const router = express.Router();

// Create database backup (admin only)
router.post('/create', verifyAdmin, asyncHandler(async (req, res) => {
  const backupPath = await createBackup();
  res.json({
    success: true,
    message: 'Backup created successfully',
    backupPath: backupPath
  });
}));

// List all backups (admin only)
router.get('/list', verifyAdmin, asyncHandler(async (req, res) => {
  const backups = listBackups();
  res.json({
    success: true,
    backups: backups
  });
}));

// Restore from backup (admin only)
router.post('/restore/:filename', verifyAdmin, asyncHandler(async (req, res) => {
  const { filename } = req.params;
  await restoreBackup(filename);
  res.json({
    success: true,
    message: 'Database restored successfully. Please restart the server.'
  });
}));

module.exports = router;

