use dep::aztec::macros::aztec;

#[aztec]
contract DocumentSigning {
    use dep::compressed_string::CompressedString;
    use dep::aztec::prelude::{
        AztecAddress, Map, PublicMutable, SharedImmutable
    };
    use dep::aztec::{
        keys::getters::get_public_keys,
        macros::{storage::storage, functions::{public, initializer, private, internal}}
    };
    use dep::aztec::oracle::debug_log::{ debug_log };

    #[storage]
    struct Storage<Context> {
        admin: PublicMutable<AztecAddress, Context>,
        documentHash: SharedImmutable<Field, Context>, // currently MD5 hash
        // list with signers (in bytestream) and their respective hasSigned t/f
        // problem: bool is not nullable, so we have to use Field with 0 (doesn't exist), 1 (not signed), 2 (signed)
        signers: Map<Field, PublicMutable<Field, Context>, Context>,
        signingEnded: PublicMutable<bool, Context>,
        active_at_block: SharedImmutable<u32, Context>, // when people can start signing
    }

    /// Constructs the DocumentSigning contract.
    /// 
    /// # Description
    /// Initializes the contract with an administrator, document hash, and sets the signing parameters.
    /// 
    /// # Preconditions
    /// - The provided admin address must not be zero.
    /// 
    /// # Parameters
    /// - `admin`: The AztecAddress representing the contract administrator.
    /// - `documentHash`: The Field representing the hash of the document to be signed.
    /// 
    /// # Postconditions
    /// - The admin is set, the document hash is initialized, signing is marked as not ended, and the active block is recorded.
    #[public]
    #[initializer]
    fn constructor(admin: AztecAddress, documentHash: Field) { // called when contract is deployed
        // Ensure the admin address is valid (non-zero)
        assert(!admin.is_zero(), "invalid admin");
        // Initialize contract storage variables
        storage.admin.write(admin);
        storage.documentHash.initialize(documentHash);
        storage.signingEnded.write(false);
        storage.active_at_block.initialize(context.block_number() as u32);
    }

    /// Performs the document signing operation by a signer.
    /// 
    /// # Description
    /// Retrieves the public key of the message sender and their secret key, calculates a nullifier,
    /// compresses the signer string, pushes the nullifier to prevent replay attacks, and enqueues the 
    /// signing update via the `add_sign` function.
    /// 
    /// # Parameters
    /// - `signer`: A string (maximum 130 characters) representing the signer's identifier.
    /// 
    /// # Side Effects
    /// - Enqueues the `add_sign` function call with the compressed signer value.
    #[private]
    fn sign_doc(signer: str<130>) {
        // Derive a hash from the public key of the message sender
        let msg_sender_npk_m_hash = get_public_keys(context.msg_sender()).npk_m.hash();
        // Retrieve the secret key for the caller to be used in nullifier generation
        let secret = context.request_nsk_app(msg_sender_npk_m_hash);
        // Compute the nullifier using a Pedersen hash of the message sender and the secret key
        let nullifier = std::hash::pedersen_hash([context.msg_sender().to_field(), secret]);
    
        // Compress the provided signer string for storage efficiency
        let signer_s: CompressedString<5,130> = CompressedString::from_string(signer);
        // Prevent replay attacks by pushing the computed nullifier
        context.push_nullifier(nullifier);
        // Enqueue the signing update by calling add_sign with the serialized compressed signer value
        DocumentSigning::at(context.this_address()).add_sign(signer_s.serialize()[0]).enqueue(&mut context);
    }
    
    /// Updates the signer's status to indicate that they have signed the document.
    /// 
    /// # Description
    /// Verifies that the signing process is still active and updates the signer's state from
    /// pending (1) to signed (2). An error is thrown if the signer has already signed.
    /// 
    /// # Preconditions
    /// - Signing must not have ended (i.e., `signingEnded` must be `false`).
    /// - The provided signer must exist in the signer list (current status is non-zero).
    /// 
    /// # Parameters
    /// - `signer`: A Field representing the compressed identifier of the signer.
    /// 
    /// # Postconditions
    /// - If the signer was in a pending state (1), it is updated to signed (2).
    /// - An error is thrown if the signer has already signed (state is 2).
    #[public]
    #[internal]
    fn add_sign(signer: Field) {
        // Ensure that signing is still active.
        assert(storage.signingEnded.read() == false, "Signing has ended");
    
        // Retrieve the current signing status for the signer.
        let current_status = storage.signers.at(signer).read();
        // Validate that the signer exists in the list (status non-zero means exists).
        assert(current_status != 0, "Given signer doesn't exist in signer list");
    
        // If the signer is pending (1), update status to signed (2).
        if current_status == 1 {
            storage.signers.at(signer).write(2);
        } else if current_status == 2 {
            // If already signed, throw an error.
            assert(false, "Signer has already signed the document");
        }
    }

    /// Adds a signer to the signer list with a pending status.
    /// 
    /// # Description
    /// Converts the provided signer string to a compressed field and adds the signer to the list
    /// with an initial signing status (1) if they do not already exist.
    /// 
    /// # Preconditions
    /// - The signer should not already exist in the signer list (initial status must be 0).
    /// 
    /// # Parameters
    /// - `signer`: A string (maximum 130 characters) representing the signer's identifier.
    /// 
    /// # Postconditions
    /// - The signer is added with a status indicating they are pending to sign.
    #[public]
    fn add_signer_final(signer: str<130>) {
        // Compress the signer string for efficient storage.
        let signer_s: CompressedString<5,130> = CompressedString::from_string(signer);
        let signer_serialized = signer_s.serialize()[0];
        // Ensure the signer does not already exist in the list (status 0 indicates non-existence).
        assert(storage.signers.at(signer_serialized).read() == 0, "Given signer already exists");
        // Write the pending signing status (1) for the new signer.
        storage.signers.at(signer_serialized).write(1);
    }

    /// Public interface to add a signer to the contract.
    /// 
    /// # Description
    /// Serves as a direct call to `add_signer_final` without enqueuing, simplifying the signer addition process.
    /// 
    /// # Parameters
    /// - `signer`: A string (maximum 130 characters) representing the signer's identifier.
    /// 
    /// # Postconditions
    /// - The signer is added to the signer list with a pending status if not already present.
    #[public]
    fn add_signer(signer: str<130>) {
        // Call add_signer_final directly to add the signer immediately.
        add_signer_final(signer);
    }

    /// Retrieves the signing status for a specific signer.
    /// 
    /// # Description
    /// Converts the input signer string to its compressed field representation and fetches the corresponding signing status.
    /// 
    /// # Parameters
    /// - `signer`: A string (maximum 130 characters) representing the signer's identifier.
    /// 
    /// # Returns
    /// - A Field value representing the signer's signing state:
    ///   - 0: Signer does not exist.
    ///   - 1: Signer is pending to sign.
    ///   - 2: Signer has already signed.
    unconstrained fn get_sign(signer: str<130>) -> pub Field {
        // Compress the signer string for lookup in the signer map.
        let signer_s: CompressedString<5,130> = CompressedString::from_string(signer);
        // Retrieve and return the signer's current status.
        storage.signers.at(signer_s.serialize()[0]).read()
    }

    /// Ends the signing process for the document.
    /// 
    /// # Description
    /// Validates that the caller is the admin and then marks the signing process as ended.
    /// 
    /// # Preconditions
    /// - The caller must be the designated admin.
    /// 
    /// # Postconditions
    /// - The signing process is updated to indicate that it has ended.
    #[public] 
    fn end_sign() {
        // Verify that the message sender is the designated admin.
        assert(storage.admin.read().eq(context.msg_sender()), "Only admin can end signing");
        // Additional validations (e.g., ensuring all signers have signed) can be added here if needed.
        // Mark the signing process as ended.
        storage.signingEnded.write(true);
    }
}