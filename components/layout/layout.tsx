"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  // Don't show sidebar on home page for clean hero experience
  const isHomePage = pathname === '/';

  // Set client flag to prevent SSR issues
  useEffect(() => {
    setIsClient(true);

    // Load sidebar state from localStorage only after hydration
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

  const handleSidebarMouseEnter = () => {
    if (!isClient) return;
    setIsSidebarCollapsed(false);
  };

  const handleSidebarMouseLeave = () => {
    if (!isClient) return;
    setIsSidebarCollapsed(true);
  };

  const toggleSidebar = () => {
    if (!isClient) return;

    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  // During SSR and initial hydration, use consistent default state
  const shouldCollapse = isClient ? isSidebarCollapsed : true;

  if (isHomePage) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div
        className="relative z-20"
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <Sidebar
          isCollapsed={shouldCollapse}
          onToggle={toggleSidebar}
          isHovered={!shouldCollapse}
        />
      </div>
      <main
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out relative z-10",
          "min-h-screen",
          // Use consistent state for SSR and initial render
          shouldCollapse ? "ml-16" : "ml-80"
        )}
      >
        <div className="container mx-auto p-6 max-w-none relative">
          {children}
        </div>
      </main>
    </div>
  );
}
