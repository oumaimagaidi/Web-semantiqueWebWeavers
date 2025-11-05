import { useEffect, useState } from "react";
import axios from "axios";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [infras, setInfras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [form, setForm] = useState({ 
    id: "", 
    type_evenement: "TrajetUrgent", 
    infrastructure_id: "",
    description: "",
    niveau_urgence: "medium"
  });
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

  useEffect(() => {
    fetchEvents();
    fetchInfras();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Essayer d'abord les événements, puis les trajets comme fallback
      try {
        const res = await axios.get("http://localhost:8000/evenements/");
        setEvents(res.data);
      } catch (error) {
        console.log("Endpoint evenements non disponible, utilisation des trajets");
        const res = await axios.get("http://localhost:8000/trajets/");
        setEvents(res.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des événements :", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInfras = async () => {
    try {
      const res = await axios.get("http://localhost:8000/infrastructures/");
      setInfras(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des infrastructures :", error);
      setInfras([]);
    }
  };

  const addEvent = async (e) => {
    e.preventDefault();
    try {
      // Essayer d'abord l'endpoint evenements
      try {
        await axios.post("http://localhost:8000/add_evenement/", {
          id: form.id,
          type_evenement: form.type_evenement,
          description: form.description || `Événement ${form.type_evenement} - Urgence: ${form.niveau_urgence}`,
          infrastructure_id: form.infrastructure_id || "",
          niveau_urgence: form.niveau_urgence
        });
      } catch (error) {
        // Fallback vers l'endpoint trajet
        console.log("Endpoint evenement non disponible, utilisation des trajets");
        await axios.post("http://localhost:8000/add_trajet/", {
          id: form.id,
          distance: 0,
          duree: 0,
          heureDepart: new Date().toISOString(),
          heureArrivee: new Date(Date.now() + 30 * 60000).toISOString(),
          type_trajet: form.type_evenement
        });
      }
      
      // Réinitialiser le formulaire et le masquer
      setForm({ 
        id: "", 
        type_evenement: "TrajetUrgent", 
        infrastructure_id: "",
        description: "",
        niveau_urgence: "medium"
      });
      setShowForm(false);
      
      // Recharger les événements
      fetchEvents();
      
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'événement :", error);
      alert("Erreur lors de l'ajout de l'événement: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculs pour la pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = events.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(events.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const eventTypes = [
    { value: "TrajetUrgent", label: "🚨 URGENCE CRITIQUE", color: "#ff00ff" },
    { value: "TrajetOptimal", label: "✅ TRAJET OPTIMAL", color: "#00ff88" },
    { value: "TrajetCourt", label: "📏 CIRCUIT COURT", color: "#00ffff" },
    { value: "TrajetRecommandé", label: "⭐ TRAJET RECOMMANDÉ", color: "#ffaa00" },
    { value: "Trajet", label: "🔄 TRAJET STANDARD", color: "#8884d8" }
  ];

  const urgencyLevels = [
    { value: "low", label: "🟢 NIVEAU FAIBLE", color: "#00ff88" },
    { value: "medium", label: "🟡 NIVEAU MOYEN", color: "#ffaa00" },
    { value: "high", label: "🔴 NIVEAU CRITIQUE", color: "#ff00ff" }
  ];

  const getEventIcon = (type) => {
    const icons = {
      'TrajetUrgent': '🚨',
      'TrajetOptimal': '✅',
      'TrajetCourt': '📏',
      'TrajetRecommandé': '⭐',
      'Trajet': '🔄',
      'default': '📊'
    };
    return icons[type] || icons.default;
  };

  const getEventColor = (type) => {
    const eventType = eventTypes.find(et => et.value === type);
    return eventType ? eventType.color : '#8884d8';
  };

  const getUrgencyColor = (level) => {
    const urgency = urgencyLevels.find(u => u.value === level);
    return urgency ? urgency.color : '#ffaa00';
  };

  // Fonction pour formater la description pour l'affichage
  const formatDescription = (event) => {
    if (event.description) return event.description;
    if (event.distance && event.duree) {
      return `Trajet de ${event.distance}km pendant ${event.duree}min`;
    }
    return "Événement de mobilité";
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
                <span style={styles.titleIcon}>🚨</span>
                CENTRE DE CONTRÔLE DES ÉVÉNEMENTS
              </h1>
              <p style={styles.subtitle}>
                SURVEILLANCE EN TEMPS RÉEL DES ALERTES ET INCIDENTS DU RÉSEAU
              </p>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>{events.length}</span>
                <span style={styles.statLabel}>ÉVÉNEMENTS</span>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>
                  {events.filter(e => e.type === 'TrajetUrgent' || e.type_evenement === 'TrajetUrgent').length}
                </span>
                <span style={styles.statLabel}>ALERTES CRITIQUES</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton pour afficher le formulaire */}
        <div style={styles.addButtonContainer}>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={styles.addButton}
          >
            <span style={styles.buttonIcon}>
              {showForm ? '✖️' : '➕'}
            </span>
            <span>
              {showForm ? 'MASQUER LE FORMULAIRE' : 'AJOUTER UN ÉVÉNEMENT'}
            </span>
          </button>
        </div>

        {/* Formulaire d'alerte (conditionnel) */}
        {showForm && (
          <div style={styles.formCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>➕ INITIER UN NOUVEL ÉVÉNEMENT</h3>
              <div style={styles.formIndicator}></div>
            </div>
            <form onSubmit={addEvent}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    IDENTIFIANT D'ÉVÉNEMENT
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="EVENT_001"
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
                    TYPE D'ÉVÉNEMENT
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <select
                      value={form.type_evenement}
                      onChange={(e) => handleInputChange("type_evenement", e.target.value)}
                      style={styles.select}
                      required
                    >
                      {eventTypes.map((type) => (
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
                    NIVEAU D'URGENCE
                  </label>
                  <div style={styles.inputContainer}>
                    <select
                      value={form.niveau_urgence}
                      onChange={(e) => handleInputChange("niveau_urgence", e.target.value)}
                      style={{
                        ...styles.select,
                        borderColor: getUrgencyColor(form.niveau_urgence)
                      }}
                    >
                      {urgencyLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    INFRASTRUCTURE CONCERNÉE
                  </label>
                  <div style={styles.inputContainer}>
                    <select
                      value={form.infrastructure_id}
                      onChange={(e) => handleInputChange("infrastructure_id", e.target.value)}
                      style={styles.select}
                    >
                      <option value="">SÉLECTIONNEZ UNE INFRASTRUCTURE</option>
                      {infras.map((infra) => (
                        <option key={infra.id} value={infra.id}>
                          {infra.nom || infra.id} ({infra.type})
                        </option>
                      ))}
                    </select>
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>

                <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
                  <label style={styles.label}>
                    RAPPORT DE SITUATION
                  </label>
                  <div style={styles.inputContainer}>
                    <textarea
                      placeholder="DÉCRIVEZ LA NATURE ET L'IMPACT DE L'ÉVÉNEMENT..."
                      value={form.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      style={styles.textarea}
                      rows={3}
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
                      <span>ACTIVER L'ALERTE</span>
                    </div>
                  )}
                </button>
                
                <button 
                  type="button"
                  onClick={() => {
                    setForm({ 
                      id: "", 
                      type_evenement: "TrajetUrgent", 
                      infrastructure_id: "",
                      description: "",
                      niveau_urgence: "medium"
                    });
                  }}
                  style={styles.secondaryButton}
                >
                  <span style={styles.buttonIcon}>🔄</span>
                  <span>RÉINITIALISER</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={styles.cancelButton}
                >
                  <span style={styles.buttonIcon}>❌</span>
                  <span>ANNULER</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tableau des événements */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📋 JOURNAL DES ÉVÉNEMENTS ET TRAJETS</h3>
            <div style={styles.sectionControls}>
              <button 
                onClick={fetchEvents}
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
                <p style={styles.loadingText}>CHARGEMENT DES ÉVÉNEMENTS...</p>
              </div>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHead}>ID</th>
                        <th style={styles.tableHead}>TYPE</th>
                        <th style={styles.tableHead}>DESCRIPTION</th>
                        <th style={styles.tableHead}>INFRASTRUCTURE</th>
                        <th style={styles.tableHead}>STATUT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentEvents.map((event) => (
                        <tr 
                          key={event.id} 
                          style={styles.tableRow}
                        >
                          <td style={styles.tableCell}>
                            <span style={styles.eventId}>{event.id}</span>
                          </td>
                          <td style={styles.tableCell}>
                            <span 
                              style={{
                                ...styles.typeBadge,
                                backgroundColor: getEventColor(event.type || event.type_evenement),
                                boxShadow: `0 0 15px ${getEventColor(event.type || event.type_evenement)}`
                              }}
                            >
                              {getEventIcon(event.type || event.type_evenement)} {(event.type || event.type_evenement).replace('Trajet', '').toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.description}>
                              {formatDescription(event)}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.infrastructure}>
                              {event.infrastructure || (event.infrastructure_id ? event.infrastructure_id : 'N/A')}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span 
                              style={{
                                ...styles.statusBadge,
                                backgroundColor: (event.type === 'TrajetUrgent' || event.type_evenement === 'TrajetUrgent') 
                                  ? '#ff00ff' 
                                  : '#00ff88',
                                boxShadow: (event.type === 'TrajetUrgent' || event.type_evenement === 'TrajetUrgent')
                                  ? '0 0 15px #ff00ff'
                                  : '0 0 15px #00ff88'
                              }}
                            >
                              {(event.type === 'TrajetUrgent' || event.type_evenement === 'TrajetUrgent') ? '🔴 ACTIF' : '🟢 TERMINÉ'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {events.length === 0 && (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📊</div>
                    <div style={styles.emptyText}>AUCUN ÉVÉNEMENT ENREGISTRÉ</div>
                    <div style={styles.emptySubtext}>
                      LE SYSTÈME EST EN ATTENTE D'ÉVÉNEMENTS
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {events.length > 0 && (
                  <div style={styles.pagination}>
                    <button 
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{
                        ...styles.paginationButton,
                        ...(currentPage === 1 && styles.paginationButtonDisabled)
                      }}
                    >
                      ‹ PRÉCÉDENT
                    </button>
                    
                    <div style={styles.paginationInfo}>
                      Page {currentPage} sur {totalPages}
                    </div>

                    <button 
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      style={{
                        ...styles.paginationButton,
                        ...(currentPage === totalPages && styles.paginationButtonDisabled)
                      }}
                    >
                      SUIVANT ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Panneau d'alerte en temps réel */}
        <div style={styles.alertPanel}>
          <div style={styles.cardGlow}></div>
          <div style={styles.alertHeader}>
            <h4 style={styles.alertTitle}>🛡️ SYSTÈME DE SURVEILLANCE ACTIF</h4>
            <div style={styles.alertStatus}>
              <div style={styles.statusIndicator}></div>
              <span>SYSTÈME OPÉRATIONNEL</span>
            </div>
          </div>
          <div style={styles.alertGrid}>
            <div style={styles.alertItem}>
              <div style={styles.alertIcon}>🚨</div>
              <div style={styles.alertContent}>
                <div style={styles.alertValue}>
                  {events.filter(e => e.type === 'TrajetUrgent' || e.type_evenement === 'TrajetUrgent').length}
                </div>
                <div style={styles.alertLabel}>ALERTES CRITIQUES</div>
              </div>
            </div>
            <div style={styles.alertItem}>
              <div style={styles.alertIcon}>✅</div>
              <div style={styles.alertContent}>
                <div style={styles.alertValue}>{events.length}</div>
                <div style={styles.alertLabel}>ÉVÉNEMENTS TOTAL</div>
              </div>
            </div>
            <div style={styles.alertItem}>
              <div style={styles.alertIcon}>⚡</div>
              <div style={styles.alertContent}>
                <div style={styles.alertValue}>24/7</div>
                <div style={styles.alertLabel}>SURVEILLANCE</div>
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
    border: '1px solid rgba(255, 0, 255, 0.3)',
    boxShadow: '0 0 30px rgba(255, 0, 255, 0.1)',
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
    background: 'linear-gradient(90deg, transparent, rgba(255,0,255,0.05), transparent)',
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
    background: 'linear-gradient(135deg, #ffffff, #ff00ff)',
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
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 0, 255, 0.3)',
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
    background: 'radial-gradient(circle at center, rgba(255,0,255,0.1) 0%, transparent 70%)',
    animation: 'pulse 2s ease-in-out infinite'
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#ff00ff',
    textShadow: '0 0 10px rgba(255, 0, 255, 0.5)'
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#88ffff',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: '1px'
  },
  addButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem'
  },
  addButton: {
    background: 'linear-gradient(135deg, #00ff88, #00ffff)',
    color: '#0a0a0a',
    fontWeight: '700',
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 25px rgba(0, 255, 136, 0.4)',
    minWidth: '300px',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
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
  textarea: {
    width: '100%',
    padding: '1rem 1.25rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#ffffff',
    resize: 'vertical',
    fontFamily: "'Rajdhani', sans-serif",
    minHeight: '100px'
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
    background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
    color: '#0a0a0a',
    fontWeight: '700',
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 25px rgba(255, 0, 255, 0.4)',
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
  cancelButton: {
    backgroundColor: 'transparent',
    color: '#ff4444',
    fontWeight: '600',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255, 68, 68, 0.3)',
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
  sectionControls: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
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
  eventId: {
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#00ffff',
    letterSpacing: '0.5px'
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
    gap: '0.25rem',
    whiteSpace: 'nowrap',
    letterSpacing: '0.5px'
  },
  distance: {
    fontWeight: '600',
    color: '#00ff88'
  },
  duration: {
    fontWeight: '600',
    color: '#00ffff'
  },
  user: {
    color: '#88ffff',
    fontStyle: 'italic'
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
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1.5rem',
    gap: '1rem',
    borderTop: '1px solid rgba(0, 255, 255, 0.1)'
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
    letterSpacing: '0.5px'
  },
  paginationButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed'
  },
  paginationInfo: {
    color: '#88ffff',
    fontSize: '0.9rem',
    fontWeight: '600',
    padding: '0 1rem'
  },
  alertPanel: {
    backgroundColor: 'rgba(10, 15, 35, 0.7)',
    borderRadius: '1.5rem',
    border: '1px solid rgba(255, 0, 255, 0.3)',
    padding: '2rem',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 0 25px rgba(255, 0, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  },
  alertHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  alertTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#ff00ff',
    letterSpacing: '1px'
  },
  alertStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: '#00ff88'
  },
  statusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#00ff88',
    boxShadow: '0 0 10px #00ff88'
  },
  alertGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem'
  },
  alertItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 0, 255, 0.2)'
  },
  alertIcon: {
    fontSize: '2rem',
    filter: 'drop-shadow(0 0 8px currentColor)'
  },
  alertContent: {
    flex: 1
  },
  alertValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#ff00ff',
    textShadow: '0 0 8px rgba(255, 0, 255, 0.5)'
  },
  alertLabel: {
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

  input:focus, select:focus, textarea:focus {
    border-color: #00ffff !important;
    background-color: rgba(0, 0, 0, 0.5) !important;
    box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.3) !important;
  }

  input:focus + .input-glow, select:focus + .input-glow, textarea:focus + .input-glow {
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5) !important;
  }

  .primary-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 0 35px rgba(255, 0, 255, 0.6);
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

  .cancel-button:hover {
    background-color: rgba(255, 68, 68, 0.1);
    border-color: rgba(255, 68, 68, 0.5);
    transform: translateY(-1px);
  }

  .refresh-button:hover:not(:disabled) {
    background-color: rgba(0, 255, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  .add-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 35px rgba(0, 255, 136, 0.6);
  }

  .pagination-button:hover:not(:disabled) {
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
    
    .primary-button, .secondary-button, .cancel-button {
      width: 100%;
      justify-content: center;
    }
    
    .alert-grid {
      grid-template-columns: 1fr;
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
    
    .form-card, .table-card, .alert-panel {
      border-radius: 1rem;
      padding: 1.5rem;
    }
    
    .table-cell, .table-head {
      padding: 1rem;
    }
    
    .alert-header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
    
    .pagination {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
`;

// Injection des styles globaux
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}