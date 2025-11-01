import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Car,
  Bus,
  Building2,
  Battery,
  MessageSquare,
  BarChart3,
  Navigation,
  Zap,
  ArrowRight,
} from "lucide-react";

export const ModulesSection = () => {
  const modules = [
    {
      icon: Car,
      title: "Mobilité Intelligente",
      description: "Optimisation des trajets en temps réel avec IA prédictive",
      color: "primary",
      gradient: "from-primary/20 to-primary/5",
    },
    {
      icon: Bus,
      title: "Transports Publics",
      description: "Bus, métro et tramways connectés pour une ville fluide",
      color: "secondary",
      gradient: "from-secondary/20 to-secondary/5",
    },
    {
      icon: Building2,
      title: "Infrastructures",
      description: "Bâtiments intelligents et espaces urbains connectés",
      color: "accent",
      gradient: "from-accent/20 to-accent/5",
    },
    {
      icon: Battery,
      title: "Énergie Propre",
      description: "Réseau de recharge électrique et énergies renouvelables",
      color: "success",
      gradient: "from-success/20 to-success/5",
    },
    {
      icon: MessageSquare,
      title: "Avis Citoyens",
      description: "Plateforme participative pour améliorer la ville ensemble",
      color: "warning",
      gradient: "from-warning/20 to-warning/5",
    },
    {
      icon: BarChart3,
      title: "Données & Analyses",
      description: "Statistiques en temps réel pour une gestion optimale",
      color: "primary",
      gradient: "from-primary/20 to-primary/5",
    },
    {
      icon: Navigation,
      title: "Planification de Trajets",
      description: "Routes optimales selon trafic, pollution et préférences",
      color: "secondary",
      gradient: "from-secondary/20 to-secondary/5",
    },
    {
      icon: Zap,
      title: "IA Urbaine",
      description: "Intelligence artificielle pour anticiper et optimiser",
      color: "accent",
      gradient: "from-accent/20 to-accent/5",
    },
  ];

  return (
    <section className="py-20 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-4 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Modules{" "}
              <span className="gradient-primary bg-clip-text text-transparent">
                Interactifs
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Explorez les différents services de la ville intelligente et découvrez comment
              la technologie transforme notre quotidien
            </p>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Card
                  key={index}
                  className="glass-effect border-primary/20 overflow-hidden group hover:border-primary/50 transition-all hover:-translate-y-2 cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="relative p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl bg-${module.color}/10 group-hover:shadow-neon transition-all`}>
                        <Icon className={`h-6 w-6 text-${module.color}`} />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center pt-8 animate-fade-in">
            <Link to="/dashboard">
              <Button
                size="lg"
                className="gradient-primary shadow-neon hover:scale-105 transition-smooth group"
              >
                Découvrir tous les modules
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
