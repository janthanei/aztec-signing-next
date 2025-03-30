# aztec-signing

This guide walks you through setting up **aztec-signing**, covering installation of prerequisites, the Aztec Sandbox, and project components for both backend and frontend. Follow the steps below to get started.

## :package: Fetch the Repository

Clone the repository:
```bash
git clone [repository URL]
```

## :gear: Prerequisites

### :computer: Node.js
- **Version:** >= v18.xx.x and <= v20.17.x (lts/iron). Note that later versions (e.g. v22.9) may cause errors around 'assert'.
- **Recommendation:** Install using [nvm](https://github.com/nvm-sh/nvm).

### :whale: Docker
- **Installation:** Follow the instructions on the [Docker Docs](https://docs.docker.com/get-docker/) page.
- **Starting Docker:** Ensure Docker is running (open the Docker Desktop application) before proceeding with the sandbox installation.

## :construction_worker: Install the Sandbox

Run the following command in your terminal:
```bash
bash -i <(curl -s https://install.aztec.network)
```

During installation, you will see logs indicating:
- Sandbox version
- Contract addresses of rollup contracts
- PXE (private execution environment) setup logs
- Initial accounts shipped with the sandbox for testing

You'll know the sandbox is ready when you see a message like:
```
[INFO] Aztec Server listening on port 8080
```

## :label: Version Compatibility

**Important:** The **aztec-signing** package has been optimized for version **v0.57.0**. This is the last working version for this package; other versions of the sandbox do not guarantee that the app will work correctly.  
To specify the version, run:
```bash
VERSION=0.57.0 aztec-up
```

After running the above command, verify that your Docker images are running the correct version. To do this, run:
```bash
docker images
```
Ensure that the Aztec sandbox image(s) are tagged with **v0.57.0**. If they do not match, consider reinstalling or updating the Docker images.

## :rocket: Next Steps

After installing the sandbox, follow these steps:

1. **Start the Sandbox:**  
   ```bash
   aztec start --sandbox
   ```
2. **Compile the Noir Contract:**  
   Navigate to the `nor contract/signing` directory and run:
   ```bash
   aztec-nargo compile
   ```
3. **Start the Backend:**  
   ```bash
   node backend/deploy.mjs
   ```
4. **Start the Frontend:**  
   ```bash
   npm run dev
   ```
5. **Install Project Dependencies:**  
   In the project root directory, run:
   ```bash
   npm install
   ```

The services should now be accessible at:
- **Sandbox:** [http://localhost:8080](http://localhost:8080)
- **Backend/Frontend:** As configured (e.g., [http://localhost:9000](http://localhost:9000) if applicable)

---

By following these instructions, you'll have the **aztec-signing** project and its sandbox environment up and running.

## :handshake: Sharing and Importing Contracts

When working with private document signing contracts, you may need to share contracts with other users for signing. This section explains how to share contracts and how signers can import them.

### :outbox_tray: Exporting Contract Details

When you deploy a contract, the system outputs essential information that needs to be shared with signers:

```bash
Contract deployed at 0x123...abc  # Full contract address
Contract partial address 0x456...def
Contract init hash 0x789...ghi
Deployment salt 0x101...1a1
```

You need to share these details, along with the contract artifact (compiled contract), with your signers.

### :inbox_tray: Importing an Existing Contract

For signers to interact with your contract, they need to add it to their Private Execution Environment (PXE):

1. **Using the Aztec CLI:**
   ```bash
   aztec add-contract \
     --contract-artifact <path-to-contract-artifact> \
     --contract-address <contract-address> \
     --init-hash <init-hash> \
     --salt <salt>
   ```

2. **In a Web Application:**
   Currently, direct contract importing via aztec.js is not available, but you can:
   
   - Host the contract artifact file on your frontend server
   - Provide a UI for users to input the contract address, init hash, and salt
   - Use the backend to execute the `add-contract` command

### :test_tube: Testing with Multiple PXEs

To test contract sharing locally:

1. Start the sandbox without a PXE in one terminal:
   ```bash
   NO_PXE=true aztec start --sandbox
   ```
   This runs the sandbox on port `8080` without starting a PXE.

2. Start a PXE in another terminal:
   ```bash
   aztec start --port 8081 --pxe --pxe.nodeUrl=http://localhost:8080/
   ```
   This runs the first PXE on port `8081`, connected to the sandbox.

3. Start another PXE in a third terminal:
   ```bash
   aztec start --port 8082 --pxe --pxe.nodeUrl=http://localhost:8080/
   ```
   This runs the second PXE on port `8082`, also connected to the sandbox.

4. Deploy your contract using the first PXE (port 8081), then import it to the second PXE (port 8082) using the `add-contract` command.

This setup simulates different users interacting with the same contract on the same network.

### :soon: Future Improvements

The Aztec team is working on adding easier contract sharing capabilities via `wallet.getContractInstance()`. Once implemented, this will allow for seamless contract interaction across different users without manual importing.

For the latest updates on this feature, see: [GitHub Issue #10787](https://github.com/AztecProtocol/aztec-packages/issues/10787)
