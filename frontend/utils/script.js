//global vars
let hashString;
document.addEventListener('click', function(e) {
    // Handle add button click
    if (e.target && e.target.classList.contains('addInputSigner')) {
        const container = document.getElementById('signerInputsContainer');
        const newInputGroup = document.createElement('div');
        newInputGroup.classList.add('input-group');
        newInputGroup.innerHTML = `
            <div class="nice-form-group">
            <input type="text" name="signerInput[]">
            </div>
            <div class="buttons">
            <button type="button" class="addInputSigner">+</button>
            <button type="button" class="removeInputSigner">-</button>
            </div>
        `;
        container.appendChild(newInputGroup);
        updateButtonVisibility();
    }
    
    // Handle remove button click
    if (e.target && e.target.classList.contains('removeInputSigner')) {
        const inputGroup = e.target.parentNode;
        inputGroup.parentNode.removeChild(inputGroup);
        updateButtonVisibility();
    }
});

// Function to update the visibility of remove buttons
function updateButtonVisibility() {
    const container = document.getElementById('signerInputsContainer');
    const allInputGroups = container.querySelectorAll('.input-group');
    const allRemoveButtons = container.querySelectorAll('.removeInputSigner');
    if (allInputGroups.length > 1) {
        // Show all "-" buttons when there are 2 or more input fields
        allRemoveButtons.forEach(button => button.style.display = 'inline-block');
    } else {
        // Hide all "-" buttons when there's only one input field
        allRemoveButtons.forEach(button => button.style.display = 'none');
    }
}

// Initial call to ensure correct button visibility on page load
document.addEventListener('DOMContentLoaded', updateButtonVisibility);


//DOM Elements
const circles = document.querySelectorAll(".circle"),
    progressBar = document.querySelector(".indicator"),
    buttons = document.querySelectorAll(".button");

const updateVisibility = () => {
    const connectWalletButton = document.getElementById("connectWallet");
    const step2Elements = document.querySelectorAll(
        "#pdfInput, #deployContract"
    );
    const step3Elements = document.querySelectorAll(
        "#signerInputsContainer, #addInputSigner, #removeInputSigner, #addSigner"
    );
    const step4Elements = document.querySelectorAll(
        "#addSignature"
    );

    // Hide everything first
    connectWalletButton.style.display = "none";
    step2Elements.forEach((el) => (el.style.display = "none"));
    step3Elements.forEach((el) => (el.style.display = "none"));
    step4Elements.forEach((el) => (el.style.display = "none"));

    // Then show based on the current step
    if (currentStep === 1) {
        connectWalletButton.style.display = "block";
    } else if (currentStep === 2) {
        step2Elements.forEach((el) => (el.style.display = "block"));
    } else if (currentStep === 3) {
        step3Elements.forEach((el) => (el.style.display = "block"));
    } else if (currentStep === 4) {
        step4Elements.forEach((el) => (el.style.display = "block"));
    }
    // Add similar conditions if there are specific elements to show in steps 3 and 4
};

let currentStep = 1;
updateVisibility();
// function that updates the current step and updates the DOM
const updateSteps = (e) => {
    // update current step based on the button clicked
    currentStep = e.target.id === "next" ? ++currentStep : --currentStep;
    // loop through all circles and add/remove "active" class based on their index and current step
    circles.forEach((circle, index) => {
        circle.classList[`${index < currentStep ? "add" : "remove"}`]("active");
    });
    // update progress bar width based on current step
    progressBar.style.width = `${
        ((currentStep - 1) / (circles.length - 1)) * 100
    }%`;
    // check if current step is last step or first step and disable corresponding buttons
    if (currentStep === circles.length) {
        buttons[1].disabled = true;
    } else if (currentStep === 1) {
        buttons[0].disabled = true;
    } else {
        buttons.forEach((button) => (button.disabled = false));
    }

    updateVisibility();
};
// add click event listeners to all buttons
buttons.forEach((button) => {
    button.addEventListener("click", updateSteps);
});

var currentAccount;
document.getElementById("connectWallet").addEventListener("click", (event) => {
    ethereum
        .request({
            method: "eth_requestAccounts",
        })
        .then((accounts) => {
            currentAccount = accounts[0];
            console.log(currentAccount);
            currentStep = 2; // Advance to step 2
            updateVisibility();

            // Optionally, if you want to ensure the progress bar and buttons are updated, 
        // you can directly manipulate them here as needed, similar to what updateSteps does.
        // For example:
        // Update the progress bar width and button states based on the new currentStep.
        progressBar.style.width = `${((currentStep - 1) / (circles.length - 1)) * 100}%`;
        circles.forEach((circle, index) => {
            circle.classList[index < currentStep ? "add" : "remove"]("active");
        });
        // Adjust button states if needed.
        buttons[0].disabled = currentStep === 1;
        buttons[1].disabled = currentStep === circles.length;
        })
        .catch((error) => {
            // Check for the specific error code indicating request is already in progress
            if (error.code === -32002) {
                // Inform the user that account request is already processing
                Swal.fire({
  title: 'Error!',
  text: 'Account request is already in progress. Check your Wallet Browser Extension!',
  icon: 'error',
  confirmButtonText: 'Ok'
})
            } else {
                // Handle other possible errors
                Swal.fire({
  title: 'Error!',
  text: `An error occurred: ${error.message}`,
  icon: 'error',
  confirmButtonText: 'Ok'
})
            }
        });
});
document
    .getElementById("pdfInput")
    .addEventListener("change", async function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async function (fileEvent) {
                // Make sure this function is async
                const binaryString = fileEvent.target.result;
                const wordArray = CryptoJS.lib.WordArray.create(
                    new Uint8Array(binaryString)
                );
                const hash = CryptoJS.SHA256(wordArray);
                hashString = "0x" + hash.toString(CryptoJS.enc.Hex);
                console.log("Hashed document:", hashString);
            };
            reader.readAsArrayBuffer(file);
        }
    });
