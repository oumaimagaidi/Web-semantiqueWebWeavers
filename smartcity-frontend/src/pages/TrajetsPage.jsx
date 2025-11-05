import { useEffect, useState } from "react";
import axios from "axios";

export default function TrajetsPage() {
  const [trajets, setTrajets] = useState([]);
  const [relations, setRelations] = useState([]);
  const [personnes, setPersonnes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTrajetForm, setShowTrajetForm] = useState(false);
  const [showRelationForm, setShowRelationForm] = useState(false);
  const [currentPageTrajets, setCurrentPageTrajets] = useState(1);
  const [currentPageRelations, setCurrentPageRelations] = useState(1);
  const [itemsPerPage] = useState(5);
  const [trajetForm, setTrajetForm] = useState({ 
    id: "", 
    duree: "", 
    distance: "",
    heureDepart: "",
    heureArrivee: ""
  });
  const [linkForm, setLinkForm] = useState({ utilisateur: "", trajet: "" });
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
      setTrajetForm({ 
        id: "", 
        duree: "", 
        distance: "",
        heureDepart: "",
        heureArrivee: ""
      });
      setShowTrajetForm(false);
      fetchTrajets();
    } catch (err) {
      console.error("Erreur lors de l'ajout du trajet:", err);
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
      setLinkForm({ utilisateur: "", trajet: "" });
      setShowRelationForm(false);
      fetchRelations();
    } catch (err) {
      console.error("Erreur lors de l'ajout de la relation:", err);
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

  // Calculs pour la pagination des trajets
  const indexOfLastTrajet = currentPageTrajets * itemsPerPage;
  const indexOfFirstTrajet = indexOfLastTrajet - itemsPerPage;
  const currentTrajets = trajets.slice(indexOfFirstTrajet, indexOfLastTrajet);
  const totalPagesTrajets = Math.ceil(trajets.length / itemsPerPage);

  // Calculs pour la pagination des relations
  const indexOfLastRelation = currentPageRelations * itemsPerPage;
  const indexOfFirstRelation = indexOfLastRelation - itemsPerPage;
  const currentRelations = relations.slice(indexOfFirstRelation, indexOfLastRelation);
  const totalPagesRelations = Math.ceil(relations.length / itemsPerPage);

  const paginateTrajets = (pageNumber) => setCurrentPageTrajets(pageNumber);
  const paginateRelations = (pageNumber) => setCurrentPageRelations(pageNumber);

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
      'TrajetUrgent': '#ff00ff',
      'TrajetOptimal': '#00ff88',
      'TrajetCourt': '#00ffff',
      'TrajetLong': '#ffaa00',
      'Trajet': '#8884d8',
      'default': '#88ffff'
    };
    return colors[type] || colors.default;
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
                <span style={styles.titleIcon}>🛣️</span>
                SYSTÈME DE GESTION DES TRAJETS
              </h1>
              <p style={styles.subtitle}>
                SURVEILLANCE ET OPTIMISATION DES CIRCUITS EN TEMPS RÉEL
              </p>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>{trajets.length}</span>
                <span style={styles.statLabel}>TRAJETS</span>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>{relations.length}</span>
                <span style={styles.statLabel}>RELATIONS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons pour afficher les formulaires */}
        <div style={styles.buttonsContainer}>
          <button 
            onClick={() => setShowTrajetForm(!showTrajetForm)}
            style={styles.addButton}
          >
            <span style={styles.buttonIcon}>
              {showTrajetForm ? '✖️' : '➕'}
            </span>
            <span>
              {showTrajetForm ? 'MASQUER LE FORMULAIRE' : 'AJOUTER UN TRAJET'}
            </span>
          </button>

          <button 
            onClick={() => setShowRelationForm(!showRelationForm)}
            style={styles.addButton}
          >
            <span style={styles.buttonIcon}>
              {showRelationForm ? '✖️' : '🔗'}
            </span>
            <span>
              {showRelationForm ? 'MASQUER L\'ASSOCIATION' : 'ASSOCIER UTILISATEUR'}
            </span>
          </button>
        </div>

        {/* Formulaire ajout trajet (conditionnel) */}
        {showTrajetForm && (
          <div style={styles.formCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>➕ INITIER UN NOUVEAU TRAJET</h3>
              <div style={styles.formIndicator}></div>
            </div>
            <form onSubmit={addTrajet}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    IDENTIFIANT DU TRAJET
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="ex: trajet_001"
                      value={trajetForm.id}
                      onChange={(e) => handleTrajetInputChange("id", e.target.value)}
                      style={styles.input}
                      required
                    />
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    DISTANCE (KM)
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="ex: 15.5"
                      value={trajetForm.distance}
                      onChange={(e) => handleTrajetInputChange("distance", e.target.value)}
                      style={styles.input}
                      required
                    />
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    DURÉE (MINUTES)
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="number"
                      step="1"
                      placeholder="ex: 30"
                      value={trajetForm.duree}
                      onChange={(e) => handleTrajetInputChange("duree", e.target.value)}
                      style={styles.input}
                      required
                    />
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    HEURE DE DÉPART
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="time"
                      value={trajetForm.heureDepart}
                      onChange={(e) => handleTrajetInputChange("heureDepart", e.target.value)}
                      style={styles.input}
                    />
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    HEURE D'ARRIVÉE
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="time"
                      value={trajetForm.heureArrivee}
                      onChange={(e) => handleTrajetInputChange("heureArrivee", e.target.value)}
                      style={styles.input}
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
                      <span style={styles.buttonIcon}>🛣️</span>
                      <span>ACTIVER LE TRAJET</span>
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
                  <span style={styles.buttonIcon}>🔄</span>
                  <span>RÉINITIALISER</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setShowTrajetForm(false)}
                  style={styles.cancelButton}
                >
                  <span style={styles.buttonIcon}>❌</span>
                  <span>ANNULER</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Formulaire lien utilisateur → trajet (conditionnel) */}
        {showRelationForm && (
          <div style={styles.formCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>🔗 ASSOCIER UN UTILISATEUR À UN TRAJET</h3>
              <div style={styles.formIndicator}></div>
            </div>
            <form onSubmit={addRelation}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    UTILISATEUR
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <select
                      value={linkForm.utilisateur}
                      onChange={(e) => handleLinkInputChange("utilisateur", e.target.value)}
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
                    TRAJET
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <select
                      value={linkForm.trajet}
                      onChange={(e) => handleLinkInputChange("trajet", e.target.value)}
                      style={styles.select}
                      required
                    >
                      <option value="">SÉLECTIONNEZ UN TRAJET</option>
                      {trajets.map((trajet) => (
                        <option key={trajet.id} value={trajet.id}>
                          {trajet.id} ({trajet.type})
                        </option>
                      ))}
                    </select>
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
                      <span style={styles.buttonIcon}>🔗</span>
                      <span>ACTIVER L'ASSOCIATION</span>
                    </div>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => setShowRelationForm(false)}
                  style={styles.cancelButton}
                >
                  <span style={styles.buttonIcon}>❌</span>
                  <span>ANNULER</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des trajets */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📋 RÉPERTOIRE DES TRAJETS ({trajets.length})</h3>
            <div style={styles.sectionActions}>
              <button 
                onClick={fetchTrajets}
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
                <p style={styles.loadingText}>CHARGEMENT DES TRAJETS...</p>
              </div>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHead}>ID</th>
                        <th style={styles.tableHead}>TYPE</th>
                        <th style={styles.tableHead}>DISTANCE</th>
                        <th style={styles.tableHead}>DURÉE</th>
                        <th style={styles.tableHead}>UTILISATEUR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTrajets.map((trajet) => (
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
                                backgroundColor: getTrajetTypeColor(trajet.type),
                                boxShadow: `0 0 15px ${getTrajetTypeColor(trajet.type)}`
                              }}
                            >
                              {getTrajetTypeIcon(trajet.type)} {trajet.type.replace('Trajet', '').toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.distance}>
                              {trajet.distance ? `${trajet.distance} KM` : 'N/A'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.duree}>
                              {trajet.duree ? `${trajet.duree} MIN` : 'N/A'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            {trajet.personne ? (
                              <span style={styles.userBadge}>
                                👤 {trajet.personne.toUpperCase()}
                              </span>
                            ) : (
                              <span style={styles.noUser}>NON ASSIGNÉ</span>
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
                    <div style={styles.emptyText}>AUCUN TRAJET TROUVÉ</div>
                    <div style={styles.emptySubtext}>
                      AJOUTEZ DES TRAJETS POUR COMMENCER
                    </div>
                  </div>
                )}

                {/* Pagination des trajets */}
                {trajets.length > 0 && (
                  <div style={styles.pagination}>
                    <button 
                      onClick={() => paginateTrajets(currentPageTrajets - 1)}
                      disabled={currentPageTrajets === 1}
                      style={{
                        ...styles.paginationButton,
                        ...(currentPageTrajets === 1 && styles.paginationButtonDisabled)
                      }}
                    >
                      ‹ PRÉCÉDENT
                    </button>
                    
                    <div style={styles.paginationInfo}>
                      Page {currentPageTrajets} sur {totalPagesTrajets}
                    </div>

                    <button 
                      onClick={() => paginateTrajets(currentPageTrajets + 1)}
                      disabled={currentPageTrajets === totalPagesTrajets}
                      style={{
                        ...styles.paginationButton,
                        ...(currentPageTrajets === totalPagesTrajets && styles.paginationButtonDisabled)
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

        {/* Liste des relations utilisateur → trajet */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>🔗 RELATIONS UTILISATEUR → TRAJET ({relations.length})</h3>
            <div style={styles.sectionActions}>
              <button 
                onClick={fetchRelations}
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
                <p style={styles.loadingText}>CHARGEMENT DES RELATIONS...</p>
              </div>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHead}>UTILISATEUR</th>
                        <th style={styles.tableHead}>TRAJET</th>
                        <th style={styles.tableHead}>TYPE DE TRAJET</th>
                        <th style={styles.tableHead}>DISTANCE</th>
                        <th style={styles.tableHead}>DURÉE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRelations.map((relation, idx) => (
                        <tr 
                          key={idx} 
                          style={styles.tableRow}
                        >
                          <td style={styles.tableCell}>
                            <span style={styles.userBadge}>
                              👤 {relation.utilisateur.toUpperCase()}
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
                                backgroundColor: getTrajetTypeColor(relation.typeTrajet),
                                boxShadow: `0 0 15px ${getTrajetTypeColor(relation.typeTrajet)}`
                              }}
                            >
                              {getTrajetTypeIcon(relation.typeTrajet)} {relation.typeTrajet.replace('Trajet', '').toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.distance}>
                              {relation.distance ? `${relation.distance} KM` : 'N/A'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.duree}>
                              {relation.duree ? `${relation.duree} MIN` : 'N/A'}
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
                    <div style={styles.emptyText}>AUCUNE RELATION TROUVÉE</div>
                    <div style={styles.emptySubtext}>
                      ASSOCIEZ DES UTILISATEURS À DES TRAJETS POUR COMMENCER
                    </div>
                  </div>
                )}

                {/* Pagination des relations */}
                {relations.length > 0 && (
                  <div style={styles.pagination}>
                    <button 
                      onClick={() => paginateRelations(currentPageRelations - 1)}
                      disabled={currentPageRelations === 1}
                      style={{
                        ...styles.paginationButton,
                        ...(currentPageRelations === 1 && styles.paginationButtonDisabled)
                      }}
                    >
                      ‹ PRÉCÉDENT
                    </button>
                    
                    <div style={styles.paginationInfo}>
                      Page {currentPageRelations} sur {totalPagesRelations}
                    </div>

                    <button 
                      onClick={() => paginateRelations(currentPageRelations + 1)}
                      disabled={currentPageRelations === totalPagesRelations}
                      style={{
                        ...styles.paginationButton,
                        ...(currentPageRelations === totalPagesRelations && styles.paginationButtonDisabled)
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
    background: 'linear-gradient(135deg, #ffffff, #00ffff)',
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
  buttonsContainer: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap'
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
  trajetId: {
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
  distance: {
    fontWeight: '600',
    color: '#00ff88',
    fontSize: '0.875rem'
  },
  duree: {
    fontWeight: '600',
    color: '#00ffff',
    fontSize: '0.875rem'
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
  trajetBadge: {
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
  noUser: {
    color: '#ff6b6b',
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
    
    .buttons-container {
      flex-direction: column;
      align-items: center;
    }
    
    .add-button {
      width: 100%;
      max-width: 400px;
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