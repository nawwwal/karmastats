"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useDevice } from '@/hooks/use-mobile';
import { haptics } from '@/lib/haptics';
import {
  Home,
  Calculator,
  Users,
  Settings,
  MoreHorizontal,
  Brain,
  Activity,
  TestTube,
  Microscope,
  LineChart
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
}

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();
  const { isMobile, platform } = useDevice();

  // Only show on mobile devices
  if (!isMobile) return null;

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      href: '/',
    },
    {
      id: 'calculators',
      label: 'Calculators',
      icon: Calculator,
      href: '/sample-size',
      badge: '7'
    },
    {
      id: 'analysis',
      label: 'Analysis',
      icon: Activity,
      href: '/regression',
    },
    {
      id: 'studies',
      label: 'Studies',
      icon: Users,
      href: '/family-study',
    },
    {
      id: 'more',
      label: 'More',
      icon: MoreHorizontal,
      href: '/settings',
    },
  ];

  const handleNavTap = async (item: NavItem) => {
    // Trigger haptic feedback
    await haptics.selection();
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav
      className={cn(
        // Base styles
        "fixed bottom-0 left-0 right-0 z-50",
        // Background with backdrop blur
        "bg-background/80 backdrop-blur-md",
        // Border and shadow
        "border-t border-border/50 shadow-lg",
        // Safe area handling for iOS
        "pb-safe-area-inset-bottom",
        // iOS specific styles
        platform === 'ios' && "pb-1",
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => handleNavTap(item)}
              className={cn(
                // Base button styles
                "flex flex-col items-center justify-center",
                "min-w-[3rem] h-12 px-2 py-1",
                "rounded-xl transition-all duration-200",
                // Touch target optimization
                "touch-manipulation select-none",
                // Active and hover states
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
                // Tap animation
                "active:scale-95 active:bg-primary/5",
                // Focus styles for accessibility
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    active && "scale-110"
                  )}
                />
                {/* Badge */}
                {item.badge && (
                  <span
                    className={cn(
                      "absolute -top-1 -right-1",
                      "w-4 h-4 text-xs font-medium",
                      "bg-primary text-primary-foreground",
                      "rounded-full flex items-center justify-center",
                      "animate-pulse"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-xs font-medium mt-0.5 transition-all duration-200",
                  active ? "opacity-100" : "opacity-70"
                )}
              >
                {item.label}
              </span>

              {/* Active indicator */}
              {active && (
                <div
                  className={cn(
                    "absolute top-0 left-1/2 transform -translate-x-1/2",
                    "w-1 h-1 bg-primary rounded-full",
                    "animate-pulse"
                  )}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* iOS home indicator safe area */}
      {platform === 'ios' && (
        <div className="h-1 bg-transparent" />
      )}
    </nav>
  );
}

// Quick Calculator FAB - Floating Action Button for quick access
interface QuickCalcFABProps {
  className?: string;
}

export function QuickCalcFAB({ className }: QuickCalcFABProps) {
  const { isMobile } = useDevice();
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Only show on mobile
  if (!isMobile) return null;

  const quickActions = [
    { icon: Brain, label: 'Study Detector', href: '/sample-size/intelligent-detector' },
    { icon: TestTube, label: 'T-Test', href: '/sample-size/t-test' },
    { icon: LineChart, label: 'Regression', href: '/regression' },
    { icon: Microscope, label: 'Disease Model', href: '/disease-math' },
  ];

  const handleFABTap = async () => {
    await haptics.light();
    setIsExpanded(!isExpanded);
  };

  const handleActionTap = async () => {
    await haptics.selection();
    setIsExpanded(false);
  };

  return (
    <div className={cn("fixed bottom-20 right-4 z-40", className)}>
      {/* Quick actions */}
      {isExpanded && (
        <div className="mb-4 space-y-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                onClick={handleActionTap}
                className={cn(
                  "flex items-center gap-3 p-3",
                  "bg-background/90 backdrop-blur-md",
                  "border border-border/50 rounded-full shadow-lg",
                  "animate-fadeInUp",
                  "hover:bg-accent/50 transition-all duration-200",
                  "active:scale-95"
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium pr-2">{action.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={handleFABTap}
        className={cn(
          "w-14 h-14 bg-primary text-primary-foreground",
          "rounded-full shadow-lg",
          "flex items-center justify-center",
          "transition-all duration-300",
          "active:scale-95",
          "hover:shadow-xl",
          isExpanded && "rotate-45"
        )}
      >
        <Calculator className="w-6 h-6" />
      </button>
    </div>
  );
}
