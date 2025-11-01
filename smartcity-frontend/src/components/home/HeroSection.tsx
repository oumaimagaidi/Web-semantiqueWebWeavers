import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-primary/30 shadow-neon">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">L'avenir urbain commence ici</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
            Bienvenue dans{" "}
            <span className="neon-text gradient-primary bg-clip-text text-transparent">
              l'avenir urbain
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez la mobilité intelligente de demain. Une ville connectée, durable et
            efficiente alimentée par l'IA et les données.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/dashboard">
              <Button
                size="lg"
                className="gradient-primary shadow-neon hover:scale-105 transition-smooth text-lg px-8 group"
              >
                Explorer le Dashboard
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/50 hover:bg-primary/10 hover:border-primary transition-smooth text-lg px-8"
            >
              En savoir plus
            </Button>
          </div>

          {/* Floating City Illustration */}
          <div className="relative mt-12 pt-12">
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
              
              {/* City skyline with neon effects */}
              <div className="relative h-64 sm:h-80 flex items-end justify-center gap-2 sm:gap-4">
                {/* Buildings */}
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="relative group animate-float"
                    style={{
                      height: `${Math.random() * 60 + 40}%`,
                      width: `${100 / 7}%`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  >
                    <div className="absolute inset-0 glass-effect neon-border rounded-t-lg overflow-hidden">
                      {/* Windows */}
                      <div className="grid grid-cols-2 gap-1 p-2 h-full">
                        {[...Array(8)].map((_, j) => (
                          <div
                            key={j}
                            className={`rounded-sm ${
                              Math.random() > 0.3
                                ? "bg-primary/50 shadow-neon"
                                : "bg-muted/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Building glow */}
                    <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-all" />
                  </div>
                ))}
              </div>

              {/* Connection lines */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
                style={{ filter: "drop-shadow(0 0 4px hsl(var(--primary)))" }}
              >
                <line
                  x1="10%"
                  y1="50%"
                  x2="90%"
                  y2="60%"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1"
                  className="animate-pulse-slow"
                />
                <line
                  x1="30%"
                  y1="40%"
                  x2="70%"
                  y2="70%"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="1"
                  className="animate-pulse-slow"
                  style={{ animationDelay: "1s" }}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};
