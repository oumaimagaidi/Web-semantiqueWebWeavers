// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [personnes, setPersonnes] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [trajets, setTrajets] = useState([]);
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [particles, setParticles] = useState([]);

  // Système de particules futuriste
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
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
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        const [statsRes, personnesRes, vehiculesRes, trajetsRes, avisRes] = await Promise.all([
          axios.get("http://localhost:8000/stats/"),
          axios.get("http://localhost:8000/personnes/"),
          axios.get("http://localhost:8000/vehicules/"),
          axios.get("http://localhost:8000/search/?query=Trajet"),
          axios.get("http://localhost:8000/search/?query=Avis")
        ]);

        setStats(statsRes.data.stats);
        setPersonnes(personnesRes.data);
        setVehicules(vehiculesRes.data);
        setTrajets(trajetsRes.data.results || []);
        setAvis(avisRes.data.results || []);
        
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("DÉFAUT DE CONNEXION AU RÉSEAU PRINCIPAL");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calcul des KPI
  const totalEntities = stats.reduce((total, stat) => total + stat.count, 0);
  const activeUsers = personnes.length;
  
  const vehiculesByType = vehicules.reduce((acc, vehicule) => {
    const type = vehicule.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const activeTransports = Object.values(vehiculesByType).reduce((sum, count) => sum + count, 0);
  
  const averageRating = avis.length > 0 ? 
    avis.reduce((sum, avis) => sum + (avis.note || 0), 0) / avis.length : 0;

  // Données pour graphiques
  const trafficData = Object.entries(vehiculesByType).map(([type, count], index) => ({
    name: type,
    count: count,
    fill: ['#00ffff', '#ff00ff', '#00ff88', '#ffaa00', '#8884d8'][index % 5]
  }));

  const userTypesData = personnes.reduce((acc, personne) => {
    const type = personne.type || 'Personne';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(userTypesData).map(([name, value]) => ({
    name,
    value
  }));

  const evolutionData = stats.map((stat, index) => ({
    name: stat.class,
    count: stat.count,
    trend: Math.min(stat.count + index * 2, stat.count * 1.5)
  }));

  const CYBERPUNK_COLORS = ['#00ffff', '#ff00ff', '#00ff88', '#ffaa00', '#8884d8'];

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
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.quantumSpinner}></div>
          <p style={styles.loadingText}>CHARGEMENT DES DONNÉES SMART CITY...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
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
        </div>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>DÉFAUT DE CONNEXION AU SYSTÈME</h2>
          <p style={styles.errorText}>{error}</p>
          <button 
            style={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            RÉINITIALISER LA CONNEXION
          </button>
        </div>
      </div>
    );
  }

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

      {/* Header holographique */}
      <div style={styles.header}>
        <div style={styles.headerGlow}></div>
        <div style={styles.headerContent}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>
              <span style={styles.titleIcon}>⚡</span>
              TABLEAU DE BORD SMART CITY
            </h1>
            <p style={styles.subtitle}>
              SURVEILLANCE EN TEMPS RÉEL DU RÉSEAU URBAIN INTELLIGENT
            </p>
          </div>
          <div style={styles.timeSection}>
            <div style={styles.timeDisplay}>
              <div style={styles.time}>{formatTime(currentTime)}</div>
              <div style={styles.date}>{formatDate(currentTime)}</div>
              <div style={styles.systemStatus}>
                <div style={styles.statusIndicator}></div>
                SYSTÈME OPÉRATIONNEL
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards cybernétiques */}
      <div style={styles.kpiSection}>
        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiGlow}></div>
            <div style={styles.kpiIcon}>👥</div>
            <div style={styles.kpiContent}>
              <div style={styles.kpiValue}>{activeUsers.toLocaleString()}</div>
              <div style={styles.kpiLabel}>UTILISATEURS ACTIFS</div>
              <div style={styles.kpiTrend}>
                <span style={styles.trendPositive}>
                  {personnes.filter(p => p.type === 'Conducteur').length} OPÉRATEURS MOBILITÉ
                </span>
              </div>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiGlow}></div>
            <div style={styles.kpiIcon}>🚌</div>
            <div style={styles.kpiContent}>
              <div style={styles.kpiValue}>{activeTransports.toLocaleString()}</div>
              <div style={styles.kpiLabel}>UNITÉS DE TRANSPORT</div>
              <div style={styles.kpiTrend}>
                {Object.entries(vehiculesByType).slice(0, 2).map(([type, count]) => (
                  <div key={type} style={styles.trendItem}>
                    {type.toUpperCase()}: {count}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiGlow}></div>
            <div style={styles.kpiIcon}>⭐</div>
            <div style={styles.kpiContent}>
              <div style={styles.kpiValue}>{averageRating.toFixed(1)}/5</div>
              <div style={styles.kpiLabel}>SATISFACTION MOYENNE</div>
              <div style={styles.kpiTrend}>
                <span style={styles.trendPositive}>
                  {avis.length} FEEDBACKS ANALYSÉS
                </span>
              </div>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiGlow}></div>
            <div style={styles.kpiIcon}>📊</div>
            <div style={styles.kpiContent}>
              <div style={styles.kpiValue}>{totalEntities.toLocaleString()}</div>
              <div style={styles.kpiLabel}>ENTITÉS TOTALES</div>
              <div style={styles.kpiTrend}>
                <span style={styles.trendPositive}>
                  {stats.length} CATÉGORIES SURVEILLÉES
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid futuriste */}
      <div style={styles.chartsSection}>
        <div style={styles.chartsGrid}>
          
          {/* Graphique des types de véhicules */}
          <div style={styles.chartCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>RÉPARTITION DES VÉHICULES</h3>
              <div style={styles.chartSubtitle}>ANALYSE EN TEMPS RÉEL</div>
            </div>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
                  <XAxis dataKey="name" stroke="#88ffff" fontSize={12} />
                  <YAxis stroke="#88ffff" fontSize={12} />
                  <Tooltip 
                    contentStyle={styles.tooltipStyle}
                    labelStyle={styles.tooltipLabel}
                  />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    fill="#00ffff" 
                    radius={[4, 4, 0, 0]}
                    name="QUANTITÉ"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graphique des types d'utilisateurs */}
          <div style={styles.chartCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>PROFIL DES UTILISATEURS</h3>
              <div style={styles.chartSubtitle}>RÉPARTITION PAR TYPE</div>
            </div>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CYBERPUNK_COLORS[index % CYBERPUNK_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={styles.tooltipStyle}
                    labelStyle={styles.tooltipLabel}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graphique d'évolution des entités */}
          <div style={styles.chartCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>ÉVOLUTION DES ENTITÉS</h3>
              <div style={styles.chartSubtitle}>ANALYSE TRIMESTRIELLE</div>
            </div>
            <div style={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
                  <XAxis dataKey="name" stroke="#88ffff" angle={-45} textAnchor="end" height={80} fontSize={10} />
                  <YAxis stroke="#88ffff" fontSize={12} />
                  <Tooltip 
                    contentStyle={styles.tooltipStyle}
                    labelStyle={styles.tooltipLabel}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#ff00ff" 
                    strokeWidth={3}
                    dot={{ fill: '#ff00ff', strokeWidth: 2, r: 4 }}
                    name="ACTUEL"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="trend" 
                    stroke="#00ff88" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#00ff88', strokeWidth: 2, r: 3 }}
                    name="PROJECTION"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statistiques détaillées */}
          <div style={styles.chartCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>MÉTRIQUES SYSTÈME</h3>
              <div style={styles.chartSubtitle}>TOP 5 CATÉGORIES</div>
            </div>
            <div style={styles.metricsGrid}>
              {stats.slice(0, 5).map((stat, index) => (
                <div key={stat.class} style={styles.metricItem}>
                  <div style={{
                    ...styles.metricIcon,
                    background: CYBERPUNK_COLORS[index % CYBERPUNK_COLORS.length],
                    boxShadow: `0 0 15px ${CYBERPUNK_COLORS[index % CYBERPUNK_COLORS.length]}`
                  }}>
                    {stat.class.charAt(0)}
                  </div>
                  <div style={styles.metricContent}>
                    <div style={styles.metricValue}>{stat.count.toLocaleString()}</div>
                    <div style={styles.metricLabel}>{stat.class.toUpperCase()}</div>
                  </div>
                  <div style={styles.metricTrend}>
                    +{Math.floor(Math.random() * 15)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Tableau des activités récentes */}
      <div style={styles.activitiesSection}>
        <div style={styles.activitiesGrid}>
          <div style={styles.activityCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.activityHeader}>
              <h4 style={styles.activityTitle}>UTILISATEURS RÉCENTS</h4>
              <div style={styles.activitySubtitle}>DERNIÈRES SYNCHRONISATIONS</div>
            </div>
            <div style={styles.activityList}>
              {personnes.slice(0, 5).map((personne, index) => (
                <div key={index} style={styles.activityItem}>
                  <div style={styles.activityAvatar}>
                    {personne.prenom?.charAt(0)}{personne.nom?.charAt(0)}
                  </div>
                  <div style={styles.activityContent}>
                    <div style={styles.activityName}>
                      {personne.prenom} {personne.nom}
                    </div>
                    <div style={styles.activityType}>
                      {personne.type} • {personne.age} ANS
                    </div>
                  </div>
                  <div style={styles.activityTime}>
                    {Math.floor(Math.random() * 60)} MIN
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.activityCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.activityHeader}>
              <h4 style={styles.activityTitle}>UNITÉS MOBILES</h4>
              <div style={styles.activitySubtitle}>VÉHICULES CONNECTÉS</div>
            </div>
            <div style={styles.activityList}>
              {vehicules.slice(0, 5).map((vehicule, index) => (
                <div key={index} style={styles.activityItem}>
                  <div style={styles.vehicleIcon}>
                    {vehicule.type === 'Voiture' ? '🚗' : 
                     vehicule.type === 'Bus' ? '🚌' :
                     vehicule.type === 'Velo' ? '🚲' : '🚇'}
                  </div>
                  <div style={styles.activityContent}>
                    <div style={styles.activityName}>
                      {vehicule.marque} {vehicule.modele}
                    </div>
                    <div style={styles.activityType}>
                      {vehicule.type} • {vehicule.immatriculation}
                    </div>
                  </div>
                  <div style={styles.activityStatus}>
                    <div style={styles.statusOnline}></div>
                    EN LIGNE
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Résumé système */}
      <div style={styles.summarySection}>
        <div style={styles.summaryCard}>
          <div style={styles.cardGlow}></div>
          <h4 style={styles.summaryTitle}>RAPPORT DE SYSTÈME</h4>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>UTILISATEURS TOTAL:</span>
              <span style={styles.summaryValue}>{activeUsers}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>VÉHICULES ENREGISTRÉS:</span>
              <span style={styles.summaryValue}>{activeTransports}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>FEEDBACKS COLLECTÉS:</span>
              <span style={styles.summaryValue}>{avis.length}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>TRAJETS SURVEILLÉS:</span>
              <span style={styles.summaryValue}>{trajets.length}</span>
            </div>
          </div>
          <div style={styles.systemHealth}>
            <div style={styles.healthIndicator}>
              <div style={styles.healthBar}>
                <div style={styles.healthFill}></div>
              </div>
              <span style={styles.healthText}>INTÉGRITÉ SYSTÈME: 98%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '0',
    backgroundColor: '#0a0a0a',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    fontFamily: "'Orbitron', 'Rajdhani', monospace",
    color: '#ffffff',
    overflowX: 'hidden',
    position: 'relative'
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
  header: {
    background: "rgba(10, 15, 35, 0.85)",
    color: 'white',
    padding: '2rem 2rem 1.5rem 2rem',
    borderBottom: '1px solid rgba(0, 255, 255, 0.3)',
    boxShadow: '0 0 30px rgba(0, 255, 255, 0.1)',
    backdropFilter: 'blur(15px)',
    position: 'relative'
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
    maxWidth: '1400px',
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
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0 0 0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #ffffff, #88ffff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '1px'
  },
  titleIcon: {
    fontSize: '2rem'
  },
  subtitle: {
    fontSize: '1rem',
    opacity: '0.8',
    margin: '0',
    fontWeight: '300',
    color: '#88ffff',
    letterSpacing: '0.5px'
  },
  timeSection: {
    textAlign: 'right'
  },
  timeDisplay: {
    background: 'rgba(0, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1rem',
    padding: '1rem 1.5rem',
    border: '1px solid rgba(0, 255, 255, 0.3)'
  },
  time: {
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: '0 0 0.25rem 0',
    color: '#00ffff',
    letterSpacing: '2px'
  },
  date: {
    fontSize: '0.9rem',
    opacity: '0.8',
    margin: '0 0 0.5rem 0',
    color: '#88ffff'
  },
  systemStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.7rem',
    color: '#00ff88'
  },
  statusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#00ff88',
    boxShadow: '0 0 10px #00ff88'
  },
  kpiSection: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  kpiCard: {
    background: 'rgba(10, 15, 35, 0.7)',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 0 25px rgba(0, 255, 255, 0.1)',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    display: 'flex',
    gap: '1.5rem',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)'
  },
  kpiGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(0,255,255,0.1) 0%, transparent 70%)',
    animation: 'pulse 2s ease-in-out infinite',
    pointerEvents: 'none'
  },
  kpiIcon: {
    fontSize: '2.5rem',
    opacity: '0.8',
    filter: 'drop-shadow(0 0 10px currentColor)'
  },
  kpiContent: {
    flex: 1
  },
  kpiValue: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#00ffff',
    margin: '0 0 0.25rem 0',
    textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
  },
  kpiLabel: {
    fontSize: '0.8rem',
    color: '#88ffff',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
    letterSpacing: '1px'
  },
  kpiTrend: {
    fontSize: '0.75rem',
    color: '#88ffff'
  },
  trendPositive: {
    color: '#00ff88',
    fontWeight: '600'
  },
  trendItem: {
    fontSize: '0.7rem',
    marginBottom: '0.25rem'
  },
  chartsSection: {
    padding: '0 2rem 2rem 2rem',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '1.5rem'
  },
  chartCard: {
    background: 'rgba(10, 15, 35, 0.7)',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 0 25px rgba(0, 255, 255, 0.1)',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)'
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
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  chartTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#00ffff',
    margin: '0',
    letterSpacing: '1px'
  },
  chartSubtitle: {
    fontSize: '0.75rem',
    color: '#88ffff',
    letterSpacing: '0.5px'
  },
  chartContainer: {
    height: '300px'
  },
  tooltipStyle: {
    backgroundColor: 'rgba(10, 15, 35, 0.9)',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    borderRadius: '0.5rem',
    color: '#ffffff'
  },
  tooltipLabel: {
    color: '#00ffff'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1rem',
    height: '100%'
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: 'rgba(0, 255, 255, 0.05)',
    borderRadius: '0.75rem',
    border: '1px solid rgba(0, 255, 255, 0.1)'
  },
  metricIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1rem'
  },
  metricContent: {
    flex: 1
  },
  metricValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#00ffff',
    margin: '0 0 0.25rem 0'
  },
  metricLabel: {
    fontSize: '0.75rem',
    color: '#88ffff',
    letterSpacing: '0.5px'
  },
  metricTrend: {
    fontSize: '0.7rem',
    color: '#00ff88',
    fontWeight: '600'
  },
  activitiesSection: {
    padding: '0 2rem 2rem 2rem',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  activitiesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem'
  },
  activityCard: {
    background: 'rgba(10, 15, 35, 0.7)',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 0 25px rgba(0, 255, 255, 0.1)',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)'
  },
  activityHeader: {
    marginBottom: '1rem'
  },
  activityTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#00ffff',
    margin: '0 0 0.25rem 0',
    letterSpacing: '1px'
  },
  activitySubtitle: {
    fontSize: '0.75rem',
    color: '#88ffff',
    letterSpacing: '0.5px'
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    background: 'rgba(0, 255, 255, 0.05)',
    borderRadius: '0.5rem',
    border: '1px solid rgba(0, 255, 255, 0.1)'
  },
  activityAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00ffff, #0099ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.875rem'
  },
  vehicleIcon: {
    fontSize: '1.5rem',
    filter: 'drop-shadow(0 0 5px rgba(0,255,255,0.5))'
  },
  activityContent: {
    flex: 1
  },
  activityName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#ffffff'
  },
  activityType: {
    fontSize: '0.75rem',
    color: '#88ffff'
  },
  activityTime: {
    fontSize: '0.7rem',
    color: '#ff00ff',
    fontWeight: '600'
  },
  activityStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.7rem',
    color: '#00ff88'
  },
  statusOnline: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#00ff88',
    boxShadow: '0 0 8px #00ff88'
  },
  summarySection: {
    padding: '0 2rem 2rem 2rem',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  summaryCard: {
    background: 'rgba(10, 15, 35, 0.7)',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 0 25px rgba(0, 255, 255, 0.1)',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)'
  },
  summaryTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#00ffff',
    margin: '0 0 1rem 0',
    letterSpacing: '1px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    background: 'rgba(0, 255, 255, 0.05)',
    borderRadius: '0.5rem',
    border: '1px solid rgba(0, 255, 255, 0.1)'
  },
  summaryLabel: {
    fontSize: '0.8rem',
    color: '#88ffff',
    letterSpacing: '0.5px'
  },
  summaryValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#00ffff'
  },
  systemHealth: {
    display: 'flex',
    justifyContent: 'center'
  },
  healthIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1.5rem',
    background: 'rgba(0, 255, 255, 0.1)',
    borderRadius: '2rem',
    border: '1px solid rgba(0, 255, 255, 0.3)'
  },
  healthBar: {
    width: '100px',
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  healthFill: {
    height: '100%',
    width: '98%',
    background: 'linear-gradient(90deg, #00ff88, #00ffff)',
    borderRadius: '3px',
    boxShadow: '0 0 10px #00ff88'
  },
  healthText: {
    fontSize: '0.75rem',
    color: '#00ff88',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '2rem',
    position: 'relative',
    zIndex: 2
  },
  quantumSpinner: {
    width: '80px',
    height: '80px',
    border: '3px solid transparent',
    borderTop: '3px solid #00ffff',
    borderRight: '3px solid #ff00ff',
    borderRadius: '50%',
    animation: 'quantumSpin 1s linear infinite',
    margin: '0 auto 2rem',
    boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)'
  },
  loadingText: {
    color: '#88ffff',
    fontSize: '1.2rem',
    fontWeight: '300',
    letterSpacing: '2px'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1.5rem',
    textAlign: 'center',
    padding: '2rem',
    position: 'relative',
    zIndex: 2
  },
  errorIcon: {
    fontSize: '4rem',
    opacity: '0.7',
    color: '#ff6b6b',
    filter: 'drop-shadow(0 0 10px #ff6b6b)'
  },
  errorTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#ff6b6b',
    margin: '0',
    letterSpacing: '1px'
  },
  errorText: {
    color: '#88ffff',
    fontSize: '1.1rem',
    maxWidth: '400px',
    margin: '0',
    lineHeight: '1.6'
  },
  retryButton: {
    background: 'linear-gradient(135deg, #ff6b6b, #ff00ff)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.9rem',
    letterSpacing: '1px',
    boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
    transition: 'all 0.3s ease'
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

  .kpi-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 255, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.5);
  }

  .retry-button:hover {
    background: linear-gradient(135deg, #ff5252, #e100e1);
    box-shadow: 0 0 30px rgba(255, 0, 255, 0.5);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    .charts-grid {
      grid-template-columns: 1fr;
    }
    
    .activities-grid {
      grid-template-columns: 1fr;
    }
    
    .header-content {
      flex-direction: column;
      text-align: center;
    }
    
    .time-section {
      text-align: center;
    }
    
    .kpi-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 0;
    }
    
    .header, .kpi-section, .charts-section, .activities-section, .summary-section {
      padding: 1rem;
    }
    
    .charts-grid {
      grid-template-columns: 1fr;
    }
    
    .chart-card {
      padding: 1rem;
    }
    
    .kpi-grid {
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