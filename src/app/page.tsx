'use client';

import ContractDeployment from '../components/ContractDeployment';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Contract Deployment</h1>
      <ContractDeployment />
    </main>
  );
}
