import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Menu, X } from "lucide-react";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Accueil", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Statistiques", href: "/dashboard" },
    { name: "Transports", href: "/dashboard" },
    { name: "Infrastructures", href: "/dashboard" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-primary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl group-hover:bg-primary/30 transition-all" />
              <div className="relative gradient-primary p-2 rounded-xl shadow-neon">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold neon-text">SmartCity</h1>
              <p className="text-xs text-muted-foreground">Vision 2050</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.name} to={item.href}>
                <Button
                  variant="ghost"
                  className="text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-smooth"
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>

          {/* CTA Button Desktop */}
          <div className="hidden md:block">
            <Link to="/dashboard">
              <Button className="gradient-primary shadow-neon hover:scale-105 transition-smooth">
                Accéder au Dashboard
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-slide-up">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-primary/10"
                >
                  {item.name}
                </Button>
              </Link>
            ))}
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full gradient-primary shadow-neon mt-2">
                Accéder au Dashboard
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
