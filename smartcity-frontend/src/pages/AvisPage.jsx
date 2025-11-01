import { useEffect, useState } from "react";
import axios from "axios";

export default function AvisPage() {
  const [avisList, setAvisList] = useState([]);
  const [personnes, setPersonnes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    id: "", 
    commentaire: "", 
    note: 5,
    type_avis: "AvisPositif",
    utilisateur_id: "" 
  });
  const [message, setMessage] = useState(null);
  const [filterUser, setFilterUser] = useState("");

  const BASE_URL = "http://localhost:8000";

  // Charger les avis et personnes au démarrage
  useEffect(() => {
    fetchAvis();
    fetchPersonnes();
  }, []);

  // Récupère tous les avis - VERSION CORRIGÉE
  const fetchAvis = async () => {
    try {
      setLoading(true);
      console.log("🔄 Chargement des avis depuis le backend...");
      
      const res = await axios.get(`${BASE_URL}/avis/`);
      console.log("📦 Données brutes reçues:", res.data);
      
      if (!res.data || !Array.isArray(res.data)) {
        console.error("❌ Format de données invalide");
        setAvisList([]);
        setMessage("❌ Format de données invalide reçu du serveur");
        return;
      }

      // Transformation robuste des données
      const transformedAvis = res.data.map(avis => {
        // Extraire l'ID de l'URI
        let avisId = avis.id;
        if (avisId && avisId.includes('#')) {
          avisId = avisId.split('#')[1];
        } else if (avisId && avisId.includes('/')) {
          avisId = avisId.split('/').pop();
        }

        // Gérer l'utilisateur
        let utilisateur = 'Utilisateur inconnu';
        if (avis.utilisateur) {
          if (typeof avis.utilisateur === 'object') {
            utilisateur = avis.utilisateur.nom || avis.utilisateur.id || 'Utilisateur';
          } else if (typeof avis.utilisateur === 'string') {
            // Extraire l'ID de l'URI utilisateur
            utilisateur = avis.utilisateur.includes('#') 
              ? avis.utilisateur.split('#')[1] 
              : avis.utilisateur.includes('/')
              ? avis.utilisateur.split('/').pop()
              : avis.utilisateur;
          }
        }

        // Gérer le type
        let typeAvis = avis.type || 'Avis';
        if (typeAvis && typeAvis.includes('#')) {
          typeAvis = typeAvis.split('#')[1];
        }

        return {
          id: avisId || avis.id,
          type: typeAvis,
          commentaire: avis.commentaire || '',
          note: parseInt(avis.note) || 0,
          utilisateur: utilisateur,
          description: avis.commentaire || '',
          avis: avisId || avis.id
        };
      });

      console.log("✅ Avis transformés:", transformedAvis);
      setAvisList(transformedAvis);
      setMessage(`✅ ${transformedAvis.length} avis chargés avec succès`);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des avis:", err);
      setMessage("❌ Impossible de charger les avis. Vérifiez que le serveur est démarré.");
      setAvisList([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupère les personnes pour la sélection
  const fetchPersonnes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/personnes/`);
      console.log("👥 Personnes chargées:", res.data);
      setPersonnes(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des personnes:", err);
      setPersonnes([]);
    }
  };

  // Ajouter un avis
  const addAvis = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      // D'abord créer l'avis
      const avisRes = await axios.post(`${BASE_URL}/add_avis/`, {
        id: form.id,
        commentaire: form.commentaire,
        note: parseInt(form.note),
        type_avis: form.type_avis
      });

      // Ensuite associer l'avis à l'utilisateur
      if (form.utilisateur_id) {
        await axios.post(`${BASE_URL}/personne/donne_avis/`, {
          personne_id: form.utilisateur_id,
          avis_id: form.id
        });
      }

      setMessage("✅ Avis créé et associé avec succès !");
      setForm({ 
        id: "", 
        commentaire: "", 
        note: 5,
        type_avis: "AvisPositif",
        utilisateur_id: "" 
      });
      fetchAvis();
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'avis:", err);
      setMessage(err.response?.data?.detail || err.response?.data?.error || "❌ Erreur lors de l'ajout de l'avis.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les avis par utilisateur - VERSION CORRIGÉE
  const fetchAvisByUser = async (e) => {
    e.preventDefault();
    if (!filterUser.trim()) {
      fetchAvis();
      return;
    }

    try {
      setLoading(true);
      // Filtrer localement d'abord
      const filteredAvis = avisList.filter(avis => 
        avis.utilisateur.toLowerCase().includes(filterUser.toLowerCase()) ||
        avis.commentaire.toLowerCase().includes(filterUser.toLowerCase()) ||
        avis.id.toLowerCase().includes(filterUser.toLowerCase())
      );
      
      setAvisList(filteredAvis);
      setMessage(`📋 ${filteredAvis.length} avis trouvés pour "${filterUser}"`);
    } catch (err) {
      console.error("Erreur lors du filtrage:", err);
      setMessage("❌ Erreur lors du filtrage");
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

  const handleResetFilter = () => {
    setFilterUser("");
    fetchAvis();
    setMessage("🔄 Liste complète des avis");
  };

  const getAvisTypeIcon = (type) => {
    const icons = {
      'AvisPositif': '👍',
      'AvisNegatif': '👎',
      'Avis': '💬',
      'default': '📝'
    };
    return icons[type] || icons.default;
  };

  const getAvisTypeColor = (type) => {
    const colors = {
      'AvisPositif': '#10b981',
      'AvisNegatif': '#ef4444',
      'Avis': '#6b7280',
      'default': '#6b7280'
    };
    return colors[type] || colors.default;
  };

  const getNoteColor = (note) => {
    if (note >= 4) return '#10b981';
    if (note >= 3) return '#f59e0b';
    return '#ef4444';
  };

  // Rendu du tableau des avis - VERSION CORRIGÉE
  const renderAvisTable = () => {
    if (loading) {
      return (
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Chargement des avis...</p>
        </div>
      );
    }

    if (avisList.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💬</div>
          <div style={styles.emptyText}>Aucun avis trouvé</div>
          <div style={styles.emptySubtext}>
            {filterUser ? `Aucun avis pour "${filterUser}"` : 'Ajoutez un premier avis pour commencer'}
          </div>
          <button 
            onClick={fetchAvis}
            style={styles.primaryButton}
          >
            🔄 Réessayer
          </button>
        </div>
      );
    }

    return (
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.tableHead}>ID</th>
              <th style={styles.tableHead}>Type</th>
              <th style={styles.tableHead}>Utilisateur</th>
              <th style={styles.tableHead}>Note</th>
              <th style={styles.tableHead}>Commentaire</th>
            </tr>
          </thead>
          <tbody>
            {avisList.map((avis, index) => (
              <tr key={avis.id || index} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  <span style={styles.avisId}>
                    {avis.id}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <span 
                    style={{
                      ...styles.typeBadge,
                      backgroundColor: getAvisTypeColor(avis.type)
                    }}
                  >
                    {getAvisTypeIcon(avis.type)} {avis.type}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <span style={styles.userBadge}>
                    👤 {avis.utilisateur}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <span 
                    style={{
                      ...styles.noteBadge,
                      backgroundColor: getNoteColor(avis.note)
                    }}
                  >
                    {'⭐'.repeat(avis.note)} ({avis.note}/5)
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <div style={styles.commentaire}>
                    {avis.commentaire || avis.description || 'Aucun commentaire'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* En-tête */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.titleSection}>
              <h1 style={styles.title}>💬 Gestion des Avis</h1>
              <p style={styles.subtitle}>
                Consultez et gérez les retours et évaluations des utilisateurs
              </p>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>{avisList.length}</span>
                <span style={styles.statLabel}>Avis total</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>
                  {avisList.filter(a => a.type === 'AvisPositif').length}
                </span>
                <span style={styles.statLabel}>Positifs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div 
            style={{
              ...styles.message,
              ...(message.startsWith("✅") ? styles.successMessage : 
                   message.startsWith("❌") ? styles.errorMessage : styles.infoMessage)
            }}
          >
            {message}
          </div>
        )}

        {/* Formulaire d'ajout */}
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>➕ Ajouter un nouvel avis</h3>
            <div style={styles.formIndicator}></div>
          </div>
          <form onSubmit={addAvis}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  ID de l'avis
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: avis_001"
                  value={form.id}
                  onChange={(e) => handleInputChange("id", e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Utilisateur
                  <span style={styles.required}>*</span>
                </label>
                <select
                  value={form.utilisateur_id}
                  onChange={(e) => handleInputChange("utilisateur_id", e.target.value)}
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
                  Type d'avis
                </label>
                <select
                  value={form.type_avis}
                  onChange={(e) => handleInputChange("type_avis", e.target.value)}
                  style={styles.select}
                >
                  <option value="AvisPositif">👍 Avis Positif</option>
                  <option value="AvisNegatif">👎 Avis Négatif</option>
                  <option value="Avis">💬 Avis Neutre</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Note (1-5)
                </label>
                <select
                  value={form.note}
                  onChange={(e) => handleInputChange("note", parseInt(e.target.value))}
                  style={{
                    ...styles.select,
                    borderColor: getNoteColor(form.note)
                  }}
                >
                  <option value={1}>⭐ 1 - Très mauvais</option>
                  <option value={2}>⭐⭐ 2 - Mauvais</option>
                  <option value={3}>⭐⭐⭐ 3 - Moyen</option>
                  <option value={4}>⭐⭐⭐⭐ 4 - Bon</option>
                  <option value={5}>⭐⭐⭐⭐⭐ 5 - Excellent</option>
                </select>
              </div>

              <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
                <label style={styles.label}>
                  Commentaire
                  <span style={styles.required}>*</span>
                </label>
                <textarea
                  placeholder="Décrivez votre expérience..."
                  value={form.commentaire}
                  onChange={(e) => handleInputChange("commentaire", e.target.value)}
                  style={styles.textarea}
                  rows={3}
                  required
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
                    <span style={styles.buttonIcon}>💬</span>
                    <span>Ajouter l'avis</span>
                  </div>
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => setForm({ 
                  id: "", 
                  commentaire: "", 
                  note: 5,
                  type_avis: "AvisPositif",
                  utilisateur_id: "" 
                })}
                style={styles.secondaryButton}
              >
                🔄 Réinitialiser
              </button>
            </div>
          </form>
        </div>

        {/* Filtre par utilisateur */}
        <div style={styles.filterCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>🔍 Filtrer par utilisateur</h3>
            <div style={styles.formIndicator}></div>
          </div>
          <form onSubmit={fetchAvisByUser} style={styles.filterForm}>
            <div style={styles.filterInputGroup}>
              <input
                type="text"
                placeholder="Entrez le nom, ID ou commentaire à filtrer"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                style={styles.filterInput}
              />
              <button
                type="submit"
                style={styles.filterButton}
                disabled={loading}
              >
                {loading ? '🔄' : '🔍'} Rechercher
              </button>
              <button
                type="button"
                onClick={handleResetFilter}
                style={styles.resetButton}
                disabled={loading}
              >
                ↻ Tout afficher
              </button>
            </div>
          </form>
        </div>

        {/* Tableau des avis */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📋 Liste des avis ({avisList.length})</h3>
            <div style={styles.sectionActions}>
              <button 
                onClick={fetchAvis}
                style={styles.refreshButton}
                disabled={loading}
              >
                {loading ? '🔄' : '🔄'} Actualiser
              </button>
              <button 
                onClick={() => console.log('Données avis:', avisList)}
                style={styles.debugButton}
              >
                🐛 Debug
              </button>
            </div>
          </div>

          <div style={styles.tableCard}>
            {renderAvisTable()}
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
  infoMessage: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #dbeafe'
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    padding: '2rem',
    marginBottom: '3rem',
    background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)'
  },
  filterCard: {
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
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
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
  filterForm: {
    width: '100%'
  },
  filterInputGroup: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  filterInput: {
    flex: '1',
    padding: '1rem 1.25rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: '#fafafa'
  },
  filterButton: {
    backgroundColor: '#10b981',
    color: 'white',
    fontWeight: '600',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap'
  },
  resetButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    fontWeight: '600',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap'
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
  sectionActions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
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
  debugButton: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
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
  noteBadge: {
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  commentaire: {
    maxWidth: '300px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
      box-shadow: 0 6px 12px -1px rgba(139, 92, 246, 0.4);
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

    .filter-button:hover:not(:disabled) {
      background-color: #059669;
      transform: translateY(-1px);
    }

    .reset-button:hover:not(:disabled) {
      background-color: #4b5563;
      transform: translateY(-1px);
    }

    .refresh-button:hover:not(:disabled) {
      background-color: #e5e7eb;
    }

    .debug-button:hover {
      background-color: #fcd34d;
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
        flex-direction: column;
      }
      
      .primary-button, .secondary-button {
        width: 100%;
        justify-content: center;
      }
      
      .filter-input-group {
        flex-direction: column;
      }
      
      .filter-input, .filter-button, .reset-button {
        width: 100%;
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
      
      .form-card, .filter-card, .table-card {
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