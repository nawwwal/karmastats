"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { cn } from '@/lib/utils';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Default to collapsed for more space
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  // Don't show sidebar on home page for clean hero experience
  const isHomePage = pathname === '/';

  // Set client flag to prevent SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Persist sidebar state in localStorage (only on client)
  useEffect(() => {
    if (!isClient) return;

    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsSidebarCollapsed(JSON.parse(saved));
    }
  }, [isClient]);

  const handleSidebarMouseEnter = () => {
    setIsSidebarCollapsed(false);
  };

  const handleSidebarMouseLeave = () => {
    setIsSidebarCollapsed(true);
  };

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);

    // Only access localStorage on client side
    if (isClient) {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
    }
  };

  if (isHomePage) {
    return (
      <FloatingParticles
        className="min-h-screen bg-background"
        density="medium"
        speed="slow"
        colors="primary"
        size="mixed"
      >
        <div className="relative z-10">
          {children}
        </div>
      </FloatingParticles>
    );
  }

  return (
    <FloatingParticles
      className="min-h-screen bg-background flex"
      density="light"
      speed="slow"
      colors="primary"
      size="small"
    >
      <div
        className="relative z-20"
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
          isHovered={!isSidebarCollapsed}
        />
      </div>
      <main
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out relative z-10",
          "min-h-screen",
          // Add proper margin for sidebar width with smooth transition
          isSidebarCollapsed ? "ml-16" : "ml-80"
        )}
      >
        <div className="container mx-auto p-6 max-w-none relative">
          {children}
        </div>
      </main>
    </FloatingParticles>
  );
}
