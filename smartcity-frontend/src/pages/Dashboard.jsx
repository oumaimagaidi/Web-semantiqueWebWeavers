// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8000/stats/");
        setStats(res.data.stats);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques:", err);
        setError("Impossible de charger les statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Mettre à jour l'heure en temps réel
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getIconForClass = (className) => {
    const icons = {
      'Utilisateur': '👤',
      'RéseauTransport': '🚄',
      'Evenement': '🚨',
      'Infrastructure': '🏗️',
      'Avis': '💬',
      'StationRecharge': '⚡',
      'Ticket': '🎫',
      'SmartCity': '🏙️',
      'Trajet': '🛣️',
      'Statistique': '📈',
      'Métro': '🚇',
      'Bus': '🚌',
      'Voiture': '🚗',
      'Vélo': '🚲',
      'Trottinette': '🛴'
    };
    
    const defaultIcon = '🔹';
    return icons[className] || defaultIcon;
  };

  const getGradientForClass = (className) => {
    const gradients = {
      'Utilisateur': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'RéseauTransport': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Evenement': 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
      'Infrastructure': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Avis': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'StationRecharge': 'linear-gradient(135deg, #fffb7d 0%, #85a3ff 100%)',
      'Ticket': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'SmartCity': 'linear-gradient(135deg, #a3bded 0%, #6991c7 100%)',
      'Trajet': 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
      'Statistique': 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      'Métro': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Bus': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Voiture': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Vélo': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'Trottinette': 'linear-gradient(135deg, #fffb7d 0%, #ffa726 100%)'
    };
    
    return gradients[className] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const getLightColorForClass = (className) => {
    const colors = {
      'Utilisateur': '#e0e7ff',
      'RéseauTransport': '#fce7f3',
      'Evenement': '#ffedd5',
      'Infrastructure': '#dbeafe',
      'Avis': '#f0fdf4',
      'StationRecharge': '#fef7cd',
      'Ticket': '#fdf2f8',
      'SmartCity': '#e0e7ff',
      'Trajet': '#ecfdf5',
      'Statistique': '#fffbeb',
      'Métro': '#e0e7ff',
      'Bus': '#fce7f3',
      'Voiture': '#dbeafe',
      'Vélo': '#f0fdf4',
      'Trottinette': '#fef7cd'
    };
    
    return colors[className] || '#f3f4f6';
  };

  const formatClassName = (className) => {
    return className
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.futuristicSpinner}></div>
          <p style={styles.loadingText}>Chargement des données SmartCity...</p>
          <div style={styles.loadingDots}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>Connexion interrompue</h2>
          <p style={styles.errorText}>{error}</p>
          <button 
            style={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            <span style={styles.buttonIcon}>🔄</span>
            Réinitialiser la connexion
          </button>
        </div>
      </div>
    );
  }

  const totalEntities = stats.reduce((total, stat) => total + stat.count, 0);
  const totalCategories = stats.length;

  return (
    <div style={styles.container}>
      {/* Header avec informations temps réel */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>
              <span style={styles.titleIcon}>🏙️</span>
              Dashboard SmartCity
            </h1>
            <p style={styles.subtitle}>
              Surveillance en temps réel de l'écosystème urbain intelligent
            </p>
          </div>
          <div style={styles.timeSection}>
            <div style={styles.timeDisplay}>
              <div style={styles.time}>{formatTime(currentTime)}</div>
              <div style={styles.date}>{formatDate(currentTime)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiSection}>
        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>📊</div>
            <div style={styles.kpiContent}>
              <div style={styles.kpiValue}>{totalEntities.toLocaleString()}</div>
              <div style={styles.kpiLabel}>Entités Total</div>
            </div>
            <div style={styles.kpiDecoration}></div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>🏷️</div>
            <div style={styles.kpiContent}>
              <div style={styles.kpiValue}>{totalCategories}</div>
              <div style={styles.kpiLabel}>Catégories</div>
            </div>
            <div style={styles.kpiDecoration}></div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>🔄</div>
            <div style={styles.kpiContent}>
              <div style={styles.kpiValue}>24/7</div>
              <div style={styles.kpiLabel}>Surveillance</div>
            </div>
            <div style={styles.kpiDecoration}></div>
          </div>
        </div>
      </div>

      {/* Grid des statistiques détaillées */}
      <div style={styles.statsSection}>
        <h2 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>📈</span>
          Statistiques Détaillées
        </h2>
        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div 
              key={stat.class} 
              style={{
                ...styles.statCard,
                background: getLightColorForClass(stat.class),
                animationDelay: `${index * 0.1}s`
              }}
              className="stat-card"
            >
              <div style={styles.statHeader}>
                <div style={styles.statIconContainer}>
                  <div style={{
                    ...styles.statIcon,
                    background: getGradientForClass(stat.class)
                  }}>
                    {getIconForClass(stat.class)}
                  </div>
                </div>
                <div style={styles.statInfo}>
                  <h3 style={styles.statName}>
                    {formatClassName(stat.class)}
                  </h3>
                  <p style={styles.statCount}>
                    {stat.count.toLocaleString()}
                  </p>
                </div>
              </div>
              <div style={styles.statFooter}>
                <div style={styles.statProgress}>
                  <div 
                    style={{
                      ...styles.statProgressBar,
                      width: `${Math.min((stat.count / totalEntities) * 100, 100)}%`,
                      background: getGradientForClass(stat.class)
                    }}
                  ></div>
                </div>
                <div style={styles.statPercentage}>
                  {((stat.count / totalEntities) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carte de statut du système */}
      <div style={styles.systemStatus}>
        <div style={styles.statusCard}>
          <h3 style={styles.statusTitle}>
            <span style={styles.statusIcon}>🔍</span>
            Statut du Système
          </h3>
          <div style={styles.statusGrid}>
            <div style={styles.statusItem}>
              <div style={styles.statusDot} className="online"></div>
              <span>Base de données</span>
            </div>
            <div style={styles.statusItem}>
              <div style={styles.statusDot} className="online"></div>
              <span>API SmartCity</span>
            </div>
            <div style={styles.statusItem}>
              <div style={styles.statusDot} className="online"></div>
              <span>Réseau IoT</span>
            </div>
            <div style={styles.statusItem}>
              <div style={styles.statusDot} className="online"></div>
              <span>Capteurs Urbains</span>
            </div>
          </div>
        </div>
      </div>

      {stats.length === 0 && !loading && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🏙️</div>
          <h3 style={styles.emptyTitle}>Système en attente de données</h3>
          <p style={styles.emptyText}>
            La plateforme SmartCity est prête à recevoir les données des capteurs urbains
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '0',
    backgroundColor: '#ffffff',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
    color: '#1e293b',
    overflowX: 'hidden'
  },
  header: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
    borderBottom: '1px solid #e2e8f0',
    padding: '2rem 2rem 1.5rem 2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '2rem'
  },
  titleSection: {
    flex: 1
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0 0 0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  titleIcon: {
    fontSize: '2.25rem'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    margin: '0',
    fontWeight: '400'
  },
  timeSection: {
    textAlign: 'right'
  },
  timeDisplay: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1rem',
    padding: '1rem 1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
  },
  time: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#3b82f6',
    margin: '0 0 0.25rem 0'
  },
  date: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: '0'
  },
  kpiSection: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  kpiCard: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1.5rem',
    padding: '2rem',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
  },
  kpiIcon: {
    fontSize: '3rem',
    opacity: '0.9'
  },
  kpiContent: {
    flex: 1
  },
  kpiValue: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1e293b',
    margin: '0 0 0.25rem 0',
    background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  kpiLabel: {
    fontSize: '1rem',
    color: '#64748b',
    fontWeight: '500',
    margin: '0'
  },
  kpiDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    borderBottomLeftRadius: '50%',
    opacity: '0.1'
  },
  statsSection: {
    padding: '0 2rem 2rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 2rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  sectionIcon: {
    fontSize: '1.5rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem'
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1.5rem',
    padding: '2rem',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    opacity: '0',
    transform: 'translateY(20px)',
    animation: 'fadeInUp 0.6s ease forwards',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '1.5rem'
  },
  statIconContainer: {
    position: 'relative'
  },
  statIcon: {
    fontSize: '2.5rem',
    width: '70px',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '1rem',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    color: 'white'
  },
  statInfo: {
    flex: 1
  },
  statName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 0.5rem 0'
  },
  statCount: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1e293b',
    margin: '0',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  statFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  statProgress: {
    flex: 1,
    height: '6px',
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  statProgressBar: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 1s ease'
  },
  statPercentage: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#475569',
    minWidth: '50px'
  },
  systemStatus: {
    padding: '0 2rem 2rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  statusCard: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1.5rem',
    padding: '2rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
  },
  statusTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 1.5rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  statusIcon: {
    fontSize: '1.25rem'
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(241, 245, 249, 0.5)',
    borderRadius: '0.75rem',
    color: '#475569',
    fontWeight: '500'
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#10b981'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '2rem'
  },
  futuristicSpinner: {
    width: '60px',
    height: '60px',
    border: '3px solid rgba(59, 130, 246, 0.3)',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
  },
  loadingText: {
    color: '#64748b',
    fontSize: '1.1rem',
    fontWeight: '400'
  },
  loadingDots: {
    display: 'flex',
    gap: '0.5rem',
    '& span': {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#3b82f6',
      animation: 'bounce 1.4s infinite ease-in-out'
    },
    '& span:nth-child(1)': { animationDelay: '-0.32s' },
    '& span:nth-child(2)': { animationDelay: '-0.16s' }
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1.5rem',
    textAlign: 'center',
    padding: '2rem'
  },
  errorIcon: {
    fontSize: '4rem',
    opacity: '0.7',
    color: '#ef4444'
  },
  errorTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0'
  },
  errorText: {
    color: '#64748b',
    fontSize: '1.1rem',
    maxWidth: '400px',
    margin: '0',
    lineHeight: '1.6'
  },
  retryButton: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
  },
  buttonIcon: {
    fontSize: '1.1rem'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: '1.5rem',
    textAlign: 'center',
    padding: '2rem'
  },
  emptyIcon: {
    fontSize: '5rem',
    opacity: '0.5',
    color: '#cbd5e1'
  },
  emptyTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0'
  },
  emptyText: {
    color: '#64748b',
    fontSize: '1.1rem',
    maxWidth: '500px',
    margin: '0',
    lineHeight: '1.6'
  }
};

// Styles CSS globaux pour les animations
const globalStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba(59, 130, 246, 0.1);
  }

  .kpi-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }

  .retry-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }

  .status-dot.online {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }
    
    .time-section {
      text-align: center;
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .kpi-grid {
      grid-template-columns: 1fr;
    }
    
    .title {
      font-size: 2rem;
    }
    
    .container {
      padding: 0;
    }
    
    .header, .kpi-section, .stats-section, .system-status {
      padding: 1.5rem 1rem;
    }
  }

  @media (max-width: 480px) {
    .stat-card {
      padding: 1.5rem;
    }
    
    .stat-header {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }
    
    .kpi-card {
      padding: 1.5rem;
      flex-direction: column;
      text-align: center;
    }
  }

  /* Scrollbar personnalisée */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

// Injection des styles globaux
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}