document
    .getElementById("deployContract")
    .addEventListener("click", async () => {
        if(hashString != null) {
        const spinner = document.querySelector('.lds-ring'); // Assuming this is your spinner's class name
        spinner.style.display = 'inline-block'; // Show the spinner
        const response = await fetch("/deploy-contract", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                hashString,
            }),
        });
        spinner.style.display = 'none';
        if (response.ok) {
            const data = await response.json();
            alert("Contract deployed at: " + data.token);
        } else {
            alert("Failed to deploy contract.");
        }
    } else {
        alert("No pdf given!");
    }
    });
document.getElementById("addSigner").addEventListener("click", async () => {
    const signerInputs = document.querySelectorAll('#signerInputsContainer input[name="signerInput[]"]');
    const signers = Array.from(signerInputs).map(input => input.value.trim()).filter(value => value !== '');

    if (signers.length === 0) {
        alert("Please enter at least one signer address.");
        return;
    }

    const spinner = document.querySelector('.lds-ring');
    spinner.style.display = 'inline-block';

    console.log("Processing signers:", signers);
    for (const signer of signers) {
        console.log(`Starting process for signer: ${signer}`);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            console.log(`Sending request for signer: ${signer}`);
            const response = await fetch("/add-signer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ signer }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            console.log(`Received response for signer: ${signer}`);

            if (response.ok) {
                try {
                    const responseData = await response.json();
                    console.log(`Signer ${signer} added successfully:`, JSON.stringify(responseData, null, 2));
                } catch (jsonError) {
                    const textResponse = await response.text();
                    console.log(`Signer ${signer} added successfully. Response (text):`, textResponse);
                }
            } else {
                const errorText = await response.text();
                console.error(`Failed to add signer ${signer}. Status: ${response.status}, Response:`, errorText);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error(`Request for signer ${signer} timed out after 30 seconds`);
            } else {
                console.error(`Error processing signer ${signer}:`, error);
            }
        }
        console.log(`Finished processing signer: ${signer}`);
    }

    spinner.style.display = 'none';
    console.log("All signers processed");
    alert(`${signers.length} signer(s) processed`);

    // After processing signers, call getAndDisplaySigners to update the list
    await getAndDisplaySigners();
});

document.getElementById("addSignature").addEventListener("click", async () => {
    console.log("currentAccount:  " + currentAccount)
    const response = await fetch("/add-signature", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            currentAccount,
        }),
    });
    if (response.ok) {
        const data = await response.json();
        alert("Signature added");
    } else {
        alert("Failed to add signature.");
    }
});

// Add this function to your existing script.js file
async function getAndDisplaySigners() {
    const spinner = document.querySelector('.lds-ring');
    spinner.style.display = 'inline-block';

    try {
        const response = await fetch("/get-signers", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                console.log("Signers:", data.signers);
                displaySigners(data.signers);
            } else {
                console.error("Failed to get signers:", data.error);
                alert("Failed to get signers: " + data.error);
            }
        } else {
            console.error("Failed to get signers. Server response:", response.status);
            alert("Failed to get signers. Server error.");
        }
    } catch (error) {
        console.error("Error getting signers:", error);
        alert("Error getting signers: " + error.message);
    } finally {
        spinner.style.display = 'none';
    }
}

function displaySigners(signers) {
    const signersContainer = document.getElementById('signersContainer');
    signersContainer.innerHTML = '<h3>Signers:</h3>';
    if (signers.length === 0) {
        signersContainer.innerHTML += '<p>No signers found.</p>';
    } else {
        const ul = document.createElement('ul');
        signers.forEach((signer, index) => {
            const li = document.createElement('li');
            li.textContent = `Signer ${index + 1}: ${signer}`;
            ul.appendChild(li);
        });
        signersContainer.appendChild(ul);
    }
}

// Add this event listener for the new button
document.getElementById("getAllSigners").addEventListener("click", getAndDisplaySigners);

// Add this function to your existing script.js file
async function endSigning() {
    const spinner = document.querySelector('.lds-ring');
    spinner.style.display = 'inline-block';

    try {
        const response = await fetch("/end-sign", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        console.log("End signing response:", data);

        if (response.ok && data.success) {
            alert("Signing has been ended successfully.");
        } else {
            alert("Failed to end signing: " + (data.error || response.statusText));
        }
    } catch (error) {
        console.error("Error ending signing:", error);
        alert("Error ending signing: " + error.message);
    } finally {
        spinner.style.display = 'none';
    }
}

// Add this event listener for the new button
document.getElementById("endSign").addEventListener("click", endSigning);
