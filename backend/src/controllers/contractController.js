import * as contractService from '../services/contractService.js';
import allowCORS from '../utils/cors.js';

const deployContract = async (req, res) => {
  console.log("Entering /deploy-contract endpoint");
  console.log("Request body:", req.body);
  
  try {
    const { hashString } = req.body;
    const result = await contractService.deployContract(hashString);
    res.status(200).json(result);
  } catch (err) {
    console.error(`Error in contract deployment: ${err}`);
    res.status(500).json({ error: err.message });
  }
};

const addSigner = async (req, res) => {
  try {
    const { signer } = req.body;
    const result = await contractService.addSigner(signer);
    res.status(200).json(result);
  } catch (err) {
    console.error(`Error in add signer: ${err}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

const addSignature = async (req, res) => {
  try {
    const { currentAccount } = req.body;
    const result = await contractService.addSignature(currentAccount);
    res.status(200).json(result);
  } catch (err) {
    console.error(`Error in add signature: ${err}`);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const getSigners = async (req, res) => {
  try {
    const result = await contractService.getSigners();
    res.status(200).json(result);
  } catch (err) {
    console.error(`Error getting signers: ${err}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

const endSign = async (req, res) => {
  try {
    const result = await contractService.endSign();
    res.status(200).json(result);
  } catch (err) {
    console.error(`Error ending signing: ${err}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

const createPxeClient = async (req, res) => {
  allowCORS(res);
  try {
    const pxeInfo = await contractService.createPxeClient();
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(pxeInfo));
  } catch (err) {
    console.error(`Error creating PXE client: ${err}`);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ error: err.message }));
  }
};

export {
  deployContract,
  addSigner,
  addSignature,
  getSigners,
  endSign,
  createPxeClient
}; 