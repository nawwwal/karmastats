import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Activity,
  Microscope,
  Users,
  Menu,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "next-themes";

interface MainNavProps {
  toggleSidebar: () => void;
}

export function MainNav({ toggleSidebar }: MainNavProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/sample-size",
      label: "Sample Size",
      active: pathname?.startsWith("/sample-size"),
    },
    {
      href: "/regression",
      label: "Regression",
      active: pathname?.startsWith("/regression"),
    },
    {
      href: "/disease-math",
      label: "Disease Modeling",
      active: pathname?.startsWith("/disease-math"),
    },
    {
      href: "/family-study",
      label: "Family Study",
      active: pathname?.startsWith("/family-study"),
    },
  ];

  return (
    <div className="flex h-16 items-center px-4 border-b border-border bg-card">
      <Button
        variant="ghost"
        size="icon"
        className="mr-2 md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <div className="flex items-center">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">
            K
          </div>
          <span className="heading-4 hidden md:inline-block">KARMASTAT</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "body-small font-medium transition-colors hover:text-primary",
                route.active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
