'use client'

import React, { useState, useEffect } from 'react'
import { Button, Card, CardBody, Progress } from '@nextui-org/react'
import * as CryptoJS from 'crypto-js'
import { ErrorModal } from '../common/ErrorModal'
import WalletConnection from './WalletConnection'
import ContractDeployStep from './ContractDeployStep'
import SignersStep from './SignersStep'
import SignatureStep from './SignatureStep'
import FinalStep from './FinalStep'

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
  const [isDeploying, setIsDeploying] = useState(false)
  const [isDeploymentSuccessful, setIsDeploymentSuccessful] = useState(false)
  const [isSubmittingSigners, setIsSubmittingSigners] = useState(false)
  const [signersSubmitted, setSignersSubmitted] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null)
  const [isAddingSignature, setIsAddingSignature] = useState(false)
  const [signatureAdded, setSignatureAdded] = useState(false)
  const [signatureStatus, setSignatureStatus] = useState<string | null>(null)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  useEffect(() => {
    setProgress((currentStep - 1) * 25)
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
      showErrorModal("Please upload a PDF first.")
      return
    }
    setIsDeploying(true)
    setDeploymentStatus("Deploying contract...")
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
        setDeploymentStatus("Contract deployed successfully");
        setIsDeploymentSuccessful(true);
      } else {
        setDeploymentStatus("Failed to deploy contract. Server responded with: " + responseText);
        setIsDeploymentSuccessful(false);
      }
    } catch (error) {
      console.error("Error deploying contract:", error);
      showErrorModal("Error deploying contract: " + (error instanceof Error ? error.message : String(error)))
      setIsDeploymentSuccessful(false)
    } finally {
      setIsDeploying(false)
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
    if (signers.some(signer => !signer.trim())) {
      return;
    }
    
    setIsSubmittingSigners(true);
    setSubmissionStatus("Submitting signers...");
    
    try {
      for (const signer of signers) {
        const response = await fetch('http://localhost:9000/add-signer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ signer }),
        });
        if (!response.ok) {
          setSubmissionStatus(`Failed to add signer: ${signer}`);
          setSignersSubmitted(false);
          return;
        }
      }
      setSubmissionStatus("Signers submitted successfully");
      setSignersSubmitted(true);
    } catch (err) {
      console.error('Error adding signers:', err);
      setSubmissionStatus("Failed to submit signers");
      setSignersSubmitted(false);
    } finally {
      setIsSubmittingSigners(false);
    }
  }

  const addSignature = async () => {
    setIsAddingSignature(true);
    setSignatureStatus("Adding signature...");
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
      setSignatureStatus("Signature added successfully");
      setSignatureAdded(true);
    } catch (err) {
      console.error('Error adding signature:', err)
      setSignatureStatus("Failed to add signature");
      setSignatureAdded(false);
      showErrorModal(`Failed to add signature: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsAddingSignature(false);
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
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const showErrorModal = (message: string) => {
    setModalMessage(message)
    setIsErrorModalOpen(true)
  }

  return (
    <>
      <Card className="w-full max-w-md bg-white/10 border-2 border-white/20">
        <CardBody>
          <Progress color="success" value={progress} className="mb-4" />
          
          {currentStep === 1 && (
            <WalletConnection 
              currentAccount={currentAccount} 
              onConnect={connectWallet} 
            />
          )}
          
          {currentStep === 2 && (
            <ContractDeployStep 
              handlePdfInput={handlePdfInput}
              deployContract={deployContract}
              selectedFile={selectedFile}
              isDeploying={isDeploying}
              deploymentStatus={deploymentStatus}
              isDeploymentSuccessful={isDeploymentSuccessful}
            />
          )}
          
          {currentStep === 3 && (
            <SignersStep 
              signers={signers}
              updateSigner={updateSigner}
              addSigner={addSigner}
              removeSigner={removeSigner}
              submitSigners={submitSigners}
              isSubmittingSigners={isSubmittingSigners}
              submissionStatus={submissionStatus}
              signersSubmitted={signersSubmitted}
            />
          )}
          
          {currentStep === 4 && (
            <SignatureStep 
              addSignature={addSignature}
              isAddingSignature={isAddingSignature}
              signatureStatus={signatureStatus}
              signatureAdded={signatureAdded}
            />
          )}
          
          {currentStep === 5 && (
            <FinalStep endSign={endSign} />
          )}
          
          <div className={`flex ${currentStep === 1 ? 'justify-end' : 'justify-between'} mt-4`}>
            {currentStep !== 1 && (
              <Button 
                onClick={prevStep} 
                disabled={currentStep === 1}
                className="bg-white/20 hover:bg-white/30 transition-all duration-200"
              >
                Prev
              </Button>
            )}
            <Button 
              onClick={nextStep} 
              disabled={currentStep === 5 || (currentStep === 2 && !isDeploymentSuccessful)}
              className="bg-white/20 hover:bg-white/30 transition-all duration-200"
            >
              Next
            </Button>
          </div>
        </CardBody>
      </Card>

      <ErrorModal 
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={modalMessage}
      />
    </>
  )
}

export default ContractDeployment 