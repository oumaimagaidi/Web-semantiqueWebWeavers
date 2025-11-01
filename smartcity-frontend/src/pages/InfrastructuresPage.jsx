import { useEffect, useState } from "react";
import axios from "axios";

export default function InfrastructuresPage() {
  const [infras, setInfras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: "",
    nom: "",
    type: "Route",
    adresse: ""
  });
  const [message, setMessage] = useState(null);
  const [particles, setParticles] = useState([]);

  // Système de particules futuriste
  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 3 + 1,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  // --- Charger les infrastructures ---
  useEffect(() => {
    fetchInfras();
  }, []);

  const fetchInfras = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/infrastructures/");
      setInfras(res.data);
      setMessage(null);
    } catch (err) {
      console.error("Erreur lors du chargement :", err);
      setMessage("❌ DÉFAUT DE CONNEXION AU RÉSEAU DES INFRASTRUCTURES");
    } finally {
      setLoading(false);
    }
  };

  // --- Ajouter une infrastructure ---
// --- Ajouter une infrastructure ---
const addInfra = async (e) => {
  e.preventDefault();
  setMessage(null);
  setLoading(true);

  try {
    const res = await axios.post("http://localhost:8000/add_infrastructure/", {
      id: form.id.trim(),
      nom: form.nom.trim(),
      type_infrastructure: form.type.trim(),  // CHANGEMENT ICI : type → type_infrastructure
      adresse: form.adresse.trim()
    });

    setMessage(res.data.message || "✅ INFRASTRUCTURE CRÉÉE AVEC SUCCÈS");
    setForm({ id: "", nom: "", type: "Route", adresse: "" });
    fetchInfras();
  } catch (err) {
    console.error("Erreur d'ajout :", err);
    setMessage(
      err.response?.data?.detail ||
      err.response?.data?.error ||  // Ajout pour capturer les erreurs du backend
      "❌ ÉCHEC DE CRÉATION DE L'INFRASTRUCTURE"
    );
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const infrastructureTypes = [
    { value: "Route", label: "🛣️ RÉSEAU ROUTIER", icon: "🛣️" },
    { value: "StationsMetro", label: "🚇 STATION MÉTRO", icon: "🚇" },
    { value: "Parking", label: "🅿️ ZONE DE STATIONNEMENT", icon: "🅿️" },
    { value: "StationsBus", label: "🚌 STATION DE BUS", icon: "🚌" },
    { value: "Batiment", label: "🏢 STRUCTURE URBAINE", icon: "🏢" }
  ];

  const getInfrastructureIcon = (type) => {
    const infraType = infrastructureTypes.find(t => t.value === type);
    return infraType ? infraType.icon : "🏗️";
  };

  const getInfrastructureColor = (type) => {
    const colors = {
      'Route': '#00ffff',
      'StationsMetro': '#ff00ff',
      'Parking': '#ffaa00',
      'StationsBus': '#00ff88',
      'Batiment': '#8884d8',
      'default': '#8884d8'
    };
    return colors[type] || colors.default;
  };

  return (
    <div style={styles.container}>
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

      <div style={styles.wrapper}>
        {/* En-tête holographique */}
        <div style={styles.header}>
          <div style={styles.headerGlow}></div>
          <div style={styles.headerContent}>
            <div style={styles.titleSection}>
              <h1 style={styles.title}>
                <span style={styles.titleIcon}>🏗️</span>
                RÉSEAU DES INFRASTRUCTURES INTELLIGENTES
              </h1>
              <p style={styles.subtitle}>
                SURVEILLANCE ET GESTION DU CADRE BÂTI CONNECTÉ DE LA SMART CITY
              </p>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>{infras.length}</span>
                <span style={styles.statLabel}>INFRASTRUCTURES</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message système */}
        {message && (
          <div
            style={{
              ...styles.message,
              ...(message.startsWith("✅") ? styles.successMessage : styles.errorMessage)
            }}
          >
            <div style={styles.messageContent}>
              <div style={styles.messageIcon}>
                {message.startsWith("✅") ? "⚡" : "⚠️"}
              </div>
              <div style={styles.messageText}>
                <div style={styles.messageTitle}>
                  {message.startsWith("✅") ? "SYNCHRONISATION RÉUSSIE" : "ALERTE SYSTÈME"}
                </div>
                <div>{message.replace("✅ ", "").replace("❌ ", "")}</div>
              </div>
            </div>
            <div style={styles.messagePulse}></div>
          </div>
        )}

        {/* Formulaire de création */}
        <div style={styles.formCard}>
          <div style={styles.cardGlow}></div>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>➕ INITIER UNE NOUVELLE INFRASTRUCTURE</h3>
            <div style={styles.formIndicator}></div>
          </div>
          <form onSubmit={addInfra}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  IDENTIFIANT UNIQUE
                  <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputContainer}>
                  <input
                    type="text"
                    placeholder="INFRA_001"
                    value={form.id}
                    onChange={(e) => handleInputChange("id", e.target.value)}
                    style={styles.input}
                    required
                  />
                  <div style={styles.inputGlow}></div>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  DÉSIGNATION
                  <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputContainer}>
                  <input
                    type="text"
                    placeholder="AUTOROUTE PRINCIPALE NEXUS"
                    value={form.nom}
                    onChange={(e) => handleInputChange("nom", e.target.value)}
                    style={styles.input}
                    required
                  />
                  <div style={styles.inputGlow}></div>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  CATÉGORIE
                  <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputContainer}>
                  <select
                    value={form.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    style={styles.select}
                    required
                  >
                    {infrastructureTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div style={styles.inputGlow}></div>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  COORDONNÉES GÉOGRAPHIQUES
                </label>
                <div style={styles.inputContainer}>
                  <input
                    type="text"
                    placeholder="SECTEUR URBAIN PRINCIPAL"
                    value={form.adresse}
                    onChange={(e) => handleInputChange("adresse", e.target.value)}
                    style={styles.input}
                  />
                  <div style={styles.inputGlow}></div>
                </div>
              </div>
            </div>

            <div style={styles.formActions}>
              <button
                type="submit"
                style={{
                  ...styles.primaryButton,
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
                    <span style={styles.buttonIcon}>⚡</span>
                    <span>ACTIVER L'INFRASTRUCTURE</span>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setForm({ id: "", nom: "", type: "Route", adresse: "" })}
                style={styles.secondaryButton}
              >
                <span style={styles.buttonIcon}>🔄</span>
                <span>RÉINITIALISER</span>
              </button>
            </div>
          </form>
        </div>

        {/* Tableau des infrastructures */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📋 INVENTAIRE DES INFRASTRUCTURES</h3>
            <button
              onClick={fetchInfras}
              style={styles.refreshButton}
              disabled={loading}
            >
              {loading ? (
                <div style={styles.buttonContent}>
                  <div style={styles.smallSpinner}></div>
                  <span>SYNCHRONISATION...</span>
                </div>
              ) : (
                <div style={styles.buttonContent}>
                  <span style={styles.buttonIcon}>🔄</span>
                  <span>ACTUALISER</span>
                </div>
              )}
            </button>
          </div>

          <div style={styles.tableCard}>
            <div style={styles.cardGlow}></div>
            {loading ? (
              <div style={styles.loadingState}>
                <div style={styles.quantumSpinner}></div>
                <p style={styles.loadingText}>CHARGEMENT DU RÉSEAU INFRASTRUCTUREL...</p>
              </div>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHead}>ID</th>
                        <th style={styles.tableHead}>INFRASTRUCTURE</th>
                        <th style={styles.tableHead}>LOCALISATION</th>
                        <th style={styles.tableHead}>TYPE</th>
                        <th style={styles.tableHead}>STATUT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {infras.map((infra) => (
                        <tr
                          key={infra.id}
                          style={styles.tableRow}
                        >
                          <td style={styles.tableCell}>
                            <span style={styles.infraId}>{infra.id}</span>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.infraInfo}>
                              <div
                                style={{
                                  ...styles.infraIcon,
                                  backgroundColor: getInfrastructureColor(infra.type),
                                  boxShadow: `0 0 20px ${getInfrastructureColor(infra.type)}`
                                }}
                              >
                                {getInfrastructureIcon(infra.type)}
                              </div>
                              <div>
                                <div style={styles.infraName}>{infra.nom}</div>
                                <div style={styles.infraDetails}>
                                  INFRASTRUCTURE CONNECTÉE
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.address}>
                              {infra.adresse || "COORDONNÉES NON DÉFINIES"}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span
                              style={{
                                ...styles.typeBadge,
                                backgroundColor: getInfrastructureColor(infra.type),
                                boxShadow: `0 0 15px ${getInfrastructureColor(infra.type)}`
                              }}
                            >
                              {getInfrastructureIcon(infra.type)} {infra.type.toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                backgroundColor: '#00ff88',
                                boxShadow: '0 0 15px #00ff88'
                              }}
                            >
                              <div style={styles.statusIndicator}></div>
                              OPÉRATIONNEL
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {infras.length === 0 && (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🏗️</div>
                    <div style={styles.emptyText}>AUCUNE INFRASTRUCTURE DÉTECTÉE</div>
                    <div style={styles.emptySubtext}>
                      INITIEZ LA CRÉATION D'UNE NOUVELLE INFRASTRUCTURE
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Panneau de contrôle réseau */}
        <div style={styles.controlPanel}>
          <div style={styles.cardGlow}></div>
          <div style={styles.controlHeader}>
            <h4 style={styles.controlTitle}>🌐 STATUT DU RÉSEAU INFRASTRUCTUREL</h4>
            <div style={styles.controlStatus}>
              <div style={styles.networkIndicator}></div>
              <span>RÉSEAU STABLE</span>
            </div>
          </div>
          <div style={styles.controlGrid}>
            <div style={styles.controlItem}>
              <div style={styles.controlIcon}>🛣️</div>
              <div style={styles.controlContent}>
                <div style={styles.controlValue}>
                  {infras.filter(i => i.type === 'Route').length}
                </div>
                <div style={styles.controlLabel}>RÉSEAUX ROUTIERS</div>
              </div>
            </div>
            <div style={styles.controlItem}>
              <div style={styles.controlIcon}>🚇</div>
              <div style={styles.controlContent}>
                <div style={styles.controlValue}>
                  {infras.filter(i => i.type === 'StationsMetro').length}
                </div>
                <div style={styles.controlLabel}>STATIONS MÉTRO</div>
              </div>
            </div>
            <div style={styles.controlItem}>
              <div style={styles.controlIcon}>🚌</div>
              <div style={styles.controlContent}>
                <div style={styles.controlValue}>
                  {infras.filter(i => i.type === 'StationsBus').length}
                </div>
                <div style={styles.controlLabel}>STATIONS BUS</div>
              </div>
            </div>
            <div style={styles.controlItem}>
              <div style={styles.controlIcon}>🅿️</div>
              <div style={styles.controlContent}>
                <div style={styles.controlValue}>
                  {infras.filter(i => i.type === 'Parking').length}
                </div>
                <div style={styles.controlLabel}>ZONES STATIONNEMENT</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    padding: '0',
    fontFamily: "'Orbitron', 'Rajdhani', monospace",
    color: '#ffffff',
    position: 'relative',
    overflowX: 'hidden'
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
  wrapper: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    position: 'relative',
    zIndex: 2
  },
  header: {
    marginBottom: '2rem',
    background: "rgba(10, 15, 35, 0.85)",
    padding: '2rem',
    borderRadius: '1.5rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    boxShadow: '0 0 30px rgba(0, 255, 255, 0.1)',
    backdropFilter: 'blur(15px)',
    position: 'relative',
    overflow: 'hidden'
  },
  headerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.05), transparent)',
    animation: 'hologramGlow 3s ease-in-out infinite'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '2rem'
  },
  titleSection: {
    flex: 1
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #ffffff, #88ffff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  titleIcon: {
    fontSize: '2rem'
  },
  subtitle: {
    color: '#88ffff',
    fontSize: '1rem',
    maxWidth: '500px',
    fontWeight: '300',
    letterSpacing: '0.5px'
  },
  stats: {
    display: 'flex',
    gap: '1rem'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: '1rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    minWidth: '160px',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)'
  },
  statGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(0,255,255,0.1) 0%, transparent 70%)',
    animation: 'pulse 2s ease-in-out infinite'
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#00ffff',
    textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#88ffff',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: '1px'
  },
  message: {
    marginBottom: '2rem',
    borderRadius: '1rem',
    fontWeight: '500',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)'
  },
  successMessage: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    color: '#00ff88',
    border: '1px solid rgba(0, 255, 0, 0.3)'
  },
  errorMessage: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    color: '#ff6b6b',
    border: '1px solid rgba(255, 0, 0, 0.3)'
  },
  messageContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem'
  },
  messageIcon: {
    fontSize: '1.5rem',
    filter: 'drop-shadow(0 0 8px currentColor)'
  },
  messageText: {
    flex: 1
  },
  messageTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    letterSpacing: '1px',
    marginBottom: '0.25rem'
  },
  messagePulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    animation: 'dataFlow 3s linear infinite'
  },
  formCard: {
    backgroundColor: 'rgba(10, 15, 35, 0.7)',
    borderRadius: '1.5rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    padding: '2rem',
    marginBottom: '3rem',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 0 25px rgba(0, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(0,255,255,0.05) 0%, transparent 70%)',
    animation: 'pulse 3s ease-in-out infinite',
    pointerEvents: 'none'
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  formTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#00ffff',
    letterSpacing: '1px'
  },
  formIndicator: {
    width: '4rem',
    height: '0.25rem',
    background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
    borderRadius: '2rem'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  inputGroup: {
    width: '100%'
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#88ffff',
    marginBottom: '0.5rem',
    letterSpacing: '1px'
  },
  required: {
    color: '#ff00ff',
    marginLeft: '0.25rem'
  },
  inputContainer: {
    position: 'relative'
  },
  input: {
    width: '100%',
    padding: '1rem 1.25rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#ffffff',
    fontFamily: "'Rajdhani', sans-serif"
  },
  select: {
    width: '100%',
    padding: '1rem 1.25rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#ffffff',
    cursor: 'pointer',
    fontFamily: "'Rajdhani', sans-serif"
  },
  inputGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '0.75rem',
    boxShadow: '0 0 0 0 rgba(0, 255, 255, 0)',
    transition: 'all 0.3s ease',
    pointerEvents: 'none',
    zIndex: -1
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #00ff88, #00ffff)',
    color: '#0a0a0a',
    fontWeight: '700',
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 25px rgba(0, 255, 255, 0.4)',
    minWidth: '200px',
    letterSpacing: '1px'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#88ffff',
    fontWeight: '600',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px'
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  buttonIcon: {
    fontSize: '1.125rem',
    filter: 'drop-shadow(0 0 5px currentColor)'
  },
  quantumSpinner: {
    width: '1.5rem',
    height: '1.5rem',
    border: '2px solid transparent',
    borderTop: '2px solid #0a0a0a',
    borderRadius: '50%',
    animation: 'quantumSpin 1s linear infinite'
  },
  smallSpinner: {
    width: '1rem',
    height: '1rem',
    border: '2px solid transparent',
    borderTop: '2px solid currentColor',
    borderRadius: '50%',
    animation: 'quantumSpin 1s linear infinite'
  },
  section: {
    marginBottom: '2rem'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#00ffff',
    letterSpacing: '1px'
  },
  refreshButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    color: '#88ffff',
    fontWeight: '600',
    padding: '0.75rem 1.25rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px'
  },
  tableCard: {
    backgroundColor: 'rgba(10, 15, 35, 0.7)',
    borderRadius: '1.5rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    overflow: 'hidden',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 0 25px rgba(0, 255, 255, 0.1)',
    position: 'relative'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '900px'
  },
  tableHeader: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderBottom: '2px solid rgba(0, 255, 255, 0.3)'
  },
  tableHead: {
    padding: '1.25rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#88ffff',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap'
  },
  tableRow: {
    transition: 'all 0.3s ease',
    borderBottom: '1px solid rgba(0, 255, 255, 0.1)'
  },
  tableCell: {
    padding: '1.25rem 1.5rem',
    fontSize: '0.875rem',
    color: '#ffffff',
    whiteSpace: 'nowrap'
  },
  infraId: {
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#00ffff',
    letterSpacing: '0.5px'
  },
  infraInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  infraIcon: {
    width: '3rem',
    height: '3rem',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '1.25rem',
    flexShrink: 0
  },
  infraName: {
    fontWeight: '600',
    color: '#ffffff',
    fontSize: '1rem'
  },
  infraDetails: {
    fontSize: '0.75rem',
    color: '#88ffff',
    marginTop: '0.25rem',
    letterSpacing: '0.5px'
  },
  address: {
    color: '#88ffff',
    fontSize: '0.875rem'
  },
  typeBadge: {
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    whiteSpace: 'nowrap',
    letterSpacing: '0.5px'
  },
  statusBadge: {
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    whiteSpace: 'nowrap',
    letterSpacing: '0.5px'
  },
  statusIndicator: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#00ff88',
    boxShadow: '0 0 8px #00ff88'
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    gap: '1rem'
  },
  loadingText: {
    color: '#88ffff',
    fontSize: '1rem',
    fontWeight: '300',
    letterSpacing: '1px'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center',
    gap: '1rem'
  },
  emptyIcon: {
    fontSize: '4rem',
    opacity: 0.5,
    filter: 'drop-shadow(0 0 10px rgba(0,255,255,0.5))'
  },
  emptyText: {
    color: '#ffffff',
    fontSize: '1.25rem',
    fontWeight: '600',
    letterSpacing: '1px'
  },
  emptySubtext: {
    color: '#88ffff',
    fontSize: '0.9rem',
    maxWidth: '300px',
    fontWeight: '300'
  },
  controlPanel: {
    backgroundColor: 'rgba(10, 15, 35, 0.7)',
    borderRadius: '1.5rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    padding: '2rem',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 0 25px rgba(0, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  },
  controlHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  controlTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#00ffff',
    letterSpacing: '1px'
  },
  controlStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: '#00ff88'
  },
  networkIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#00ff88',
    boxShadow: '0 0 10px #00ff88'
  },
  controlGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem'
  },
  controlItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: '1rem',
    border: '1px solid rgba(0, 255, 255, 0.2)'
  },
  controlIcon: {
    fontSize: '2rem',
    filter: 'drop-shadow(0 0 8px currentColor)'
  },
  controlContent: {
    flex: 1
  },
  controlValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#00ffff',
    textShadow: '0 0 8px rgba(0, 255, 255, 0.5)'
  },
  controlLabel: {
    fontSize: '0.8rem',
    color: '#88ffff',
    fontWeight: '600',
    letterSpacing: '0.5px'
  }
};

