import { useEffect, useState } from "react";
import axios from "axios";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [infras, setInfras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    id: "", 
    type: "accident", 
    infrastructure_id: "",
    description: "",
    niveau_urgence: "medium"
  });

  useEffect(() => {
    fetchEvents();
    fetchInfras();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Utiliser l'endpoint des trajets comme événements (adaptation)
      const res = await axios.get("http://localhost:8000/trajets/");
      setEvents(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des événements :", error);
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
    }
  };

  const addEvent = async (e) => {
    e.preventDefault();
    try {
      // Utiliser l'endpoint add_trajet comme événement
      await axios.post("http://localhost:8000/add_trajet/", {
        id: form.id,
        distance: 0, // Valeur par défaut pour les événements
        duree: 0,    // Valeur par défaut pour les événements
        type_trajet: form.type
      });
      setForm({ 
        id: "", 
        type: "accident", 
        infrastructure_id: "",
        description: "",
        niveau_urgence: "medium"
      });
      fetchEvents();
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'événement :", error);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const eventTypes = [
    { value: "TrajetUrgent", label: "🚨 Urgence", color: "#dc2626" },
    { value: "TrajetOptimal", label: "✅ Optimal", color: "#059669" },
    { value: "TrajetCourt", label: "📏 Court", color: "#3b82f6" },
    { value: "TrajetLong", label: "🛣️ Long", color: "#f59e0b" },
    { value: "Trajet", label: "🔄 Normal", color: "#6b7280" }
  ];

  const urgencyLevels = [
    { value: "low", label: "🟢 Faible", color: "#059669" },
    { value: "medium", label: "🟡 Moyen", color: "#d97706" },
    { value: "high", label: "🔴 Élevé", color: "#dc2626" }
  ];

  const getEventIcon = (type) => {
    const icons = {
      'TrajetUrgent': '🚨',
      'TrajetOptimal': '✅',
      'TrajetCourt': '📏',
      'TrajetLong': '🛣️',
      'Trajet': '🔄',
      'default': '📊'
    };
    return icons[type] || icons.default;
  };

  const getEventColor = (type) => {
    const eventType = eventTypes.find(et => et.value === type);
    return eventType ? eventType.color : '#6b7280';
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* En-tête */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.titleSection}>
              <h1 style={styles.title}>🚨 Gestion des Événements de Trafic</h1>
              <p style={styles.subtitle}>
                Surveillez et gérez les événements et trajets du réseau de transport
              </p>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{events.length}</span>
                <span style={styles.statLabel}>Événements</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>
                  {events.filter(e => e.type === 'TrajetUrgent').length}
                </span>
                <span style={styles.statLabel}>Urgences</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>➕ Ajouter un nouvel événement</h3>
            <div style={styles.formIndicator}></div>
          </div>
          <form onSubmit={addEvent}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  ID de l'événement
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: event_001"
                  value={form.id}
                  onChange={(e) => handleInputChange("id", e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Type d'événement
                  <span style={styles.required}>*</span>
                </label>
                <select
                  value={form.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  style={styles.select}
                  required
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Niveau d'urgence
                </label>
                <select
                  value={form.niveau_urgence}
                  onChange={(e) => handleInputChange("niveau_urgence", e.target.value)}
                  style={{
                    ...styles.select,
                    borderColor: urgencyLevels.find(u => u.value === form.niveau_urgence)?.color
                  }}
                >
                  {urgencyLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Infrastructure concernée
                </label>
                <select
                  value={form.infrastructure_id}
                  onChange={(e) => handleInputChange("infrastructure_id", e.target.value)}
                  style={styles.select}
                >
                  <option value="">Sélectionnez une infrastructure</option>
                  {infras.map((infra) => (
                    <option key={infra.id} value={infra.id}>
                      {infra.nom} ({infra.type})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
                <label style={styles.label}>
                  Description
                </label>
                <textarea
                  placeholder="Décrivez l'événement..."
                  value={form.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  style={styles.textarea}
                  rows={3}
                />
              </div>
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
                    <span style={styles.buttonIcon}>🚨</span>
                    <span>Ajouter l'événement</span>
                  </div>
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => setForm({ 
                  id: "", 
                  type: "accident", 
                  infrastructure_id: "",
                  description: "",
                  niveau_urgence: "medium"
                })}
                style={styles.secondaryButton}
              >
                🔄 Réinitialiser
              </button>
            </div>
          </form>
        </div>

        {/* Tableau */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📋 Liste des Événements et Trajets</h3>
            <button 
              onClick={fetchEvents}
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
                <p style={styles.loadingText}>Chargement des événements...</p>
              </div>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHead}>ID</th>
                        <th style={styles.tableHead}>Type</th>
                        <th style={styles.tableHead}>Distance</th>
                        <th style={styles.tableHead}>Durée</th>
                        <th style={styles.tableHead}>Utilisateur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
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
                                backgroundColor: getEventColor(event.type)
                              }}
                            >
                              {getEventIcon(event.type)} {event.type}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.distance}>
                              {event.distance ? `${event.distance} km` : 'N/A'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.duration}>
                              {event.duree ? `${event.duree} min` : 'N/A'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.user}>
                              {event.personne || 'Non assigné'}
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
                    <div style={styles.emptyText}>Aucun événement enregistré</div>
                    <div style={styles.emptySubtext}>
                      Les événements et trajets apparaîtront ici
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
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
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
    color: '#dc2626'
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    textAlign: 'center'
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    padding: '2rem',
    marginBottom: '3rem',
    background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)'
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
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
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
  select: {
    width: '100%',
    padding: '1rem 1.25rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: '#fafafa',
    cursor: 'pointer'
  },
  textarea: {
    width: '100%',
    padding: '1rem 1.25rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: '#fafafa',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    color: 'white',
    fontWeight: '600',
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)',
    minWidth: '200px'
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#6b7280',
    fontWeight: '600',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    border: '2px solid #e5e7eb',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease'
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
  eventId: {
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
  distance: {
    fontWeight: '600',
    color: '#059669'
  },
  duration: {
    fontWeight: '600',
    color: '#3b82f6'
  },
  user: {
    color: '#6b7280',
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

// Media queries et animations
const mediaQueries = `
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
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  input:focus, select:focus, textarea:focus {
    border-color: #dc2626;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    transform: translateY(-1px);
  }

  .primary-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px -1px rgba(220, 38, 38, 0.4);
  }

  .primary-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .secondary-button:hover {
    background-color: #f3f4f6;
    border-color: #d1d5db;
  }

  .refresh-button:hover {
    background-color: #e5e7eb;
  }

  .table-row:hover {
    background-color: #fef2f2;
    transform: translateX(4px);
  }
`;

// Injection des styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = mediaQueries;
  document.head.appendChild(styleSheet);
}