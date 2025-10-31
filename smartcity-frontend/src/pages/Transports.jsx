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
    type_vehicule: "Voiture" 
  });

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
      setForm({ id: "", marque: "", modele: "", type_vehicule: "Voiture" });
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

  const vehiculeFields = [
    { key: "id", label: "ID", type: "text", placeholder: "ID unique du véhicule" },
    { key: "marque", label: "Marque", type: "text", placeholder: "Marque du véhicule" },
    { key: "modele", label: "Modèle", type: "text", placeholder: "Modèle du véhicule" }
  ];

  const typeOptions = [
    { value: "Voiture", label: "🚗 Voiture" },
    { value: "Bus", label: "🚌 Bus" },
    { value: "Metro", label: "🚇 Métro" },
    { value: "Velo", label: "🚲 Vélo" },
    { value: "Trottinette", label: "🛴 Trottinette" }
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
      'Voiture': '#3b82f6',
      'Bus': '#f59e0b',
      'Metro': '#dc2626',
      'Velo': '#84cc16',
      'Trottinette': '#8b5cf6',
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
      'Parking': '#f59e0b',
      'Route': '#6b7280',
      'StationsBus': '#3b82f6',
      'StationsMetro': '#dc2626',
      'Batiment': '#059669',
      'default': '#6b7280'
    };
    return colors[type] || colors.default;
  };

  const currentList = activeTab === "vehicules" ? vehicules : infrastructures;
  const totalCount = vehicules.length + infrastructures.length;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* En-tête */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.titleSection}>
              <h1 style={styles.title}>🚗 Gestion des Transports</h1>
              <p style={styles.subtitle}>
                Administrez les véhicules et infrastructures de transport de votre ville intelligente
              </p>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{vehicules.length}</span>
                <span style={styles.statLabel}>Véhicules</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{infrastructures.length}</span>
                <span style={styles.statLabel}>Infrastructures</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{totalCount}</span>
                <span style={styles.statLabel}>Total</span>
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
            onClick={() => setActiveTab("vehicules")}
          >
            🚗 Véhicules
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "infrastructures" ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab("infrastructures")}
          >
            🏗️ Infrastructures
          </button>
        </div>

        {/* Formulaire pour véhicules */}
        {activeTab === "vehicules" && (
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>➕ Ajouter un nouveau véhicule</h3>
              <div style={styles.formIndicator}></div>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                {vehiculeFields.map(({ key, label, type, placeholder }) => (
                  <div key={key} style={styles.inputGroup}>
                    <label style={styles.label}>
                      {label}
                      <span style={styles.required}>*</span>
                    </label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                ))}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Type de véhicule
                    <span style={styles.required}>*</span>
                  </label>
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
                      <span style={styles.buttonIcon}>🚗</span>
                      <span>Ajouter le véhicule</span>
                    </div>
                  )}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setForm({ id: "", marque: "", modele: "", type_vehicule: "Voiture" })}
                  style={styles.secondaryButton}
                >
                  🔄 Réinitialiser
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tableau */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              {activeTab === "vehicules" ? "📋 Liste des Véhicules" : "🏗️ Liste des Infrastructures"}
            </h3>
            <button 
              onClick={activeTab === "vehicules" ? loadVehicules : loadInfrastructures}
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
                <p style={styles.loadingText}>
                  {activeTab === "vehicules" ? "Chargement des véhicules..." : "Chargement des infrastructures..."}
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
                            <th style={styles.tableHead}>Véhicule</th>
                            <th style={styles.tableHead}>Marque/Modèle</th>
                            <th style={styles.tableHead}>Type</th>
                          </>
                        ) : (
                          <>
                            <th style={styles.tableHead}>ID</th>
                            <th style={styles.tableHead}>Infrastructure</th>
                            <th style={styles.tableHead}>Adresse</th>
                            <th style={styles.tableHead}>Type</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {currentList.map((item) => (
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
                                    : getInfrastructureColor(item.type)
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
                                  {activeTab === "vehicules" ? "Véhicule de transport" : "Infrastructure urbaine"}
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
                                {item.adresse || "Non spécifiée"}
                              </span>
                            )}
                          </td>
                          <td style={styles.tableCell}>
                            <span 
                              style={{
                                ...styles.typeBadge,
                                backgroundColor: activeTab === "vehicules" 
                                  ? getVehicleColor(item.type)
                                  : getInfrastructureColor(item.type)
                              }}
                            >
                              {activeTab === "vehicules" 
                                ? getVehicleIcon(item.type)
                                : getInfrastructureIcon(item.type)
                              } {item.type}
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
                        ? "Aucun véhicule trouvé" 
                        : "Aucune infrastructure trouvée"
                      }
                    </div>
                    <div style={styles.emptySubtext}>
                      {activeTab === "vehicules"
                        ? "Commencez par ajouter un nouveau véhicule"
                        : "Les infrastructures apparaîtront ici"
                      }
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
    background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
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
    gap: '1rem',
    flexWrap: 'wrap'
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
    minWidth: '100px'
  },
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#3b82f6'
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    textAlign: 'center'
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '0.5rem'
  },
  tab: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    color: '#6b7280'
  },
  activeTab: {
    backgroundColor: '#3b82f6',
    color: 'white',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    padding: '2rem',
    marginBottom: '3rem',
    background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'
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
    background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
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
    background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
    color: 'white',
    fontWeight: '600',
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
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
  itemId: {
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#374151'
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
    color: '#1f2937',
    fontSize: '1rem'
  },
  itemDetails: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.25rem'
  },
  detailsText: {
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
    gap: '0.25rem',
    whiteSpace: 'nowrap'
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
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  input:focus, select:focus {
    border-color: #3b82f6;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    transform: translateY(-1px);
  }

  .primary-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px -1px rgba(59, 130, 246, 0.4);
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

  .tab:hover:not(.active-tab) {
    background-color: #f3f4f6;
  }

  .table-row:hover {
    background-color: #f8fafc;
    transform: translateX(4px);
  }
`;

// Injection des styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = mediaQueries;
  document.head.appendChild(styleSheet);
}