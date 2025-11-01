import { Card } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Activity } from "lucide-react";

export const StatsSection = () => {
  const stats = [
    {
      title: "Trafic en temps réel",
      value: "75%",
      trend: "down",
      trendValue: "-15%",
      description: "Réduction des embouteillages",
      color: "success",
    },
    {
      title: "Qualité de l'air",
      value: "Excellent",
      trend: "up",
      trendValue: "+25%",
      description: "Amélioration de la qualité",
      color: "primary",
    },
    {
      title: "Satisfaction citoyenne",
      value: "94%",
      trend: "up",
      trendValue: "+8%",
      description: "Évaluation positive",
      color: "warning",
    },
  ];

  return (
    <section className="py-20 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-4 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Statistiques{" "}
              <span className="gradient-primary bg-clip-text text-transparent">
                en Temps Réel
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Suivez les performances de la ville en direct grâce à nos capteurs intelligents
              et notre système d'analyse IA
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="glass-effect border-primary/20 p-6 hover:border-primary/50 transition-all hover:-translate-y-2 group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </h3>
                    <Activity className={`h-4 w-4 text-${stat.color} animate-pulse`} />
                  </div>

                  {/* Value */}
                  <div className="space-y-2">
                    <div className={`text-4xl font-bold neon-text`}>
                      {stat.value}
                    </div>
                    
                    {/* Trend */}
                    <div className="flex items-center gap-2">
                      {stat.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-success" />
                      )}
                      <span className="text-sm font-semibold text-success">
                        {stat.trendValue}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        vs. mois dernier
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground border-t border-primary/10 pt-3">
                    {stat.description}
                  </p>

                  {/* Progress bar */}
                  <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${stat.color} rounded-full transition-all duration-1000 shadow-neon`}
                      style={{
                        width: stat.value.includes("%") ? stat.value : "94%",
                        animationDelay: `${index * 0.2}s`,
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Live Data Visualization */}
          <Card className="glass-effect border-primary/20 p-8 mt-12 animate-fade-in">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-center">
                Flux de données en temps réel
              </h3>
              
              {/* Simulated data stream */}
              <div className="relative h-32 bg-muted/10 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center gap-1">
                  {[...Array(50)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary/50 rounded-full animate-pulse-slow"
                      style={{
                        height: `${Math.random() * 80 + 20}%`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Données collectées depuis plus de 5000 capteurs IoT à travers la ville
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
