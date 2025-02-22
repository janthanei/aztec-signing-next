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
