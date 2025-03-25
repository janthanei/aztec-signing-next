'use client'

import React from 'react'
import { Button, Input, Spinner,Tooltip } from "@nextui-org/react";

interface ContractDeployStepProps {
  handlePdfInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  deployContract: () => Promise<void>;
  selectedFile: File | null;
  isDeploying: boolean;
  deploymentStatus: string | null;
  isDeploymentSuccessful: boolean;
}

const ContractDeployStep: React.FC<ContractDeployStepProps> = ({ 
  handlePdfInput,
  deployContract,
  selectedFile,
  isDeploying,
  deploymentStatus,
  isDeploymentSuccessful
}) => {
  return (
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
  )
}

export default ContractDeployStep 