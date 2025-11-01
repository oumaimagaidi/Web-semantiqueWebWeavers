import { Link } from "react-router-dom";
import { Building2, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  const footerLinks = {
    Produit: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "API", href: "#" },
      { name: "Documentation", href: "#" },
      { name: "Tarifs", href: "#" },
    ],
    Entreprise: [
      { name: "À propos", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Carrières", href: "#" },
      { name: "Contact", href: "#" },
    ],
    Ressources: [
      { name: "Guides", href: "#" },
      { name: "Support", href: "#" },
      { name: "Statut", href: "#" },
      { name: "Changelog", href: "#" },
    ],
    Légal: [
      { name: "Confidentialité", href: "#" },
      { name: "Conditions", href: "#" },
      { name: "Cookies", href: "#" },
      { name: "Licences", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <footer className="relative border-t border-primary/20 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl group-hover:bg-primary/30 transition-all" />
                <div className="relative gradient-primary p-2 rounded-xl shadow-neon">
                  <Building2 className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold neon-text">SmartCity</h3>
                <p className="text-xs text-muted-foreground">Vision 2050</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Construisons ensemble la ville intelligente de demain, durable, connectée et
              centrée sur l'humain.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10 hover:text-primary transition-smooth"
                    asChild
                  >
                    <a href={social.href} aria-label={social.label}>
                      <Icon className="h-4 w-4" />
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-sm font-semibold">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 SmartCity Vision 2050. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">Propulsé par</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-neon" />
                <span className="text-sm font-medium">Lovable AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
