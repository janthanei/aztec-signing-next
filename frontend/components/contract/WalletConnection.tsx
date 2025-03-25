'use client'

import React from 'react'
import { Button } from '@nextui-org/react'

interface WalletConnectionProps {
  currentAccount: string | null;
  onConnect: () => Promise<void>;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ 
  currentAccount, 
  onConnect 
}) => {
  return (
    <>
      <Button 
        onClick={onConnect} 
        disabled={!!currentAccount}
        className="bg-white/20 hover:bg-white/30 transition-all duration-200"
      >
        {currentAccount ? 'Wallet Connected' : 'Connect Wallet'}
      </Button>
      {currentAccount && (
        <div className="flex items-center gap-2 mt-2">
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
          <p>
            Connected account: {currentAccount.slice(0, 5)}...{currentAccount.slice(-5)}
          </p>
        </div>
      )}
    </>
  )
}

export default WalletConnection 