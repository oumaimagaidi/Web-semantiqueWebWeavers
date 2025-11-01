import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [particles, setParticles] = useState([]);
  const [scanActive, setScanActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);

  // Système de particules futuriste
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 3 + 1,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/signin", { replace: true });
    }
  }, [navigate]);

  // Vérifier s'il y a un message de succès depuis la page d'inscription
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setScanActive(true);

    try {
      const response = await axios.post("http://localhost:8000/auth/signin/", formData);
      
      // Stocker le token et les infos utilisateur
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }
      
      // Animation de succès avant redirection
      setTimeout(() => {
        navigate("/app", { replace: true });
      }, 1000);
      
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError(err.response?.data?.detail || "Échec d'authentification. Vérifiez vos identifiants.");
      setScanActive(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: "demo@nexus.city",
      password: "encryption_key_2024"
    });
    setScanActive(true);
    setTimeout(() => setScanActive(false), 2000);
  };

  const handleForgotPassword = () => {
    setError("Module de récupération en cours d'initialisation. Contactez le support technique.");
  };

  const handleBiometricLogin = () => {
    setScanActive(true);
    setTimeout(() => {
      setError("Capteur biométrique non détecté. Utilisez l'authentification standard.");
      setScanActive(false);
    }, 2000);
  };

  return (
    <div style={styles.container} ref={containerRef}>
      {/* Réseau neuronal cybernétique */}
      <div style={styles.neuralNetwork}>
        {particles.map(particle => (
          <div
            key={particle.id}
            style={{
              ...styles.neuralParticle,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.speed * 8}s`
            }}
          />
        ))}
        
        {/* Lignes de données */}
        <div style={styles.dataStream}>
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              style={{
                ...styles.dataLine,
                left: `${i * 15}%`,
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Interface holographique principale */}
      <div style={styles.hologram}>
        <div style={styles.hologramGlow}></div>
        
        <div style={styles.card}>
          {/* En-tête cybernétique */}
          <div style={styles.header}>
            <div style={styles.logo}>
              <div style={styles.logoOrb}>
                <div style={styles.orbGlow}></div>
                <span style={styles.logoIcon}>⚡</span>
              </div>
              <div style={styles.logoTextContainer}>
                <span style={styles.logoText}>smartCity</span>
                <span style={styles.logoSubtext}>ACCESS CONTROL</span>
              </div>
            </div>
            
            <div style={styles.titleSection}>
              <h1 style={styles.title}>
                <span style={styles.titleMain}>AUTHENTIFICATION REQUISE</span>
                <span style={styles.titleSub}>Accès au réseau urbain intelligent</span>
              </h1>
              {scanActive && (
                <div style={styles.scanOverlay}>
                  <div style={styles.scanLine}></div>
                  <div style={styles.scanText}>ANALYSE BIOMÉTRIQUE...</div>
                </div>
              )}
            </div>
          </div>

          {/* Alerts système */}
          {error && (
            <div style={styles.errorAlert}>
              <div style={styles.alertContent}>
                <div style={styles.alertOrb}>⚠️</div>
                <div>
                  <div style={styles.alertTitle}>ALERTE SÉCURITÉ</div>
                  <div style={styles.alertText}>{error}</div>
                </div>
              </div>
              <div style={styles.alertPulse}></div>
            </div>
          )}

          {success && (
            <div style={styles.successAlert}>
              <div style={styles.alertContent}>
                <div style={styles.alertOrb}>✅</div>
                <div>
                  <div style={styles.alertTitle}>SYNCHRONISATION RÉUSSIE</div>
                  <div style={styles.alertText}>{success}</div>
                </div>
              </div>
              <div style={styles.alertPulse}></div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Champ d'identifiant quantique */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelText}>IDENTIFIANT QUANTIQUE</span>
                <div style={styles.inputContainer}>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="citoyen@nexus.city"
                    required
                  />
                  <div style={styles.inputGlow}></div>
                  <div style={styles.inputIcon}>📧</div>
                </div>
              </label>
            </div>

            {/* Champ de clé de cryptage */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelText}>CLÉ DE CRYPTAGE</span>
                <div style={styles.inputContainer}>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="●●●●●●●●●●●●"
                    required
                  />
                  <div style={styles.inputGlow}></div>
                  <div style={styles.inputIcon}>🔒</div>
                </div>
              </label>
            </div>

            {/* Options de sécurité */}
            <div style={styles.optionsRow}>
              <label style={styles.checkboxLabel}>
                <div style={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <div style={styles.checkboxDesign}></div>
                </div>
                <span style={styles.checkboxText}>MÉMOIRE CYBERNÉTIQUE</span>
              </label>
              
              <button 
                type="button" 
                onClick={handleForgotPassword}
                style={styles.forgotPassword}
              >
                CLÉ COMPROMISE ?
              </button>
            </div>

            {/* Bouton d'authentification principale */}
            <button 
              type="submit" 
              style={{
                ...styles.submitButton,
                ...(loading && styles.buttonDisabled),
                ...(scanActive && styles.scanningButton)
              }}
              disabled={loading}
            >
              {loading ? (
                <div style={styles.buttonContent}>
                  <div style={styles.quantumSpinner}></div>
                  <span>VÉRIFICATION BIOMÉTRIQUE...</span>
                </div>
              ) : (
                <div style={styles.buttonContent}>
                  <span style={styles.buttonOrb}>🚀</span>
                  <span>INITIER LA CONNEXION</span>
                </div>
              )}
            </button>

            {/* Séparateur technologique */}
            {/* <div style={styles.divider}>
              <div style={styles.dividerLine}></div>
              <span style={styles.dividerText}>PROTOCOLE ALTERNATIF</span>
              <div style={styles.dividerLine}></div>
            </div> */}

            {/* Options d'authentification avancées */}
            {/* <div style={styles.authOptions}>
              <button 
                type="button" 
                onClick={handleDemoLogin}
                style={styles.demoButton}
              >
                <span style={styles.demoIcon}>👁️</span>
                <span>ACCÈS DÉMONSTRATION</span>
              </button>
              
              <button 
                type="button" 
                onClick={handleBiometricLogin}
                style={styles.biometricButton}
              >
                <span style={styles.biometricIcon}>👁️‍🗨️</span>
                <span>SCAN RÉTINIEN</span>
              </button>
            </div>

            <div style={styles.demoHint}>
              <span style={styles.demoHintText}>
                Système de démonstration - Accès limité aux fonctionnalités de base
              </span>
            </div> */}
          </form>

          {/* Pied de page cybernétique */}
          <div style={styles.footer}>
            <div style={styles.footerGlow}></div>
            <p style={styles.footerText}>
              NOUVEAU SUR LE RÉSEAU NEXUS ?{" "}
              <Link to="/signup" style={styles.footerLink}>
                INITIER UN PROTOCOLE D'ENREGISTREMENT
              </Link>
            </p>
            <div style={styles.securityBadge}>
              <span style={styles.securityIcon}>🛡️</span>
              <span style={styles.securityText}>SYSTÈME CERTIFIÉ ISO-27001</span>
            </div>
          </div>
        </div>
      </div>

      {/* Styles CSS globaux */}
      <style jsx global>{`
        @keyframes neuralFloat {
          0%, 100% { 
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.3;
          }
          25% { 
            transform: translate(10px, -15px) rotate(90deg);
            opacity: 0.6;
          }
          50% { 
            transform: translate(-5px, -25px) rotate(180deg);
            opacity: 0.8;
          }
          75% { 
            transform: translate(-15px, -10px) rotate(270deg);
            opacity: 0.6;
          }
        }

        @keyframes dataFlow {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }

        @keyframes quantumSpin {
          0% { 
            transform: rotate(0deg) scale(1);
            box-shadow: 0 0 20px #00ffff;
          }
          50% { 
            transform: rotate(180deg) scale(1.1);
            box-shadow: 0 0 30px #ff00ff;
          }
          100% { 
            transform: rotate(360deg) scale(1);
            box-shadow: 0 0 20px #00ffff;
          }
        }

        @keyframes scanAnimation {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(400%); opacity: 0; }
        }

        @keyframes hologramGlow {
          0%, 100% { 
            opacity: 0.6;
            filter: brightness(1);
          }
          50% { 
            opacity: 1;
            filter: brightness(1.3);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a0a0a",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
    padding: "1rem",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Orbitron', 'Rajdhani', monospace"
  },
  neuralNetwork: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    zIndex: 0
  },
  neuralParticle: {
    position: "absolute",
    backgroundColor: "#00ffff",
    borderRadius: "50%",
    animation: "neuralFloat 15s ease-in-out infinite",
    boxShadow: "0 0 8px #00ffff, 0 0 16px #00ffff"
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
    opacity: 0.4
  },
  hologram: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "500px"
  },
  hologramGlow: {
    position: "absolute",
    top: "-15px",
    left: "-15px",
    right: "-15px",
    bottom: "-15px",
    background: "radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%)",
    borderRadius: "2rem",
    animation: "hologramGlow 4s ease-in-out infinite",
    zIndex: -1
  },
  card: {
    backgroundColor: "rgba(10, 15, 35, 0.85)",
    padding: "2.5rem",
    borderRadius: "1.5rem",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    boxShadow: `
      0 0 40px rgba(0, 255, 255, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 8px 32px rgba(0, 0, 0, 0.6)
    `,
    backdropFilter: "blur(15px)",
    position: "relative",
    overflow: "hidden"
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
    position: "relative"
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    marginBottom: "1.5rem"
  },
  logoOrb: {
    position: "relative",
    width: "60px",
    height: "60px",
    background: "linear-gradient(135deg, #00ffff, #0099ff)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 25px rgba(0, 255, 255, 0.5)"
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
    fontSize: "1.8rem",
    filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))"
  },
  logoTextContainer: {
    textAlign: "left"
  },
  logoText: {
    fontSize: "2rem",
    fontWeight: "900",
    background: "linear-gradient(135deg, #00ffff, #0099ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    display: "block",
    lineHeight: "1",
    letterSpacing: "2px"
  },
  logoSubtext: {
    fontSize: "0.6rem",
    fontWeight: "300",
    color: "#88ffff",
    letterSpacing: "1.5px",
    display: "block",
    marginTop: "0.2rem"
  },
  titleSection: {
    position: "relative",
    overflow: "hidden",
    padding: "1rem 0"
  },
  title: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },
  titleMain: {
    fontSize: "1.4rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #ffffff, #88ffff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "1.5px"
  },
  titleSub: {
    fontSize: "0.9rem",
    fontWeight: "300",
    color: "#88ffff",
    letterSpacing: "1px"
  },
  scanOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(180deg, rgba(0,255,255,0.1) 0%, transparent 50%, rgba(0,255,255,0.1) 100%)",
    animation: "pulse 1.5s ease-in-out infinite"
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background: "linear-gradient(90deg, transparent, #00ffff, transparent)",
    animation: "scanAnimation 2s linear infinite"
  },
  scanText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "#00ffff",
    fontSize: "0.7rem",
    fontWeight: "600",
    letterSpacing: "1px"
  },
  errorAlert: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    color: "#ff6b6b",
    padding: "1.25rem",
    borderRadius: "1rem",
    marginBottom: "1.5rem",
    border: "1px solid rgba(255, 0, 0, 0.3)",
    position: "relative",
    overflow: "hidden"
  },
  successAlert: {
    backgroundColor: "rgba(0, 255, 0, 0.1)",
    color: "#6bcf7f",
    padding: "1.25rem",
    borderRadius: "1rem",
    marginBottom: "1.5rem",
    border: "1px solid rgba(0, 255, 0, 0.3)",
    position: "relative",
    overflow: "hidden"
  },
  alertContent: {
    display: "flex",
    alignItems: "center",
    gap: "1rem"
  },
  alertOrb: {
    fontSize: "1.3rem",
    filter: "drop-shadow(0 0 8px currentColor)"
  },
  alertTitle: {
    fontSize: "0.75rem",
    fontWeight: "700",
    letterSpacing: "1px",
    marginBottom: "0.25rem"
  },
  alertText: {
    fontSize: "0.8rem",
    fontWeight: "300"
  },
  alertPulse: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
    animation: "dataFlow 2s linear infinite"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column"
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  },
  labelText: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#88ffff",
    letterSpacing: "1px",
    textTransform: "uppercase"
  },
  inputContainer: {
    position: "relative"
  },
  input: {
    padding: "1.25rem 3rem 1.25rem 1.25rem",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    borderRadius: "1rem",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    outline: "none",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    color: "#ffffff",
    width: "100%",
    boxSizing: "border-box",
    fontWeight: "400",
    fontFamily: "'Rajdhani', sans-serif"
  },
  inputGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: "1rem",
    boxShadow: "0 0 0 0 rgba(0, 255, 255, 0)",
    transition: "all 0.3s ease",
    pointerEvents: "none",
    zIndex: -1
  },
  inputIcon: {
    position: "absolute",
    right: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "1.2rem",
    opacity: 0.7
  },
  optionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "-0.5rem"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    cursor: "pointer"
  },
  checkboxContainer: {
    position: "relative"
  },
  checkbox: {
    position: "absolute",
    opacity: 0,
    cursor: "pointer"
  },
  checkboxDesign: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(0, 255, 255, 0.5)",
    borderRadius: "4px",
    position: "relative",
    transition: "all 0.3s ease"
  },
  checkboxText: {
    fontSize: "0.7rem",
    color: "#88ffff",
    fontWeight: "500",
    letterSpacing: "0.5px"
  },
  forgotPassword: {
    background: "none",
    border: "none",
    color: "#ff6b6b",
    fontSize: "0.7rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "color 0.2s ease",
    textDecoration: "none",
    letterSpacing: "0.5px"
  },
  submitButton: {
    background: "linear-gradient(135deg, #00ff88, #00ffff)",
    color: "#0a0a0a",
    border: "none",
    padding: "1.25rem 2rem",
    borderRadius: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "0.9rem",
    letterSpacing: "1.5px",
    boxShadow: "0 0 25px rgba(0, 255, 255, 0.4)",
    marginTop: "0.5rem",
    position: "relative",
    overflow: "hidden"
  },
  scanningButton: {
    background: "linear-gradient(135deg, #ff00ff, #00ffff)",
    boxShadow: "0 0 30px rgba(255, 0, 255, 0.6)"
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed"
  },
  buttonContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem"
  },
  buttonOrb: {
    fontSize: "1.2rem",
    filter: "drop-shadow(0 0 8px rgba(0,255,255,0.5))"
  },
  quantumSpinner: {
    width: "1.2rem",
    height: "1.2rem",
    border: "2px solid transparent",
    borderTop: "2px solid #0a0a0a",
    borderRadius: "50%",
    animation: "quantumSpin 1s linear infinite"
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    margin: "1.5rem 0"
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(0,255,255,0.5), transparent)"
  },
  dividerText: {
    color: "#88ffff",
    fontSize: "0.7rem",
    fontWeight: "600",
    letterSpacing: "1px"
  },
  authOptions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem"
  },
  demoButton: {
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    color: "white",
    border: "none",
    padding: "1rem 1.5rem",
    borderRadius: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "0.75rem",
    boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    letterSpacing: "0.5px"
  },
  biometricButton: {
    background: "linear-gradient(135deg, #ff00ff, #ff6b6b)",
    color: "white",
    border: "none",
    padding: "1rem 1.5rem",
    borderRadius: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "0.75rem",
    boxShadow: "0 0 15px rgba(255, 0, 255, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    letterSpacing: "0.5px"
  },
  demoIcon: {
    fontSize: "1rem"
  },
  biometricIcon: {
    fontSize: "1rem"
  },
  demoHint: {
    textAlign: "center",
    marginTop: "0.5rem"
  },
  demoHintText: {
    color: "#88ffff",
    fontSize: "0.65rem",
    fontStyle: "italic",
    opacity: 0.8
  },
  footer: {
    textAlign: "center",
    marginTop: "2rem",
    paddingTop: "2rem",
    borderTop: "1px solid rgba(0, 255, 255, 0.2)",
    position: "relative"
  },
  footerGlow: {
    position: "absolute",
    top: 0,
    left: "25%",
    right: "25%",
    height: "1px",
    background: "linear-gradient(90deg, transparent, #00ffff, transparent)"
  },
  footerText: {
    color: "#88ffff",
    fontSize: "0.8rem",
    fontWeight: "300",
    letterSpacing: "0.5px",
    marginBottom: "1rem"
  },
  footerLink: {
    color: "#00ffff",
    fontWeight: "600",
    textDecoration: "none",
    transition: "all 0.2s ease"
  },
  securityBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "rgba(0, 255, 255, 0.1)",
    borderRadius: "2rem",
    border: "1px solid rgba(0, 255, 255, 0.3)"
  },
  securityIcon: {
    fontSize: "0.8rem"
  },
  securityText: {
    color: "#88ffff",
    fontSize: "0.6rem",
    fontWeight: "600",
    letterSpacing: "0.5px"
  }
};