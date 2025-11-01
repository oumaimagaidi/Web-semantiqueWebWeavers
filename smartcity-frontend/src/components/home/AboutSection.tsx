import { Card } from "@/components/ui/card";
import { Leaf, Zap, Brain, Users } from "lucide-react";

export const AboutSection = () => {
  const features = [
    {
      icon: Leaf,
      title: "Écologie",
      description: "Réduction de 60% des émissions CO2 grâce aux transports intelligents",
      color: "secondary",
    },
    {
      icon: Zap,
      title: "Énergie",
      description: "100% d'énergies renouvelables avec un réseau intelligent",
      color: "warning",
    },
    {
      icon: Brain,
      title: "Intelligence",
      description: "IA urbaine pour optimiser chaque aspect de la ville",
      color: "primary",
    },
    {
      icon: Users,
      title: "Citoyens",
      description: "Une ville participative où chaque voix compte",
      color: "accent",
    },
  ];

  return (
    <section className="py-20 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Section Header */}
          <div className="text-center space-y-4 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Une ville{" "}
              <span className="gradient-primary bg-clip-text text-transparent">
                intelligente et durable
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              SmartCity Vision 2050 repense l'urbanisme à travers la technologie, la durabilité
              et l'innovation pour créer un environnement urbain harmonieux et efficient.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="glass-effect border-primary/20 p-6 hover:border-primary/50 transition-all hover:-translate-y-2 group animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="space-y-4">
                    <div className={`inline-flex p-3 rounded-xl bg-${feature.color}/10 shadow-neon-${feature.color === 'secondary' ? 'green' : feature.color === 'primary' ? '' : 'purple'}`}>
                      <Icon className={`h-6 w-6 text-${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
            {[
              { value: "100K+", label: "Citoyens connectés" },
              { value: "60%", label: "Réduction CO2" },
              { value: "24/7", label: "Monitoring IA" },
              { value: "500+", label: "Points de recharge" },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center space-y-2 animate-scale-in"
                style={{ animationDelay: `${index * 0.1 + 0.5}s` }}
              >
                <div className="text-3xl sm:text-4xl font-bold neon-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
