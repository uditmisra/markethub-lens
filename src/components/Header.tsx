import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-hero p-2 rounded-lg transition-transform group-hover:scale-105">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">CustomerEvidence</span>
        </Link>
        
        <nav className="flex items-center gap-1">
          <Button
            variant={isActive("/") ? "secondary" : "ghost"}
            asChild
          >
            <Link to="/">Home</Link>
          </Button>
          <Button
            variant={isActive("/submit") ? "secondary" : "ghost"}
            asChild
          >
            <Link to="/submit">Submit Evidence</Link>
          </Button>
          <Button
            variant={isActive("/dashboard") ? "secondary" : "ghost"}
            asChild
          >
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};
