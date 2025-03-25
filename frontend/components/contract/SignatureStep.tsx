'use client'

import React from 'react'
import { Button, Spinner } from '@nextui-org/react'

interface SignatureStepProps {
  addSignature: () => Promise<void>;
  isAddingSignature: boolean;
  signatureStatus: string | null;
  signatureAdded: boolean;
}

const SignatureStep: React.FC<SignatureStepProps> = ({
  addSignature,
  isAddingSignature,
  signatureStatus,
  signatureAdded
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button 
        onClick={addSignature}
        disabled={isAddingSignature}
        className="bg-white/20 hover:bg-white/30 transition-all duration-200"
      >
        Add Signature
      </Button>

      {isAddingSignature && (
        <Spinner 
          color="success" 
          label="Adding signature..." 
          labelColor="success"
        />
      )}
      
      {signatureStatus && !isAddingSignature && (
        <div className="flex items-center gap-2">
          {signatureAdded && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <p className="text-center">{signatureStatus}</p>
        </div>
      )}
    </div>
  )
}

export default SignatureStep 