'use client';

import React from 'react';
import { Link } from '@nextui-org/react';
import { Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-divider py-6 px-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-center items-center gap-4">
        <Link href="https://github.com/janthanei/aztec-signing-next" isExternal className="text-default-500 hover:text-primary">
          <Github size={20} />
        </Link>
        
        <Link href="https://aztec.network/" isExternal className="text-default-500 hover:text-primary">
          Powered by Aztec Network
        </Link>
      </div>
    </footer>
  );
}; 