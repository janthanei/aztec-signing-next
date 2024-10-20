const express = require('express');
const { createPXEClient } = require('@aztec/aztec.js');

const app = express();
const port = 3001; // Choose a port for your backend

const { PXE_URL = 'http://localhost:8080' } = process.env;

app.get('/api/pxe-connection', async (req, res) => {
  try {
    const pxe = createPXEClient(PXE_URL);
    const { l1ChainId } = await pxe.getNodeInfo();
    res.json({ message: `Connected to chain ${l1ChainId}` });
  } catch (error) {
    res.status(500).json({ error: `Error connecting to PXE: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});