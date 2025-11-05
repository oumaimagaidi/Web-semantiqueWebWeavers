import { useEffect, useState } from "react";
import axios from "axios";

export default function AvisPage() {
  const [avisList, setAvisList] = useState([]);
  const [personnes, setPersonnes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [form, setForm] = useState({ 
    id: "", 
    commentaire: "", 
    note: 5,
    type_avis: "AvisPositif",
    utilisateur_id: "" 
  });
  const [message, setMessage] = useState(null);
  const [filterUser, setFilterUser] = useState("");
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
        setMessage("❌ FORMAT DE DONNÉES INVALIDE REÇU DU SERVEUR");
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
        let utilisateur = 'UTILISATEUR INCONNU';
        if (avis.utilisateur) {
          if (typeof avis.utilisateur === 'object') {
            utilisateur = avis.utilisateur.nom || avis.utilisateur.id || 'UTILISATEUR';
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
      setMessage(`✅ ${transformedAvis.length} AVIS CHARGÉS AVEC SUCCÈS`);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des avis:", err);
      setMessage("❌ IMPOSSIBLE DE CHARGER LES AVIS. VÉRIFIEZ QUE LE SERVEUR EST DÉMARRÉ.");
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

      setMessage("✅ AVIS CRÉÉ ET ASSOCIÉ AVEC SUCCÈS");
      setForm({ 
        id: "", 
        commentaire: "", 
        note: 5,
        type_avis: "AvisPositif",
        utilisateur_id: "" 
      });
      setShowForm(false);
      fetchAvis();
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'avis:", err);
      setMessage(err.response?.data?.detail || err.response?.data?.error || "❌ ERREUR LORS DE L'AJOUT DE L'AVIS.");
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
      setMessage(`📋 ${filteredAvis.length} AVIS TROUVÉS POUR "${filterUser}"`);
    } catch (err) {
      console.error("Erreur lors du filtrage:", err);
      setMessage("❌ ERREUR LORS DU FILTRAGE");
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
    setMessage("🔄 LISTE COMPLÈTE DES AVIS");
  };

  // Calculs pour la pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAvis = avisList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(avisList.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
      'AvisPositif': '#00ff88',
      'AvisNegatif': '#ff00ff',
      'Avis': '#00ffff',
      'default': '#88ffff'
    };
    return colors[type] || colors.default;
  };

  const getNoteColor = (note) => {
    if (note >= 4) return '#00ff88';
    if (note >= 3) return '#ffaa00';
    return '#ff00ff';
  };

  // Rendu du tableau des avis - VERSION CORRIGÉE
  const renderAvisTable = () => {
    if (loading) {
      return (
        <div style={styles.loadingState}>
          <div style={styles.quantumSpinner}></div>
          <p style={styles.loadingText}>CHARGEMENT DES AVIS...</p>
        </div>
      );
    }

    if (avisList.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💬</div>
          <div style={styles.emptyText}>AUCUN AVIS TROUVÉ</div>
          <div style={styles.emptySubtext}>
            {filterUser ? `AUCUN AVIS POUR "${filterUser}"` : 'AJOUTEZ UN PREMIER AVIS POUR COMMENCER'}
          </div>
          <button 
            onClick={fetchAvis}
            style={styles.primaryButton}
          >
            <span style={styles.buttonIcon}>🔄</span>
            <span>RÉESSAYER</span>
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
              <th style={styles.tableHead}>TYPE</th>
              <th style={styles.tableHead}>UTILISATEUR</th>
              <th style={styles.tableHead}>NOTE</th>
              <th style={styles.tableHead}>COMMENTAIRE</th>
            </tr>
          </thead>
          <tbody>
            {currentAvis.map((avis, index) => (
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
                      backgroundColor: getAvisTypeColor(avis.type),
                      boxShadow: `0 0 15px ${getAvisTypeColor(avis.type)}`
                    }}
                  >
                    {getAvisTypeIcon(avis.type)} {avis.type.toUpperCase()}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <span style={styles.userBadge}>
                    👤 {avis.utilisateur.toUpperCase()}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <span 
                    style={{
                      ...styles.noteBadge,
                      backgroundColor: getNoteColor(avis.note),
                      boxShadow: `0 0 15px ${getNoteColor(avis.note)}`
                    }}
                  >
                    {'⭐'.repeat(avis.note)} ({avis.note}/5)
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <div style={styles.commentaire}>
                    {avis.commentaire || avis.description || 'AUCUN COMMENTAIRE'}
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
                <span style={styles.titleIcon}>💬</span>
                SYSTÈME DE GESTION DES AVIS
              </h1>
              <p style={styles.subtitle}>
                SURVEILLANCE ET ANALYSE DES RETOURS UTILISATEURS EN TEMPS RÉEL
              </p>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>{avisList.length}</span>
                <span style={styles.statLabel}>AVIS TOTAL</span>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>
                  {avisList.filter(a => a.type === 'AvisPositif').length}
                </span>
                <span style={styles.statLabel}>POSITIFS</span>
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
              {showForm ? 'MASQUER LE FORMULAIRE' : 'AJOUTER UN AVIS'}
            </span>
          </button>
        </div>

        {/* Message système */}
        {message && (
          <div 
            style={{
              ...styles.message,
              ...(message.startsWith("✅") ? styles.successMessage : 
                   message.startsWith("❌") ? styles.errorMessage : styles.infoMessage)
            }}
          >
            <div style={styles.messageContent}>
              <div style={styles.messageIcon}>
                {message.startsWith("✅") ? "⚡" : "⚠️"}
              </div>
              <div style={styles.messageText}>
                <div style={styles.messageTitle}>
                  {message.startsWith("✅") ? "SYNCHRONISATION RÉUSSIE" : "ALERTE SYSTÈME"}
                </div>
                <div>{message.replace("✅ ", "").replace("❌ ", "")}</div>
              </div>
            </div>
            <div style={styles.messagePulse}></div>
          </div>
        )}

        {/* Formulaire d'ajout (conditionnel) */}
        {showForm && (
          <div style={styles.formCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>➕ INITIER UN NOUVEL AVIS</h3>
              <div style={styles.formIndicator}></div>
            </div>
            <form onSubmit={addAvis}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    IDENTIFIANT AVIS
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="ex: AVIS_001"
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
                    UTILISATEUR
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <select
                      value={form.utilisateur_id}
                      onChange={(e) => handleInputChange("utilisateur_id", e.target.value)}
                      style={styles.select}
                      required
                    >
                      <option value="">SÉLECTIONNEZ UN UTILISATEUR</option>
                      {personnes.map((personne) => (
                        <option key={personne.id} value={personne.id}>
                          {personne.prenom} {personne.nom} ({personne.type})
                        </option>
                      ))}
                    </select>
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    TYPE D'AVIS
                  </label>
                  <div style={styles.inputContainer}>
                    <select
                      value={form.type_avis}
                      onChange={(e) => handleInputChange("type_avis", e.target.value)}
                      style={styles.select}
                    >
                      <option value="AvisPositif">👍 AVIS POSITIF</option>
                      <option value="AvisNegatif">👎 AVIS NÉGATIF</option>
                      <option value="Avis">💬 AVIS NEUTRE</option>
                    </select>
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    NOTE (1-5)
                  </label>
                  <div style={styles.inputContainer}>
                    <select
                      value={form.note}
                      onChange={(e) => handleInputChange("note", parseInt(e.target.value))}
                      style={{
                        ...styles.select,
                        borderColor: getNoteColor(form.note)
                      }}
                    >
                      <option value={1}>⭐ 1 - TRÈS MAUVAIS</option>
                      <option value={2}>⭐⭐ 2 - MAUVAIS</option>
                      <option value={3}>⭐⭐⭐ 3 - MOYEN</option>
                      <option value={4}>⭐⭐⭐⭐ 4 - BON</option>
                      <option value={5}>⭐⭐⭐⭐⭐ 5 - EXCELLENT</option>
                    </select>
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>

                <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
                  <label style={styles.label}>
                    COMMENTAIRE
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <textarea
                      placeholder="DÉCRIVEZ VOTRE EXPÉRIENCE..."
                      value={form.commentaire}
                      onChange={(e) => handleInputChange("commentaire", e.target.value)}
                      style={styles.textarea}
                      rows={3}
                      required
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
                      <span>ACTIVER L'AVIS</span>
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

        {/* Filtre par utilisateur */}
        <div style={styles.filterCard}>
          <div style={styles.cardGlow}></div>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>🔍 FILTRER PAR UTILISATEUR</h3>
            <div style={styles.formIndicator}></div>
          </div>
          <form onSubmit={fetchAvisByUser} style={styles.filterForm}>
            <div style={styles.filterInputGroup}>
              <div style={styles.inputContainer}>
                <input
                  type="text"
                  placeholder="ENTREZ LE NOM, ID OU COMMENTAIRE À FILTRER"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  style={styles.filterInput}
                />
                <div style={styles.inputGlow}></div>
              </div>
              <button
                type="submit"
                style={styles.filterButton}
                disabled={loading}
              >
                {loading ? (
                  <div style={styles.buttonContent}>
                    <div style={styles.smallSpinner}></div>
                    <span>RECHERCHE...</span>
                  </div>
                ) : (
                  <div style={styles.buttonContent}>
                    <span style={styles.buttonIcon}>🔍</span>
                    <span>RECHERCHER</span>
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={handleResetFilter}
                style={styles.resetButton}
                disabled={loading}
              >
                <span style={styles.buttonIcon}>↻</span>
                <span>TOUT AFFICHER</span>
              </button>
            </div>
          </form>
        </div>

        {/* Tableau des avis */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📋 RÉPERTOIRE DES AVIS ({avisList.length})</h3>
            <div style={styles.sectionActions}>
              <button 
                onClick={fetchAvis}
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
              <button 
                onClick={() => console.log('Données avis:', avisList)}
                style={styles.debugButton}
              >
                <span style={styles.buttonIcon}>🐛</span>
                <span>DEBUG</span>
              </button>
            </div>
          </div>

          <div style={styles.tableCard}>
            <div style={styles.cardGlow}></div>
            {renderAvisTable()}

            {/* Pagination */}
            {avisList.length > 0 && (
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
    gap: '1rem'
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
  message: {
    marginBottom: '2rem',
    borderRadius: '1rem',
    fontWeight: '500',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)'
  },
  successMessage: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    color: '#00ff88',
    border: '1px solid rgba(0, 255, 0, 0.3)'
  },
  errorMessage: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    color: '#ff6b6b',
    border: '1px solid rgba(255, 0, 0, 0.3)'
  },
  infoMessage: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    color: '#88ffff',
    border: '1px solid rgba(0, 255, 255, 0.3)'
  },
  messageContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem'
  },
  messageIcon: {
    fontSize: '1.5rem',
    filter: 'drop-shadow(0 0 8px currentColor)'
  },
  messageText: {
    flex: 1
  },
  messageTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    letterSpacing: '1px',
    marginBottom: '0.25rem'
  },
  messagePulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    animation: 'dataFlow 3s linear infinite'
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
  filterCard: {
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
    border: '1px solid rgba(0, 255, 255, 0.3)',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#ffffff',
    fontFamily: "'Rajdhani', sans-serif"
  },
  filterButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    color: '#00ffff',
    fontWeight: '600',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    letterSpacing: '0.5px'
  },
  resetButton: {
    backgroundColor: 'rgba(255, 0, 255, 0.2)',
    color: '#ff00ff',
    fontWeight: '600',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255, 0, 255, 0.3)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    letterSpacing: '0.5px'
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
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#00ffff',
    letterSpacing: '1px'
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
  debugButton: {
    backgroundColor: 'rgba(255, 255, 0, 0.1)',
    color: '#ffaa00',
    fontWeight: '600',
    padding: '0.75rem 1.25rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255, 255, 0, 0.3)',
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
  avisId: {
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
    letterSpacing: '0.5px'
  },
  userBadge: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    color: '#88ffff',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    letterSpacing: '0.5px'
  },
  noteBadge: {
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    letterSpacing: '0.5px'
  },
  commentaire: {
    maxWidth: '300px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#88ffff'
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

  .cancel-button:hover {
    background-color: rgba(255, 68, 68, 0.1);
    border-color: rgba(255, 68, 68, 0.5);
    transform: translateY(-1px);
  }

  .filter-button:hover:not(:disabled) {
    background-color: rgba(0, 255, 255, 0.3);
    border-color: rgba(0, 255, 255, 0.6);
    transform: translateY(-1px);
  }

  .reset-button:hover:not(:disabled) {
    background-color: rgba(255, 0, 255, 0.3);
    border-color: rgba(255, 0, 255, 0.6);
    transform: translateY(-1px);
  }

  .refresh-button:hover:not(:disabled) {
    background-color: rgba(0, 255, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  .debug-button:hover {
    background-color: rgba(255, 255, 0, 0.2);
    border-color: rgba(255, 255, 0, 0.5);
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