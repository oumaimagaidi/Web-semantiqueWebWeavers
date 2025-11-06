// src/pages/AIQuery.jsx
import { useState } from "react";
import axios from "axios";

export default function AIQuery() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [particles, setParticles] = useState([]);

  // Système de particules futuriste
  useState(() => {
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

  // FONCTION ask CORRIGÉE
  const ask = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // CORRECTION : endpoint /ask/ au lieu de /ask_ia/
      const res = await axios.post("http://localhost:8000/ask", { 
        question: question.trim() 
      });
      
      setResult(res.data);
      
      // Ajouter à l'historique
      setHistory(prev => [{
        question,
        result: res.data,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 4)]); // Garder les 5 dernières requêtes
      
    } catch (err) {
      console.error("Erreur lors de la requête IA:", err);
      
      // Message d'erreur plus détaillé
      if (err.response) {
        setError(`Erreur ${err.response.status}: ${err.response.data.detail || 'Erreur serveur'}`);
      } else if (err.request) {
        setError("Impossible de contacter le serveur. Vérifiez que le serveur FastAPI est démarré sur le port 8000.");
      } else {
        setError("Erreur lors de la configuration de la requête.");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setResult(null);
  };

  const exampleQueries = [
    "Montre-moi tous les métros reliés à une station",
    "Quels sont les utilisateurs ayant donné des avis",
    "Liste toutes les infrastructures de type route",
    "Affiche les statistiques de pollution",
    "Quels trajets ont été effectués par les utilisateurs"
  ];

  const handleExampleClick = (example) => {
    setQuestion(example);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      ask();
    }
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
                <span style={styles.titleIcon}>🧠</span>
                SYSTÈME D'INTELLIGENCE ARTIFICIELLE
              </h1>
              <p style={styles.subtitle}>
                INTERROGEZ VOS DONNÉES SMART CITY AVEC DES REQUÊTES EN LANGAGE NATUREL
              </p>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>{history.length}</span>
                <span style={styles.statLabel}>REQUÊTES</span>
              </div>
            </div>
          </div>
        </div>

        {/* Zone principale */}
        <div style={styles.mainContent}>
          {/* Section de requête */}
          <div style={styles.querySection}>
            <div style={styles.queryCard}>
              <div style={styles.cardGlow}></div>
              <div style={styles.queryHeader}>
                <h3 style={styles.queryTitle}>💬 FORMULAIRE DE REQUÊTE IA</h3>
                <div style={styles.queryTips}>
                  <span style={styles.tip}>⚡ CTRL + ENTER POUR LANCER L'ANALYSE</span>
                </div>
              </div>
              
              <div style={styles.inputGroup}>
                <div style={styles.inputContainer}>
                  <textarea 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyPress}
                    style={styles.textarea}
                    placeholder="EX: MONTRER TOUS LES MÉTROS RELIÉS À UNE STATION DE RECHARGE..."
                    rows="4"
                  />
                  <div style={styles.inputGlow}></div>
                </div>
                <div style={styles.charCount}>
                  {question.length} CARACTÈRES ANALYSÉS
                </div>
              </div>

              {/* Exemples de requêtes */}
              <div style={styles.examplesSection}>
                <h4 style={styles.examplesTitle}>EXEMPLES DE REQUÊTES PRÉDÉFINIES :</h4>
                <div style={styles.examplesGrid}>
                  {exampleQueries.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      style={styles.exampleButton}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.actions}>
                <button 
                  onClick={ask}
                  disabled={loading || !question.trim()}
                  style={{
                    ...styles.primaryButton,
                    ...((loading || !question.trim()) && styles.buttonDisabled)
                  }}
                >
                  {loading ? (
                    <div style={styles.buttonContent}>
                      <div style={styles.quantumSpinner}></div>
                      <span>ANALYSE EN COURS...</span>
                    </div>
                  ) : (
                    <div style={styles.buttonContent}>
                      <span style={styles.buttonIcon}>🚀</span>
                      <span>LANCER L'ANALYSE IA</span>
                    </div>
                  )}
                </button>
                
                <button 
                  onClick={() => setQuestion("")}
                  style={styles.secondaryButton}
                  disabled={loading}
                >
                  <span style={styles.buttonIcon}>🗑️</span>
                  <span>EFFACER</span>
                </button>
              </div>
            </div>
          </div>

          {/* Résultats d'erreur */}
          {error && (
            <div style={styles.errorCard}>
              <div style={styles.errorHeader}>
                <span style={styles.errorIcon}>⚠️</span>
                <h3 style={styles.errorTitle}>ALERTE SYSTÈME</h3>
              </div>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          {/* Résultats de l'analyse */}
          {result && (
            <div style={styles.resultsSection}>
              <div style={styles.resultsCard}>
                <div style={styles.cardGlow}></div>
                <div style={styles.resultsHeader}>
                  <h3 style={styles.resultsTitle}>📊 RÉSULTATS DE L'ANALYSE IA</h3>
                  <div style={styles.resultsMeta}>
                    <span style={styles.metaItem}>✅ REQUÊTE TRAITÉE AVEC SUCCÈS</span>
                  </div>
                </div>

                <div style={styles.resultContent}>
                  <div style={styles.sparqlSection}>
                    <h4 style={styles.sectionTitle}>
                      🔍 REQUÊTE SPARQL GÉNÉRÉE
                    </h4>
                    <div style={styles.codeBlock}>
                      <pre style={styles.code}>{result.sparql_query}</pre>
                    </div>
                  </div>

                  <div style={styles.dataSection}>
                    <h4 style={styles.sectionTitle}>
                      📄 DONNÉES EXTRACTIVES
                    </h4>
                    <div style={styles.jsonBlock}>
                      <pre style={styles.json}>
                        {JSON.stringify(result.results, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Historique des requêtes */}
          {history.length > 0 && (
            <div style={styles.historySection}>
              <div style={styles.historyCard}>
                <div style={styles.cardGlow}></div>
                <div style={styles.historyHeader}>
                  <h3 style={styles.historyTitle}>📝 HISTORIQUE DES REQUÊTES</h3>
                  <button 
                    onClick={clearHistory}
                    style={styles.clearButton}
                  >
                    <span style={styles.buttonIcon}>🗑️</span>
                    <span>EFFACER L'HISTORIQUE</span>
                  </button>
                </div>
                
                <div style={styles.historyGrid}>
                  {history.map((item, index) => (
                    <div key={index} style={styles.historyItem}>
                      <div style={styles.historyQuestion}>
                        <strong>QUESTION: </strong>{item.question}
                      </div>
                      <div style={styles.historyMeta}>
                        <span style={styles.timestamp}>🕒 {item.timestamp}</span>
                        <span style={styles.resultCount}>
                          📊 {item.result.results?.length || 0} RÉSULTATS
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          setQuestion(item.question);
                          setResult(item.result);
                        }}
                        style={styles.reuseButton}
                      >
                        <span style={styles.buttonIcon}>🔄</span>
                        <span>RÉUTILISER</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* État vide */}
          {!result && !loading && history.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🤖</div>
              <h3 style={styles.emptyTitle}>SYSTÈME D'INTELLIGENCE ARTIFICIELLE PRÊT</h3>
              <p style={styles.emptyText}>
                UTILISEZ LE FORMULAIRE CI-DESSUS POUR POSER DES QUESTIONS EN LANGAGE NATUREL SUR VOS DONNÉES SMART CITY.
                L'IA GÉNÉRERA AUTOMATIQUEMENT LES REQUÊTES SPARQL CORRESPONDANTES POUR EXPLORER VOS DONNÉES.
              </p>
            </div>
          )}
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
    backgroundColor: "#ff00ff",
    borderRadius: "50%",
    animation: "neuralFloat 15s ease-in-out infinite",
    boxShadow: "0 0 8px #ff00ff, 0 0 16px #ff00ff"
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
    background: "linear-gradient(180deg, transparent, #ff00ff, transparent)",
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
    border: '1px solid rgba(255, 0, 255, 0.3)',
    boxShadow: '0 0 30px rgba(255, 0, 255, 0.1)',
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
    background: 'linear-gradient(90deg, transparent, rgba(255,0,255,0.05), transparent)',
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
    background: 'linear-gradient(135deg, #ffffff, #ff00ff)',
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
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 0, 255, 0.3)',
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
    background: 'radial-gradient(circle at center, rgba(255,0,255,0.1) 0%, transparent 70%)',
    animation: 'pulse 2s ease-in-out infinite'
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#ff00ff',
    textShadow: '0 0 10px rgba(255, 0, 255, 0.5)'
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#88ffff',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: '1px'
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  querySection: {
    width: '100%'
  },
  queryCard: {
    backgroundColor: 'rgba(10, 15, 35, 0.7)',
    borderRadius: '1.5rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    padding: '2rem',
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
  queryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  queryTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#00ffff',
    letterSpacing: '1px'
  },
  queryTips: {
    display: 'flex',
    gap: '1rem'
  },
  tip: {
    fontSize: '0.75rem',
    color: '#88ffff',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  inputGroup: {
    marginBottom: '1.5rem'
  },
  inputContainer: {
    position: 'relative'
  },
  textarea: {
    width: '100%',
    padding: '1rem 1.25rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontFamily: "'Rajdhani', sans-serif",
    resize: 'vertical',
    minHeight: '120px',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#ffffff'
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
  charCount: {
    fontSize: '0.75rem',
    color: '#88ffff',
    textAlign: 'right',
    marginTop: '0.5rem',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  examplesSection: {
    marginBottom: '1.5rem'
  },
  examplesTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#88ffff',
    marginBottom: '0.75rem',
    letterSpacing: '0.5px'
  },
  examplesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '0.5rem'
  },
  exampleButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    color: '#88ffff',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: '500'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
    color: '#0a0a0a',
    fontWeight: '700',
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 25px rgba(255, 0, 255, 0.4)',
    minWidth: '200px',
    letterSpacing: '1px'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none'
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
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
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
  errorCard: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    border: '1px solid rgba(255, 0, 0, 0.3)',
    borderRadius: '1rem',
    padding: '1.5rem',
    color: '#ff6b6b',
    backdropFilter: 'blur(10px)'
  },
  errorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  },
  errorIcon: {
    fontSize: '1.25rem'
  },
  errorTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    margin: 0,
    letterSpacing: '0.5px'
  },
  errorText: {
    margin: 0,
    fontSize: '0.875rem',
    lineHeight: '1.4'
  },
  resultsSection: {
    width: '100%'
  },
  resultsCard: {
    backgroundColor: 'rgba(10, 15, 35, 0.7)',
    borderRadius: '1.5rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    padding: '2rem',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 0 25px rgba(0, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  resultsTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#00ffff',
    letterSpacing: '1px'
  },
  resultsMeta: {
    display: 'flex',
    gap: '1rem'
  },
  metaItem: {
    fontSize: '0.875rem',
    color: '#00ff88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    padding: '0.5rem 1rem',
    borderRadius: '2rem',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  resultContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  sparqlSection: {
    width: '100%'
  },
  dataSection: {
    width: '100%'
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#88ffff',
    marginBottom: '1rem',
    letterSpacing: '0.5px'
  },
  codeBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    overflow: 'auto',
    border: '1px solid rgba(0, 255, 255, 0.2)'
  },
  code: {
    color: '#00ff88',
    fontSize: '0.875rem',
    fontFamily: "'Monaco', 'Consolas', monospace",
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    lineHeight: '1.4'
  },
  jsonBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    overflow: 'auto',
    maxHeight: '400px'
  },
  json: {
    color: '#00ffff',
    fontSize: '0.875rem',
    fontFamily: "'Monaco', 'Consolas', monospace",
    margin: 0,
    whiteSpace: 'pre-wrap',
    lineHeight: '1.4'
  },
  historySection: {
    width: '100%'
  },
  historyCard: {
    backgroundColor: 'rgba(10, 15, 35, 0.7)',
    borderRadius: '1.5rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    padding: '2rem',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 0 25px rgba(0, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  historyTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#00ffff',
    letterSpacing: '1px'
  },
  clearButton: {
    backgroundColor: 'transparent',
    color: '#ff4444',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    padding: '0.75rem 1.25rem',
    borderRadius: '0.75rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  historyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1rem'
  },
  historyItem: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    borderRadius: '1rem',
    padding: '1.5rem',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)'
  },
  historyQuestion: {
    fontSize: '0.875rem',
    color: '#ffffff',
    marginBottom: '1rem',
    lineHeight: '1.4',
    fontWeight: '500'
  },
  historyMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  timestamp: {
    fontSize: '0.75rem',
    color: '#88ffff',
    fontWeight: '600'
  },
  resultCount: {
    fontSize: '0.75rem',
    color: '#00ff88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    fontWeight: '600'
  },
  reuseButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    color: '#88ffff',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    letterSpacing: '0.5px'
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
  emptyTitle: {
    color: '#ffffff',
    fontSize: '1.5rem',
    fontWeight: '600',
    letterSpacing: '1px'
  },
  emptyText: {
    color: '#88ffff',
    fontSize: '1rem',
    maxWidth: '500px',
    lineHeight: '1.6',
    fontWeight: '300'
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

  textarea:focus {
    border-color: #00ffff !important;
    background-color: rgba(0, 0, 0, 0.5) !important;
    box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.3) !important;
  }

  textarea:focus + .input-glow {
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5) !important;
  }

  .primary-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 0 35px rgba(255, 0, 255, 0.6);
  }

  .primary-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .secondary-button:hover:not(:disabled) {
    background-color: rgba(0, 255, 255, 0.1);
    border-color: rgba(0, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  .example-button:hover {
    background-color: rgba(0, 255, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  .history-item:hover {
    background-color: rgba(0, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
  }

  .reuse-button:hover {
    background-color: rgba(0, 255, 255, 0.3);
    border-color: rgba(0, 255, 255, 0.6);
  }

  .clear-button:hover {
    background-color: rgba(255, 68, 68, 0.1);
    border-color: rgba(255, 68, 68, 0.5);
  }

  @media (max-width: 1024px) {
    .header-content {
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .stats {
      align-self: flex-start;
    }
    
    .examples-grid {
      grid-template-columns: 1fr;
    }
    
    .actions {
      flex-direction: column;
    }
    
    .primary-button, .secondary-button {
      width: 100%;
      justify-content: center;
    }
    
    .results-header, .history-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .clear-button {
      align-self: flex-start;
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
    
    .query-card, .results-card, .history-card {
      border-radius: 1rem;
      padding: 1.5rem;
    }
    
    .history-grid {
      grid-template-columns: 1fr;
    }
  }
`;

// Injection des styles globaux
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}