import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import {
  Calculator,
  Activity,
  Microscope,
  Users,
  Home,
  ChevronDown,
  ChevronRight,
  Search,
  Star,
  Heart,
  Bookmark,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  TestTube,
  BarChart3,
  Brain,
  Stethoscope,
  TrendingUp,
  Database,
  LineChart,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
  isActive?: boolean;
  isOpen?: boolean;
  toggleOpen?: () => void;
  badge?: string;
  isCollapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  href,
  icon,
  title,
  description,
  children,
  isActive,
  isOpen,
  toggleOpen,
  badge,
  isCollapsed
}) => {
  const hasChildren = Boolean(children);

  if (hasChildren) {
    return (
      <li className="mb-1">
        <button
          onClick={toggleOpen}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-lg w-full text-left transition-all duration-200 group",
            isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-accent hover:text-accent-foreground",
            isCollapsed && "justify-center px-2"
          )}
        >
          <span className="flex-shrink-0 w-5 h-5 transition-colors group-hover:scale-110 duration-200">
            {icon}
          </span>
          {!isCollapsed && (
            <>
              <div className="flex-grow min-w-0">
                <div className="font-medium truncate">{title}</div>
                {description && (
                  <div className="text-xs text-muted-foreground truncate">{description}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
                <span className="flex-shrink-0">
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              </div>
            </>
          )}
        </button>
        {!isCollapsed && isOpen && (
          <ul className="pl-6 mt-2 space-y-1 border-l border-border ml-5">
            {children}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li className="mb-1">
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-lg w-full transition-all duration-200 group",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "hover:bg-accent hover:text-accent-foreground",
          isCollapsed && "justify-center px-2"
        )}
      >
        <span className="flex-shrink-0 w-5 h-5 transition-colors group-hover:scale-110 duration-200">
          {icon}
        </span>
        {!isCollapsed && (
          <div className="flex-grow min-w-0">
            <div className="font-medium truncate">{title}</div>
            {description && (
              <div className="text-xs text-muted-foreground truncate">{description}</div>
            )}
          </div>
        )}
        {!isCollapsed && badge && (
          <Badge variant="secondary" className="text-xs">{badge}</Badge>
        )}
      </Link>
    </li>
  );
};

const SidebarSearch: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (isCollapsed) return null;

  return (
    <div className="px-3 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50"
        />
      </div>
    </div>
  );
};

const ThemeToggle: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size={isCollapsed ? "icon" : "sm"}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn(
        "transition-all duration-200",
        isCollapsed ? "w-10 h-10" : "w-full justify-start"
      )}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      {!isCollapsed && <span className="ml-2">Toggle theme</span>}
    </Button>
  );
};

