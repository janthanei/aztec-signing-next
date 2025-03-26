'use client'

import React from 'react'
import { Button, Card, CardBody, Chip } from '@nextui-org/react'
import { Wallet, CheckCircle } from 'lucide-react'

interface WalletConnectionProps {
  currentAccount: string | null;
  onConnect: () => Promise<void>;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ 
  currentAccount, 
  onConnect 
}) => {
  return (
    <div className="flex flex-col items-center w-full max-w-md gap-4">
      {!currentAccount ? (
        <Card className="w-full border border-default-200">
          <CardBody className="flex justify-center p-6">
            <Button 
              onClick={onConnect} 
              color="primary"
              size="lg"
              variant="shadow"
              startContent={<Wallet size={20} />}
              className="font-medium"
            >
              Connect Wallet
            </Button>
          </CardBody>
        </Card>
      ) : (
        <Card className="w-full border border-success/30 bg-success/5">
          <CardBody className="flex flex-col items-center gap-4 p-6">
            <CheckCircle size={40} className="text-success" />
            <div className="text-center">
              <h3 className="text-lg font-medium text-success mb-1">Wallet Connected</h3>
              <Chip
                variant="flat"
                color="success"
                classNames={{
                  base: "border-success/30",
                  content: "text-success text-sm"
                }}
              >
                {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
              </Chip>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

export default WalletConnection 