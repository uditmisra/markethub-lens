import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useEvidence } from "@/hooks/useEvidence";

export const Header = () => {
  const location = useLocation();
  const { canApprove, isAdmin } = useUserRole();
  const { pendingCount } = useEvidence();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-hero p-2 rounded-lg transition-transform group-hover:scale-105">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">WallOfLove</span>
        </Link>
        
        <nav className="flex items-center gap-1">
          <Button
            variant={isActive("/") ? "secondary" : "ghost"}
            asChild
          >
            <Link to="/">Home</Link>
          </Button>
          <Button
            variant={isActive("/testimonials") ? "secondary" : "ghost"}
            asChild
          >
            <Link to="/testimonials">Wall of Love</Link>
          </Button>
          <Button
            variant={isActive("/submit") ? "secondary" : "ghost"}
            asChild
          >
            <Link to="/submit">Share Feedback</Link>
          </Button>
          <Button
            variant={isActive("/dashboard") ? "secondary" : "ghost"}
            asChild
          >
            <Link to="/dashboard">Testimonial Library</Link>
          </Button>
          {canApprove && (
            <Button
              variant={isActive("/admin/review") ? "secondary" : "ghost"}
              asChild
              className="relative"
            >
              <Link to="/admin/review">
                Pending Review
                {pendingCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-2 h-5 min-w-5 px-1.5 rounded-full text-xs"
                  >
                    {pendingCount}
                  </Badge>
                )}
              </Link>
            </Button>
          )}
          {isAdmin && (
            <>
              <Button
                variant={isActive("/integrations") ? "secondary" : "ghost"}
                asChild
              >
                <Link to="/integrations">Connections</Link>
              </Button>
              <Button
                variant={isActive("/widgets") ? "secondary" : "ghost"}
                asChild
              >
                <Link to="/widgets">Embed</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
