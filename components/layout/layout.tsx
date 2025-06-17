"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  // Don't show sidebar on home page for clean hero experience
  const isHomePage = pathname === '/';

  // Persist sidebar state in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  if (isHomePage) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      <main
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out overflow-auto",
          "h-full",
          // Add proper margin for sidebar width
          isSidebarCollapsed ? "ml-16" : "ml-80"
        )}
      >
        <div className="container mx-auto p-6 max-w-none min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
