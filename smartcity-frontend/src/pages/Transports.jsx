// src/pages/Transports.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function Transports() {
  const [vehicules, setVehicules] = useState([]);
  const [infrastructures, setInfrastructures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("vehicules");
  const [form, setForm] = useState({ 
    id: "", 
    marque: "", 
    modele: "", 
    type_vehicule: "Voiture",
    immatriculation: ""
  });
  const [particles, setParticles] = useState([]);
  const [showForm, setShowForm] = useState(false); // Nouvel état pour contrôler l'affichage du formulaire
  const [currentPage, setCurrentPage] = useState(1); // État pour la page actuelle
  const [itemsPerPage] = useState(5); // Nombre d'éléments par page

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

  // ✅ Fonction pour charger les véhicules
  const loadVehicules = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/vehicules/");
      setVehicules(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des véhicules :", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fonction pour charger les infrastructures
  const loadInfrastructures = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/infrastructures/");
      setInfrastructures(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des infrastructures :", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Chargement initial
  useEffect(() => {
    loadVehicules();
    loadInfrastructures();
  }, []);

  // ✅ Ajouter un véhicule
  const addVehicule = async () => {
    try {
      await axios.post("http://localhost:8000/add_vehicule/", form);
      setForm({ id: "", marque: "", modele: "", type_vehicule: "Voiture", immatriculation: "" });
      setShowForm(false); // Fermer le formulaire après l'ajout
      loadVehicules();
    } catch (error) {
      console.error("Erreur lors de l'ajout du véhicule :", error);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === "vehicules") {
      addVehicule();
    }
  };

  // Logique de pagination
  const currentList = activeTab === "vehicules" ? vehicules : infrastructures;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = currentList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(currentList.length / itemsPerPage);

  // Changer de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Aller à la page précédente
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Aller à la page suivante
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const vehiculeFields = [
    { key: "id", label: "IDENTIFIANT UNIQUE", type: "text", placeholder: "ID_VÉHICULE" },
    { key: "marque", label: "MARQUE", type: "text", placeholder: "MARQUE DU VÉHICULE" },
    { key: "modele", label: "MODÈLE", type: "text", placeholder: "MODÈLE DU VÉHICULE" },
    { key: "immatriculation", label: "IMMATRICULATION", type: "text", placeholder: "PLAQUE D'IMMATRICULATION (OPTIONNEL)" } 
  ];

  const typeOptions = [
    { value: "Voiture", label: "🚗 VÉHICULE TERRESTRE" },
    { value: "Bus", label: "🚌 UNITÉ DE TRANSPORT" },
    { value: "Metro", label: "🚇 SYSTÈME MÉTRO" },
    { value: "Velo", label: "🚲 MOBILITÉ DOUCE" },
    { value: "Trottinette", label: "🛴 MICRO-MOBILITÉ" }
  ];

  const getVehicleIcon = (type) => {
    const icons = {
      'Voiture': '🚗',
      'Bus': '🚌',
      'Metro': '🚇',
      'Velo': '🚲',
      'Trottinette': '🛴',
      'default': '🚦'
    };
    return icons[type] || icons.default;
  };

  const getVehicleColor = (type) => {
    const colors = {
      'Voiture': '#00ffff',
      'Bus': '#ff00ff',
      'Metro': '#ffaa00',
      'Velo': '#00ff88',
      'Trottinette': '#8884d8',
      'default': '#6b7280'
    };
    return colors[type] || colors.default;
  };

  const getInfrastructureIcon = (type) => {
    const icons = {
      'Parking': '🅿️',
      'Route': '🛣️',
      'StationsBus': '🚏',
      'StationsMetro': '🚇',
      'Batiment': '🏢',
      'default': '🏗️'
    };
    return icons[type] || icons.default;
  };

  const getInfrastructureColor = (type) => {
    const colors = {
      'Parking': '#ffaa00',
      'Route': '#88ffff',
      'StationsBus': '#ff00ff',
      'StationsMetro': '#00ffff',
      'Batiment': '#00ff88',
      'default': '#6b7280'
    };
    return colors[type] || colors.default;
  };

  const totalCount = vehicules.length + infrastructures.length;

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
                <span style={styles.titleIcon}>🚗</span>
                SYSTÈME DE TRANSPORTS INTELLIGENTS
              </h1>
              <p style={styles.subtitle}>
                SURVEILLANCE ET GESTION DU RÉSEAU DE MOBILITÉ URBAINE
              </p>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>{vehicules.length}</span>
                <span style={styles.statLabel}>UNITÉS MOBILES</span>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>{infrastructures.length}</span>
                <span style={styles.statLabel}>INFRASTRUCTURES</span>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>{totalCount}</span>
                <span style={styles.statLabel}>TOTAL ACTIF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "vehicules" ? styles.activeTab : {})
            }}
            onClick={() => {
              setActiveTab("vehicules");
              setCurrentPage(1); // Réinitialiser la pagination lors du changement d'onglet
            }}
          >
            <span style={styles.tabIcon}>🚗</span>
            UNITÉS MOBILES
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "infrastructures" ? styles.activeTab : {})
            }}
            onClick={() => {
              setActiveTab("infrastructures");
              setCurrentPage(1); // Réinitialiser la pagination lors du changement d'onglet
            }}
          >
            <span style={styles.tabIcon}>🏗️</span>
            INFRASTRUCTURES
          </button>
        </div>

        {/* Bouton pour afficher le formulaire (uniquement pour véhicules) */}
        {activeTab === "vehicules" && !showForm && (
          <div style={styles.addButtonContainer}>
            <button 
              onClick={() => setShowForm(true)}
              style={styles.addItemButton}
            >
              <div style={styles.buttonContent}>
                <span style={styles.buttonIcon}>🚗</span>
                <span>AJOUTER UN VÉHICULE</span>
              </div>
              <div style={styles.buttonGlow}></div>
            </button>
          </div>
        )}

        {/* Formulaire pour véhicules (conditionnel) */}
        {activeTab === "vehicules" && showForm && (
          <div style={styles.formCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>➕ INITIER UNE NOUVELLE UNITÉ MOBILE</h3>
              <div style={styles.formActionsTop}>
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={styles.closeButton}
                >
                  <span style={styles.buttonIcon}>✕</span>
                  <span>FERMER</span>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                {vehiculeFields.map(({ key, label, type, placeholder }) => (
                  <div key={key} style={styles.inputGroup}>
                    <label style={styles.label}>
                      {label}
                      <span style={styles.required}>*</span>
                    </label>
                    <div style={styles.inputContainer}>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={form[key]}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        style={styles.input}
                        required
                      />
                      <div style={styles.inputGlow}></div>
                    </div>
                  </div>
                ))}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    TYPE DE VÉHICULE
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <select
                      value={form.type_vehicule}
                      onChange={(e) => handleInputChange("type_vehicule", e.target.value)}
                      style={styles.select}
                      required
                    >
                      {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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
                      <span>ACTIVER L'UNITÉ MOBILE</span>
                    </div>
                  )}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setForm({ id: "", marque: "", modele: "", type_vehicule: "Voiture", immatriculation: "" })}
                  style={styles.secondaryButton}
                >
                  <span style={styles.buttonIcon}>🔄</span>
                  <span>RÉINITIALISER</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tableau */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              {activeTab === "vehicules" ? "📋 RÉPERTOIRE DES UNITÉS MOBILES" : "🏗️ INVENTAIRE DES INFRASTRUCTURES"}
            </h3>
            <div style={styles.sectionActions}>
              <div style={styles.paginationInfo}>
                AFFICHAGE {Math.min(indexOfFirstItem + 1, currentList.length)}-{Math.min(indexOfLastItem, currentList.length)} SUR {currentList.length}
              </div>
              <button 
                onClick={activeTab === "vehicules" ? loadVehicules : loadInfrastructures}
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
          </div>

          <div style={styles.tableCard}>
            <div style={styles.cardGlow}></div>
            {loading ? (
              <div style={styles.loadingState}>
                <div style={styles.quantumSpinner}></div>
                <p style={styles.loadingText}>
                  {activeTab === "vehicules" ? "CHARGEMENT DES UNITÉS MOBILES..." : "CHARGEMENT DES INFRASTRUCTURES..."}
                </p>
              </div>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        {activeTab === "vehicules" ? (
                          <>
                            <th style={styles.tableHead}>ID</th>
                            <th style={styles.tableHead}>UNITÉ MOBILE</th>
                            <th style={styles.tableHead}>SPÉCIFICATIONS</th>
                            <th style={styles.tableHead}>TYPE</th>
                          </>
                        ) : (
                          <>
                            <th style={styles.tableHead}>ID</th>
                            <th style={styles.tableHead}>INFRASTRUCTURE</th>
                            <th style={styles.tableHead}>LOCALISATION</th>
                            <th style={styles.tableHead}>TYPE</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((item) => (
                        <tr key={item.id} style={styles.tableRow}>
                          <td style={styles.tableCell}>
                            <span style={styles.itemId}>{item.id}</span>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.itemInfo}>
                              <div 
                                style={{
                                  ...styles.itemIcon,
                                  backgroundColor: activeTab === "vehicules" 
                                    ? getVehicleColor(item.type)
                                    : getInfrastructureColor(item.type),
                                  boxShadow: `0 0 20px ${activeTab === "vehicules" 
                                    ? getVehicleColor(item.type)
                                    : getInfrastructureColor(item.type)}`
                                }}
                              >
                                {activeTab === "vehicules" 
                                  ? getVehicleIcon(item.type)
                                  : getInfrastructureIcon(item.type)
                                }
                              </div>
                              <div>
                                <div style={styles.itemName}>
                                  {activeTab === "vehicules" ? `${item.marque} ${item.modele}` : item.nom}
                                </div>
                                <div style={styles.itemDetails}>
                                  {activeTab === "vehicules" ? "UNITÉ DE TRANSPORT CONNECTÉE" : "INFRASTRUCTURE URBAINE INTELLIGENTE"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            {activeTab === "vehicules" ? (
                              <span style={styles.detailsText}>
                                {item.marque} {item.modele}
                              </span>
                            ) : (
                              <span style={styles.detailsText}>
                                {item.adresse || "LOCALISATION NON SPÉCIFIÉE"}
                              </span>
                            )}
                          </td>
                          <td style={styles.tableCell}>
                            <span 
                              style={{
                                ...styles.typeBadge,
                                backgroundColor: activeTab === "vehicules" 
                                  ? getVehicleColor(item.type)
                                  : getInfrastructureColor(item.type),
                                boxShadow: `0 0 15px ${activeTab === "vehicules" 
                                  ? getVehicleColor(item.type)
                                  : getInfrastructureColor(item.type)}`
                              }}
                            >
                              {activeTab === "vehicules" 
                                ? getVehicleIcon(item.type)
                                : getInfrastructureIcon(item.type)
                              } {item.type.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {currentList.length === 0 && (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>
                      {activeTab === "vehicules" ? "🚗" : "🏗️"}
                    </div>
                    <div style={styles.emptyText}>
                      {activeTab === "vehicules" 
                        ? "AUCUNE UNITÉ MOBILE DÉTECTÉE" 
                        : "AUCUNE INFRASTRUCTURE IDENTIFIÉE"
                      }
                    </div>
                    <div style={styles.emptySubtext}>
                      {activeTab === "vehicules"
                        ? "INITIEZ L'AJOUT D'UNE NOUVELLE UNITÉ MOBILE"
                        : "LES INFRASTRUCTURES APPARAÎTRONT ICI APRÈS SYNCHRONISATION"
                      }
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {currentList.length > 0 && (
                  <div style={styles.paginationContainer}>
                    <div style={styles.pagination}>
                      <button 
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        style={{
                          ...styles.paginationButton,
                          ...(currentPage === 1 && styles.paginationButtonDisabled)
                        }}
                      >
                        <span style={styles.buttonIcon}>◀</span>
                        <span>PRÉCÉDENT</span>
                      </button>

                      <div style={styles.paginationNumbers}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            style={{
                              ...styles.paginationNumber,
                              ...(currentPage === number && styles.paginationNumberActive)
                            }}
                          >
                            {number}
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        style={{
                          ...styles.paginationButton,
                          ...(currentPage === totalPages && styles.paginationButtonDisabled)
                        }}
                      >
                        <span>SUIVANT</span>
                        <span style={styles.buttonIcon}>▶</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
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
    gap: '1rem',
    flexWrap: 'wrap'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: '1rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    minWidth: '140px',
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
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '2px solid rgba(0, 255, 255, 0.3)',
    paddingBottom: '0.5rem'
  },
  tab: {
    padding: '1rem 2rem',
    border: 'none',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    color: '#88ffff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    letterSpacing: '0.5px'
  },
  activeTab: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    color: '#00ffff',
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
    border: '1px solid rgba(0, 255, 255, 0.5)'
  },
  tabIcon: {
    fontSize: '1.25rem'
  },
  // Nouveaux styles pour le bouton d'ajout
  addButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem'
  },
  addItemButton: {
    background: 'linear-gradient(135deg, #00ff88, #00ffff)',
    color: '#0a0a0a',
    fontWeight: '700',
    padding: '1.5rem 3rem',
    borderRadius: '1rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 30px rgba(0, 255, 255, 0.4)',
    minWidth: '280px',
    letterSpacing: '1px',
    position: 'relative',
    overflow: 'hidden'
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
    animation: 'pulse 2s ease-in-out infinite',
    pointerEvents: 'none'
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
  formActionsTop: {
    display: 'flex',
    gap: '1rem'
  },
  closeButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    color: '#ff6b6b',
    fontWeight: '600',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255, 0, 0, 0.3)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px'
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
  sectionActions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  paginationInfo: {
    fontSize: '0.8rem',
    color: '#88ffff',
    fontWeight: '600',
    letterSpacing: '0.5px',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(0, 255, 255, 0.2)'
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
    minWidth: '800px'
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
  itemId: {
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#00ffff',
    letterSpacing: '0.5px'
  },
  itemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  itemIcon: {
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
  itemName: {
    fontWeight: '600',
    color: '#ffffff',
    fontSize: '1rem'
  },
  itemDetails: {
    fontSize: '0.75rem',
    color: '#88ffff',
    marginTop: '0.25rem',
    letterSpacing: '0.5px'
  },
  detailsText: {
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
  // Styles pour la pagination
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem',
    borderTop: '1px solid rgba(0, 255, 255, 0.1)'
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  paginationButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    color: '#88ffff',
    fontWeight: '600',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  paginationButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed'
  },
  paginationNumbers: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },
  paginationNumber: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    color: '#88ffff',
    fontWeight: '600',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.3s ease',
    minWidth: '3rem'
  },
  paginationNumberActive: {
    backgroundColor: 'rgba(0, 255, 255, 0.3)',
    color: '#ffffff',
    border: '1px solid rgba(0, 255, 255, 0.5)',
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)'
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

  .tab:hover:not(.active-tab) {
    background-color: rgba(0, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  .table-row:hover {
    background-color: rgba(0, 255, 255, 0.05);
    transform: translateX(4px);
  }

  .add-item-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 40px rgba(0, 255, 255, 0.6);
  }

  .close-button:hover {
    background-color: rgba(255, 0, 0, 0.2);
    border-color: rgba(255, 0, 0, 0.5);
    transform: translateY(-1px);
  }

  .pagination-button:hover:not(:disabled) {
    background-color: rgba(0, 255, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  .pagination-number:hover:not(.pagination-number-active) {
    background-color: rgba(0, 255, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.4);
    transform: translateY(-1px);
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
    
    .tabs {
      flex-direction: column;
    }
    
    .form-card, .table-card {
      border-radius: 1rem;
      padding: 1.5rem;
    }
    
    .table-cell, .table-head {
      padding: 1rem;
    }
    
    .item-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
    
    .item-icon {
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1rem;
    }
    
    .section-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
    
    .section-actions {
      width: 100%;
      justify-content: space-between;
    }
    
    .pagination {
      flex-direction: column;
      gap: 1rem;
    }
    
    .pagination-numbers {
      order: -1;
    }
  }
`;

// Injection des styles globaux
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}