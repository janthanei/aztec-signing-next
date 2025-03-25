import { Contract, loadContractArtifact, Fr, GrumpkinScalar } from '@aztec/aztec.js';
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { deriveSigningKey } from '@aztec/circuits.js';
import { promises as fs } from 'fs';
import { pxe } from '../utils/pxeClient.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import TokenContractJson from '../../../signing-contract/target/document_signing-DocumentSigning.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let ownerWallet, ownerAddress, token, TokenContractArtifact;

const deployContract = async (hashString) => {
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

  return { token: token.address.toString() };
};

const addSigner = async (signer) => {
  const contract = await Contract.at(token.address, TokenContractArtifact, ownerWallet);
  console.log('contract: ', contract);
  await contract.methods.add_signer_final(signer.toLowerCase()).send().wait();
  return { success: true, message: 'Signer added successfully' };
};

const addSignature = async (currentAccount) => {
  const contract = await Contract.at(token.address, TokenContractArtifact, ownerWallet);
  await contract.methods.sign_doc(currentAccount).send().wait();
  return { success: true, message: 'Signature added successfully' };
};

const getSigners = async () => {
  // This function is currently returning an empty array as per the original code
  return { success: true, signers: [] };
};

const endSign = async () => {
  const contract = await Contract.at(token.address, TokenContractArtifact, ownerWallet);
  await contract.methods.end_sign().send().wait();
  return { success: true, message: 'Signing ended successfully' };
};

const createPxeClient = async () => {
  const { l1ChainId } = await pxe.getNodeInfo();
  const accounts = await pxe.getRegisteredAccounts();
  
  return {
    chainId: l1ChainId,
    accounts: accounts.map(a => a.address.toString()),
  };
};

export {
  deployContract,
  addSigner,
  addSignature,
  getSigners,
  endSign,
  createPxeClient
}; 