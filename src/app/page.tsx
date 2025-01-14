'use client';

import { useState } from 'react';
import ContractDeployment from '../components/ContractDeployment';
import { FileSignature, FileText } from 'lucide-react';

export default function Home() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  if (selectedOption === 'create') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-8">Contract Deployment</h1>
        <ContractDeployment />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <div className="flex gap-8 w-full max-w-4xl">
        <button
          onClick={() => setSelectedOption('create')}
          className="flex-1 flex flex-col items-center justify-center p-8 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 border-2 border-white/20"
        >
          <FileText className="h-24 w-24 mb-4" />
          <span className="text-xl font-semibold">Create a new document to sign</span>
        </button>

        <button
          onClick={() => setSelectedOption('sign')}
          className="flex-1 flex flex-col items-center justify-center p-8 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 border-2 border-white/20"
        >
          <FileSignature className="h-24 w-24 mb-4" />
          <span className="text-xl font-semibold">Sign an existing document</span>
        </button>
      </div>
    </main>
  );
}
