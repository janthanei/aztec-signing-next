'use client'

import React from 'react'
import { Button, Spinner, Card, CardBody } from '@nextui-org/react'
import { PenTool, CheckCircle, AlertTriangle } from 'lucide-react'

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
    <div className="flex flex-col items-center gap-6 w-full max-w-xl">
      <Card className="w-full border border-default-200">
        <CardBody className="p-6 flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-primary/10 mb-2">
            <PenTool size={40} className="text-primary" />
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Sign Document</h3>
            <p className="text-default-500 text-sm mb-6">
              Add your signature to the document to verify your approval. This action 
              cannot be reversed.
            </p>
          </div>
          
          <Button 
            onClick={addSignature}
            isDisabled={isAddingSignature || signatureAdded}
            isLoading={isAddingSignature}
            color="primary"
            variant="shadow"
            size="lg"
            className="min-w-[200px]"
          >
            {signatureAdded ? 'Signature Added' : isAddingSignature ? 'Adding Signature...' : 'Sign Document'}
          </Button>
        </CardBody>
      </Card>
      
      {signatureStatus && !isAddingSignature && (
        <Card className={`w-full border ${signatureAdded ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'}`}>
          <CardBody className="flex items-center gap-2 py-3">
            {signatureAdded ? (
              <CheckCircle size={18} className="text-success flex-shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-danger flex-shrink-0" />
            )}
            <p className={`text-sm ${signatureAdded ? 'text-success' : 'text-danger'}`}>
              {signatureStatus}
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

export default SignatureStep 