import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [user, setUser] = useState(null);
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const navigate = useNavigate();
  const gridRef = useRef(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (userData && token) {
      setUser(JSON.parse(userData));
    } else {
      // Montrer les options d'authentification après un délai
      const timer = setTimeout(() => {
        setShowAuthOptions(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleGetStarted = () => {
    setShowAuthOptions(true);
  };

  const handleSignIn = () => {
    navigate("/signin");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleExploreDemo = () => {
    // Option pour explorer sans compte
    setShowAuthOptions(false);
    // Ici vous pouvez rediriger vers une version démo ou afficher un message
    setTimeout(() => {
      setShowAuthOptions(true);
    }, 3000);
  };

  return (
    <div style={styles.container}>
      {/* Arrière-plan cybernétique */}
      <div style={styles.cyberBackground}>
        {Array.from({ length: 25 }, (_, i) => (
          <div
            key={i}
            style={{
              ...styles.floatingOrb,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
        
        {/* Lignes de données animées */}
        <div style={styles.dataStream}>
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              style={{
                ...styles.dataLine,
                left: `${i * 12}%`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div style={styles.content}>
        
        {/* En-tête holographique */}
       

        {/* Section principale */}
        <main style={styles.main}>
          <div style={styles.heroSection}>
            
            {/* Message de bienvenue futuriste */}
            <div style={styles.heroContent}>
              <div style={styles.titleGroup}>
                <h1 style={styles.mainTitle}>
                  <span style={styles.titleGlow}>BIENVENUE DANS</span>
                  <span style={styles.titleHighlight}>LA VILLE INTELLIGENTE</span>
                </h1>
                
                <p style={styles.subtitle}>
                  Expérimentez l'avenir de la mobilité urbaine, de l'énergie durable 
                  et des services connectés. Rejoignez le réseau intelligent qui 
                  révolutionne la vie urbaine.
                </p>

                {/* Statistiques impressionnantes */}
                <div style={styles.statsGrid}>
                  <div style={styles.statItem}>
                    <div style={styles.statNumber}>50K+</div>
                    <div style={styles.statLabel}>CITOYENS CONNECTÉS</div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={styles.statNumber}>24/7</div>
                    <div style={styles.statLabel}>SURVEILLANCE IA</div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={styles.statNumber}>98%</div>
                    <div style={styles.statLabel}>SATISFACTION</div>
                  </div>
                </div>
              </div>

              {/* Options d'authentification */}
              {showAuthOptions ? (
                <div style={styles.authSection}>
                  <div style={styles.authCard}>
                    <div style={styles.authHeader}>
                      <h3 style={styles.authTitle}>ACCÈS AU RÉSEAU</h3>
                      <p style={styles.authSubtitle}>
                        Choisissez votre méthode d'authentification
                      </p>
                    </div>

                    <div style={styles.authButtons}>
                      <button 
                        style={styles.primaryAuthButton}
                        onClick={handleSignIn}
                      >
                        <span style={styles.buttonIcon}>🔐</span>
                        <div style={styles.buttonText}>
                          <div style={styles.buttonMain}>CONNEXION</div>
                          <div style={styles.buttonSub}>J'ai déjà un compte</div>
                        </div>
                        <div style={styles.buttonGlow}></div>
                      </button>

                      <button 
                        style={styles.secondaryAuthButton}
                        onClick={handleSignUp}
                      >
                        <span style={styles.buttonIcon}>🚀</span>
                        <div style={styles.buttonText}>
                          <div style={styles.buttonMain}>INSCRIPTION</div>
                          <div style={styles.buttonSub}>Nouveau sur SmartCity</div>
                        </div>
                        <div style={styles.buttonGlow}></div>
                      </button>
                    </div>

                    <div style={styles.demoOption}>
                      <button 
                        style={styles.demoButton}
                        onClick={handleExploreDemo}
                      >
                        <span style={styles.demoIcon}>👁️</span>
                        Explorer la démonstration
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Bouton d'entrée principal */
                <div style={styles.ctaSection}>
                  <button 
                    style={styles.ctaButton}
                    onClick={handleGetStarted}
                  >
                    <span style={styles.ctaIcon}>🎯</span>
                    <span style={styles.ctaText}>ACCÉDER AU SYSTÈME</span>
                    <div style={styles.ctaPulse}></div>
                  </button>
                  
                  <p style={styles.ctaHint}>
                    Interface de gestion urbaine intelligente
                  </p>
                </div>
              )}
            </div>

            {/* Visualisation futuriste */}
            <div style={styles.visualization}>
              <div style={styles.cityGrid}>
                {Array.from({ length: 36 }, (_, i) => (
                  <div key={i} style={styles.gridCell}>
                    <div style={styles.cellPulse}></div>
                  </div>
                ))}
              </div>
              
              <div style={styles.scanOverlay}>
                <div style={styles.scanLine}></div>
                <div style={styles.scanText}>SYSTÈME DE VILLE INTELLIGENTE</div>
              </div>
            </div>
          </div>
        </main>

        {/* Pied de page */}
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.techBadges}>
              <span style={styles.badge}>🏙️ URBAN TECH</span>
              <span style={styles.badge}>⚡ ÉNERGIE DURABLE</span>
              <span style={styles.badge}>🚀 MOBILITÉ AVANCÉE</span>
              <span style={styles.badge}>🛡️ SÉCURITÉ INTELLIGENTE</span>
            </div>
            
            <div style={styles.securityNote}>
              <span style={styles.securityIcon}>🔒</span>
              Système certifié ISO-27001 • Protection des données garantie
            </div>
          </div>
        </footer>
      </div>

      {/* Styles CSS globaux */}
      <style jsx="true" global="true">{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.8;
          }
        }

        @keyframes dataFlow {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: scale(1.1);
            opacity: 1;
          }
        }

        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }

        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
          }
          50% { 
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.6);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0a0a0a",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
    color: "#ffffff",
    fontFamily: "'Orbitron', 'Rajdhani', monospace",
    overflow: "hidden",
    position: "relative"
  },
  cyberBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0
  },
  floatingOrb: {
    position: "absolute",
    width: "4px",
    height: "4px",
    backgroundColor: "#00ffff",
    borderRadius: "50%",
    animation: "float 20s ease-in-out infinite",
    boxShadow: "0 0 10px #00ffff"
  },
  dataStream: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  dataLine: {
    position: "absolute",
    width: "1px",
    height: "100px",
    background: "linear-gradient(180deg, transparent, #00ffff, transparent)",
    animation: "dataFlow 4s linear infinite",
    opacity: 0.3
  },
  content: {
    position: "relative",
    zIndex: 2,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column"
  },
  header: {
    padding: "2rem 3rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem"
  },
  logoOrb: {
    position: "relative",
    width: "70px",
    height: "70px",
    background: "linear-gradient(135deg, #00ffff, #0099ff)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 30px rgba(0, 255, 255, 0.5)"
  },
  orbGlow: {
    position: "absolute",
    top: "-3px",
    left: "-3px",
    right: "-3px",
    bottom: "-3px",
    background: "linear-gradient(135deg, #00ffff, #0099ff)",
    borderRadius: "50%",
    filter: "blur(8px)",
    opacity: 0.5,
    animation: "pulse 2s ease-in-out infinite"
  },
  logoIcon: {
    fontSize: "2rem",
    filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))"
  },
  logoTextContainer: {
    display: "flex",
    flexDirection: "column"
  },
  logoText: {
    fontSize: "2.5rem",
    fontWeight: "900",
    background: "linear-gradient(135deg, #00ffff, #0099ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "3px"
  },
  logoSubtext: {
    fontSize: "0.7rem",
    fontWeight: "300",
    color: "#88ffff",
    letterSpacing: "2px",
    marginTop: "0.25rem"
  },
  main: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem"
  },
  heroSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "4rem",
    alignItems: "center",
    maxWidth: "1400px",
    width: "100%"
  },
  heroContent: {
    display: "flex",
    flexDirection: "column",
    gap: "3rem"
  },
  titleGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem"
  },
  mainTitle: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },
  titleGlow: {
    fontSize: "1.8rem",
    fontWeight: "300",
    color: "#88ffff",
    letterSpacing: "2px"
  },
  titleHighlight: {
    fontSize: "3.5rem",
    fontWeight: "900",
    background: "linear-gradient(135deg, #ffffff, #00ffff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    lineHeight: "1.1",
    letterSpacing: "1px"
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#88ffff",
    fontWeight: "300",
    lineHeight: "1.6",
    maxWidth: "500px"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "2rem",
    marginTop: "1rem"
  },
  statItem: {
    textAlign: "center",
    padding: "1rem",
    backgroundColor: "rgba(0, 255, 255, 0.05)",
    borderRadius: "1rem",
    border: "1px solid rgba(0, 255, 255, 0.2)"
  },
  statNumber: {
    fontSize: "1.8rem",
    fontWeight: "900",
    color: "#00ffff",
    marginBottom: "0.5rem"
  },
  statLabel: {
    fontSize: "0.8rem",
    color: "#88ffff",
    fontWeight: "600",
    letterSpacing: "1px"
  },
  ctaSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "1rem"
  },
  ctaButton: {
    position: "relative",
    padding: "1.5rem 3rem",
    background: "linear-gradient(135deg, #00ff88, #00ffff)",
    border: "none",
    borderRadius: "2rem",
    color: "#0a0a0a",
    cursor: "pointer",
    fontWeight: "900",
    fontSize: "1.1rem",
    letterSpacing: "2px",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    animation: "glow 2s ease-in-out infinite",
    transition: "all 0.3s ease",
    overflow: "hidden"
  },
  ctaIcon: {
    fontSize: "1.5rem"
  },
  ctaText: {
    zIndex: 2,
    position: "relative"
  },
  ctaPulse: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, #00ff88, #00ffff)",
    borderRadius: "2rem",
    animation: "pulse 2s ease-in-out infinite",
    opacity: 0.5
  },
  ctaHint: {
    color: "#88ffff",
    fontSize: "0.9rem",
    fontWeight: "300"
  },
  authSection: {
    animation: "slideIn 0.5s ease-out"
  },
  authCard: {
    backgroundColor: "rgba(10, 15, 35, 0.8)",
    padding: "2.5rem",
    borderRadius: "2rem",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
  },
  authHeader: {
    textAlign: "center",
    marginBottom: "2.5rem"
  },
  authTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#00ffff",
    marginBottom: "0.5rem",
    letterSpacing: "2px"
  },
  authSubtitle: {
    color: "#88ffff",
    fontSize: "1rem",
    fontWeight: "300"
  },
  authButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    marginBottom: "2rem"
  },
  primaryAuthButton: {
    position: "relative",
    padding: "1.5rem 2rem",
    background: "linear-gradient(135deg, #00ffff, #0099ff)",
    border: "none",
    borderRadius: "1rem",
    color: "#0a0a0a",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    transition: "all 0.3s ease",
    overflow: "hidden"
  },
  secondaryAuthButton: {
    position: "relative",
    padding: "1.5rem 2rem",
    background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
    border: "none",
    borderRadius: "1rem",
    color: "#ffffff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    transition: "all 0.3s ease",
    overflow: "hidden"
  },
  buttonIcon: {
    fontSize: "1.8rem",
    zIndex: 2
  },
  buttonText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    zIndex: 2
  },
  buttonMain: {
    fontWeight: "700",
    fontSize: "1rem",
    letterSpacing: "1px"
  },
  buttonSub: {
    fontSize: "0.8rem",
    opacity: 0.9,
    fontWeight: "300"
  },
  buttonGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, transparent, rgba(255,255,255,0.2), transparent)",
    opacity: 0,
    transition: "opacity 0.3s ease"
  },
  demoOption: {
    textAlign: "center",
    paddingTop: "1.5rem",
    borderTop: "1px solid rgba(0, 255, 255, 0.2)"
  },
  demoButton: {
    background: "none",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "2rem",
    color: "#88ffff",
    padding: "0.75rem 1.5rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
    transition: "all 0.3s ease"
  },
  demoIcon: {
    fontSize: "1rem"
  },
  visualization: {
    position: "relative",
    height: "400px",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    borderRadius: "2rem",
    overflow: "hidden"
  },
  cityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gridTemplateRows: "repeat(6, 1fr)",
    height: "100%",
    padding: "1rem"
  },
  gridCell: {
    border: "1px solid rgba(0, 255, 255, 0.1)",
    position: "relative",
    overflow: "hidden"
  },
  cellPulse: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "4px",
    height: "4px",
    backgroundColor: "#00ffff",
    borderRadius: "50%",
    animation: "pulse 3s ease-in-out infinite",
    animationDelay: "calc(var(--delay, 0) * 0.5s)"
  },
  scanOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "2rem"
  },
  scanLine: {
    width: "100%",
    height: "2px",
    background: "linear-gradient(90deg, transparent, #00ffff, transparent)",
    animation: "scan 3s linear infinite"
  },
  scanText: {
    color: "#88ffff",
    fontSize: "0.9rem",
    fontWeight: "600",
    letterSpacing: "2px"
  },
  footer: {
    padding: "2rem 3rem",
    borderTop: "1px solid rgba(0, 255, 255, 0.1)"
  },
  footerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  techBadges: {
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap"
  },
  badge: {
    padding: "0.5rem 1rem",
    backgroundColor: "rgba(0, 255, 255, 0.1)",
    borderRadius: "2rem",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#88ffff",
    border: "1px solid rgba(0, 255, 255, 0.2)"
  },
  securityNote: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#88ffff",
    fontSize: "0.8rem",
    fontWeight: "300"
  },
  securityIcon: {
    fontSize: "1rem"
  }
};

// Ajouter des délais d'animation aléatoires pour les cellules
const gridCells = document.querySelectorAll('.grid-cell');
gridCells.forEach((cell, index) => {
  cell.style.setProperty('--delay', Math.random() * 10);
});