const SidebarFavorites: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
  const favorites = [
    { title: "Sample Size Calculator", href: "/sample-size", icon: <Calculator size={16} /> },
    { title: "Disease Modeling", href: "/disease-math", icon: <Microscope size={16} /> }
  ];

  if (favorites.length === 0) return null;

  return (
    <div className="mb-6">
      {!isCollapsed && (
        <h3 className="px-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Favorites
        </h3>
      )}
      <ul className="space-y-1">
        {favorites.map((item, index) => (
          <li key={index}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200 group",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Star size={16} className="text-warning flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.title}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    calculators: true,
    studies: false,
    analysis: false,
    resources: false
  });

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const isActive = (path: string) => pathname === path;
  const isCategoryActive = (paths: string[]) => paths.some(path => pathname?.startsWith(path));

  const navigationStructure = [
    {
      type: 'item',
      href: '/',
      icon: <Home />,
      title: 'Home',
      description: 'Dashboard & overview'
    },
    {
      type: 'separator'
    },
    {
      type: 'category',
      key: 'calculators',
      icon: <Calculator />,
      title: 'Statistical Calculators',
      description: 'Sample size & power analysis',
      badge: '7',
      isActive: isCategoryActive(['/sample-size', '/regression', '/disease-math']),
      children: [
        {
          href: '/sample-size/intelligent-detector',
          icon: <Brain size={16} />,
          title: 'Study Detector',
          description: 'AI-powered study design detection'
        },
        {
          href: '/sample-size/survival',
          icon: <TrendingUp size={16} />,
          title: 'Survival Analysis',
          description: 'Time-to-event studies'
        },
        {
          href: '/sample-size/comparative',
          icon: <BarChart3 size={16} />,
          title: 'Comparative Studies',
          description: 'Case-control & cohort'
        },
        {
          href: '/sample-size/t-test',
          icon: <TestTube size={16} />,
          title: 'T-Test Calculator',
          description: 'Independent & paired tests'
        },
        {
          href: '/sample-size/diagnostic',
          icon: <Stethoscope size={16} />,
          title: 'Diagnostic Studies',
          description: 'Sensitivity & specificity'
        },
        {
          href: '/sample-size/clinical-trials',
          icon: <Target size={16} />,
          title: 'Clinical Trials',
          description: 'RCT sample size calculations'
        },
        {
          href: '/sample-size/cross-sectional',
          icon: <Database size={16} />,
          title: 'Cross-sectional',
          description: 'Prevalence & survey studies'
        }
      ]
    },
    {
      type: 'category',
      key: 'analysis',
      icon: <Activity />,
      title: 'Data Analysis',
      description: 'Advanced statistical modeling',
      badge: '2',
      isActive: isCategoryActive(['/regression', '/disease-math']),
      children: [
        {
          href: '/regression',
          icon: <LineChart size={16} />,
          title: 'Regression Analysis',
          description: 'Linear, polynomial & logistic'
        },
        {
          href: '/disease-math',
          icon: <Microscope size={16} />,
          title: 'Disease Modeling',
          description: 'Epidemiological SEIRDV models'
        }
      ]
    },
    {
      type: 'category',
      key: 'studies',
      icon: <Users />,
      title: 'Study Templates',
      description: 'Standardized study forms',
      badge: '1',
      isActive: isCategoryActive(['/family-study']),
      children: [
        {
          href: '/family-study',
          icon: <Heart size={16} />,
          title: 'Family Health Study',
          description: 'ICMR-NIN 2020 compliance'
        }
      ]
    },
    {
      type: 'separator'
    },
    {
      type: 'item',
      href: '/settings',
      icon: <Settings />,
      title: 'Settings',
      description: 'Preferences & configuration'
    }
  ];

  return (
    <aside className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-80"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
                  K
                </div>
                <div>
                  <div className="font-bold text-lg text-gradient">KARMASTAT</div>
                  <div className="text-xs text-muted-foreground">Statistical Tools</div>
                </div>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 hover:bg-sidebar-accent"
            >
              {isCollapsed ? <Menu size={16} /> : <X size={16} />}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 pb-0">
          <SidebarSearch isCollapsed={isCollapsed} />
        </div>

        {/* Main Navigation */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            {/* Favorites */}
            <SidebarFavorites isCollapsed={isCollapsed} />

            {/* Navigation Items */}
            <nav>
              <ul className="space-y-1">
                {navigationStructure.map((item, index) => {
                  if (item.type === 'separator') {
                    return !isCollapsed ? <Separator key={index} className="my-4" /> : null;
                  }

                  if (item.type === 'category') {
                    return (
                      <SidebarItem
                        key={item.key}
                        href="#"
                        icon={item.icon}
                        title={item.title}
                        description={item.description}
                        isActive={item.isActive}
                        isOpen={openCategories[item.key]}
                        toggleOpen={() => toggleCategory(item.key)}
                        badge={item.badge}
                        isCollapsed={isCollapsed}
                      >
                        {item.children?.map((child, childIndex) => (
                          <SidebarItem
                            key={childIndex}
                            href={child.href}
                            icon={child.icon}
                            title={child.title}
                            description={child.description}
                            isActive={isActive(child.href)}
                            isCollapsed={false}
                          />
                        ))}
                      </SidebarItem>
                    );
                  }

                  return (
                    <SidebarItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      title={item.title}
                      description={item.description}
                      isActive={isActive(item.href)}
                      isCollapsed={isCollapsed}
                    />
                  );
                })}
              </ul>
            </nav>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <ThemeToggle isCollapsed={isCollapsed} />
          {!isCollapsed && (
            <div className="text-xs text-muted-foreground text-center">
              Made with ❤️ by Karmayogi
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
