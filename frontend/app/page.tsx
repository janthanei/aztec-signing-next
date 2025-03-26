'use client';

import React, { useState } from 'react';
import { Card, CardBody, CardFooter, Button, Divider } from '@nextui-org/react';
import ContractDeployment from '../components/contract/ContractDeployment';
import { FileSignature, FileText } from 'lucide-react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

export default function Home() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleNavigation = (page: string) => {
    if (page === 'home') {
      setSelectedOption(null);
    } else if (page === 'create') {
      setSelectedOption('create');
    } else if (page === 'sign') {
      setSelectedOption('sign');
    }
  };

  if (selectedOption === 'create') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header activePage="create" onNavigate={handleNavigation} />
        <main className="flex flex-col items-center justify-center flex-grow p-8">
          <ContractDeployment />
        </main>
        <Footer />
      </div>
    );
  }

  if (selectedOption === 'sign') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header activePage="sign" onNavigate={handleNavigation} />
        <main className="flex flex-col items-center justify-center flex-grow p-8">
          <h1 className="text-4xl font-bold mb-8">Sign Document</h1>
          <div className="bg-content1 p-8 rounded-lg shadow">
            <p className="text-default-500">Document signing functionality will be implemented here.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header activePage="home" onNavigate={handleNavigation} />
      
      <main className="flex items-center justify-center flex-grow p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          <Card
            isPressable
            onPress={() => setSelectedOption('create')}
            className="p-4 h-80"
          >
            <CardBody className="flex flex-col items-center justify-center">
              <FileText className="h-20 w-20 mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Create Document</h2>
              <p className="text-center text-default-500">Create a new document that can be securely signed using private technology</p>
            </CardBody>
            <Divider />
            <CardFooter className="flex justify-center">
              <div className="flex items-center text-primary">
                Get Started <FileText size={16} className="ml-2" />
              </div>
            </CardFooter>
          </Card>
          
          <Card
            isPressable
            onPress={() => setSelectedOption('sign')}
            className="p-4 h-80"
          >
            <CardBody className="flex flex-col items-center justify-center">
              <FileSignature className="h-20 w-20 mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Sign Document</h2>
              <p className="text-center text-default-500">Sign an existing document securely with your private key</p>
            </CardBody>
            <Divider />
            <CardFooter className="flex justify-center">
              <div className="flex items-center text-primary">
                Sign Now <FileSignature size={16} className="ml-2" />
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
