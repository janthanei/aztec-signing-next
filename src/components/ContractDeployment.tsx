'use client'

import React, { useState, useEffect } from 'react'
import { Button, Input, Progress, Card, CardBody, Spinner, Tooltip } from '@nextui-org/react'
import * as CryptoJS from 'crypto-js'
import { Plus, Trash2 } from 'lucide-react'

declare global {
  interface Window {
    ethereum?: any;
  }
}

const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-red-500"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
)

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
    setIsDeploying(true);
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
        setDeploymentStatus("Contract deployed successfully");
        setIsDeploymentSuccessful(true);
      } else {
        setDeploymentStatus("Failed to deploy contract. Server responded with: " + responseText);
        setIsDeploymentSuccessful(false);
      }
    } catch (error) {
      console.error("Error deploying contract:", error);
      setDeploymentStatus("Error deploying contract: " + (error instanceof Error ? error.message : String(error)));
      setIsDeploymentSuccessful(false);
    } finally {
      setIsDeploying(false);
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
    <Card className="w-full max-w-md bg-white/10 border-2 border-white/20">
      <CardBody>
        <Progress color="success" value={progress} className="mb-4" />
        {currentStep === 1 && (
          <>
            <Button 
              onClick={connectWallet} 
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
        )}
        {currentStep === 2 && (
          <>
            <div className="mb-4">
              <Input
                type="file"
                onChange={handlePdfInput}
                accept=".pdf,application/pdf"
                classNames={{
                  input: [
                    "file:bg-white/20",
                    "file:border-0",
                    "file:hover:bg-white/30",
                    "file:text-black",
                    "file:rounded-lg",
                    "file:px-4",
                    "file:py-2",
                    "file:mr-4",
                    "file:transition-all",
                    "file:duration-200",
                    "text-black",
                    "bg-transparent",
                    "rounded-lg",
                    "cursor-pointer",
                    "border-white/20"
                  ].join(" "),
                  base: "max-w-full",
                  mainWrapper: "bg-transparent",
                  innerWrapper: "bg-transparent",
                  inputWrapper: [
                    "bg-transparent",
                    "border-1",
                    "border-white/20",
                    "hover:bg-white/10",
                    "hover:border-white/30",
                    "transition-all",
                    "duration-200",
                    "!cursor-pointer"
                  ].join(" ")
                }}
                placeholder="Select PDF file"
              />
            </div>
            <div className="flex flex-col items-center gap-4">
              {!selectedFile ? (
                <Tooltip
                  content="Please upload a PDF first"
                  showArrow={true}
                  placement="bottom"
                  classNames={{
                    base: [
                      "bg-white/10",
                      "backdrop-blur-sm",
                      "border-white/20",
                      "border",
                    ].join(" "),
                    content: [
                      "text-black",
                      "text-sm",
                      "py-2",
                      "px-4",
                    ].join(" "),
                    arrow: "bg-white/10"
                  }}
                >
                  <div>
                    <Button 
                      onClick={deployContract} 
                      disabled={true}
                      className="bg-white/20 hover:bg-white/30 transition-all duration-200"
                    >
                      Deploy Contract
                    </Button>
                  </div>
                </Tooltip>
              ) : (
                <Button 
                  onClick={deployContract} 
                  disabled={isDeploying}
                  className="bg-white/20 hover:bg-white/30 transition-all duration-200"
                >
                  Deploy Contract
                </Button>
              )}
              {isDeploying && (
                <Spinner 
                  color="success" 
                  label="Deploying contract..." 
                  labelColor="success"
                />
              )}
              {deploymentStatus && !isDeploying && (
                <div className="flex items-center gap-2">
                  {isDeploymentSuccessful && (
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
                  <p className="text-center">{deploymentStatus}</p>
                </div>
              )}
            </div>
          </>
        )}
        {currentStep === 3 && (
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
        )}
        {currentStep === 4 && (
          <div className="flex flex-col items-center gap-4">
            <Button 
              onClick={addSignature}
              disabled={isAddingSignature}
              className="bg-white/20 hover:bg-white/30 transition-all duration-200"
            >
              Add Signature
            </Button>

            {isAddingSignature && (
              <Spinner 
                color="success" 
                label="Adding signature..." 
                labelColor="success"
              />
            )}
            
            {signatureStatus && !isAddingSignature && (
              <div className="flex items-center gap-2">
                {signatureAdded && (
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
                <p className="text-center">{signatureStatus}</p>
              </div>
            )}
          </div>
        )}
        {currentStep === 5 && (
          <Button onClick={endSign}>
            End Sign
          </Button>
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
  )
}

export default ContractDeployment
