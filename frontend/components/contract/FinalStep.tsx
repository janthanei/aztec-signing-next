'use client'

import React from 'react'
import { Button, Card, CardBody, Chip, Link } from '@nextui-org/react'
import { CheckCircle2, Home } from 'lucide-react'

interface FinalStepProps {
  endSign: () => Promise<void>;
  isFinalizing: boolean;
  isFinalized: boolean;
}

const FinalStep: React.FC<FinalStepProps> = ({ endSign, isFinalizing, isFinalized }) => {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl">
      <Card className="w-full border border-success/30 bg-success/5">
        <CardBody className="p-6 flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-success/20 mb-2">
            <CheckCircle2 size={40} className="text-success" />
          </div>
          
          <div className="text-center">
            <Chip color="success" variant="flat" className="mb-2">Process Complete</Chip>
            <h3 className="text-lg font-medium mb-2">Document Successfully Signed</h3>
            {!isFinalized ? (
              <p className="text-default-500 text-sm mb-6">
                All signatures have been collected and verified. You can now finalize the document.
              </p>
            ) : (
              <p className="text-default-500 text-sm mb-6">
                The signing process has been completed successfully. 
                You can close this window or return to the home page.
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full justify-center">
            {!isFinalized ? (
              <Button 
                onClick={endSign}
                color="success"
                variant="shadow"
                size="lg"
                startContent={!isFinalizing && <CheckCircle2 size={18} />}
                className="font-medium"
                isLoading={isFinalizing}
                isDisabled={isFinalizing}
              >
                {isFinalizing ? 'Finalizing...' : 'Finalize Document'}
              </Button>
            ) : (
              <Link href="/">
                <Button
                  color="primary"
                  variant="flat"
                  size="lg"
                  startContent={<Home size={18} />}
                  className="font-medium"
                >
                  Return Home
                </Button>
              </Link>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default FinalStep 