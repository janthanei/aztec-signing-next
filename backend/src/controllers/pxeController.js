import { pxe, isPXEAvailable } from '../utils/pxeClient.js';

const getPxeConnection = async (req, res) => {
  try {
    // First check if PXE is available
    const available = await isPXEAvailable();
    
    if (!available) {
      return res.status(503).json({ 
        error: 'PXE server not available', 
        message: 'PXE server is not available at the configured URL. Please make sure it is running.' 
      });
    }
    
    // If available, get chain info
    const { l1ChainId } = await pxe.getNodeInfo();
    res.json({ message: `Connected to chain ${l1ChainId}` });
  } catch (error) {
    console.error("Error in PXE connection:", error);
    res.status(500).json({ error: `Error connecting to PXE: ${error.message}` });
  }
};

export { getPxeConnection }; 