'use client'

import React from 'react'
import { Button, Input, Spinner, Card, CardBody, Tooltip, Chip } from '@nextui-org/react'
import { Plus, Trash2, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react'

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
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xl font-semibold">Add Document Signers</h2>
        <Chip color="primary" variant="flat" size="sm">
          {signers.length} {signers.length === 1 ? 'signer' : 'signers'}
        </Chip>
      </div>
      
      <Card className="border border-default-200">
        <CardBody className="p-4 gap-4">
          {signers.map((signer, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={signer}
                onChange={(e) => updateSigner(index, e.target.value)}
                placeholder={`Signer address ${index + 1}`}
                variant="bordered"
                color="primary"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">{index + 1}.</span>
                  </div>
                }
                className="flex-1"
              />
              {index > 0 && (
                <Button 
                  onClick={() => removeSigner(index)} 
                  isIconOnly
                  color="danger"
                  variant="light"
                  className="h-full aspect-square"
                >
                  <Trash2 size={18} />
                </Button>
              )}
            </div>
          ))}
          
          <div className="flex justify-center mt-2">
            <Button 
              onClick={addSigner} 
              color="success"
              variant="flat"
              startContent={<UserPlus size={18} />}
              className="mt-2"
            >
              Add Another Signer
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="flex flex-col items-center gap-4">
        <Button 
          onClick={submitSigners}
          isDisabled={signers.some(signer => !signer.trim()) || isSubmittingSigners}
          isLoading={isSubmittingSigners}
          color="primary"
          variant="shadow"
          size="lg"
          className="min-w-[200px]"
        >
          {isSubmittingSigners ? 'Submitting...' : 'Submit Signers'}
        </Button>
        
        {submissionStatus && !isSubmittingSigners && (
          <Card className={`w-full border ${signersSubmitted ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'}`}>
            <CardBody className="flex items-center gap-2 py-3">
              {signersSubmitted ? (
                <CheckCircle size={18} className="text-success flex-shrink-0" />
              ) : (
                <AlertTriangle size={18} className="text-danger flex-shrink-0" />
              )}
              <p className={`text-sm ${signersSubmitted ? 'text-success' : 'text-danger'}`}>
                {submissionStatus}
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}

export default SignersStep 