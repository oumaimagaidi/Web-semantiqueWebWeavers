import { useEffect, useState } from "react";
import axios from "axios";

export default function RechargePage() {
  const [stations, setStations] = useState([]);
  const [reseauxRecharge, setReseauxRecharge] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stationForm, setStationForm] = useState({ 
    id: "", 
    type_connecteur: "Type2", 
    puissanceMax: 22.0, 
    disponible: true 
  });
  const [linkForm, setLinkForm] = useState({ reseau: "", station: "" });

  // ------------------- Fetch stations -------------------
  const fetchStations = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/stations_recharge/");
      setStations(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des stations:", err);
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Fetch relations reseau -> station -------------------
  const fetchReseauxRecharge = async () => {
    try {
      const res = await axios.get("http://localhost:8000/reseaux/seRecharge");
      setReseauxRecharge(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des relations:", err);
      setReseauxRecharge([]);
    }
  };

  // ------------------- Fetch véhicules pour la sélection -------------------
  const fetchVehicules = async () => {
    try {
      const res = await axios.get("http://localhost:8000/vehicules/");
      setVehicules(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des véhicules:", err);
      setVehicules([]);
    }
  };

  useEffect(() => {
    fetchStations();
    fetchReseauxRecharge();
    fetchVehicules();
  }, []);

  // ------------------- Add new station -------------------
  const addStation = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("http://localhost:8000/add_station_recharge/", stationForm);
      alert("✅ Station de recharge ajoutée avec succès !");
      setStationForm({ 
        id: "", 
        type_connecteur: "Type2", 
        puissanceMax: 22.0, 
        disponible: true 
      });
      fetchStations();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Add new relation reseau -> station -------------------
  const addReseauRecharge = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Utiliser l'endpoint pour créer une relation d'utilisation
      await axios.post("http://localhost:8000/personne/utilise_transport/", {
        personne_id: linkForm.reseau,
        transport_id: linkForm.station
      });
      alert("✅ Relation réseau → station ajoutée avec succès !");
      setLinkForm({ reseau: "", station: "" });
      fetchReseauxRecharge();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStationInputChange = (field, value) => {
    setStationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLinkInputChange = (field, value) => {
    setLinkForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const connecteurTypes = [
    { value: "Type2", label: "Type 2" },
    { value: "CCS", label: "CCS Combo" },
    { value: "CHAdeMO", label: "CHAdeMO" },
    { value: "AC", label: "AC Standard" }
  ];

  const getStationIcon = (type) => {
    const icons = {
      'RechargeElectrique': '⚡',
      'RechargeGaz': '⛽',
      'default': '🔌'
    };
    return icons[type] || icons.default;
  };

  const getStationColor = (type) => {
    const colors = {
      'RechargeElectrique': '#10b981',
      'RechargeGaz': '#f59e0b',
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
              <h1 style={styles.title}>⚡ Gestion des Stations de Recharge</h1>
              <p style={styles.subtitle}>
                Gérez les stations de recharge et leurs relations avec les réseaux de transport
              </p>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{stations.length}</span>
                <span style={styles.statLabel}>Stations</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{reseauxRecharge.length}</span>
                <span style={styles.statLabel}>Relations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire ajout station */}
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>➕ Ajouter une station de recharge</h3>
            <div style={styles.formIndicator}></div>
          </div>
          <form onSubmit={addStation}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  ID de la station
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: station_001"
                  value={stationForm.id}
                  onChange={(e) => handleStationInputChange("id", e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Type de connecteur
                  <span style={styles.required}>*</span>
                </label>
                <select
                  value={stationForm.type_connecteur}
                  onChange={(e) => handleStationInputChange("type_connecteur", e.target.value)}
                  style={styles.select}
                  required
                >
                  {connecteurTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Puissance maximale (kW)
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="ex: 22.0"
                  value={stationForm.puissanceMax}
                  onChange={(e) => handleStationInputChange("puissanceMax", parseFloat(e.target.value))}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Statut
                </label>
                <select
                  value={stationForm.disponible}
                  onChange={(e) => handleStationInputChange("disponible", e.target.value === "true")}
                  style={styles.select}
                >
                  <option value={true}>🟢 Disponible</option>
                  <option value={false}>🔴 Indisponible</option>
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
                    <span style={styles.buttonIcon}>⚡</span>
                    <span>Ajouter la station</span>
                  </div>
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => setStationForm({ 
                  id: "", 
                  type_connecteur: "Type2", 
                  puissanceMax: 22.0, 
                  disponible: true 
                })}
                style={styles.secondaryButton}
              >
                🔄 Réinitialiser
              </button>
            </div>
          </form>
        </div>

        {/* Formulaire ajout relation reseau -> station */}
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>🔗 Associer un réseau à une station</h3>
            <div style={styles.formIndicator}></div>
          </div>
          <form onSubmit={addReseauRecharge}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  ID du réseau/véhicule
                  <span style={styles.required}>*</span>
                </label>
                <select
                  value={linkForm.reseau}
                  onChange={(e) => handleLinkInputChange("reseau", e.target.value)}
                  style={styles.select}
                  required
                >
                  <option value="">Sélectionnez un réseau</option>
                  {vehicules.map((vehicule) => (
                    <option key={vehicule.id} value={vehicule.id}>
                      {vehicule.id} ({vehicule.type})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  ID de la station
                  <span style={styles.required}>*</span>
                </label>
                <select
                  value={linkForm.station}
                  onChange={(e) => handleLinkInputChange("station", e.target.value)}
                  style={styles.select}
                  required
                >
                  <option value="">Sélectionnez une station</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.id} ({station.connecteur})
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
                    <span>Association en cours...</span>
                  </div>
                ) : (
                  <div style={styles.buttonContent}>
                    <span style={styles.buttonIcon}>🔗</span>
                    <span>Associer le réseau</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Liste des stations */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📋 Stations de recharge ({stations.length})</h3>
            <button 
              onClick={fetchStations}
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
                <p style={styles.loadingText}>Chargement des stations...</p>
              </div>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHead}>ID</th>
                        <th style={styles.tableHead}>Type</th>
                        <th style={styles.tableHead}>Connecteur</th>
                        <th style={styles.tableHead}>Puissance</th>
                        <th style={styles.tableHead}>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stations.map((station) => (
                        <tr 
                          key={station.id} 
                          style={styles.tableRow}
                        >
                          <td style={styles.tableCell}>
                            <span style={styles.stationId}>{station.id}</span>
                          </td>
                          <td style={styles.tableCell}>
                            <span 
                              style={{
                                ...styles.typeBadge,
                                backgroundColor: getStationColor(station.type)
                              }}
                            >
                              {getStationIcon(station.type)} {station.type}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.connecteur}>
                              {station.connecteur}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.puissance}>
                              {station.puissance ? `${station.puissance} kW` : 'N/A'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span 
                              style={{
                                ...styles.statusBadge,
                                backgroundColor: station.disponible ? '#d1fae5' : '#fee2e2',
                                color: station.disponible ? '#065f46' : '#991b1b'
                              }}
                            >
                              {station.disponible ? '🟢 Disponible' : '🔴 Indisponible'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {stations.length === 0 && (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>⚡</div>
                    <div style={styles.emptyText}>Aucune station de recharge trouvée</div>
                    <div style={styles.emptySubtext}>
                      Ajoutez une station de recharge pour commencer
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Liste des relations reseau -> station */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>🔗 Relations Réseau → Station ({reseauxRecharge.length})</h3>
            <button 
              onClick={fetchReseauxRecharge}
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
                <p style={styles.loadingText}>Chargement des relations...</p>
              </div>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHead}>Réseau/Véhicule</th>
                        <th style={styles.tableHead}>Station de recharge</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reseauxRecharge.map((relation, idx) => (
                        <tr 
                          key={idx} 
                          style={styles.tableRow}
                        >
                          <td style={styles.tableCell}>
                            <span style={styles.reseauBadge}>
                              {relation.reseau}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.stationBadge}>
                              {relation.station}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {reseauxRecharge.length === 0 && (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🔗</div>
                    <div style={styles.emptyText}>Aucune relation réseau → station</div>
                    <div style={styles.emptySubtext}>
                      Associez des réseaux à des stations pour commencer
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
    background: 'linear-gradient(135deg, #10b981, #059669)',
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
    color: '#10b981'
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
    background: 'linear-gradient(135deg, #10b981, #059669)',
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
  stationId: {
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
  connecteur: {
    fontWeight: '500',
    color: '#374151'
  },
  puissance: {
    fontWeight: '600',
    color: '#059669'
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
  reseauBadge: {
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  stationBadge: {
    backgroundColor: '#f0fdf4',
    color: '#059669',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600'
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
    
    .section-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  input:focus, select:focus {
    border-color: #10b981;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    transform: translateY(-1px);
  }

  .primary-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px -1px rgba(16, 185, 129, 0.4);
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