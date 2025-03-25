'use client'

import React from 'react'
import { Button, Input, Spinner } from '@nextui-org/react'
import { Plus, Trash2 } from 'lucide-react'

interface SignersStepProps {
  signers: string[];
  updateSigner: (index: number, value: string) => void;
  addSigner: () => void;
  removeSigner: (index: number) => void;
  submitSigners: () => Promise<void>;
  isSubmittingSigners: boolean;
  submissionStatus: string | null;
  signersSubmitted: boolean;
}

const SignersStep: React.FC<SignersStepProps> = ({
  signers,
  updateSigner,
  addSigner,
  removeSigner,
  submitSigners,
  isSubmittingSigners,
  submissionStatus,
  signersSubmitted
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold mb-2">Add Signers</h2>
      
      <div className="flex flex-col gap-3">
        {signers.map((signer, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={signer}
              onChange={(e) => updateSigner(index, e.target.value)}
              placeholder={`Signer address ${index + 1}`}
              classNames={{
                input: "text-white",
                base: "flex-1",
                mainWrapper: "bg-transparent",
                innerWrapper: "bg-transparent",
                inputWrapper: [
                  "bg-white/10",
                  "border-1",
                  "border-white/20",
                  "hover:bg-white/20",
                  "hover:border-white/30",
                  "transition-all",
                  "duration-200"
                ].join(" ")
              }}
            />
            {index > 0 && (
              <Button 
                onClick={() => removeSigner(index)} 
                isIconOnly
                className="bg-white/20 hover:bg-red-500/50 transition-all duration-200 h-full aspect-square"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <Button 
            onClick={addSigner} 
            className="bg-green-500/20 hover:bg-green-500/40 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Signer
          </Button>
          <Button 
            onClick={submitSigners}
            disabled={signers.some(signer => !signer.trim()) || isSubmittingSigners}
            className="bg-white/20 hover:bg-white/30 transition-all duration-200"
          >
            Submit Signers
          </Button>
        </div>

        {isSubmittingSigners && (
          <Spinner 
            color="success" 
            label="Submitting signers..." 
            labelColor="success"
          />
        )}
        
        {submissionStatus && !isSubmittingSigners && (
          <div className="flex items-center gap-2">
            {signersSubmitted && (
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
            <p className="text-center">{submissionStatus}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SignersStep 