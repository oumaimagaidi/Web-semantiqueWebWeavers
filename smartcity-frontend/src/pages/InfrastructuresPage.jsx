import { useEffect, useState } from "react";
import axios from "axios";

export default function InfrastructuresPage() {
  const [infras, setInfras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: "",
    nom: "",
    type_infrastructure: "Route",
    adresse: ""
  });
  const [message, setMessage] = useState(null);

  // --- Charger les infrastructures depuis l'API ---
  useEffect(() => {
    fetchInfras();
  }, []);

  const fetchInfras = async () => {
    try {
      setLoading(true);
      console.log("🔄 Chargement des infrastructures depuis l'API...");
      
      const res = await axios.get("http://localhost:8000/infrastructures/");
      
      console.log("✅ Données reçues de l'API:", res.data);
      
      if (Array.isArray(res.data)) {
        // TRANSFORMATION DES DONNÉES POUR LE FRONTEND
        const transformedData = res.data.map(infra => ({
          id: infra.id, // L'ID est déjà le nom court depuis le backend
          nom: infra.nom || "Infrastructure sans nom",
          type: infra.type, // Le backend retourne 'type' pas 'type_infrastructure'
          adresse: infra.adresse || "Adresse non spécifiée"
        }));
        
        console.log("🔄 Données transformées:", transformedData);
        setInfras(transformedData);
        setMessage(null);
      } else {
        console.error("❌ Format de données invalide:", res.data);
        setMessage("❌ Format de données invalide reçu du serveur");
        setInfras([]);
      }
      
    } catch (err) {
      console.error("❌ Erreur lors du chargement :", err);
      
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
        setMessage(`❌ Erreur serveur (${err.response.status}): ${err.response.data?.detail || 'Impossible de charger les données'}`);
      } else if (err.request) {
        console.error("Pas de réponse du serveur");
        setMessage("❌ Serveur inaccessible. Vérifiez que le backend est démarré sur localhost:8000");
      } else {
        setMessage("❌ Erreur de connexion: " + err.message);
      }
      
      setInfras([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Ajouter une infrastructure ---
  const addInfra = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!form.id.trim() || !form.nom.trim()) {
      setMessage("❌ L'ID et le nom sont obligatoires");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        id: form.id.trim(),
        nom: form.nom.trim(),
        type_infrastructure: form.type_infrastructure.trim(),
        adresse: form.adresse.trim()
      };

      console.log("📤 Envoi des données à l'API:", payload);

      const res = await axios.post("http://localhost:8000/add_infrastructure/", payload);

      console.log("✅ Réponse de l'API:", res.data);

      setMessage(res.data.message || "✅ Infrastructure ajoutée avec succès !");
      setForm({ id: "", nom: "", type_infrastructure: "Route", adresse: "" });
      
      // Recharger les données après ajout
      setTimeout(() => {
        fetchInfras();
      }, 1000);
      
    } catch (err) {
      console.error("❌ Erreur d'ajout :", err);
      
      if (err.response) {
        const errorData = err.response.data;
        console.error("Détails de l'erreur:", errorData);
        
        if (errorData.detail) {
          setMessage(`❌ ${errorData.detail}`);
        } else if (errorData.error) {
          setMessage(`❌ ${errorData.error}`);
        } else {
          setMessage("❌ Erreur lors de l'ajout de l'infrastructure");
        }
      } else if (err.request) {
        setMessage("❌ Serveur inaccessible");
      } else {
        setMessage("❌ Erreur: " + err.message);
      }
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

  // CORRECTION : Utiliser 'type' au lieu de 'type_infrastructure'
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

  // Fonction pour tester la connexion à l'API
  const testAPIConnection = async () => {
    try {
      setMessage("🔄 Test de connexion à l'API...");
      const testRes = await axios.get("http://localhost:8000/");
      console.log("✅ Test API réussi:", testRes.data);
      setMessage("✅ Connexion API réussie! " + testRes.data.message);
    } catch (err) {
      console.error("❌ Test API échoué:", err);
      setMessage("❌ Impossible de se connecter à l'API. Vérifiez que le serveur est démarré.");
    }
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
              <button 
                onClick={testAPIConnection}
                style={styles.testButton}
                title="Tester la connexion à l'API"
              >
                🔌 Test API
              </button>
            </div>
          </div>
        </div>

        {/* Message d'état */}
        {message && (
          <div
            style={{
              ...styles.message,
              ...(message.startsWith("✅") ? styles.successMessage : 
                   message.startsWith("🔄") ? styles.infoMessage : styles.errorMessage)
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Type d'infrastructure
                  <span style={styles.required}>*</span>
                </label>
                <select
                  value={form.type_infrastructure}
                  onChange={(e) => handleInputChange("type_infrastructure", e.target.value)}
                  style={styles.select}
                  required
                  disabled={loading}
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
                  disabled={loading}
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
                onClick={() => setForm({ id: "", nom: "", type_infrastructure: "Route", adresse: "" })}
                style={styles.secondaryButton}
                disabled={loading}
              >
                🔄 Réinitialiser
              </button>
            </div>
          </form>
        </div>

        {/* Tableau - CORRIGÉ pour utiliser 'type' au lieu de 'type_infrastructure' */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              📋 Liste des Infrastructures 
              <span style={styles.countBadge}>{infras.length}</span>
            </h3>
            <div style={styles.sectionActions}>
              <button
                onClick={fetchInfras}
                style={styles.refreshButton}
                disabled={loading}
                title="Actualiser les données"
              >
                {loading ? '🔄' : '🔄'} Actualiser
              </button>
            </div>
          </div>

          <div style={styles.tableCard}>
            {loading ? (
              <div style={styles.loadingState}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Chargement des infrastructures depuis la base de données...</p>
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
                                  backgroundColor: getInfrastructureColor(infra.type) // CORRIGÉ: infra.type
                                }}
                              >
                                {getInfrastructureIcon(infra.type)} {/* CORRIGÉ: infra.type */}
                              </div>
                              <div>
                                <div style={styles.infraName}>{infra.nom}</div>
                                <div style={styles.infraDetails}>
                                  ID: {infra.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.address}>
                              {infra.adresse}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span
                              style={{
                                ...styles.typeBadge,
                                backgroundColor: getInfrastructureColor(infra.type) // CORRIGÉ: infra.type
                              }}
                            >
                              {getInfrastructureIcon(infra.type)} {infra.type} {/* CORRIGÉ: infra.type */}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {infras.length === 0 && !loading && (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🏗️</div>
                    <div style={styles.emptyText}>Aucune infrastructure trouvée</div>
                    <div style={styles.emptySubtext}>
                      {message ? (
                        <div>
                          <p>Impossible de charger les données depuis le serveur.</p>
                          <button 
                            onClick={fetchInfras}
                            style={styles.retryButton}
                          >
                            🔄 Réessayer
                          </button>
                        </div>
                      ) : (
                        "Commencez par ajouter une nouvelle infrastructure"
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Styles CSS */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Les styles restent identiques...
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
    gap: '1rem',
    alignItems: 'center'
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
  testButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
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
  infoMessage: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #dbeafe'
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
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  countBadge: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  sectionActions: {
    display: 'flex',
    gap: '0.5rem'
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
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    marginTop: '1rem'
  }
};