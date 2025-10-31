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
      setMessage("❌ Impossible de charger les infrastructures.");
    } finally {
      setLoading(false);
    }
  };

  // --- Ajouter une infrastructure ---
  const addInfra = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/add_infrastructure/", {
        id: form.id.trim(),
        nom: form.nom.trim(),
        type: form.type.trim(),
        adresse: form.adresse.trim()
      });

      setMessage(res.data.message || "✅ Infrastructure ajoutée avec succès !");
      setForm({ id: "", nom: "", type: "Route", adresse: "" });
      fetchInfras();
    } catch (err) {
      console.error("Erreur d'ajout :", err);
      setMessage(
        err.response?.data?.detail ||
        "❌ Erreur lors de l'ajout. Vérifiez la console pour plus de détails."
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
    { value: "Route", label: "🛣️ Route", icon: "🛣️" },
    { value: "StationsMetro", label: "🚇 Station Metro", icon: "🚇" },
    { value: "Parking", label: "🅿️ Parking", icon: "🅿️" },
    { value: "StationsBus", label: "🚌 Station Bus", icon: "🚌" },
    { value: "Batiment", label: "🏢 Bâtiment", icon: "🏢" }
  ];

  const getInfrastructureIcon = (type) => {
    const infraType = infrastructureTypes.find(t => t.value === type);
    return infraType ? infraType.icon : "🏗️";
  };

  const getInfrastructureColor = (type) => {
    const colors = {
      'Route': '#059669',
      'StationsMetro': '#dc2626',
      'Parking': '#d97706',
      'StationsBus': '#3b82f6',
      'Batiment': '#7c3aed',
      'default': '#6b7280'
    };
    return colors[type] || colors.default;
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* En-tête */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.titleSection}>
              <h1 style={styles.title}>🏗️ Gestion des Infrastructures</h1>
              <p style={styles.subtitle}>
                Administrez les infrastructures de transport de votre ville intelligente
              </p>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{infras.length}</span>
                <span style={styles.statLabel}>Infrastructures</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message d'état */}
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

        {/* Formulaire */}
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>➕ Ajouter une nouvelle infrastructure</h3>
            <div style={styles.formIndicator}></div>
          </div>
          <form onSubmit={addInfra}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  ID de l'infrastructure
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: route_001"
                  value={form.id}
                  onChange={(e) => handleInputChange("id", e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Nom de l'infrastructure
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: Autoroute A1"
                  value={form.nom}
                  onChange={(e) => handleInputChange("nom", e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Type d'infrastructure
                  <span style={styles.required}>*</span>
                </label>
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
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Adresse
                </label>
                <input
                  type="text"
                  placeholder="ex: 123 Rue Principale"
                  value={form.adresse}
                  onChange={(e) => handleInputChange("adresse", e.target.value)}
                  style={styles.input}
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
                    <span style={styles.buttonIcon}>🏗️</span>
                    <span>Ajouter l'infrastructure</span>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setForm({ id: "", nom: "", type: "Route", adresse: "" })}
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
            <h3 style={styles.sectionTitle}>📋 Liste des Infrastructures</h3>
            <button
              onClick={fetchInfras}
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
                <p style={styles.loadingText}>Chargement des infrastructures...</p>
              </div>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHead}>ID</th>
                        <th style={styles.tableHead}>Infrastructure</th>
                        <th style={styles.tableHead}>Adresse</th>
                        <th style={styles.tableHead}>Type</th>
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
                                  backgroundColor: getInfrastructureColor(infra.type)
                                }}
                              >
                                {getInfrastructureIcon(infra.type)}
                              </div>
                              <div>
                                <div style={styles.infraName}>{infra.nom}</div>
                                <div style={styles.infraDetails}>
                                  Infrastructure urbaine
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.address}>
                              {infra.adresse || "Non spécifiée"}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span
                              style={{
                                ...styles.typeBadge,
                                backgroundColor: getInfrastructureColor(infra.type)
                              }}
                            >
                              {getInfrastructureIcon(infra.type)} {infra.type}
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
                    <div style={styles.emptyText}>Aucune infrastructure trouvée</div>
                    <div style={styles.emptySubtext}>
                      Commencez par ajouter une nouvelle infrastructure
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
    background: 'linear-gradient(135deg, #059669, #047857)',
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
    color: '#059669'
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
    marginBottom: '3rem',
    background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)'
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
    background: 'linear-gradient(135deg, #059669, #047857)',
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
  formActions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white',
    fontWeight: '600',
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)',
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
  infraId: {
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#374151'
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
    color: '#1f2937',
    fontSize: '1rem'
  },
  infraDetails: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.25rem'
  },
  address: {
    color: '#6b7280',
    fontSize: '0.875rem'
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
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  input:focus, select:focus {
    border-color: #059669;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
    transform: translateY(-1px);
  }

  .primary-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px -1px rgba(5, 150, 105, 0.4);
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
    background-color: #f0fdf4;
    transform: translateX(4px);
  }
`;

// Injection des styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = mediaQueries;
  document.head.appendChild(styleSheet);
}