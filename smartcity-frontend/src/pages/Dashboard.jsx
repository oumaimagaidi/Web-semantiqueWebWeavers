// src/pages/Dashboard.jsx
import { useEffect, useState, useMemo } from "react";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("count");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
    
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtrage et tri des données
  const filteredAndSortedStats = useMemo(() => {
    let filtered = stats.filter(stat => 
      stat.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatClassName(stat.class).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory !== "all") {
      filtered = filtered.filter(stat => 
        getCategory(stat.class) === selectedCategory
      );
    }

    return filtered.sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "name") {
        return multiplier * formatClassName(a.class).localeCompare(formatClassName(b.class));
      }
      return multiplier * (b.count - a.count);
    });
  }, [stats, searchTerm, sortBy, sortOrder, selectedCategory]);

  const getIconForClass = (className) => {
    const icons = {
      'Personne': '👤', 'Conducteur': '🚗', 'Pieton': '🚶', 'Voyageur': '🎒',
      'ReseauTransport': '🚆', 'Bus': '🚌', 'Metro': '🚇', 'Voiture': '🚙',
      'Velo': '🚲', 'Trottinette': '🛴', 'Trajet': '🛣️', 'TrajetOptimal': '⭐',
      'TrajetCourt': '📏', 'Infrastructure': '🏗️', 'Route': '🛣️', 'Parking': '🅿️',
      'StationsBus': '🚏', 'StationsMetro': '🚉', 'Batiment': '🏢', 'Avis': '💬',
      'AvisPositif': '👍', 'AvisNegatif': '👎', 'StationRecharge': '⚡',
      'RechargeElectrique': '🔋', 'RechargeGaz': '⛽', 'Ticket': '🎫',
      'TicketBus': '🚌', 'TicketMetro': '🚇', 'TicketParking': '🅿️',
      'SmartCity': '🏙️', 'Statistiques': '📊', 'StatistiquesAccidents': '🚨',
      'StatistiquesPollution': '🌫️', 'StatistiquesUtilisation': '📈',
      'Trafic': '🚦', 'Accident': '🚧', 'Embouteillage': '🚗💨', 'Radar': '📡'
    };
    return icons[className] || '🔮';
  };

  const getColorForClass = (className) => {
    const colors = {
      'Personne': '#3B82F6', 'Conducteur': '#EF4444', 'Pieton': '#10B981',
      'Voyageur': '#0EA5E9', 'ReseauTransport': '#F59E0B', 'Bus': '#F97316',
      'Metro': '#8B5CF6', 'Voiture': '#DC2626', 'Velo': '#22C55E',
      'Trottinette': '#06B6D4', 'Trajet': '#6366F1', 'TrajetOptimal': '#EAB308',
      'TrajetCourt': '#3B82F6', 'Infrastructure': '#14B8A6', 'Route': '#6B7280',
      'Parking': '#78716C', 'StationsBus': '#EA580C', 'StationsMetro': '#7C3AED',
      'Batiment': '#57534E', 'Avis': '#C084FC', 'AvisPositif': '#22C55E',
      'AvisNegatif': '#EF4444', 'StationRecharge': '#10B981', 'RechargeElectrique': '#10B981',
      'RechargeGaz': '#F59E0B', 'Ticket': '#EC4899', 'TicketBus': '#DB2777',
      'TicketMetro': '#A855F7', 'TicketParking': '#BE185D', 'SmartCity': '#2563EB',
      'Statistiques': '#7C3AED', 'StatistiquesAccidents': '#DC2626',
      'StatistiquesPollution': '#0D9488', 'StatistiquesUtilisation': '#4F46E5',
      'Trafic': '#EA580C', 'Accident': '#B91C1C', 'Embouteillage': '#C2410C',
      'Radar': '#3730A3'
    };
    return colors[className] || '#7C3AED';
  };

  const getCategory = (className) => {
    const categories = {
      'transport': ['Bus', 'Metro', 'Voiture', 'Velo', 'Trottinette', 'Trajet', 'TrajetOptimal', 'TrajetCourt', 'ReseauTransport'],
      'infrastructure': ['Route', 'Parking', 'StationsBus', 'StationsMetro', 'Batiment', 'StationRecharge', 'Infrastructure'],
      'personnes': ['Personne', 'Conducteur', 'Pieton', 'Voyageur'],
      'services': ['Ticket', 'TicketBus', 'TicketMetro', 'TicketParking', 'Avis', 'AvisPositif', 'AvisNegatif'],
      'donnees': ['Statistiques', 'StatistiquesAccidents', 'StatistiquesPollution', 'StatistiquesUtilisation', 'Trafic', 'Accident', 'Embouteillage', 'Radar', 'SmartCity']
    };

    for (const [category, items] of Object.entries(categories)) {
      if (items.includes(className)) return category;
    }
    return 'autres';
  };

  const categories = [
    { id: 'all', name: 'Toutes', icon: '📊', count: stats.length },
    { id: 'transport', name: 'Transport', icon: '🚗', count: stats.filter(s => getCategory(s.class) === 'transport').length },
    { id: 'infrastructure', name: 'Infrastructure', icon: '🏗️', count: stats.filter(s => getCategory(s.class) === 'infrastructure').length },
    { id: 'personnes', name: 'Personnes', icon: '👥', count: stats.filter(s => getCategory(s.class) === 'personnes').length },
    { id: 'services', name: 'Services', icon: '🎫', count: stats.filter(s => getCategory(s.class) === 'services').length },
    { id: 'donnees', name: 'Données', icon: '📈', count: stats.filter(s => getCategory(s.class) === 'donnees').length }
  ];

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
      hour12: false
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

  const totalEntities = useMemo(() => 
    filteredAndSortedStats.reduce((total, stat) => total + stat.count, 0), 
    [filteredAndSortedStats]
  );

  if (loading) {
    return (
      <div className="dashboard">
        <Header time={time} />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <Header time={time} />
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Erreur de connexion</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header time={time} />
      
      {/* Barre de contrôle */}
      <div className="control-bar">
        <div className="search-container">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Rechercher une entité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="filters">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="count">Trier par quantité</option>
            <option value="name">Trier par nom</option>
          </select>

          <button 
            className={`sort-order ${sortOrder}`}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Ordre croissant' : 'Ordre décroissant'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Principal */}
      <div className="kpi-section">
        <div className="kpi-card">
          <div className="kpi-content">
            <div className="kpi-icon">📊</div>
            <div className="kpi-data">
              <div className="kpi-value">{totalEntities.toLocaleString()}</div>
              <div className="kpi-label">Entités totales</div>
              <div className="kpi-subtext">
                {filteredAndSortedStats.length} catégorie{filteredAndSortedStats.length > 1 ? 's' : ''} affichée{filteredAndSortedStats.length > 1 ? 's' : ''}
                {searchTerm && ` pour "${searchTerm}"`}
              </div>
            </div>
          </div>
          <div className="kpi-trend">
            <span className="trend-positive">+{Math.round(totalEntities * 0.15).toLocaleString()}</span> ce mois
          </div>
        </div>
      </div>

      {/* Filtres rapides par catégorie */}
      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-filter ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
            <span className="category-count">{category.count}</span>
          </button>
        ))}
      </div>

      {/* Grille principale */}
      <div className="main-content">
        {/* Cartes de statistiques */}
        <div className="stats-grid">
          {filteredAndSortedStats.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>Aucun résultat trouvé</h3>
              <p>Essayez de modifier vos critères de recherche ou de filtrage</p>
            </div>
          ) : (
            filteredAndSortedStats.map((stat, index) => (
              <div 
                key={stat.class} 
                className="stat-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-header">
                  <div 
                    className="card-icon"
                    style={{ 
                      backgroundColor: `${getColorForClass(stat.class)}15`,
                      color: getColorForClass(stat.class),
                      border: `2px solid ${getColorForClass(stat.class)}30`
                    }}
                  >
                    {getIconForClass(stat.class)}
                  </div>
                  <div className="card-stats">
                    <div className="card-count">{stat.count.toLocaleString()}</div>
                    <div 
                      className="card-trend"
                      style={{ 
                        backgroundColor: `${getColorForClass(stat.class)}15`,
                        color: getColorForClass(stat.class)
                      }}
                    >
                      +{Math.round(stat.count * 0.12).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="card-body">
                  <h3 className="card-name">{formatClassName(stat.class)}</h3>
                  <div className="card-category">
                    <span 
                      className="category-tag"
                      style={{ 
                        backgroundColor: `${getColorForClass(stat.class)}10`,
                        color: getColorForClass(stat.class),
                        border: `1px solid ${getColorForClass(stat.class)}20`
                      }}
                    >
                      {getCategory(stat.class)}
                    </span>
                  </div>
                </div>

                <div className="progress-container">
                  <div 
                    className="progress-bar"
                    style={{ backgroundColor: `${getColorForClass(stat.class)}20` }}
                  >
                    <div 
                      className="progress-fill"
                      style={{
                        width: `${(stat.count / totalEntities) * 100}%`,
                        backgroundColor: getColorForClass(stat.class)
                      }}
                    ></div>
                  </div>
                  <div className="card-percentage">
                    {((stat.count / totalEntities) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar avec métriques */}
        <div className="sidebar">
          {/* Résumé des filtres */}
          <div className="summary-card">
            <h3>Résumé</h3>
            <div className="summary-stats">
              <div className="summary-stat">
                <span className="stat-label">Entités trouvées</span>
                <span className="stat-value">{filteredAndSortedStats.length}</span>
              </div>
              <div className="summary-stat">
                <span className="stat-label">Quantité totale</span>
                <span className="stat-value">{totalEntities.toLocaleString()}</span>
              </div>
              <div className="summary-stat">
                <span className="stat-label">Moyenne par entité</span>
                <span className="stat-value">
                  {Math.round(totalEntities / (filteredAndSortedStats.length || 1)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Top 5 */}
          <div className="ranking-card">
            <h3>Top 5 des entités</h3>
            <div className="ranking-list">
              {[...stats]
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((stat, index) => (
                <div key={stat.class} className="ranking-item">
                  <div 
                    className="rank-badge"
                    style={{ backgroundColor: getColorForClass(stat.class) }}
                  >
                    {index + 1}
                  </div>
                  <div className="rank-icon">{getIconForClass(stat.class)}</div>
                  <div className="rank-info">
                    <div className="rank-name">{formatClassName(stat.class)}</div>
                    <div className="rank-count">{stat.count.toLocaleString()}</div>
                  </div>
                  <div 
                    className="rank-percentage"
                    style={{ color: getColorForClass(stat.class) }}
                  >
                    {((stat.count / totalEntities) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Métriques rapides */}
          <div className="metrics-card">
            <h3>Métriques</h3>
            <div className="metrics-grid">
              <div className="metric">
                <div className="metric-icon">🚀</div>
                <div className="metric-data">
                  <div className="metric-value">{stats.length}</div>
                  <div className="metric-label">Catégories</div>
                </div>
              </div>
              <div className="metric">
                <div className="metric-icon">⚡</div>
                <div className="metric-data">
                  <div className="metric-value">
                    {Math.round(totalEntities / stats.length)}
                  </div>
                  <div className="metric-label">Moyenne</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1e293b;
        }

        /* Header */
        .dashboard-header {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          padding: 1.5rem 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo {
          font-size: 2.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 0.5rem;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .logo-text h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .logo-text p {
          margin: 0;
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 400;
        }

        .time-section {
          text-align: right;
        }

        .current-time {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .current-date {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 400;
        }

        /* Barre de contrôle */
        .control-bar {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem 2rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          z-index: 2;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .clear-search:hover {
          background: #f1f5f9;
        }

        .filters {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .sort-order {
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .sort-order:hover {
          background: #f8fafc;
        }

        .sort-order.asc {
          color: #10b981;
        }

        .sort-order.desc {
          color: #ef4444;
        }

        /* KPI Section */
        .kpi-section {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem 1.5rem;
        }

        .kpi-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 2rem;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }

        .kpi-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          position: relative;
          z-index: 2;
        }

        .kpi-icon {
          font-size: 3rem;
          opacity: 0.9;
        }

        .kpi-data {
          flex: 1;
        }

        .kpi-value {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          line-height: 1;
        }

        .kpi-label {
          font-size: 1rem;
          opacity: 0.9;
          margin-bottom: 0.25rem;
          font-weight: 500;
        }

        .kpi-subtext {
          font-size: 0.875rem;
          opacity: 0.7;
        }

        .kpi-trend {
          position: absolute;
          right: 2rem;
          bottom: 1.5rem;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .trend-positive {
          font-weight: 600;
        }

        /* Filtres par catégorie */
        .category-filters {
          max-width: 1400px;
          margin: 0 auto 1.5rem;
          padding: 0 2rem;
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .category-filters::-webkit-scrollbar {
          display: none;
        }

        .category-filter {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .category-filter:hover {
          border-color: #3b82f6;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .category-filter.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .category-icon {
          font-size: 1.125rem;
        }

        .category-name {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .category-count {
          font-size: 0.75rem;
          opacity: 0.7;
          background: rgba(0, 0, 0, 0.1);
          padding: 0.125rem 0.5rem;
          border-radius: 8px;
        }

        .category-filter.active .category-count {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Contenu principal */
        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem 2rem;
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
        }

        /* Grille de statistiques */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid #f1f5f9;
          transition: all 0.3s ease;
          animation: cardEntrance 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .card-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          transition: all 0.3s ease;
        }

        .card-stats {
          text-align: right;
        }

        .card-count {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.25rem;
          line-height: 1;
        }

        .card-trend {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
        }

        .card-body {
          margin-bottom: 1rem;
        }

        .card-name {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.75rem 0;
          line-height: 1.4;
        }

        .card-category {
          margin-bottom: 0.5rem;
        }

        .category-tag {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
          background: #f1f5f9;
        }

        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .card-percentage {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
          min-width: 45px;
        }

        /* Sidebar */
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .summary-card,
        .ranking-card,
        .metrics-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }

        .summary-card h3,
        .ranking-card h3,
        .metrics-card h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
        }

        .summary-stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .summary-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .summary-stat:last-child {
          border-bottom: none;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #64748b;
        }

        .stat-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .ranking-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ranking-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }

        .ranking-item:hover {
          background: #f8fafc;
        }

        .rank-badge {
          width: 24px;
          height: 24px;
          background: #3b82f6;
          color: white;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .rank-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .rank-info {
          flex: 1;
          min-width: 0;
        }

        .rank-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 0.125rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .rank-count {
          font-size: 0.75rem;
          color: #64748b;
        }

        .rank-percentage {
          font-size: 0.75rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .metrics-grid {
          display: grid;
          gap: 1rem;
        }

        .metric {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
        }

        .metric-icon {
          font-size: 1.5rem;
        }

        .metric-data {
          flex: 1;
        }

        .metric-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.125rem;
        }

        .metric-label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* États */
        .loading-state,
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: 1rem;
          text-align: center;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 3px solid #f1f5f9;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-state p {
          color: #64748b;
          font-size: 1rem;
          font-weight: 500;
        }

        .error-state .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-state h2 {
          margin: 0 0 1rem 0;
          color: #dc2626;
          font-size: 1.5rem;
        }

        .error-state p {
          margin: 0 0 2rem 0;
          color: #64748b;
          max-width: 400px;
          line-height: 1.6;
        }

        .retry-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-size: 0.875rem;
        }

        .retry-btn:hover {
          background: #2563eb;
        }

        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 16px;
          border: 2px dashed #e2e8f0;
        }

        .no-results-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .no-results h3 {
          margin: 0 0 0.5rem 0;
          color: #1e293b;
          font-size: 1.25rem;
        }

        .no-results p {
          margin: 0;
          color: #64748b;
        }

        /* Animations */
        @keyframes cardEntrance {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .main-content {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            padding: 1rem;
          }
          
          .header-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          
          .control-bar {
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
          }
          
          .search-container {
            min-width: 100%;
          }
          
          .filters {
            width: 100%;
            justify-content: space-between;
          }
          
          .main-content,
          .kpi-section,
          .category-filters {
            padding: 0 1rem 1rem;
          }
          
          .category-filters {
            gap: 0.5rem;
          }
          
          .kpi-content {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
          
          .kpi-value {
            font-size: 2.5rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .control-bar {
            gap: 0.75rem;
          }
          
          .filters {
            flex-direction: column;
            width: 100%;
          }
          
          .filter-select,
          .sort-order {
            width: 100%;
          }
          
          .category-filters {
            flex-wrap: nowrap;
            overflow-x: auto;
          }
        }

        /* Scrollbar personnalisée */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

// Composant Header séparé
function Header({ time }) {
  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo">🌐</div>
          <div className="logo-text">
            <h1>SmartCity Analytics</h1>
            <p>Tableau de bord temps réel</p>
          </div>
        </div>
        
        <div className="time-section">
          <div className="current-time">{formatTime(time)}</div>
          <div className="current-date">{formatDate(time)}</div>
        </div>
      </div>
    </header>
  );
}

// Fonctions de formatage
function formatTime(date) {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function formatDate(date) {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}