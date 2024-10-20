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
        documentHash: SharedImmutable<Field, Context>, //currently MD5 hash
        //list with signers (in bytestream) and their respective hasSigned t/f
        //problem: bool is not nullable, so we have to use Field with 0(doesnt exist),1(not signed),2(signed)
        signers: Map<Field, PublicMutable<Field, Context>, Context>,
        signingEnded: PublicMutable<bool, Context>,
        active_at_block: SharedImmutable<u32, Context>, // when people can start signing
    }

    #[public] // annotation to mark function as private and expose private context
    #[initializer] // annotation to mark function as a constructor
    fn constructor(admin: AztecAddress, documentHash: Field) { // called when contract is deployed
        assert(!admin.is_zero(), "invalid admin");
        storage.admin.write(admin);
        storage.documentHash.initialize(documentHash);
        storage.signingEnded.write(false);
        storage.active_at_block.initialize(context.block_number() as u32);
    }

    #[private] // annotation to mark function as private and expose private context
    fn sign_doc(signer: str<130>) {
        //v056 changes
        let msg_sender_npk_m_hash = get_public_keys(context.msg_sender()).npk_m.hash();
        let secret = context.request_nsk_app(msg_sender_npk_m_hash); // get secret key of caller of function
        let nullifier = std::hash::pedersen_hash([context.msg_sender().to_field(), secret]); // derive nullifier from sender and secret

        let signer_s: CompressedString<5,130> = CompressedString::from_string(signer);
        context.push_nullifier(nullifier);
        DocumentSigning::at(context.this_address()).add_sign(signer_s.serialize()[0]).enqueue(&mut context);
    }
    
    #[public]
    #[internal]
    fn add_sign(signer: Field) {
        assert(storage.signingEnded.read() == false, "Signing has ended");
        
        let current_status = storage.signers.at(signer).read();
        assert(current_status != 0, "Given signer doesn't exist in signer list");
        
        if current_status == 1 {
            storage.signers.at(signer).write(2);
        } else if current_status == 2 {
            assert(false, "Signer has already signed the document");
        }
    }

    #[public]
    fn add_signer_final(signer: str<130>) {
        let signer_s: CompressedString<5,130> = CompressedString::from_string(signer);
        let signer_serialized = signer_s.serialize()[0];
        assert(storage.signers.at(signer_serialized).read() == 0, "Given signer already exists");
        storage.signers.at(signer_serialized).write(1);
    }

    #[public]
    fn add_signer(signer: str<130>) {
        // Call add_signer_final directly without using enqueue
        add_signer_final(signer);
    }

    unconstrained fn get_sign(signer: str<130>) -> pub Field {
        let signer_s: CompressedString<5,130> = CompressedString::from_string(signer);
        storage.signers.at(signer_s.serialize()[0]).read()
    }

    #[public] 
    fn end_sign() {
        assert(storage.admin.read().eq(context.msg_sender()), "Only admin can end signing"); // assert that caller is admin
        storage.signingEnded.write(true);
    }
}
