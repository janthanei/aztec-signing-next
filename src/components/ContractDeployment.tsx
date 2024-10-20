'use client'

import React, { useState, useEffect } from 'react'
import { Button, Input, Progress, Card, CardBody } from '@nextui-org/react'
import * as CryptoJS from 'crypto-js'

declare global {
  interface Window {
    ethereum?: any;
  }
}

const ContractDeployment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [pxeInfo, setPXEInfo] = useState<{ chainId: string; accounts: string[] } | null>(null)
  const [signers, setSigners] = useState<string[]>([''])
  const [deploymentStatus, setDeploymentStatus] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentAccount, setCurrentAccount] = useState<string | null>(null)
  const [hashString, setHashString] = useState<string | null>(null)

  useEffect(() => {
    setProgress((currentStep - 1) * 25) // Adjusted for 5 steps
  }, [currentStep])

  useEffect(() => {
    fetchPXEInfo()
  }, [])

  const fetchPXEInfo = async () => {
    try {
      const response = await fetch('http://localhost:9000/create-pxe-client')
      if (!response.ok) {
        throw new Error('Failed to fetch PXE info')
      }
      const data = await response.json()
      setPXEInfo(data)
    } catch (err) {
      console.error('Error fetching PXE info:', err)
    }
  }

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        setCurrentAccount(accounts[0])
        console.log("Connected account:", accounts[0])
        nextStep()
      } else {
        console.error("Ethereum object not found, do you have MetaMask installed?")
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const handlePdfInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = async (fileEvent: ProgressEvent<FileReader>) => {
        const binaryString = fileEvent.target?.result
        if (binaryString && typeof binaryString !== 'string') {
          const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(binaryString))
          const hash = CryptoJS.SHA256(wordArray)
          const newHashString = "0x" + hash.toString(CryptoJS.enc.Hex)
          setHashString(newHashString)
          console.log("Hashed document:", newHashString)
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const deployContract = async () => {
    if (!hashString) {
      alert("Please upload a PDF first.");
      return;
    }
    setDeploymentStatus("Deploying contract...");
    try {
      console.log("Attempting to deploy contract with hashString:", hashString);
      const response = await fetch("http://localhost:9000/deploy-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hashString,
        }),
      });
      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text:", responseText);
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        setDeploymentStatus("Contract deployed at: " + data.token);
        nextStep();
      } else {
        setDeploymentStatus("Failed to deploy contract. Server responded with: " + responseText);
      }
    } catch (error) {
      console.error("Error deploying contract:", error);
      setDeploymentStatus("Error deploying contract: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const addSigner = () => {
    setSigners([...signers, ''])
  }

  const removeSigner = (index: number) => {
    const newSigners = signers.filter((_, i) => i !== index)
    setSigners(newSigners)
  }

  const updateSigner = (index: number, value: string) => {
    const newSigners = [...signers]
    newSigners[index] = value
    setSigners(newSigners)
  }

  const submitSigners = async () => {
    for (const signer of signers) {
      if (signer) {
        try {
          const response = await fetch('http://localhost:9000/add-signer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ signer }),
          })
          if (!response.ok) {
            throw new Error(`Failed to add signer: ${signer}`)
          }
        } catch (err) {
          console.error(`Error adding signer ${signer}:`, err)
        }
      }
    }
    nextStep()
  }

  const addSignature = async () => {
    try {
      console.log("currentAccount: pxeInfo?.accounts[0]: " + pxeInfo?.accounts[0])
      console.log("currentAccount:: " + currentAccount)
      const response = await fetch('http://localhost:9000/add-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentAccount }),
      })
      if (!response.ok) {
        throw new Error('Failed to add signature')
      }
      alert('Signature added successfully')
      nextStep() // Automatically move to the next step after adding signature
    } catch (err) {
      console.error('Error adding signature:', err)
      alert('Failed to add signature')
    }
  }

  const endSign = async () => {
    try {
      const response = await fetch('http://localhost:9000/end-sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentAccount }),
      })
      if (!response.ok) {
        throw new Error('Failed to end signing process')
      }
      alert('Signing process completed successfully')
    } catch (err) {
      console.error('Error ending signing process:', err)
      alert('Failed to end signing process')
    }
  }

  const nextStep = () => {
    if (currentStep < 5) { // Changed to 5 steps
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardBody>
        <Progress value={progress} className="mb-4" />
        {currentStep === 1 && (
          <>
            <h2>Connect Wallet</h2>
            <Button onClick={connectWallet} disabled={!!currentAccount}>
              {currentAccount ? 'Wallet Connected' : 'Connect Wallet'}
            </Button>
            {currentAccount && <p>Connected account: {currentAccount}</p>}
          </>
        )}
        {currentStep === 2 && (
          <>
            <Input type="file" onChange={handlePdfInput} className="mb-4" accept=".pdf" />
            <Button onClick={deployContract} disabled={!hashString}>
              Deploy Contract
            </Button>
            {deploymentStatus && <p>{deploymentStatus}</p>}
          </>
        )}
        {currentStep === 3 && (
          <>
            {signers.map((signer, index) => (
              <div key={index} className="flex mb-2">
                <Input
                  value={signer}
                  onChange={(e) => updateSigner(index, e.target.value)}
                  placeholder="Signer address"
                  className="mr-2"
                />
                <Button onClick={() => removeSigner(index)} color="danger" size="sm">
                  -
                </Button>
              </div>
            ))}
            <Button onClick={addSigner} className="mt-2">
              Add Signer
            </Button>
            <Button onClick={submitSigners} className="mt-4">
              Submit Signers
            </Button>
          </>
        )}
        {currentStep === 4 && (
          <Button onClick={addSignature}>
            Add Signature
          </Button>
        )}
        {currentStep === 5 && (
          <Button onClick={endSign}>
            End Sign
          </Button>
        )}
        <div className="flex justify-between mt-4">
          <Button onClick={prevStep} disabled={currentStep === 1}>
            Prev
          </Button>
          <Button onClick={nextStep} disabled={currentStep === 5}>
            Next
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}

export default ContractDeployment
