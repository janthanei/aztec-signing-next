/**
 * @file        contractDeployment.js
 * @description Contract deployment script for document signing application
 */

import { Contract, loadContractArtifact, createPXEClient, Fr, GrumpkinScalar } from '@aztec/aztec.js';
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { deriveSigningKey } from '@aztec/circuits.js';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import TokenContractJson from '../contracts/signing/target/document_signing-DocumentSigning.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PXE_URL = process.env.PXE_URL || 'http://localhost:8080';
const pxe = createPXEClient(PXE_URL);

async function deployContract(hashString) {
  try {
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
    console.log("Owner wallet obtained:", wallet);

    const ownerAddress = wallet.getCompleteAddress();
    const TokenContractArtifact = loadContractArtifact(TokenContractJson);
    
    const token = await Contract.deploy(wallet, TokenContractArtifact, [ownerAddress, 123])
      .send()
      .deployed();

    console.log(`Token deployed at ${token.address.toString()}`);

    const addresses = { token: token.address.toString() };
    await fs.writeFile('addresses.json', JSON.stringify(addresses, null, 2));

    return { token: token.address.toString() };
  } catch (err) {
    console.error(`Error in contract deployment: ${err}`);
    throw err;
  }
}

// If this script is run directly, print a message explaining how to use it instead of deploying
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`
=====================================================================
This is a contract deployment module for the document signing app.
It should not be run directly. Instead:
  npm run server
=====================================================================
  `);
}

export { deployContract }; 