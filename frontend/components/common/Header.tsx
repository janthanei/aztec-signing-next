'use client';

import React from 'react';
import { 
  Navbar, 
  NavbarContent, 
  NavbarItem, 
  Button
} from '@nextui-org/react';
import { Home as HomeIcon, FileText, FileSignature } from 'lucide-react';

interface HeaderProps {
  activePage?: 'home' | 'create' | 'sign';
  onNavigate?: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activePage = 'home',
  onNavigate 
}) => {
  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <Navbar className="shadow-sm w-auto">
        <NavbarContent className="gap-6 mx-auto">
          <NavbarItem isActive={activePage === 'home'}>
            <Button
              variant={activePage === 'home' ? 'flat' : 'light'}
              color={activePage === 'home' ? 'primary' : 'default'}
              isIconOnly
              startContent={<HomeIcon size={20} />}
              onPress={() => handleNavigation('home')}
            />
          </NavbarItem>
          <NavbarItem isActive={activePage === 'create'}>
            <Button
              variant={activePage === 'create' ? 'flat' : 'light'}
              color={activePage === 'create' ? 'primary' : 'default'}
              isIconOnly
              startContent={<FileText size={20} />}
              onPress={() => handleNavigation('create')}
            />
          </NavbarItem>
          <NavbarItem isActive={activePage === 'sign'}>
            <Button
              variant={activePage === 'sign' ? 'flat' : 'light'}
              color={activePage === 'sign' ? 'primary' : 'default'}
              isIconOnly
              startContent={<FileSignature size={20} />}
              onPress={() => handleNavigation('sign')}
            />
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    </div>
  );
}; 