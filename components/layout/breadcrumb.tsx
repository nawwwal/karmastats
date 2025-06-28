import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb() {
  const pathname = usePathname();
  
  if (!pathname || pathname === "/") return null;
  
  const pathSegments = pathname.split("/").filter(Boolean);
  
  // Map of path segments to human-readable names
  const pathNames: Record<string, string> = {
    "sample-size": "Sample Size",
    "regression": "Regression",
    "disease-math": "Disease Modeling",
    "family-study": "Family Health Study",
    "comparative": "Comparative Study",
    "diagnostic": "Diagnostic Study",
    "clinical-trials": "Clinical Trials",
    "cross-sectional": "Cross-sectional Study",
    "survival": "Survival Analysis",
    "t-test": "T-Test",
    "intelligent-detector": "Study Detector"
  };
  
  return (
    <nav className="flex items-center text-sm text-muted-foreground py-2 px-4 bg-background">
      <Link href="/" className="flex items-center hover:text-primary transition-colors">
        <Home className="h-4 w-4 mr-1" />
        <span>Home</span>
      </Link>
      
      {pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
        const isLast = index === pathSegments.length - 1;
        
        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            {isLast ? (
              <span className="font-medium text-foreground">
                {pathNames[segment] || segment.replace(/-/g, " ")}
              </span>
            ) : (
              <Link 
                href={path}
                className="hover:text-primary transition-colors"
              >
                {pathNames[segment] || segment.replace(/-/g, " ")}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
