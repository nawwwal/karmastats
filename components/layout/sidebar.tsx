import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
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
  Settings
} from 'lucide-react';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  isActive?: boolean;
  isOpen?: boolean;
  toggleOpen?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  href, 
  icon, 
  title, 
  children, 
  isActive, 
  isOpen, 
  toggleOpen 
}) => {
  const hasChildren = Boolean(children);

  return (
    <li className="mb-2">
      {hasChildren ? (
        <div className="flex flex-col">
          <button
            onClick={toggleOpen}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md w-full text-left transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <span className="flex-shrink-0 w-5 h-5">{icon}</span>
            <span className="flex-grow">{title}</span>
            <span className="flex-shrink-0">
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          </button>
          {isOpen && (
            <ul className="pl-6 mt-1 space-y-1">
              {children}
            </ul>
          )}
        </div>
      ) : (
        <Link 
          href={href}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md w-full transition-colors",
            isActive 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <span className="flex-shrink-0 w-5 h-5">{icon}</span>
          <span className="flex-grow">{title}</span>
        </Link>
      )}
    </li>
  );
};

const SidebarSearch = () => {
  return (
    <div className="px-3 mb-4">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search tools..." 
          className="w-full pl-8 pr-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
    </div>
  );
};

const SidebarFavorites = () => {
  const favorites = [
    { title: "Sample Size Calculator", href: "/sample-size" },
    { title: "Disease Modeling", href: "/disease-math" }
  ];

  return favorites.length > 0 ? (
    <div className="mb-4">
      <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Favorites
      </h3>
      <ul>
        {favorites.map((item, index) => (
          <li key={index}>
            <Link 
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground"
            >
              <Star size={16} className="text-yellow-500" />
              <span>{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  ) : null;
};

export function Sidebar() {
  const pathname = usePathname();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    calculators: true,
    studies: false,
    references: false
  });

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const isActive = (path: string) => pathname === path;
  const isCategoryActive = (paths: string[]) => paths.some(path => pathname?.startsWith(path));

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex-shrink-0 overflow-y-auto">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">
            K
          </div>
          <span className="text-xl font-bold">KARMASTAT</span>
        </Link>

        <SidebarSearch />
        
        <SidebarFavorites />

        <nav>
          <ul className="space-y-1">
            <SidebarItem 
              href="/" 
              icon={<Home />} 
              title="Home" 
              isActive={isActive('/')}
            />

            <SidebarItem 
              href="#" 
              icon={<Calculator />} 
              title="Calculators" 
              isActive={isCategoryActive(['/sample-size', '/regression', '/disease-math'])}
              isOpen={openCategories.calculators}
              toggleOpen={() => toggleCategory('calculators')}
            >
              <li>
                <Link 
                  href="/sample-size" 
                  className={cn(
                    "block py-2 px-3 rounded-md",
                    pathname?.startsWith('/sample-size') 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  Sample Size
                </Link>
              </li>
              <li>
                <Link 
                  href="/regression" 
                  className={cn(
                    "block py-2 px-3 rounded-md",
                    pathname?.startsWith('/regression') 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  Regression Analysis
                </Link>
              </li>
              <li>
                <Link 
                  href="/disease-math" 
                  className={cn(
                    "block py-2 px-3 rounded-md",
                    pathname?.startsWith('/disease-math') 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  Disease Modeling
                </Link>
              </li>
            </SidebarItem>

            <SidebarItem 
              href="#" 
              icon={<Activity />} 
              title="Studies" 
              isActive={isCategoryActive(['/family-study'])}
              isOpen={openCategories.studies}
              toggleOpen={() => toggleCategory('studies')}
            >
              <li>
                <Link 
                  href="/family-study" 
                  className={cn(
                    "block py-2 px-3 rounded-md",
                    pathname?.startsWith('/family-study') 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  Family Health Study
                </Link>
              </li>
            </SidebarItem>

            <SidebarItem 
              href="#" 
              icon={<Microscope />} 
              title="References" 
              isActive={false}
              isOpen={openCategories.references}
              toggleOpen={() => toggleCategory('references')}
            >
              <li>
                <Link 
                  href="/references/icmr-guidelines" 
                  className="block py-2 px-3 rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  ICMR Guidelines
                </Link>
              </li>
              <li>
                <Link 
                  href="/references/who-standards" 
                  className="block py-2 px-3 rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  WHO Standards
                </Link>
              </li>
            </SidebarItem>

            <SidebarItem 
              href="/about" 
              icon={<Users />} 
              title="About Us" 
              isActive={isActive('/about')}
            />
          </ul>
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <Link 
            href="/settings" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Settings size={16} />
            <span>Settings</span>
          </Link>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent">
              <Heart size={16} className="text-muted-foreground hover:text-rose-500" />
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent">
              <Bookmark size={16} className="text-muted-foreground hover:text-primary" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}