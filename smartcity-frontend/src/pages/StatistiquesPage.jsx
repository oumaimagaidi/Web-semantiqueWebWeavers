import { useState, useEffect } from "react";
import axios from "axios";

export default function StatistiquesPage() {
  const [pollutionForm, setPollutionForm] = useState({ id: "", tauxPollution: "" });
  const [accidentForm, setAccidentForm] = useState({ id: "", nbreDaccident: "" });
  const [observationForm, setObservationForm] = useState({ utilisateur_id: "", statistique_id: "" });
  const [statistiques, setStatistiques] = useState([]);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const [showPollutionForm, setShowPollutionForm] = useState(false);
  const [showAccidentForm, setShowAccidentForm] = useState(false);
  const [showObservationForm, setShowObservationForm] = useState(false);
  const [currentPageStats, setCurrentPageStats] = useState(1);
  const [currentPageObs, setCurrentPageObs] = useState(1);
  const [itemsPerPage] = useState(5);

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

  useEffect(() => {
    fetchStatistiques();
    fetchObservations();
  }, []);

  // --- Fetch toutes les statistiques ---
  const fetchStatistiques = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/statistiques/");
      setStatistiques(res.data);
    } catch (err) {
      console.error("Erreur fetch statistiques:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch toutes les observations ---
  const fetchObservations = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/observations/");
      setObservations(res.data);
    } catch (err) {
      console.error("Erreur fetch observations:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Ajouter statistique pollution ---
  const addPollution = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/add_statistique_pollution/", pollutionForm);
      setPollutionForm({ id: "", tauxPollution: "" });
      setShowPollutionForm(false);
      fetchStatistiques();
    } catch (err) {
      console.error("Erreur ajout pollution:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Ajouter statistique accident ---
  const addAccident = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/add_statistique_accident/", accidentForm);
      setAccidentForm({ id: "", nbreDaccident: "" });
      setShowAccidentForm(false);
      fetchStatistiques();
    } catch (err) {
      console.error("Erreur ajout accident:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Ajouter observation ---
  const addObservation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/add_observation/", observationForm);
      setObservationForm({ utilisateur_id: "", statistique_id: "" });
      setShowObservationForm(false);
      fetchObservations();
    } catch (err) {
      console.error("Erreur ajout observation:", err);
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

  const handleObservationInputChange = (field, value) => {
    setObservationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Logique de pagination pour les statistiques
  const indexOfLastStat = currentPageStats * itemsPerPage;
  const indexOfFirstStat = indexOfLastStat - itemsPerPage;
  const currentStats = statistiques.slice(indexOfFirstStat, indexOfLastStat);
  const totalPagesStats = Math.ceil(statistiques.length / itemsPerPage);

  // Logique de pagination pour les observations
  const indexOfLastObs = currentPageObs * itemsPerPage;
  const indexOfFirstObs = indexOfLastObs - itemsPerPage;
  const currentObs = observations.slice(indexOfFirstObs, indexOfLastObs);
  const totalPagesObs = Math.ceil(observations.length / itemsPerPage);

  // Changer de page pour statistiques
  const paginateStats = (pageNumber) => setCurrentPageStats(pageNumber);
  const goToPreviousPageStats = () => {
    if (currentPageStats > 1) {
      setCurrentPageStats(currentPageStats - 1);
    }
  };
  const goToNextPageStats = () => {
    if (currentPageStats < totalPagesStats) {
      setCurrentPageStats(currentPageStats + 1);
    }
  };

  // Changer de page pour observations
  const paginateObs = (pageNumber) => setCurrentPageObs(pageNumber);
  const goToPreviousPageObs = () => {
    if (currentPageObs > 1) {
      setCurrentPageObs(currentPageObs - 1);
    }
  };
  const goToNextPageObs = () => {
    if (currentPageObs < totalPagesObs) {
      setCurrentPageObs(currentPageObs + 1);
    }
  };

  const statsHeaders = ["ID", "TAUX POLLUTION", "NB ACCIDENTS"];
  const obsHeaders = ["UTILISATEUR", "STATISTIQUE", "POLLUTION", "ACCIDENTS"];

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
                <span style={styles.titleIcon}>📊</span>
                CENTRE DE SURVEILLANCE STATISTIQUE
              </h1>
              <p style={styles.subtitle}>
                ANALYSE EN TEMPS RÉEL DES DONNÉES ENVIRONNEMENTALES ET DE SÉCURITÉ
              </p>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>{statistiques.length}</span>
                <span style={styles.statLabel}>STATISTIQUES</span>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>{observations.length}</span>
                <span style={styles.statLabel}>OBSERVATIONS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons pour afficher les formulaires */}
        <div style={styles.buttonsContainer}>
          {!showPollutionForm && !showAccidentForm && !showObservationForm && (
            <>
              <button 
                onClick={() => setShowPollutionForm(true)}
                style={styles.addButton}
              >
                <div style={styles.buttonContent}>
                  <span style={styles.buttonIcon}>🌫️</span>
                  <span>AJOUTER POLLUTION</span>
                </div>
                <div style={styles.buttonGlow}></div>
              </button>

              <button 
                onClick={() => setShowAccidentForm(true)}
                style={styles.addButton}
              >
                <div style={styles.buttonContent}>
                  <span style={styles.buttonIcon}>🚨</span>
                  <span>AJOUTER ACCIDENT</span>
                </div>
                <div style={styles.buttonGlow}></div>
              </button>

              <button 
                onClick={() => setShowObservationForm(true)}
                style={styles.addButton}
              >
                <div style={styles.buttonContent}>
                  <span style={styles.buttonIcon}>👁️</span>
                  <span>AJOUTER OBSERVATION</span>
                </div>
                <div style={styles.buttonGlow}></div>
              </button>
            </>
          )}
        </div>

        {/* Formulaire Statistique Pollution (conditionnel) */}
        {showPollutionForm && (
          <div style={styles.formCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>🌫️ INITIER STATISTIQUE POLLUTION</h3>
              <div style={styles.formActionsTop}>
                <button 
                  type="button"
                  onClick={() => setShowPollutionForm(false)}
                  style={styles.closeButton}
                >
                  <span style={styles.buttonIcon}>✕</span>
                  <span>FERMER</span>
                </button>
              </div>
            </div>
            <form onSubmit={addPollution}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    IDENTIFIANT STATISTIQUE
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="STAT_POLLUTION_001"
                      value={pollutionForm.id}
                      onChange={(e) => handlePollutionInputChange("id", e.target.value)}
                      style={styles.input}
                      required
                    />
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    TAUX DE POLLUTION
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="25.5"
                      value={pollutionForm.tauxPollution}
                      onChange={(e) => handlePollutionInputChange("tauxPollution", e.target.value)}
                      style={styles.input}
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
                      <span>ENREGISTRER POLLUTION</span>
                    </div>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => setPollutionForm({ id: "", tauxPollution: "" })}
                  style={styles.secondaryButton}
                >
                  <span style={styles.buttonIcon}>🔄</span>
                  <span>RÉINITIALISER</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Formulaire Statistique Accident (conditionnel) */}
        {showAccidentForm && (
          <div style={styles.formCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>🚨 INITIER STATISTIQUE ACCIDENT</h3>
              <div style={styles.formActionsTop}>
                <button 
                  type="button"
                  onClick={() => setShowAccidentForm(false)}
                  style={styles.closeButton}
                >
                  <span style={styles.buttonIcon}>✕</span>
                  <span>FERMER</span>
                </button>
              </div>
            </div>
            <form onSubmit={addAccident}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    IDENTIFIANT STATISTIQUE
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="STAT_ACCIDENT_001"
                      value={accidentForm.id}
                      onChange={(e) => handleAccidentInputChange("id", e.target.value)}
                      style={styles.input}
                      required
                    />
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    NOMBRE D'ACCIDENTS
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="number"
                      placeholder="15"
                      value={accidentForm.nbreDaccident}
                      onChange={(e) => handleAccidentInputChange("nbreDaccident", e.target.value)}
                      style={styles.input}
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
                      <span>ENREGISTRER ACCIDENT</span>
                    </div>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => setAccidentForm({ id: "", nbreDaccident: "" })}
                  style={styles.secondaryButton}
                >
                  <span style={styles.buttonIcon}>🔄</span>
                  <span>RÉINITIALISER</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Formulaire Observation (conditionnel) */}
        {showObservationForm && (
          <div style={styles.formCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>👁️ INITIER OBSERVATION</h3>
              <div style={styles.formActionsTop}>
                <button 
                  type="button"
                  onClick={() => setShowObservationForm(false)}
                  style={styles.closeButton}
                >
                  <span style={styles.buttonIcon}>✕</span>
                  <span>FERMER</span>
                </button>
              </div>
            </div>
            <form onSubmit={addObservation}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    IDENTIFIANT UTILISATEUR
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="UTILISATEUR_001"
                      value={observationForm.utilisateur_id}
                      onChange={(e) => handleObservationInputChange("utilisateur_id", e.target.value)}
                      style={styles.input}
                      required
                    />
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    IDENTIFIANT STATISTIQUE
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="STAT_001"
                      value={observationForm.statistique_id}
                      onChange={(e) => handleObservationInputChange("statistique_id", e.target.value)}
                      style={styles.input}
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
                      <span>ENREGISTRER OBSERVATION</span>
                    </div>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => setObservationForm({ utilisateur_id: "", statistique_id: "" })}
                  style={styles.secondaryButton}
                >
                  <span style={styles.buttonIcon}>🔄</span>
                  <span>RÉINITIALISER</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des Statistiques */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📋 RÉPERTOIRE DES STATISTIQUES</h3>
            <div style={styles.sectionActions}>
              <div style={styles.paginationInfo}>
                AFFICHAGE {Math.min(indexOfFirstStat + 1, statistiques.length)}-{Math.min(indexOfLastStat, statistiques.length)} SUR {statistiques.length}
              </div>
              <button 
                onClick={fetchStatistiques}
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
                <p style={styles.loadingText}>CHARGEMENT DES DONNÉES STATISTIQUES...</p>
              </div>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        {statsHeaders.map(header => (
                          <th key={header} style={styles.tableHead}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentStats.map((stat) => (
                        <tr 
                          key={stat.id} 
                          style={styles.tableRow}
                        >
                          <td style={styles.tableCell}>
                            <span style={styles.idBadge}>
                              {stat.id}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            {stat.tauxPollution ? (
                              <span style={styles.pollutionBadge}>
                                🌫️ {stat.tauxPollution}
                              </span>
                            ) : (
                              <span style={styles.naText}>-</span>
                            )}
                          </td>
                          <td style={styles.tableCell}>
                            {stat.nbreDaccident ? (
                              <span style={styles.accidentBadge}>
                                🚨 {stat.nbreDaccident}
                              </span>
                            ) : (
                              <span style={styles.naText}>-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {statistiques.length === 0 && (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📊</div>
                    <div style={styles.emptyText}>AUCUNE STATISTIQUE DÉTECTÉE</div>
                    <div style={styles.emptySubtext}>
                      INITIEZ L'AJOUT DE STATISTIQUES POUR COMMENCER
                    </div>
                  </div>
                )}

                {/* Pagination Statistiques */}
                {statistiques.length > 0 && (
                  <div style={styles.paginationContainer}>
                    <div style={styles.pagination}>
                      <button 
                        onClick={goToPreviousPageStats}
                        disabled={currentPageStats === 1}
                        style={{
                          ...styles.paginationButton,
                          ...(currentPageStats === 1 && styles.paginationButtonDisabled)
                        }}
                      >
                        <span style={styles.buttonIcon}>◀</span>
                        <span>PRÉCÉDENT</span>
                      </button>

                      <div style={styles.paginationNumbers}>
                        {Array.from({ length: totalPagesStats }, (_, i) => i + 1).map(number => (
                          <button
                            key={number}
                            onClick={() => paginateStats(number)}
                            style={{
                              ...styles.paginationNumber,
                              ...(currentPageStats === number && styles.paginationNumberActive)
                            }}
                          >
                            {number}
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={goToNextPageStats}
                        disabled={currentPageStats === totalPagesStats}
                        style={{
                          ...styles.paginationButton,
                          ...(currentPageStats === totalPagesStats && styles.paginationButtonDisabled)
                        }}
                      >
                        <span>SUIVANT</span>
                        <span style={styles.buttonIcon}>▶</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Liste des Observations */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>👁️ RÉPERTOIRE DES OBSERVATIONS</h3>
            <div style={styles.sectionActions}>
              <div style={styles.paginationInfo}>
                AFFICHAGE {Math.min(indexOfFirstObs + 1, observations.length)}-{Math.min(indexOfLastObs, observations.length)} SUR {observations.length}
              </div>
              <button 
                onClick={fetchObservations}
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
                <p style={styles.loadingText}>CHARGEMENT DES OBSERVATIONS...</p>
              </div>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        {obsHeaders.map(header => (
                          <th key={header} style={styles.tableHead}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentObs.map((obs, idx) => (
                        <tr 
                          key={idx} 
                          style={styles.tableRow}
                        >
                          <td style={styles.tableCell}>
                            <span style={styles.userBadge}>
                              👤 {obs.utilisateur}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.statsBadge}>
                              📊 {obs.statistique}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            {obs.tauxPollution ? (
                              <span style={styles.pollutionValue}>
                                {obs.tauxPollution}
                              </span>
                            ) : (
                              <span style={styles.naText}>-</span>
                            )}
                          </td>
                          <td style={styles.tableCell}>
                            {obs.nbreDaccident ? (
                              <span style={styles.accidentValue}>
                                {obs.nbreDaccident}
                              </span>
                            ) : (
                              <span style={styles.naText}>-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {observations.length === 0 && (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>👁️</div>
                    <div style={styles.emptyText}>AUCUNE OBSERVATION DÉTECTÉE</div>
                    <div style={styles.emptySubtext}>
                      INITIEZ L'AJOUT D'OBSERVATIONS POUR COMMENCER
                    </div>
                  </div>
                )}

                {/* Pagination Observations */}
                {observations.length > 0 && (
                  <div style={styles.paginationContainer}>
                    <div style={styles.pagination}>
                      <button 
                        onClick={goToPreviousPageObs}
                        disabled={currentPageObs === 1}
                        style={{
                          ...styles.paginationButton,
                          ...(currentPageObs === 1 && styles.paginationButtonDisabled)
                        }}
                      >
                        <span style={styles.buttonIcon}>◀</span>
                        <span>PRÉCÉDENT</span>
                      </button>

                      <div style={styles.paginationNumbers}>
                        {Array.from({ length: totalPagesObs }, (_, i) => i + 1).map(number => (
                          <button
                            key={number}
                            onClick={() => paginateObs(number)}
                            style={{
                              ...styles.paginationNumber,
                              ...(currentPageObs === number && styles.paginationNumberActive)
                            }}
                          >
                            {number}
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={goToNextPageObs}
                        disabled={currentPageObs === totalPagesObs}
                        style={{
                          ...styles.paginationButton,
                          ...(currentPageObs === totalPagesObs && styles.paginationButtonDisabled)
                        }}
                      >
                        <span>SUIVANT</span>
                        <span style={styles.buttonIcon}>▶</span>
                      </button>
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
    padding: '1.5rem 2rem',
    borderRadius: '1rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 30px rgba(0, 255, 255, 0.4)',
    minWidth: '220px',
    letterSpacing: '1px',
    position: 'relative',
    overflow: 'hidden'
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
    animation: 'pulse 2s ease-in-out infinite',
    pointerEvents: 'none'
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
  formActionsTop: {
    display: 'flex',
    gap: '1rem'
  },
  closeButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    color: '#ff6b6b',
    fontWeight: '600',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255, 0, 0, 0.3)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px'
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
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#00ffff',
    letterSpacing: '1px'
  },
  sectionActions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  paginationInfo: {
    fontSize: '0.8rem',
    color: '#88ffff',
    fontWeight: '600',
    letterSpacing: '0.5px',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(0, 255, 255, 0.2)'
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
  idBadge: {
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#00ffff',
    letterSpacing: '0.5px'
  },
  pollutionBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    color: '#00ff88',
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    whiteSpace: 'nowrap',
    letterSpacing: '0.5px',
    boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)'
  },
  accidentBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    color: '#ff6b6b',
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    whiteSpace: 'nowrap',
    letterSpacing: '0.5px',
    boxShadow: '0 0 15px rgba(255, 107, 107, 0.3)'
  },
  userBadge: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    color: '#00ffff',
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    whiteSpace: 'nowrap',
    letterSpacing: '0.5px',
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)'
  },
  statsBadge: {
    backgroundColor: 'rgba(255, 0, 255, 0.2)',
    color: '#ff00ff',
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    whiteSpace: 'nowrap',
    letterSpacing: '0.5px',
    boxShadow: '0 0 15px rgba(255, 0, 255, 0.3)'
  },
  pollutionValue: {
    color: '#00ff88',
    fontWeight: '600',
    fontSize: '0.875rem'
  },
  accidentValue: {
    color: '#ff6b6b',
    fontWeight: '600',
    fontSize: '0.875rem'
  },
  naText: {
    color: '#88ffff',
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
  // Styles pour la pagination
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem',
    borderTop: '1px solid rgba(0, 255, 255, 0.1)'
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center'
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
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  paginationButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed'
  },
  paginationNumbers: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },
  paginationNumber: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    color: '#88ffff',
    fontWeight: '600',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.3s ease',
    minWidth: '3rem'
  },
  paginationNumberActive: {
    backgroundColor: 'rgba(0, 255, 255, 0.3)',
    color: '#ffffff',
    border: '1px solid rgba(0, 255, 255, 0.5)',
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)'
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

  input:focus, select:focus {
    border-color: #00ffff !important;
    background-color: rgba(0, 0, 0, 0.5) !important;
    box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.3) !important;
  }

  input:focus + .input-glow, select:focus + .input-glow {
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

  .refresh-button:hover:not(:disabled) {
    background-color: rgba(0, 255, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  .table-row:hover {
    background-color: rgba(0, 255, 255, 0.05);
    transform: translateX(4px);
  }

  .add-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 40px rgba(0, 255, 255, 0.6);
  }

  .close-button:hover {
    background-color: rgba(255, 0, 0, 0.2);
    border-color: rgba(255, 0, 0, 0.5);
    transform: translateY(-1px);
  }

  .pagination-button:hover:not(:disabled) {
    background-color: rgba(0, 255, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  .pagination-number:hover:not(.pagination-number-active) {
    background-color: rgba(0, 255, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.4);
    transform: translateY(-1px);
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
    
    .buttons-container {
      flex-direction: column;
      align-items: center;
    }
    
    .add-button {
      width: 100%;
      max-width: 300px;
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
    
    .section-actions {
      width: 100%;
      justify-content: space-between;
    }
    
    .pagination {
      flex-direction: column;
      gap: 1rem;
    }
    
    .pagination-numbers {
      order: -1;
    }
  }
`;

// Injection des styles globaux
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}