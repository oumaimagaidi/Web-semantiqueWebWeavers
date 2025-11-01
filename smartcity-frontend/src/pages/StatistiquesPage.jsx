import { useState, useEffect } from "react";
import axios from "axios";

export default function StatistiquesPage() {
  const [pollutionForm, setPollutionForm] = useState({ id: "", valeur: "" });
  const [accidentForm, setAccidentForm] = useState({ id: "", valeur: "" });
  const [utilisationForm, setUtilisationForm] = useState({ id: "", valeur: "" });
  const [statistiques, setStatistiques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const BASE_URL = "http://localhost:8000";

  useEffect(() => {
    fetchStatistiques();
  }, []);

  // --- Fetch toutes les statistiques ---
  const fetchStatistiques = async () => {
    try {
      setLoading(true);
      console.log("🔄 Chargement des statistiques...");
      
      const res = await axios.get(`${BASE_URL}/statistiques/`);
      console.log("📊 Statistiques reçues:", res.data);
      
      setStatistiques(res.data);
      setMessage(null);
    } catch (err) {
      console.error("❌ Erreur fetch statistiques:", err);
      setMessage("❌ Impossible de charger les statistiques");
    } finally {
      setLoading(false);
    }
  };

  // --- Ajouter statistique pollution ---
  const addPollution = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/add_statistique_pollution/`, {
        id: pollutionForm.id,
        tauxPollution: parseFloat(pollutionForm.valeur)
      });
      
      setMessage("✅ Statistique pollution ajoutée avec succès !");
      setPollutionForm({ id: "", valeur: "" });
      fetchStatistiques();
    } catch (err) {
      console.error("❌ Erreur ajout pollution:", err);
      setMessage(err.response?.data?.error || "❌ Erreur lors de l'ajout de la statistique pollution");
    } finally {
      setLoading(false);
    }
  };

  // --- Ajouter statistique accident ---
  const addAccident = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/add_statistique_accident/`, {
        id: accidentForm.id,
        nbreDaccident: parseInt(accidentForm.valeur)
      });
      
      setMessage("✅ Statistique accident ajoutée avec succès !");
      setAccidentForm({ id: "", valeur: "" });
      fetchStatistiques();
    } catch (err) {
      console.error("❌ Erreur ajout accident:", err);
      setMessage(err.response?.data?.error || "❌ Erreur lors de l'ajout de la statistique accident");
    } finally {
      setLoading(false);
    }
  };

  // --- Ajouter statistique utilisation ---
  const addUtilisation = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/add_statistique/`, {
        id: utilisationForm.id,
        type_statistique: "StatistiquesUtilisation",
        valeur: parseFloat(utilisationForm.valeur),
        unite: "utilisations"
      });
      
      setMessage("✅ Statistique utilisation ajoutée avec succès !");
      setUtilisationForm({ id: "", valeur: "" });
      fetchStatistiques();
    } catch (err) {
      console.error("❌ Erreur ajout utilisation:", err);
      setMessage(err.response?.data?.error || "❌ Erreur lors de l'ajout de la statistique utilisation");
    } finally {
      setLoading(false);
    }
  };

  const handlePollutionInputChange = (field, value) => {
    setPollutionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAccidentInputChange = (field, value) => {
    setAccidentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUtilisationInputChange = (field, value) => {
    setUtilisationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatistiqueIcon = (type) => {
    const icons = {
      'StatistiquesPollution': '🌫️',
      'StatistiquesAccidents': '🚨',
      'StatistiquesUtilisation': '📊',
      'default': '📈'
    };
    return icons[type] || icons.default;
  };

  const getStatistiqueColor = (type) => {
    const colors = {
      'StatistiquesPollution': '#10b981',
      'StatistiquesAccidents': '#ef4444',
      'StatistiquesUtilisation': '#8b5cf6',
      'default': '#6b7280'
    };
    return colors[type] || colors.default;
  };

  const getUniteDisplay = (unite) => {
    const displays = {
      'µg/m³': 'µg/m³',
      'accidents': 'accidents',
      'utilisations': 'utilisations',
      'default': unite
    };
    return displays[unite] || displays.default;
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* En-tête */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.titleSection}>
              <h1 style={styles.title}>📊 Tableau de Bord des Statistiques</h1>
              <p style={styles.subtitle}>
                Surveillez les données de pollution, accidents et utilisation des transports
              </p>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{statistiques.length}</span>
                <span style={styles.statLabel}>Statistiques totales</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>
                  {statistiques.filter(s => s.type === 'StatistiquesPollution').length}
                </span>
                <span style={styles.statLabel}>Pollution</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div 
            style={{
              ...styles.message,
              ...(message.startsWith("✅") ? styles.successMessage : styles.errorMessage)
            }}
          >
            {message}
          </div>
        )}

        {/* Formulaire Statistique Pollution */}
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>🌫️ Ajouter une Statistique Pollution</h3>
            <div style={styles.formIndicator}></div>
          </div>
          <form onSubmit={addPollution}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  ID de la statistique
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: pollution_001"
                  value={pollutionForm.id}
                  onChange={(e) => handlePollutionInputChange("id", e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Taux de pollution (µg/m³)
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="ex: 25.5"
                  value={pollutionForm.valeur}
                  onChange={(e) => handlePollutionInputChange("valeur", e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formActions}>
                <button 
                  type="submit"
                  style={styles.primaryButton}
                  disabled={loading}
                >
                  {loading ? (
                    <div style={styles.buttonContent}>
                      <div style={styles.spinner}></div>
                      <span>Ajout en cours...</span>
                    </div>
                  ) : (
                    <div style={styles.buttonContent}>
                      <span style={styles.buttonIcon}>🌫️</span>
                      <span>Ajouter Pollution</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Formulaire Statistique Accident */}
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>🚨 Ajouter une Statistique Accident</h3>
            <div style={styles.formIndicator}></div>
          </div>
          <form onSubmit={addAccident}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  ID de la statistique
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: accident_001"
                  value={accidentForm.id}
                  onChange={(e) => handleAccidentInputChange("id", e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Nombre d'accidents
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="ex: 15"
                  value={accidentForm.valeur}
                  onChange={(e) => handleAccidentInputChange("valeur", e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formActions}>
                <button 
                  type="submit"
                  style={styles.secondaryButton}
                  disabled={loading}
                >
                  {loading ? (
                    <div style={styles.buttonContent}>
                      <div style={styles.spinner}></div>
                      <span>Ajout en cours...</span>
                    </div>
                  ) : (
                    <div style={styles.buttonContent}>
                      <span style={styles.buttonIcon}>🚨</span>
                      <span>Ajouter Accident</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Formulaire Statistique Utilisation */}
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>📊 Ajouter une Statistique d'Utilisation</h3>
            <div style={styles.formIndicator}></div>
          </div>
          <form onSubmit={addUtilisation}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  ID de la statistique
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: utilisation_001"
                  value={utilisationForm.id}
                  onChange={(e) => handleUtilisationInputChange("id", e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Nombre d'utilisations
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="ex: 150"
                  value={utilisationForm.valeur}
                  onChange={(e) => handleUtilisationInputChange("valeur", e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formActions}>
                <button 
                  type="submit"
                  style={styles.tertiaryButton}
                  disabled={loading}
                >
                  {loading ? (
                    <div style={styles.buttonContent}>
                      <div style={styles.spinner}></div>
                      <span>Ajout en cours...</span>
                    </div>
                  ) : (
                    <div style={styles.buttonContent}>
                      <span style={styles.buttonIcon}>📊</span>
                      <span>Ajouter Utilisation</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Liste des Statistiques */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📋 Liste des Statistiques ({statistiques.length})</h3>
            <button 
              onClick={fetchStatistiques}
              style={styles.refreshButton}
              disabled={loading}
            >
              {loading ? '🔄' : '🔄'} Actualiser
            </button>
          </div>

          <div style={styles.tableCard}>
            {loading ? (
              <div style={styles.loadingState}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Chargement des statistiques...</p>
              </div>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHead}>ID</th>
                        <th style={styles.tableHead}>Type</th>
                        <th style={styles.tableHead}>Valeur</th>
                        <th style={styles.tableHead}>Unité</th>
                        <th style={styles.tableHead}>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistiques.map((stat) => (
                        <tr key={stat.id} style={styles.tableRow}>
                          <td style={styles.tableCell}>
                            <span style={styles.avisId}>
                              {stat.id}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span 
                              style={{
                                ...styles.typeBadge,
                                backgroundColor: getStatistiqueColor(stat.type)
                              }}
                            >
                              {getStatistiqueIcon(stat.type)} {stat.type}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.valueText}>
                              {stat.valeur}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.uniteBadge}>
                              {getUniteDisplay(stat.unite)}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.statusBadge}>
                              {stat.valeur > 50 ? '🔴 Élevé' : stat.valeur > 20 ? '🟡 Moyen' : '🟢 Faible'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {statistiques.length === 0 && (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📊</div>
                    <div style={styles.emptyText}>Aucune statistique trouvée</div>
                    <div style={styles.emptySubtext}>
                      Ajoutez des statistiques pour commencer la surveillance
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
    backgroundColor: '#f8fafc',
    padding: '0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  wrapper: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1.5rem'
  },
  header: {
    marginBottom: '2rem'
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
    fontSize: '2.25rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '1.125rem',
    maxWidth: '500px'
  },
  stats: {
    display: 'flex',
    gap: '1rem'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    minWidth: '120px'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#8b5cf6'
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    textAlign: 'center'
  },
  message: {
    marginBottom: '2rem',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    fontWeight: '500',
    fontSize: '0.875rem'
  },
  successMessage: {
    backgroundColor: '#f0fdf4',
    color: '#059669',
    border: '1px solid #bbf7d0'
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca'
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    padding: '2rem',
    marginBottom: '2rem'
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937'
  },
  formIndicator: {
    width: '4rem',
    height: '0.25rem',
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    borderRadius: '2rem'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1rem'
  },
  inputGroup: {
    width: '100%'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  required: {
    color: '#ef4444',
    marginLeft: '0.25rem'
  },
  input: {
    width: '100%',
    padding: '1rem 1.25rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: '#fafafa'
  },
  formActions: {
    display: 'flex',
    alignItems: 'center'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    fontWeight: '600',
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
    minWidth: '200px'
  },
  secondaryButton: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    fontWeight: '600',
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
    minWidth: '200px'
  },
  tertiaryButton: {
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    color: 'white',
    fontWeight: '600',
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)',
    minWidth: '200px'
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  buttonIcon: {
    fontSize: '1.125rem'
  },
  spinner: {
    width: '1.25rem',
    height: '1.25rem',
    border: '2px solid transparent',
    borderTop: '2px solid currentColor',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
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
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937'
  },
  refreshButton: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    fontWeight: '500',
    padding: '0.75rem 1.25rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease'
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
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
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e5e7eb'
  },
  tableHead: {
    padding: '1.25rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap'
  },
  tableRow: {
    transition: 'all 0.3s ease',
    borderBottom: '1px solid #f3f4f6'
  },
  tableCell: {
    padding: '1.25rem 1.5rem',
    fontSize: '0.875rem',
    color: '#374151',
    whiteSpace: 'nowrap'
  },
  avisId: {
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#374151'
  },
  typeBadge: {
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'capitalize',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  valueText: {
    fontWeight: '600',
    fontSize: '1rem',
    color: '#1f2937'
  },
  uniteBadge: {
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  statusBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem'
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
    color: '#6b7280',
    fontSize: '1rem'
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
    opacity: 0.5
  },
  emptyText: {
    color: '#374151',
    fontSize: '1.25rem',
    fontWeight: '600'
  },
  emptySubtext: {
    color: '#6b7280',
    fontSize: '1rem',
    maxWidth: '300px'
  }
};

// Injection des styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    input:focus, select:focus, textarea:focus {
      border-color: #8b5cf6;
      background-color: white;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
      transform: translateY(-1px);
    }

    .primary-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px -1px rgba(16, 185, 129, 0.4);
    }

    .secondary-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px -1px rgba(239, 68, 68, 0.4);
    }

    .tertiary-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px -1px rgba(139, 92, 246, 0.4);
    }

    .primary-button:disabled, .secondary-button:disabled, .tertiary-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .refresh-button:hover:not(:disabled) {
      background-color: #e5e7eb;
    }

    .table-row:hover {
      background-color: #faf5ff;
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
        justify-content: center;
      }
      
      .primary-button, .secondary-button, .tertiary-button {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 768px) {
      .wrapper {
        padding: 1.5rem 1rem;
      }
      
      .title {
        font-size: 1.75rem;
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
      
      .form-card, .table-card {
        border-radius: 1rem;
        padding: 1.5rem;
      }
      
      .table-cell, .table-head {
        padding: 1rem;
      }
      
      .section-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}