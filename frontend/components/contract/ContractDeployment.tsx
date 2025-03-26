'use client'

import React, { useState, useEffect } from 'react'
import { Button, Card, CardBody, Progress, Divider, Chip } from '@nextui-org/react'
import * as CryptoJS from 'crypto-js'
import { ErrorModal } from '../common/ErrorModal'
import { SuccessModal } from '../common/SuccessModal'
import WalletConnection from './WalletConnection'
import ContractDeployStep from './ContractDeployStep'
import SignersStep from './SignersStep'
import SignatureStep from './SignatureStep'
import FinalStep from './FinalStep'
import { Check, FileText, PenTool, Users, Wallet, Bookmark } from 'lucide-react'

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
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [isDocumentFinalized, setIsDocumentFinalized] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

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
      setIsFinalizing(true)
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
      setIsDocumentFinalized(true)
      showSuccessModal('Signing process completed successfully')
    } catch (err) {
      console.error('Error ending signing process:', err)
      showErrorModal(`Failed to end signing process: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsFinalizing(false)
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

  const showSuccessModal = (message: string) => {
    setModalMessage(message)
    setIsSuccessModalOpen(true)
  }

  const steps = [
    { title: "Connect Wallet", icon: <Wallet size={20} /> },
    { title: "Upload Document", icon: <FileText size={20} /> },
    { title: "Add Signers", icon: <Users size={20} /> },
    { title: "Sign Document", icon: <PenTool size={20} /> },
    { title: "Complete", icon: <Bookmark size={20} /> }
  ];

  return (
    <>
      <Card className="w-full max-w-4xl bg-content1 shadow-md">
        <CardBody className="p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col items-center ${
                    index < currentStep ? 'text-primary' : 
                    index === currentStep ? 'text-foreground' : 'text-default-400'
                  }`}
                  style={{ width: `${100 / steps.length}%` }}
                >
                  <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2 ${
                    index < currentStep 
                      ? 'bg-primary border-primary'
                      : index === currentStep
                      ? 'bg-transparent border-primary'
                      : 'bg-transparent border-default-300'
                  }`}>
                    {index < currentStep ? (
                      <Check size={16} className="text-white" />
                    ) : (
                      <span className={index === currentStep ? "text-primary" : "text-default-500"}>
                        {steps[index].icon}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs md:text-sm text-center ${
                    index === currentStep ? 'font-medium' : 'font-normal'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative w-full h-2 bg-default-200 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-in-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="p-4 bg-content2 rounded-xl mb-6">
            {currentStep === 1 && (
              <div className="flex flex-col items-center py-8">
                <h2 className="text-xl font-semibold mb-8">Connect your wallet to continue</h2>
                <WalletConnection 
                  currentAccount={currentAccount} 
                  onConnect={connectWallet} 
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex flex-col items-center py-8">
                <h2 className="text-xl font-semibold mb-8">Upload your document</h2>
                <ContractDeployStep 
                  handlePdfInput={handlePdfInput}
                  deployContract={deployContract}
                  selectedFile={selectedFile}
                  isDeploying={isDeploying}
                  deploymentStatus={deploymentStatus}
                  isDeploymentSuccessful={isDeploymentSuccessful}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="py-8">
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
              </div>
            )}

            {currentStep === 4 && (
              <div className="flex flex-col items-center py-8">
                <h2 className="text-xl font-semibold mb-8">Sign the document</h2>
                <SignatureStep 
                  addSignature={addSignature}
                  isAddingSignature={isAddingSignature}
                  signatureStatus={signatureStatus}
                  signatureAdded={signatureAdded}
                />
              </div>
            )}

            {currentStep === 5 && (
              <div className="flex flex-col items-center py-8">
                <h2 className="text-xl font-semibold mb-6">Complete the signing process</h2>
                <p className="text-default-500 mb-8 text-center">
                  All signatures have been collected. You can now finalize the document.
                </p>
                <FinalStep 
                  endSign={endSign} 
                  isFinalizing={isFinalizing} 
                  isFinalized={isDocumentFinalized} 
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            {currentStep !== 1 && !isDocumentFinalized && (
              <Button 
                onClick={prevStep} 
                variant="ghost"
                color="default"
              >
                Previous
              </Button>
            )}
            {(currentStep === 1 || isDocumentFinalized || currentStep === 5) && <div></div>}
            
            {currentStep !== 5 && !isDocumentFinalized && (
              <Button 
                onClick={nextStep} 
                disabled={
                  (currentStep === 1 && !currentAccount) ||
                  (currentStep === 2 && !isDeploymentSuccessful) ||
                  (currentStep === 3 && !signersSubmitted) ||
                  (currentStep === 4 && !signatureAdded)
                }
                color="primary"
              >
                Next
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
      
      <ErrorModal 
        isOpen={isErrorModalOpen} 
        onClose={() => setIsErrorModalOpen(false)} 
        message={modalMessage} 
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={modalMessage}
      />
    </>
  )
}

export default ContractDeployment 