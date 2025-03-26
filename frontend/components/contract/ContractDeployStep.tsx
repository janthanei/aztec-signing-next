'use client'

import React from 'react'
import { Button, Input, Spinner, Card, CardBody, Tooltip, Chip } from "@nextui-org/react";
import { Upload, FileUp, CheckCircle, AlertTriangle } from 'lucide-react';

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
    <div className="w-full max-w-xl">
      <Card className="mb-6 border border-default-200">
        <CardBody className="gap-6 p-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-default-700">Select PDF document</label>
            <Input
              type="file"
              onChange={handlePdfInput}
              accept=".pdf,application/pdf"
              variant="bordered"
              color="primary"
              startContent={<Upload size={18} />}
              classNames={{
                input: "file:hidden cursor-pointer",
                inputWrapper: "py-2"
              }}
              placeholder="Select a PDF file"
            />
          </div>
          
          {selectedFile && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-default-700">Selected file:</span>
              <Chip
                variant="flat" 
                color="primary"
                startContent={<FileUp size={14} className="ml-1" />}
                classNames={{
                  base: "border-primary/30"
                }}
              >
                {selectedFile.name}
              </Chip>
            </div>
          )}
        </CardBody>
      </Card>
      
      {!selectedFile ? (
        <Tooltip
          content="Please upload a PDF first"
          placement="bottom"
          color="warning"
        >
          <div className="flex justify-center">
            <Button 
              isDisabled
              color="primary" 
              variant="shadow"
              size="lg"
            >
              Deploy Contract
            </Button>
          </div>
        </Tooltip>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Button 
            onClick={deployContract} 
            isDisabled={isDeploying}
            isLoading={isDeploying}
            color="primary"
            variant="shadow"
            size="lg"
            className="min-w-[200px]"
          >
            {isDeploying ? 'Deploying...' : 'Deploy Contract'}
          </Button>
          
          {deploymentStatus && !isDeploying && (
            <Card className={`w-full border ${isDeploymentSuccessful ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'}`}>
              <CardBody className="flex items-center gap-2 py-3">
                {isDeploymentSuccessful ? (
                  <CheckCircle size={18} className="text-success flex-shrink-0" />
                ) : (
                  <AlertTriangle size={18} className="text-danger flex-shrink-0" />
                )}
                <p className={`text-sm ${isDeploymentSuccessful ? 'text-success' : 'text-danger'}`}>
                  {deploymentStatus}
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default ContractDeployStep 