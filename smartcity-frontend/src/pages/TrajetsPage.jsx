import { useEffect, useState } from "react";
import axios from "axios";

export default function TrajetsPage() {
  const [trajets, setTrajets] = useState([]);
  const [relations, setRelations] = useState([]);
  const [personnes, setPersonnes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trajetForm, setTrajetForm] = useState({ 
    id: "", 
    duree: "", 
    distance: "",
    heureDepart: "",
    heureArrivee: ""
  });
  const [linkForm, setLinkForm] = useState({ utilisateur: "", trajet: "" });

  // ------------------- Récupérer tous les trajets -------------------
  const fetchTrajets = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/trajets/");
      setTrajets(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des trajets:", err);
      setTrajets([]);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Récupérer les relations utilisateur → trajet -------------------
  const fetchRelations = async () => {
    try {
      const res = await axios.get("http://localhost:8000/utilisateurs/trajets/");
      setRelations(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des relations:", err);
      setRelations([]);
    }
  };

  // ------------------- Récupérer les personnes pour la sélection -------------------
  const fetchPersonnes = async () => {
    try {
      const res = await axios.get("http://localhost:8000/personnes/");
      setPersonnes(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des personnes:", err);
      setPersonnes([]);
    }
  };

  useEffect(() => {
    fetchTrajets();
    fetchRelations();
    fetchPersonnes();
  }, []);

  // ------------------- Ajouter un trajet -------------------
  const addTrajet = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/add_trajet/", {
        id: trajetForm.id,
        distance: parseFloat(trajetForm.distance) || 0,
        duree: parseFloat(trajetForm.duree) || 0,
        heureDepart: trajetForm.heureDepart || "00:00",
        heureArrivee: trajetForm.heureArrivee || "00:00"
      });
      alert("✅ Trajet ajouté avec succès !");
      setTrajetForm({ 
        id: "", 
        duree: "", 
        distance: "",
        heureDepart: "",
        heureArrivee: ""
      });
      fetchTrajets();
    } catch (err) {
      alert(err.response?.data?.detail || err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Ajouter relation utilisateur → trajet -------------------
  const addRelation = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/personne/effectue_trajet/", {
        personne_id: linkForm.utilisateur,
        trajet_id: linkForm.trajet
      });
      alert("✅ Relation utilisateur → trajet ajoutée avec succès !");
      setLinkForm({ utilisateur: "", trajet: "" });
      fetchRelations();
    } catch (err) {
      alert(err.response?.data?.detail || err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrajetInputChange = (field, value) => {
    setTrajetForm(prev => ({
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

  const getTrajetTypeIcon = (type) => {
    const icons = {
      'TrajetUrgent': '🚨',
      'TrajetOptimal': '✅',
      'TrajetCourt': '📏',
      'TrajetLong': '🛣️',
      'Trajet': '🔄',
      'default': '🗺️'
    };
    return icons[type] || icons.default;
  };

  const getTrajetTypeColor = (type) => {
    const colors = {
      'TrajetUrgent': '#dc2626',
      'TrajetOptimal': '#059669',
      'TrajetCourt': '#3b82f6',
      'TrajetLong': '#f59e0b',
      'Trajet': '#6b7280',
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
              <h1 style={styles.title}>🛣️ Gestion des Trajets</h1>
              <p style={styles.subtitle}>
                Gérez les trajets et leurs relations avec les utilisateurs
              </p>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{trajets.length}</span>
                <span style={styles.statLabel}>Trajets</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{relations.length}</span>
                <span style={styles.statLabel}>Relations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire ajout trajet */}
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>➕ Ajouter un nouveau trajet</h3>
            <div style={styles.formIndicator}></div>
          </div>
          <form onSubmit={addTrajet}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  ID du trajet
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: trajet_001"
                  value={trajetForm.id}
                  onChange={(e) => handleTrajetInputChange("id", e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Distance (km)
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="ex: 15.5"
                  value={trajetForm.distance}
                  onChange={(e) => handleTrajetInputChange("distance", e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Durée (minutes)
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  placeholder="ex: 30"
                  value={trajetForm.duree}
                  onChange={(e) => handleTrajetInputChange("duree", e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Heure de départ
                </label>
                <input
                  type="time"
                  value={trajetForm.heureDepart}
                  onChange={(e) => handleTrajetInputChange("heureDepart", e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Heure d'arrivée
                </label>
                <input
                  type="time"
                  value={trajetForm.heureArrivee}
                  onChange={(e) => handleTrajetInputChange("heureArrivee", e.target.value)}
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
                    <span style={styles.buttonIcon}>🛣️</span>
                    <span>Ajouter le trajet</span>
                  </div>
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => setTrajetForm({ 
                  id: "", 
                  duree: "", 
                  distance: "",
                  heureDepart: "",
                  heureArrivee: ""
                })}
                style={styles.secondaryButton}
              >
                🔄 Réinitialiser
              </button>
            </div>
          </form>
        </div>

        {/* Formulaire lien utilisateur → trajet */}
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>🔗 Associer un utilisateur à un trajet</h3>
            <div style={styles.formIndicator}></div>
          </div>
          <form onSubmit={addRelation}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Utilisateur
                  <span style={styles.required}>*</span>
                </label>
                <select
                  value={linkForm.utilisateur}
                  onChange={(e) => handleLinkInputChange("utilisateur", e.target.value)}
                  style={styles.select}
                  required
                >
                  <option value="">Sélectionnez un utilisateur</option>
                  {personnes.map((personne) => (
                    <option key={personne.id} value={personne.id}>
                      {personne.prenom} {personne.nom} ({personne.type})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Trajet
                  <span style={styles.required}>*</span>
                </label>
                <select
                  value={linkForm.trajet}
                  onChange={(e) => handleLinkInputChange("trajet", e.target.value)}
                  style={styles.select}
                  required
                >
                  <option value="">Sélectionnez un trajet</option>
                  {trajets.map((trajet) => (
                    <option key={trajet.id} value={trajet.id}>
                      {trajet.id} ({trajet.type})
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
                    <span>Associer l'utilisateur</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Liste des trajets */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📋 Tous les trajets ({trajets.length})</h3>
            <button 
              onClick={fetchTrajets}
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
                <p style={styles.loadingText}>Chargement des trajets...</p>
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
                      {trajets.map((trajet) => (
                        <tr 
                          key={trajet.id} 
                          style={styles.tableRow}
                        >
                          <td style={styles.tableCell}>
                            <span style={styles.trajetId}>{trajet.id}</span>
                          </td>
                          <td style={styles.tableCell}>
                            <span 
                              style={{
                                ...styles.typeBadge,
                                backgroundColor: getTrajetTypeColor(trajet.type)
                              }}
                            >
                              {getTrajetTypeIcon(trajet.type)} {trajet.type}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.distance}>
                              {trajet.distance ? `${trajet.distance} km` : 'N/A'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.duree}>
                              {trajet.duree ? `${trajet.duree} min` : 'N/A'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            {trajet.personne ? (
                              <span style={styles.userBadge}>
                                👤 {trajet.personne}
                              </span>
                            ) : (
                              <span style={styles.noUser}>Non assigné</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {trajets.length === 0 && (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🛣️</div>
                    <div style={styles.emptyText}>Aucun trajet trouvé</div>
                    <div style={styles.emptySubtext}>
                      Ajoutez des trajets pour commencer
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Liste des relations utilisateur → trajet */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>🔗 Relations Utilisateur → Trajet ({relations.length})</h3>
            <button 
              onClick={fetchRelations}
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
                        <th style={styles.tableHead}>Utilisateur</th>
                        <th style={styles.tableHead}>Trajet</th>
                        <th style={styles.tableHead}>Type de trajet</th>
                        <th style={styles.tableHead}>Distance</th>
                        <th style={styles.tableHead}>Durée</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relations.map((relation, idx) => (
                        <tr 
                          key={idx} 
                          style={styles.tableRow}
                        >
                          <td style={styles.tableCell}>
                            <span style={styles.userBadge}>
                              👤 {relation.utilisateur}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.trajetBadge}>
                              🛣️ {relation.trajet}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span 
                              style={{
                                ...styles.typeBadge,
                                backgroundColor: getTrajetTypeColor(relation.typeTrajet)
                              }}
                            >
                              {getTrajetTypeIcon(relation.typeTrajet)} {relation.typeTrajet}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.distance}>
                              {relation.distance ? `${relation.distance} km` : 'N/A'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.duree}>
                              {relation.duree ? `${relation.duree} min` : 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {relations.length === 0 && (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🔗</div>
                    <div style={styles.emptyText}>Aucune relation trouvée</div>
                    <div style={styles.emptySubtext}>
                      Associez des utilisateurs à des trajets pour commencer
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
    color: '#3b82f6'
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
  trajetId: {
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
  duree: {
    fontWeight: '600',
    color: '#3b82f6'
  },
  userBadge: {
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
  trajetBadge: {
    backgroundColor: '#f0fdf4',
    color: '#059669',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  noUser: {
    color: '#9ca3af',
    fontStyle: 'italic',
    fontSize: '0.875rem'
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

  .table-row:hover {
    background-color: #f0f9ff;
    transform: translateX(4px);
  }
`;

// Injection des styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = mediaQueries;
  document.head.appendChild(styleSheet);
}