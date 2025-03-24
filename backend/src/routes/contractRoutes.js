import express from 'express';
import * as contractController from '../controllers/contractController.js';

const router = express.Router();

// Contract deployment and interaction routes
router.post('/deploy-contract', contractController.deployContract);
router.post('/add-signer', contractController.addSigner);
router.post('/add-signature', contractController.addSignature);
router.get('/get-signers', contractController.getSigners);
router.post('/end-sign', contractController.endSign);
router.get('/create-pxe-client', contractController.createPxeClient);

export default router; 