/**
 * @file        server.js
 * @description Main server file for initializing the Express application, setting up middleware, and defining routes.
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { isPXEAvailable, PXE_URL } from './src/utils/pxeClient.js';

// Import routes
import contractRoutes from './src/routes/contractRoutes.js';
import pxeRoutes from './src/routes/pxeRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json());

// Add this line to log all incoming requests
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  next();
});

// Routes - applied directly without /api prefix
app.use('/', pxeRoutes);
app.use('/', contractRoutes);

// Start server
const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  
  // Check PXE status on startup
  isPXEAvailable().then(available => {
    if (available) {
      console.log(`✅ PXE is running at ${PXE_URL}`);
    } else {
      console.log(`❌ PXE is not available at ${PXE_URL}. Please start the PXE server.`);
      console.log('   Run: aztec-cli --network localhost start');
    }
  });
});

export default app;