// Styles CSS globaux
const globalStyles = `
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

  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
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

  input:focus, select:focus {
    border-color: #00ffff !important;
    background-color: rgba(0, 0, 0, 0.5) !important;
    box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.3) !important;
  }

  input:focus + .input-glow, select:focus + .input-glow {
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5) !important;
  }

  .primary-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 0 35px rgba(0, 255, 255, 0.6);
  }

  .primary-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .secondary-button:hover {
    background-color: rgba(0, 255, 255, 0.1);
    border-color: rgba(0, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  .refresh-button:hover:not(:disabled) {
    background-color: rgba(0, 255, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  .table-row:hover {
    background-color: rgba(0, 255, 255, 0.05);
    transform: translateX(4px);
  }

  @media (max-width: 1024px) {
    .header-content {
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .stats {
      align-self: flex-start;
    }
    
    .form-grid {
      grid-template-columns: 1fr;
    }
    
    .form-actions {
      flex-direction: column;
    }
    
    .primary-button, .secondary-button {
      width: 100%;
      justify-content: center;
    }
    
    .control-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .wrapper {
      padding: 1.5rem 1rem;
    }
    
    .title {
      font-size: 1.5rem;
    }
    
    .stats {
      flex-direction: column;
      width: 100%;
    }
    
    .stat-item {
      flex-direction: row;
      justify-content: space-between;
      width: 100%;
    }
    
    .form-card, .table-card, .control-panel {
      border-radius: 1rem;
      padding: 1.5rem;
    }
    
    .table-cell, .table-head {
      padding: 1rem;
    }
    
    .infra-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
    
    .infra-icon {
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1rem;
    }
    
    .control-grid {
      grid-template-columns: 1fr;
    }
    
    .control-header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  }
`;

// Injection des styles globaux
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}