/**
 * Layout principal de la aplicación
 * Incluye Sidebar y área de contenido principal
 */

import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 md:ml-64 pb-16 md:pb-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

