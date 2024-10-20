// Check for MetaMask after reading the file and calculating the hash
                if (typeof window.ethereum !== "undefined") {
                    try {
                        // Ensure the signer code is inside this block so it waits for the file to be processed
                        const accounts = await ethereum.request({
                            method: "eth_requestAccounts",
                        });
                        const account = accounts[0];
                        const provider = new ethers.providers.Web3Provider(
                            window.ethereum
                        );
                        const signer = provider.getSigner(account);
                        // Add '0x' prefix to the hash string
                        const hexHash = `0x${hashString}`;
                        // Now you can arrayify it
                        const signature = await signer.signMessage(
                            ethers.utils.arrayify(hexHash)
                        );
                        console.log("Signature:", signature);
                    } catch (error) {
                        console.error("Error signing message:", error);
                    }
                } else {
                    console.log("MetaMask is not installed!");
                }