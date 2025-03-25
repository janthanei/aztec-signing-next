'use client'

import React from 'react'
import { Button } from '@nextui-org/react'

interface FinalStepProps {
  endSign: () => Promise<void>;
}

const FinalStep: React.FC<FinalStepProps> = ({ endSign }) => {
  return (
    <Button 
      onClick={endSign}
      className="bg-white/20 hover:bg-white/30 transition-all duration-200"
    >
      End Sign
    </Button>
  )
}

export default FinalStep 