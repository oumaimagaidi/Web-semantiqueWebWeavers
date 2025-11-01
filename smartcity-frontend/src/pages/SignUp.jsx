import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function SignUp() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    age: "",
    email: "",
    telephone: "",
    type_personne: "Personne",
    dateNaissance: "",
    genre: "",
    nationalite: "",
    languePreferee: "Français",
    niveauAbonnement: "Standard",
    preferencesAccessibilite: "Aucune",
    username: "",
    password: "",
    confirmPassword: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Système de particules futuriste
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 1,
      delay: Math.random() * 10
    }));
    setParticles(newParticles);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
    
    setError("");
    setSuccess("");
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/\d/)) strength += 25;
    if (password.match(/[^a-zA-Z\d]/)) strength += 25;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return "#ff6b6b";
    if (passwordStrength < 75) return "#ffd93d";
    return "#6bcf7f";
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    if (!formData.email.includes('@')) {
      setError("Veuillez entrer un email valide");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const userData = {
        nom: formData.nom,
        prenom: formData.prenom,
        age: parseInt(formData.age),
        email: formData.email,
        telephone: formData.telephone,
        type_personne: formData.type_personne,
        dateNaissance: formData.dateNaissance,
        genre: formData.genre,
        nationalite: formData.nationalite,
        languePreferee: formData.languePreferee,
        niveauAbonnement: formData.niveauAbonnement,
        preferencesAccessibilite: formData.preferencesAccessibilite,
        username: formData.username,
        password: formData.password
      };

      const response = await axios.post("http://localhost:8000/auth/signup/", userData);
      
      setSuccess("✅ Synchronisation réussie ! Initialisation du profil...");
      
      setTimeout(() => {
        navigate("/signin", { 
          state: { 
            message: "Profil créé avec succès ! Vous pouvez maintenant vous connecter." 
          }
        });
      }, 2000);

    } catch (err) {
      console.error("Erreur d'inscription:", err);
      setError(err.response?.data?.detail || "Erreur de synchronisation. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const StepIndicator = () => (
    <div style={styles.stepIndicator}>
      {[1, 2, 3].map(step => (
        <div key={step} style={styles.stepContainer}>
          <div 
            style={{
              ...styles.stepCircle,
              ...(currentStep >= step ? styles.stepActive : styles.stepInactive)
            }}
          >
            <div style={styles.stepGlow}></div>
            {step}
          </div>
          <div style={styles.stepLabel}>
            {step === 1 && "Identité"}
            {step === 2 && "Profil"}
            {step === 3 && "Sécurité"}
          </div>
          {step < 3 && <div style={styles.stepLine}></div>}
        </div>
      ))}
    </div>
  );

  return (
    <div style={styles.container} ref={containerRef}>
      {/* Réseau de neurones / Circuit board animé */}
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
              animationDuration: `${particle.speed * 10}s`
            }}
          />
        ))}
        
        {/* Lignes de connexion */}
        <div style={styles.connectionLines}>
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              style={{
                ...styles.connectionLine,
                left: `${i * 12}%`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Hologramme principal */}
      <div style={styles.hologram}>
        <div style={styles.hologramGlow}></div>
        
        <div style={styles.card}>
          {/* En-tête futuriste */}
          <div style={styles.header}>
            <div style={styles.logo}>
              <div style={styles.logoOrb}>
                <div style={styles.orbGlow}></div>
                <span style={styles.logoIcon}>⚡</span>
              </div>
              <div style={styles.logoTextContainer}>
                <span style={styles.logoText}>SCity</span>
                <span style={styles.logoSubtext}>SMART CITY NETWORK</span>
              </div>
            </div>
            
            <div style={styles.titleSection}>
              <h1 style={styles.title}>
                <span style={styles.titleMain}>ACTIVATION DU PROFIL</span>
                <span style={styles.titleSub}>Rejoignez le réseau urbain intelligent</span>
              </h1>
              <div style={styles.scanLine}></div>
            </div>
          </div>

          <StepIndicator />

          {/* Alerts holographiques */}
          {error && (
            <div style={styles.errorAlert}>
              <div style={styles.alertContent}>
                <div style={styles.alertOrb}>⚠️</div>
                <div>
                  <div style={styles.alertTitle}>ALERTE SYSTÈME</div>
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
            {/* Étape 1: Identité */}
            {currentStep === 1 && (
              <div style={styles.stepContent}>
                <div style={styles.inputGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelText}>PRÉNOM</span>
                      <div style={styles.inputContainer}>
                        <input
                          type="text"
                          name="prenom"
                          value={formData.prenom}
                          onChange={handleChange}
                          style={styles.input}
                          placeholder="Entrez votre prénom"
                          required
                        />
                        <div style={styles.inputGlow}></div>
                      </div>
                    </label>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelText}>NOM</span>
                      <div style={styles.inputContainer}>
                        <input
                          type="text"
                          name="nom"
                          value={formData.nom}
                          onChange={handleChange}
                          style={styles.input}
                          placeholder="Entrez votre nom"
                          required
                        />
                        <div style={styles.inputGlow}></div>
                      </div>
                    </label>
                  </div>
                </div>

                <div style={styles.inputGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelText}>ÂGE</span>
                      <div style={styles.inputContainer}>
                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleChange}
                          style={styles.input}
                          placeholder="25"
                          min="1"
                          max="120"
                          required
                        />
                        <div style={styles.inputGlow}></div>
                      </div>
                    </label>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelText}>GENRE</span>
                      <div style={styles.inputContainer}>
                        <select
                          name="genre"
                          value={formData.genre}
                          onChange={handleChange}
                          style={styles.input}
                        >
                          <option value="">SÉLECTIONNEZ</option>
                          <option value="Masculin">MASCULIN</option>
                          <option value="Féminin">FÉMININ</option>
                          <option value="Autre">AUTRE</option>
                        </select>
                        <div style={styles.inputGlow}></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2: Profil */}
            {currentStep === 2 && (
              <div style={styles.stepContent}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <span style={styles.labelText}>EMAIL QUANTIQUE</span>
                    <div style={styles.inputContainer}>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="utilisateur@nexus.city"
                        required
                      />
                      <div style={styles.inputGlow}></div>
                    </div>
                  </label>
                </div>

                <div style={styles.inputGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelText}>FRÉQUENCE COM</span>
                      <div style={styles.inputContainer}>
                        <input
                          type="tel"
                          name="telephone"
                          value={formData.telephone}
                          onChange={handleChange}
                          style={styles.input}
                          placeholder="+33 1 23 45 67 89"
                          required
                        />
                        <div style={styles.inputGlow}></div>
                      </div>
                    </label>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelText}>TYPE DE PROFILE</span>
                      <div style={styles.inputContainer}>
                        <select
                          name="type_personne"
                          value={formData.type_personne}
                          onChange={handleChange}
                          style={styles.input}
                          required
                        >
                          <option value="Personne">CITOYEN STANDARD</option>
                          <option value="Conducteur">OPÉRATEUR MOBILITÉ</option>
                          <option value="Pieton">PIÉTON CONNECTÉ</option>
                          <option value="Voyageur">VOYAGEUR RÉSEAU</option>
                        </select>
                        <div style={styles.inputGlow}></div>
                      </div>
                    </label>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <span style={styles.labelText}>NIVEAU D'ACCÈS</span>
                    <div style={styles.inputContainer}>
                      <select
                        name="niveauAbonnement"
                        value={formData.niveauAbonnement}
                        onChange={handleChange}
                        style={styles.input}
                      >
                        <option value="Standard">ACCÈS STANDARD</option>
                        <option value="Premium">ACCÈS PREMIUM</option>
                        <option value="Étudiant">PROTOCOLE ÉTUDIANT</option>
                        <option value="Famille">RÉSEAU FAMILIAL</option>
                      </select>
                      <div style={styles.inputGlow}></div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Étape 3: Sécurité */}
            {currentStep === 3 && (
              <div style={styles.stepContent}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <span style={styles.labelText}>IDENTIFIANT RÉSEAU</span>
                    <div style={styles.inputContainer}>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="Votre identifiant unique"
                        required
                      />
                      <div style={styles.inputGlow}></div>
                    </div>
                  </label>
                </div>

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
                    </div>
                    {formData.password && (
                      <div style={styles.passwordStrength}>
                        <div style={styles.strengthMeter}>
                          <div 
                            style={{
                              ...styles.strengthBar,
                              width: `${passwordStrength}%`,
                              backgroundColor: getPasswordStrengthColor(),
                              boxShadow: `0 0 20px ${getPasswordStrengthColor()}`
                            }}
                          ></div>
                        </div>
                        <div style={styles.passwordStrengthText}>
                          INTÉGRITÉ: {passwordStrength < 50 ? 'FAIBLE' : passwordStrength < 75 ? 'MOYENNE' : 'MAXIMALE'}
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <span style={styles.labelText}>CONFIRMATION DE CLÉ</span>
                    <div style={styles.inputContainer}>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        style={{
                          ...styles.input,
                          ...(formData.confirmPassword && formData.password !== formData.confirmPassword && styles.inputError)
                        }}
                        placeholder="●●●●●●●●●●●●"
                        required
                      />
                      <div style={styles.inputGlow}></div>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <div style={styles.errorText}>NON-CONCORDANCE DES CLÉS DÉTECTÉE</div>
                    )}
                  </label>
                </div>

                <div style={styles.terms}>
                  <p style={styles.termsText}>
                    En activant votre profil, vous acceptez le{" "}
                    <a href="#" style={styles.termsLink}>PROTOCOLE D'UTILISATION</a>{" "}
                    et la{" "}
                    <a href="#" style={styles.termsLink}>POLITIQUE DE DONNÉES QUANTIQUES</a>
                  </p>
                </div>
              </div>
            )}

            <div style={styles.navigation}>
              {currentStep > 1 && (
                <button 
                  type="button" 
                  onClick={prevStep}
                  style={styles.backButton}
                >
                  <span style={styles.buttonIcon}>◀</span>
                  RETOUR
                </button>
              )}
              
              {currentStep < 3 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  style={styles.nextButton}
                >
                  CONTINUER
                  <span style={styles.buttonIcon}>▶</span>
                </button>
              ) : (
                <button 
                  type="submit" 
                  style={{
                    ...styles.submitButton,
                    ...(loading && styles.buttonDisabled)
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <div style={styles.buttonContent}>
                      <div style={styles.quantumSpinner}></div>
                      <span>CRYPTAGE EN COURS...</span>
                    </div>
                  ) : (
                    <div style={styles.buttonContent}>
                      <span style={styles.buttonOrb}>⚡</span>
                      <span>ACTIVER LE PROFIL</span>
                    </div>
                  )}
                </button>
              )}
            </div>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              DÉJÀ CONNECTÉ AU RÉSEAU ?{" "}
              <Link to="/signin" style={styles.footerLink}>
                ACCÉDER AU SYSTÈME
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Styles CSS globaux */}
      <style jsx="true" global="true">{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }

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

        @keyframes connectionFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
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

        @keyframes hologramGlow {
          0%, 100% { 
            opacity: 0.8;
            filter: brightness(1);
          }
          50% { 
            opacity: 1;
            filter: brightness(1.2);
          }
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
    fontFamily: "'Orbitron', 'Rajdhani', sans-serif"
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
    animation: "neuralFloat 20s ease-in-out infinite",
    boxShadow: "0 0 10px #00ffff, 0 0 20px #00ffff"
  },
  connectionLines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  connectionLine: {
    position: "absolute",
    height: "1px",
    background: "linear-gradient(90deg, transparent, #00ffff, transparent)",
    animation: "connectionFlow 8s linear infinite",
    opacity: 0.3
  },
  hologram: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "600px"
  },
  hologramGlow: {
    position: "absolute",
    top: "-20px",
    left: "-20px",
    right: "-20px",
    bottom: "-20px",
    background: "radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%)",
    borderRadius: "2rem",
    animation: "hologramGlow 3s ease-in-out infinite",
    zIndex: -1
  },
  card: {
    backgroundColor: "rgba(10, 15, 35, 0.9)",
    padding: "3rem",
    borderRadius: "2rem",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    boxShadow: `
      0 0 50px rgba(0, 255, 255, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 8px 32px rgba(0, 0, 0, 0.5)
    `,
    backdropFilter: "blur(20px)",
    position: "relative",
    overflow: "hidden"
  },
  header: {
    textAlign: "center",
    marginBottom: "3rem"
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.5rem",
    marginBottom: "2rem"
  },
  logoOrb: {
    position: "relative",
    width: "80px",
    height: "80px",
    background: "linear-gradient(135deg, #00ffff, #ff00ff)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 30px rgba(0, 255, 255, 0.5)"
  },
  orbGlow: {
    position: "absolute",
    top: "-5px",
    left: "-5px",
    right: "-5px",
    bottom: "-5px",
    background: "linear-gradient(135deg, #00ffff, #ff00ff)",
    borderRadius: "50%",
    filter: "blur(10px)",
    opacity: 0.6,
    animation: "pulse 2s ease-in-out infinite"
  },
  logoIcon: {
    fontSize: "2.5rem",
    filter: "drop-shadow(0 0 10px rgba(255,255,255,0.5))"
  },
  logoTextContainer: {
    textAlign: "left"
  },
  logoText: {
    fontSize: "2.5rem",
    fontWeight: "900",
    background: "linear-gradient(135deg, #00ffff, #ff00ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    display: "block",
    lineHeight: "1",
    letterSpacing: "3px"
  },
  logoSubtext: {
    fontSize: "0.7rem",
    fontWeight: "300",
    color: "#00ffff",
    letterSpacing: "2px",
    display: "block",
    marginTop: "0.25rem"
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
    fontSize: "1.8rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #ffffff, #00ffff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "2px"
  },
  titleSub: {
    fontSize: "1rem",
    fontWeight: "300",
    color: "#88ffff",
    letterSpacing: "1px"
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background: "linear-gradient(90deg, transparent, #00ffff, transparent)",
    animation: "scan 2s linear infinite"
  },
  stepIndicator: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "3rem",
    position: "relative"
  },
  stepContainer: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    position: "relative"
  },
  stepCircle: {
    position: "relative",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    zIndex: 2,
    border: "2px solid transparent"
  },
  stepGlow: {
    position: "absolute",
    top: "-3px",
    left: "-3px",
    right: "-3px",
    bottom: "-3px",
    borderRadius: "50%",
    filter: "blur(5px)",
    opacity: 0
  },
  stepActive: {
    backgroundColor: "rgba(0, 255, 255, 0.1)",
    color: "#00ffff",
    borderColor: "#00ffff",
    boxShadow: "0 0 20px rgba(0, 255, 255, 0.5)"
  },
  stepInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "#666",
    borderColor: "#333"
  },
  stepLabel: {
    position: "absolute",
    top: "100%",
    marginTop: "0.5rem",
    fontSize: "0.7rem",
    color: "#88ffff",
    fontWeight: "300",
    whiteSpace: "nowrap",
    letterSpacing: "1px"
  },
  stepLine: {
    flex: 1,
    height: "2px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    margin: "0 1rem",
    position: "relative"
  },
  stepContent: {
    animation: "slideIn 0.3s ease-out"
  },
  errorAlert: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    color: "#ff6b6b",
    padding: "1.5rem",
    borderRadius: "1rem",
    marginBottom: "2rem",
    border: "1px solid rgba(255, 0, 0, 0.3)",
    position: "relative",
    overflow: "hidden"
  },
  successAlert: {
    backgroundColor: "rgba(0, 255, 0, 0.1)",
    color: "#6bcf7f",
    padding: "1.5rem",
    borderRadius: "1rem",
    marginBottom: "2rem",
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
    fontSize: "1.5rem",
    filter: "drop-shadow(0 0 10px currentColor)"
  },
  alertTitle: {
    fontSize: "0.8rem",
    fontWeight: "700",
    letterSpacing: "1px",
    marginBottom: "0.25rem"
  },
  alertText: {
    fontSize: "0.875rem",
    fontWeight: "300"
  },
  alertPulse: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
    animation: "connectionFlow 3s linear infinite"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem"
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
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
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#88ffff",
    letterSpacing: "1px",
    textTransform: "uppercase"
  },
  inputContainer: {
    position: "relative"
  },
  input: {
    padding: "1.25rem 1.5rem",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    borderRadius: "1rem",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    outline: "none",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
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
  inputError: {
    borderColor: "#ff6b6b",
    backgroundColor: "rgba(255, 0, 0, 0.1)"
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: "0.75rem",
    marginTop: "0.5rem",
    fontWeight: "300"
  },
  passwordStrength: {
    marginTop: "1rem"
  },
  strengthMeter: {
    height: "4px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "2px",
    overflow: "hidden",
    marginBottom: "0.5rem"
  },
  strengthBar: {
    height: "100%",
    borderRadius: "2px",
    transition: "all 0.3s ease"
  },
  passwordStrengthText: {
    fontSize: "0.7rem",
    color: "#88ffff",
    fontWeight: "300",
    letterSpacing: "1px"
  },
  terms: {
    textAlign: "center",
    marginTop: "2rem",
    padding: "1.5rem",
    backgroundColor: "rgba(0, 255, 255, 0.05)",
    borderRadius: "1rem",
    border: "1px solid rgba(0, 255, 255, 0.1)"
  },
  termsText: {
    color: "#88ffff",
    fontSize: "0.75rem",
    lineHeight: "1.6",
    fontWeight: "300"
  },
  termsLink: {
    color: "#00ffff",
    textDecoration: "none",
    fontWeight: "600",
    transition: "all 0.2s ease"
  },
  navigation: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "3rem"
  },
  backButton: {
    background: "transparent",
    color: "#88ffff",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    padding: "1.25rem 2rem",
    borderRadius: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "0.9rem",
    letterSpacing: "1px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  },
  nextButton: {
    background: "linear-gradient(135deg, #00ffff, #0099ff)",
    color: "#0a0a0a",
    border: "none",
    padding: "1.25rem 2rem",
    borderRadius: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "0.9rem",
    letterSpacing: "1px",
    boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginLeft: "auto"
  },
  submitButton: {
    background: "linear-gradient(135deg, #00ff88, #00ffff)",
    color: "#0a0a0a",
    border: "none",
    padding: "1.5rem 3rem",
    borderRadius: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "1rem",
    letterSpacing: "2px",
    boxShadow: "0 0 30px rgba(0, 255, 255, 0.5)",
    marginLeft: "auto"
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    transform: "none"
  },
  buttonContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem"
  },
  buttonIcon: {
    fontSize: "1rem"
  },
  buttonOrb: {
    fontSize: "1.5rem",
    filter: "drop-shadow(0 0 10px rgba(0,255,255,0.5))"
  },
  quantumSpinner: {
    width: "1.5rem",
    height: "1.5rem",
    border: "2px solid transparent",
    borderTop: "2px solid #0a0a0a",
    borderRadius: "50%",
    animation: "quantumSpin 1s linear infinite"
  },
  footer: {
    textAlign: "center",
    marginTop: "3rem",
    paddingTop: "2rem",
    borderTop: "1px solid rgba(0, 255, 255, 0.1)"
  },
  footerText: {
    color: "#88ffff",
    fontSize: "0.875rem",
    fontWeight: "300",
    letterSpacing: "1px"
  },
  footerLink: {
    color: "#00ffff",
    fontWeight: "600",
    textDecoration: "none",
    transition: "all 0.2s ease"
  }
};