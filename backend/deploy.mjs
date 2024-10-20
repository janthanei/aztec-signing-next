/**
 * @file        app.js
 * @description Main server file for initializing the Express application, setting up middleware, and defining routes for document signing and contract interactions.
 * 
 * @version     0.0.1
 * 
 * @license     Licensed under the MIT License (or your chosen license)
 * @copyright   Copyright (c) 2024, YourCompanyName
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Contract, loadContractArtifact, createPXEClient, Fr, GrumpkinScalar } from '@aztec/aztec.js';
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { deriveSigningKey } from '@aztec/circuits.js';
import fs from 'fs/promises';

import TokenContractJson from '../contracts/signing/target/document_signing-DocumentSigning.json' assert { type: 'json' };

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json());

// Add this line to log all incoming requests
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  next();
});

const PXE_URL = process.env.PXE_URL || 'http://localhost:8080';
const pxe = createPXEClient(PXE_URL);

let ownerWallet, ownerAddress, token, TokenContractArtifact;

const allowCORS = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// Routes
app.post('/deploy-contract', async (req, res) => {
  console.log("Entering /deploy-contract endpoint");
  console.log("Request body:", req.body);
  
  try {
    const { hashString } = req.body;
    if (!hashString) {
      throw new Error('hashString is required');
    }

    const numericValue = BigInt(hashString);
    console.log("Numeric value:", numericValue.toString());

    const { l1ChainId } = await pxe.getNodeInfo();
    console.log(`Connected to chain ${l1ChainId}`);
    const accounts = await pxe.getRegisteredAccounts();
    console.log(`User accounts:\n${accounts.map(a => a.address).join('\n')}`);

    const secretKey = Fr.random();
    const signingPrivateKey = GrumpkinScalar.random();
    let schnorrAccount = await getSchnorrAccount(pxe, secretKey, deriveSigningKey(secretKey));
    
    let tx = await schnorrAccount.deploy().wait();
    let wallet = await schnorrAccount.getWallet();
    ownerWallet = wallet;
    console.log("Owner wallet obtained:", ownerWallet);

    ownerAddress = ownerWallet.getCompleteAddress();
    TokenContractArtifact = loadContractArtifact(TokenContractJson);
    token = await Contract.deploy(ownerWallet, TokenContractArtifact, [ownerAddress, 123])
      .send()
      .deployed();

    console.log(`Token deployed at ${token.address.toString()}`);

    const addresses = { token: token.address.toString() };
    await fs.writeFile('addresses.json', JSON.stringify(addresses, null, 2));

    res.status(200).json({ token: token.address.toString() });
  } catch (err) {
    console.error(`Error in contract deployment: ${err}`);
    res.status(500).json({ error: err.message });
  }
});

app.post('/add-signer', async (req, res) => {
  try {
    const contract = await Contract.at(token.address, TokenContractArtifact, ownerWallet);
    console.log('contract: ', contract);
    const { signer } = req.body;
    const _tx = await contract.methods.add_signer_final(signer).send().wait();
    
    res.status(200).json({ success: true, message: 'Signer added successfully' });
  } catch (err) {
    console.error(`Error in add signer: ${err}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/add-signature', async (req, res) => {
  try {
    const contract = await Contract.at(token.address, TokenContractArtifact, ownerWallet);
    const { currentAccount } = req.body;
    const _tx = await contract.methods.sign_doc(currentAccount).send().wait();
    res.status(200).json({ success: true, message: 'Signature added successfully' });
  } catch (err) {
    console.error(`Error in add signature: ${err}`);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/get-signers', async (req, res) => {
  try {
    // Commented out as per original file
    /*const contract = await Contract.at(token.address, TokenContractArtifact, ownerWallet);
    const signersObject = await contract.methods.get_all_signers();
    
    console.log("Raw signers object:", signersObject);

    const signers = Object.values(signersObject).map((signer, index) => {
      console.log(`Signer ${index + 1}:`, signer);
      console.log(`Type of signer ${index + 1}:`, typeof signer);
      
      if (typeof signer === 'object' && signer !== null) {
        console.log(`Properties of signer ${index + 1}:`, Object.keys(signer));
        for (let key in signer) {
          console.log(`${key}:`, signer[key]);
        }
        return JSON.stringify(signer);
      } else if (typeof signer === 'function') {
        return 'Function (invalid signer)';
      } else {
        return signer.toString();
      }
    });
    
    console.log("Processed signers:", signers);

    res.status(200).json({ success: true, signers });*/
    res.status(200).json({ success: true, signers: [] });
  } catch (err) {
    console.error(`Error getting signers: ${err}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/end-sign', async (req, res) => {
  try {
    const contract = await Contract.at(token.address, TokenContractArtifact, ownerWallet);
    await contract.methods.end_sign().send().wait();
    
    res.status(200).json({ success: true, message: 'Signing ended successfully' });
  } catch (err) {
    console.error(`Error ending signing: ${err}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/create-pxe-client', async (req, res) => {
  allowCORS(res);
  try {
    const { l1ChainId } = await pxe.getNodeInfo();
    const accounts = await pxe.getRegisteredAccounts();
    
    const pxeInfo = {
      chainId: l1ChainId,
      accounts: accounts.map(a => a.address.toString()),
    };

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(pxeInfo));
  } catch (err) {
    console.error(`Error creating PXE client: ${err}`);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ error: err.message }));
  }
});

// Start server
const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
