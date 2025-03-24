import express from 'express';
import { getPxeConnection } from '../controllers/pxeController.js';
import { isPXEAvailable, PXE_URL } from '../utils/pxeClient.js';

const router = express.Router();

// PXE connection route
router.get('/pxe-connection', getPxeConnection);

// Simple PXE status check
router.get('/pxe-status', async (req, res) => {
  const available = await isPXEAvailable();
  res.json({
    available,
    url: PXE_URL,
    status: available ? 'online' : 'offline',
    message: available ? 'PXE server is running' : 'PXE server is not running or not accessible'
  });
});

export default router; 