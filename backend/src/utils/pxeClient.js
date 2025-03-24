import { createPXEClient } from '@aztec/aztec.js';

const PXE_URL = process.env.PXE_URL || 'http://localhost:8080';
const pxe = createPXEClient(PXE_URL);

/**
 * Check if the PXE server is available
 * @returns {Promise<boolean>} true if available, false otherwise
 */
async function isPXEAvailable() {
  try {
    await pxe.getNodeInfo();
    return true;
  } catch (error) {
    console.log(`PXE not available at ${PXE_URL}: ${error.message}`);
    return false;
  }
}

export { pxe, PXE_URL, isPXEAvailable }; 