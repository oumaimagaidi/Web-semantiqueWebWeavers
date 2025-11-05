import { useEffect, useState } from "react";
import axios from "axios";

export default function RechargePage() {
  const [stations, setStations] = useState([]);
  const [reseauxRecharge, setReseauxRecharge] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [stationForm, setStationForm] = useState({ 
    id: "", 
    type_connecteur: "Type2", 
    puissanceMax: 22.0, 
    disponible: true 
  });
  const [linkForm, setLinkForm] = useState({ 
    vehicule_id: "", 
    station_id: "" 
  });
  const [particles, setParticles] = useState([]);
  const [showStationForm, setShowStationForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [currentPageStations, setCurrentPageStations] = useState(1);
  const [currentPageRelations, setCurrentPageRelations] = useState(1);
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

  // ------------------- Fetch stations -------------------
  // ------------------- Fetch stations -------------------
const fetchStations = async () => {
  try {
    setLoading(true);
    console.log("🔄 Chargement des stations...");
    
    // Essayer d'abord l'endpoint spécifique s'il existe
    try {
      const res = await axios.get("http://localhost:8000/stations_recharge/");
      console.log("📊 Stations reçues (endpoint spécifique):", res.data);
      setStations(res.data);
      setMessage(null);
      return;
    } catch (specificError) {
      console.log("ℹ️ Endpoint spécifique non disponible, utilisation de /search/");
    }

    // Utiliser l'endpoint de recherche générique
    const res = await axios.get("http://localhost:8000/search/?query=Recharge");
    console.log("📊 Résultats de recherche bruts:", res.data);
    
    if (res.data.results && res.data.results.length > 0) {
      // Transformer les données pour correspondre au format attendu
      const stationsData = res.data.results.map(item => {
        console.log("🔍 Item de station:", item);
        
        // Déterminer le type basé sur les propriétés disponibles
        let stationType = 'RechargeElectrique';
        if (item.type && item.type.includes('Gaz')) {
          stationType = 'RechargeGaz';
        } else if (item.type && item.type.includes('Recharge')) {
          stationType = item.type;
        }
        
        // Extraire les propriétés avec des fallbacks
        return {
          id: item.id || item.label || `station_${Math.random().toString(36).substr(2, 9)}`,
          type: stationType,
          type_connecteur: item.type_connecteur || 'Type2',
          puissanceMax: item.puissanceMax || item.puissance || 22.0,
          disponible: item.disponible !== undefined ? item.disponible : true,
          // Propriétés supplémentaires pour le debug
          rawData: item // Garder les données brutes pour inspection
        };
      });
      
      console.log("🏗️ Stations transformées:", stationsData);
      setStations(stationsData);
      setMessage(`✅ ${stationsData.length} STATIONS DE RECHARGE TROUVÉES`);
    } else {
      console.log("ℹ️ Aucune station trouvée via /search/");
      setStations([]);
      setMessage("ℹ️ AUCUNE STATION EXISTANTE - CRÉEZ-EN DE NOUVELLES");
    }
    
  } catch (err) {
    console.error("❌ Erreur lors du chargement des stations:", err);
    setMessage("❌ ERREUR DE CHARGEMENT - VÉRIFIEZ LA CONSOLE POUR LES DÉTAILS");
    setStations([]);
  } finally {
    setLoading(false);
  }
};

// ------------------- Fetch relations véhicule -> station -------------------
// ------------------- Fetch relations véhicule -> station -------------------
const fetchReseauxRecharge = async () => {
  try {
    console.log("🔄 Chargement des relations via /relations_recharge/...");
    
    // Utiliser le NOUVEL endpoint dédié
    const res = await axios.get("http://localhost:8000/relations_recharge/");
    console.log("📊 Relations reçues:", res.data);
    
    setReseauxRecharge(res.data);
    
    if (res.data.length === 0) {
      setMessage("ℹ️ AUCUNE RELATION TROUVÉE - CRÉEZ DES LIAISONS ENTRE VÉHICULES ET STATIONS");
    } else {
      setMessage(`✅ ${res.data.length} RELATIONS DE RECHARGE TROUVÉES`);
    }
    
  } catch (err) {
    console.error("❌ Erreur lors du chargement des relations:", err);
    
    // Fallback vers l'ancienne méthode si le nouvel endpoint n'existe pas
    try {
      setMessage("⚠️ CHARGEMENT DES RELATIONS VIA RECHERCHE...");
      const searchRes = await axios.get("http://localhost:8000/search/?query=utiliseStationRecharge");
      console.log("📊 Relations de secours:", searchRes.data);
      
      if (searchRes.data.results && searchRes.data.results.length > 0) {
        const relations = searchRes.data.results.map(item => ({
          vehicule: item.vehicule || item.source || item.id,
          station: item.station || item.target || item.label,
          type: item.type || 'utiliseStationRecharge'
        }));
        setReseauxRecharge(relations);
        setMessage(`✅ ${relations.length} RELATIONS TROUVÉES VIA RECHERCHE`);
      } else {
        setMessage("ℹ️ AUCUNE RELATION EXISTANTE - CRÉEZ LA PREMIÈRE LIAISON");
        setReseauxRecharge([]);
      }
    } catch (fallbackErr) {
      console.error("❌ Erreur de fallback:", fallbackErr);
      setMessage("⚠️ AFFICHAGE DES RELATIONS DE DÉMONSTRATION");
      
      // Relations de démonstration en dernier recours
      const demoRelations = [
        { vehicule: "VÉHICULE_ALPHA", station: "STATION_CENTRALE", type: "utiliseStationRecharge" },
        { vehicule: "BUS_ELECTRIQUE", station: "STATION_RAPIDE", type: "utiliseStationRecharge" }
      ];
      setReseauxRecharge(demoRelations);
    }
  }
};
// Fonction pour rafraîchir spécifiquement les relations
const refreshRelations = async () => {
  try {
    setLoading(true);
    setMessage("🔄 RAFRAÎCHISSEMENT DES RELATIONS...");
    await fetchReseauxRecharge();
  } catch (err) {
    console.error("Erreur de rafraîchissement:", err);
  } finally {
    setLoading(false);
  }
};

  // ------------------- Fetch relations véhicule -> station -------------------
  

  // ------------------- Fetch véhicules pour la sélection -------------------
  const fetchVehicules = async () => {
    try {
      const res = await axios.get("http://localhost:8000/vehicules/");
      console.log("📊 Véhicules reçus:", res.data);
      setVehicules(res.data);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des véhicules:", err);
      setMessage("⚠️ ERREUR DE CHARGEMENT DES VÉHICULES");
      setVehicules([]);
    }
  };

  useEffect(() => {
    fetchStations();
    fetchReseauxRecharge();
    fetchVehicules();
  }, []);

  // ------------------- Add new station -------------------
  const addStation = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      console.log("🔄 Envoi de la station:", stationForm);
      
      // Utiliser l'endpoint générique d'ajout
      const res = await axios.post("http://localhost:8000/add_station_recharge/", stationForm);
      
      console.log("✅ Réponse du serveur:", res.data);
      
      setMessage("✅ STATION DE RECHARGE CRÉÉE AVEC SUCCÈS");
      setStationForm({ 
        id: "", 
        type_connecteur: "Type2", 
        puissanceMax: 22.0, 
        disponible: true 
      });
      setShowStationForm(false);
      
      setTimeout(() => {
        fetchStations();
      }, 1000);
      
    } catch (err) {
      console.error("❌ Erreur détaillée lors de l'ajout de la station:", err);
      
      let errorMessage = "❌ ÉCHEC DE CRÉATION DE LA STATION";
      if (err.response) {
        errorMessage = err.response.data?.detail || 
                      err.response.data?.error || 
                      `Erreur ${err.response.status}: ${err.response.statusText}`;
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = "❌ SERVEUR INDISPONIBLE - VÉRIFIEZ QUE LE BACKEND EST DÉMARRÉ";
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Add new relation véhicule -> station -------------------
  // ------------------- Add new relation véhicule -> station -------------------
const addReseauRecharge = async (e) => {
  e.preventDefault();
  setMessage(null);
  setLoading(true);

  try {
    // Validation des champs
    if (!linkForm.vehicule_id || !linkForm.station_id) {
      setMessage("❌ VEUILLEZ SÉLECTIONNER UN VÉHICULE ET UNE STATION");
      setLoading(false);
      return;
    }

    console.log("🔄 Envoi de la relation:", linkForm);
    
    // Utiliser l'endpoint dédié pour créer la relation
    const res = await axios.post("http://localhost:8000/vehicule/utilise_station/", {
      vehicule_id: linkForm.vehicule_id,
      station_id: linkForm.station_id
    });
    
    console.log("✅ Réponse du serveur:", res.data);
    
    if (res.data.error) {
      setMessage(`❌ ${res.data.error}`);
    } else {
      setMessage(res.data.message || "✅ LIAISON ÉTABLIE AVEC SUCCÈS");
      setLinkForm({ vehicule_id: "", station_id: "" });
      setShowLinkForm(false);
      
      // Recharger les données après un court délai
      setTimeout(() => {
        fetchReseauxRecharge();
      }, 1000);
    }
    
  } catch (err) {
    console.error("❌ Erreur détaillée lors de l'ajout de la relation:", err);
    
    let errorMessage = "❌ ÉCHEC DE CRÉATION DE LA LIAISON";
    
    if (err.response) {
      // Erreur du serveur
      console.error("📊 Données de réponse d'erreur:", err.response.data);
      errorMessage = err.response.data?.detail || 
                    err.response.data?.error || 
                    `Erreur ${err.response.status}: ${err.response.statusText}`;
    } else if (err.request) {
      // Pas de réponse du serveur
      errorMessage = "❌ IMPOSSIBLE DE SE CONNECTER AU SERVEUR";
    } else if (err.code === 'ERR_NETWORK') {
      errorMessage = "❌ PROBLÈME DE RÉSEAU - VÉRIFIEZ VOTRE CONNEXION";
    }
    
    setMessage(errorMessage);
  } finally {
    setLoading(false);
  }
};
  const handleStationInputChange = (field, value) => {
    setStationForm(prev => ({
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

  // Logique de pagination pour les stations
  const indexOfLastStation = currentPageStations * itemsPerPage;
  const indexOfFirstStation = indexOfLastStation - itemsPerPage;
  const currentStations = stations.slice(indexOfFirstStation, indexOfLastStation);
  const totalPagesStations = Math.ceil(stations.length / itemsPerPage);

  // Logique de pagination pour les relations
  const indexOfLastRelation = currentPageRelations * itemsPerPage;
  const indexOfFirstRelation = indexOfLastRelation - itemsPerPage;
  const currentRelations = reseauxRecharge.slice(indexOfFirstRelation, indexOfLastRelation);
  const totalPagesRelations = Math.ceil(reseauxRecharge.length / itemsPerPage);

  // Changer de page pour stations
  const paginateStations = (pageNumber) => setCurrentPageStations(pageNumber);
  const goToPreviousPageStations = () => {
    if (currentPageStations > 1) {
      setCurrentPageStations(currentPageStations - 1);
    }
  };
  const goToNextPageStations = () => {
    if (currentPageStations < totalPagesStations) {
      setCurrentPageStations(currentPageStations + 1);
    }
  };

  // Changer de page pour relations
  const paginateRelations = (pageNumber) => setCurrentPageRelations(pageNumber);
  const goToPreviousPageRelations = () => {
    if (currentPageRelations > 1) {
      setCurrentPageRelations(currentPageRelations - 1);
    }
  };
  const goToNextPageRelations = () => {
    if (currentPageRelations < totalPagesRelations) {
      setCurrentPageRelations(currentPageRelations + 1);
    }
  };

  const connecteurTypes = [
    { value: "Type2", label: "🔌 TYPE 2 STANDARD" },
    { value: "CCS", label: "⚡ CCS COMBO RAPIDE" },
    { value: "CHAdeMO", label: "🔋 CHADEMO ULTRA" },
    { value: "AC", label: "💡 AC STANDARD" }
  ];

  const getStationIcon = (type) => {
    const icons = {
      'RechargeElectrique': '⚡',
      'RechargeGaz': '⛽',
      'StationRecharge': '🔌',
      'default': '🔌'
    };
    return icons[type] || icons.default;
  };

  const getStationColor = (type) => {
    const colors = {
      'RechargeElectrique': '#00ff88',
      'RechargeGaz': '#ffaa00',
      'StationRecharge': '#00ffff',
      'default': '#6b7280'
    };
    return colors[type] || colors.default;
  };

  // Fonction pour tester la connexion
  const testConnection = async () => {
    try {
      setMessage("🔄 TEST DE CONNEXION EN COURS...");
      const res = await axios.get("http://localhost:8000/");
      setMessage("✅ CONNEXION SERVEUR RÉUSSIE");
      console.log("✅ Serveur accessible:", res.data);
    } catch (err) {
      setMessage("❌ SERVEUR INACCESSIBLE - DÉMARREZ LE BACKEND FASTAPI");
      console.error("❌ Serveur inaccessible:", err);
    }
  };

  // Fonction pour créer des données de démonstration
  const createDemoData = async () => {
    try {
      setLoading(true);
      setMessage("🔄 CRÉATION DES DONNÉES DE DÉMONSTRATION...");
      
      // Créer quelques stations de démonstration
      const demoStations = [
        {
          id: "STATION_DEMO_001",
          type_connecteur: "Type2",
          puissanceMax: 22.0,
          disponible: true
        },
        {
          id: "STATION_DEMO_002", 
          type_connecteur: "CCS",
          puissanceMax: 50.0,
          disponible: true
        }
      ];
      
      for (const station of demoStations) {
        await axios.post("http://localhost:8000/add_station_recharge/", station);
      }
      
      setMessage("✅ DONNÉES DE DÉMONSTRATION CRÉÉES AVEC SUCCÈS");
      setTimeout(() => {
        fetchStations();
      }, 1000);
      
    } catch (err) {
      setMessage("❌ ERREUR LORS DE LA CRÉATION DES DONNÉES DE DÉMO");
      console.error("Erreur démo:", err);
    } finally {
      setLoading(false);
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
                <span style={styles.titleIcon}>⚡</span>
                RÉSEAU DE RECHARGE ÉNERGÉTIQUE
              </h1>
              <p style={styles.subtitle}>
                SYSTÈME DE GESTION DES STATIONS DE RECHARGE INTELLIGENTES
              </p>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>{stations.length}</span>
                <span style={styles.statLabel}>STATIONS ACTIVES</span>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>{reseauxRecharge.length}</span>
                <span style={styles.statLabel}>CONNEXIONS</span>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>{vehicules.length}</span>
                <span style={styles.statLabel}>UNITÉS MOBILES</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message système */}
        {message && (
          <div
            style={{
              ...styles.message,
              ...(message.startsWith("✅") ? styles.successMessage : 
                  message.startsWith("❌") ? styles.errorMessage : styles.warningMessage)
            }}
          >
            <div style={styles.messageContent}>
              <div style={styles.messageIcon}>
                {message.startsWith("✅") ? "⚡" : 
                 message.startsWith("❌") ? "⚠️" : "🔧"}
              </div>
              <div style={styles.messageText}>
                <div style={styles.messageTitle}>
                  {message.startsWith("✅") ? "SYNCHRONISATION RÉUSSIE" : 
                   message.startsWith("❌") ? "ALERTE SYSTÈME" : "AVERTISSEMENT"}
                </div>
                <div>{message.replace("✅ ", "").replace("❌ ", "").replace("⚠️ ", "")}</div>
              </div>
            </div>
            <div style={styles.messagePulse}></div>
          </div>
        )}

        {/* Boutons pour afficher les formulaires */}
        <div style={styles.buttonsContainer}>
          {!showStationForm && (
            <button 
              onClick={() => setShowStationForm(true)}
              style={styles.addButton}
            >
              <div style={styles.buttonContent}>
                <span style={styles.buttonIcon}>🔌</span>
                <span>AJOUTER UNE STATION</span>
              </div>
              <div style={styles.buttonGlow}></div>
            </button>
          )}

          {!showLinkForm && (
            <button 
              onClick={() => setShowLinkForm(true)}
              style={styles.addButton}
            >
              <div style={styles.buttonContent}>
                <span style={styles.buttonIcon}>🔗</span>
                <span>CRÉER UNE LIAISON</span>
              </div>
              <div style={styles.buttonGlow}></div>
            </button>
          )}

          {/* Boutons utilitaires */}
          <div style={styles.utilityButtons}>
            <button 
              onClick={testConnection}
              style={styles.testButton}
            >
              <div style={styles.buttonContent}>
                <span style={styles.buttonIcon}>🔍</span>
                <span>TEST CONNEXION</span>
              </div>
            </button>

            <button 
              onClick={createDemoData}
              style={styles.demoButton}
              disabled={loading}
            >
              <div style={styles.buttonContent}>
                <span style={styles.buttonIcon}>🎮</span>
                <span>DONNÉES DÉMO</span>
              </div>
            </button>
          </div>
        </div>

        {/* Formulaire ajout station (conditionnel) */}
        {showStationForm && (
          <div style={styles.formCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>➕ INITIER UNE NOUVELLE STATION</h3>
              <div style={styles.formActionsTop}>
                <button 
                  type="button"
                  onClick={() => setShowStationForm(false)}
                  style={styles.closeButton}
                >
                  <span style={styles.buttonIcon}>✕</span>
                  <span>FERMER</span>
                </button>
              </div>
            </div>
            <form onSubmit={addStation}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    IDENTIFIANT UNIQUE
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="STATION_RECHARGE_001"
                      value={stationForm.id}
                      onChange={(e) => handleStationInputChange("id", e.target.value)}
                      style={styles.input}
                      required
                    />
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    TYPE DE CONNECTEUR
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <select
                      value={stationForm.type_connecteur}
                      onChange={(e) => handleStationInputChange("type_connecteur", e.target.value)}
                      style={styles.select}
                      required
                    >
                      {connecteurTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    PUISSANCE MAXIMALE (kW)
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="22.0"
                      value={stationForm.puissanceMax}
                      onChange={(e) => handleStationInputChange("puissanceMax", parseFloat(e.target.value))}
                      style={styles.input}
                      required
                    />
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    STATUT OPÉRATIONNEL
                  </label>
                  <div style={styles.inputContainer}>
                    <select
                      value={stationForm.disponible}
                      onChange={(e) => handleStationInputChange("disponible", e.target.value === "true")}
                      style={styles.select}
                    >
                      <option value={true}>🟢 STATION OPÉRATIONNELLE</option>
                      <option value={false}>🔴 STATION HORS SERVICE</option>
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
                      <span style={styles.buttonIcon}>⚡</span>
                      <span>ACTIVER LA STATION</span>
                    </div>
                  )}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setStationForm({ 
                    id: "", 
                    type_connecteur: "Type2", 
                    puissanceMax: 22.0, 
                    disponible: true 
                  })}
                  style={styles.secondaryButton}
                >
                  <span style={styles.buttonIcon}>🔄</span>
                  <span>RÉINITIALISER</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Formulaire ajout relation véhicule -> station (conditionnel) */}
        {showLinkForm && (
          <div style={styles.formCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>🔗 ÉTABLIR UNE LIAISON VÉHICULE → STATION</h3>
              <div style={styles.formActionsTop}>
                <button 
                  type="button"
                  onClick={() => setShowLinkForm(false)}
                  style={styles.closeButton}
                >
                  <span style={styles.buttonIcon}>✕</span>
                  <span>FERMER</span>
                </button>
              </div>
            </div>
            <form onSubmit={addReseauRecharge}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    VÉHICULE
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <select
                      value={linkForm.vehicule_id}
                      onChange={(e) => handleLinkInputChange("vehicule_id", e.target.value)}
                      style={styles.select}
                      required
                    >
                      <option value="">SÉLECTIONNEZ UN VÉHICULE</option>
                      {vehicules.map((vehicule) => (
                        <option key={vehicule.id} value={vehicule.id}>
                          {vehicule.id} - {vehicule.marque} {vehicule.modele} ({vehicule.type})
                        </option>
                      ))}
                    </select>
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    STATION DE RECHARGE
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <select
                      value={linkForm.station_id}
                      onChange={(e) => handleLinkInputChange("station_id", e.target.value)}
                      style={styles.select}
                      required
                    >
                      <option value="">SÉLECTIONNEZ UNE STATION</option>
                      {stations.map((station) => (
                        <option key={station.id} value={station.id}>
                          {station.id} - {station.type_connecteur || 'Type2'} (22kW)
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
                      <span>ÉTABLIR LA LIAISON</span>
                    </div>
                  )}
                </button>
              </div>
              <div style={styles.formNote}>
                <span style={styles.noteIcon}>💡</span>
                <span>Cette fonctionnalité utilise l'IA pour créer la relation SPARQL</span>
              </div>
            </form>
          </div>
        )}

        {/* Liste des stations */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📋 RÉPERTOIRE DES STATIONS ({stations.length})</h3>
            <div style={styles.sectionActions}>
              <div style={styles.paginationInfo}>
                AFFICHAGE {Math.min(indexOfFirstStation + 1, stations.length)}-{Math.min(indexOfLastStation, stations.length)} SUR {stations.length}
              </div>
              <button 
                onClick={fetchStations}
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
                <p style={styles.loadingText}>CHARGEMENT DU RÉSEAU DE RECHARGE...</p>
              </div>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHead}>ID</th>
                        <th style={styles.tableHead}>TYPE</th>
                        <th style={styles.tableHead}>CONNECTEUR</th>
                        <th style={styles.tableHead}>PUISSANCE</th>
                        <th style={styles.tableHead}>STATUT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStations.map((station) => (
                        <tr 
                          key={station.id} 
                          style={styles.tableRow}
                        >
                          <td style={styles.tableCell}>
                            <span style={styles.stationId}>{station.id}</span>
                          </td>
                          <td style={styles.tableCell}>
                            <span 
                              style={{
                                ...styles.typeBadge,
                                backgroundColor: getStationColor(station.type),
                                boxShadow: `0 0 15px ${getStationColor(station.type)}`
                              }}
                            >
                              {getStationIcon(station.type)} {station.type || 'StationRecharge'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.connecteur}>
                              {station.type_connecteur || 'Type2'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.puissance}>
                              {(station.puissanceMax || 22.0)} kW
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span 
                              style={{
                                ...styles.statusBadge,
                                backgroundColor: station.disponible ? '#00ff88' : '#ff6b6b',
                                boxShadow: station.disponible ? '0 0 15px #00ff88' : '0 0 15px #ff6b6b'
                              }}
                            >
                              {station.disponible !== false ? '🟢 OPÉRATIONNEL' : '🔴 HORS SERVICE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {stations.length === 0 && (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>⚡</div>
                    <div style={styles.emptyText}>AUCUNE STATION DE RECHARGE DÉTECTÉE</div>
                    <div style={styles.emptySubtext}>
                      UTILISEZ LE BOUTON "DONNÉES DÉMO" POUR CRÉER DES STATIONS DE TEST
                    </div>
                  </div>
                )}

                {/* Pagination Stations */}
                {stations.length > 0 && (
                  <div style={styles.paginationContainer}>
                    <div style={styles.pagination}>
                      <button 
                        onClick={goToPreviousPageStations}
                        disabled={currentPageStations === 1}
                        style={{
                          ...styles.paginationButton,
                          ...(currentPageStations === 1 && styles.paginationButtonDisabled)
                        }}
                      >
                        <span style={styles.buttonIcon}>◀</span>
                        <span>PRÉCÉDENT</span>
                      </button>

                      <div style={styles.paginationNumbers}>
                        {Array.from({ length: totalPagesStations }, (_, i) => i + 1).map(number => (
                          <button
                            key={number}
                            onClick={() => paginateStations(number)}
                            style={{
                              ...styles.paginationNumber,
                              ...(currentPageStations === number && styles.paginationNumberActive)
                            }}
                          >
                            {number}
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={goToNextPageStations}
                        disabled={currentPageStations === totalPagesStations}
                        style={{
                          ...styles.paginationButton,
                          ...(currentPageStations === totalPagesStations && styles.paginationButtonDisabled)
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

        {/* Liste des relations véhicule -> station */}
<div style={styles.section}>
  <div style={styles.sectionHeader}>
    <h3 style={styles.sectionTitle}>🔗 LIAISONS VÉHICULE → STATION ({reseauxRecharge.length})</h3>
    <div style={styles.sectionActions}>
      <div style={styles.paginationInfo}>
        AFFICHAGE {Math.min(indexOfFirstRelation + 1, reseauxRecharge.length)}-{Math.min(indexOfLastRelation, reseauxRecharge.length)} SUR {reseauxRecharge.length}
      </div>
      <div style={styles.relationActions}>
        <button 
          onClick={refreshRelations}
          style={styles.refreshButton}
          disabled={loading}
          title="Rafraîchir les relations"
        >
          {loading ? (
            <div style={styles.buttonContent}>
              <div style={styles.smallSpinner}></div>
              <span>ACTUALISATION...</span>
            </div>
          ) : (
            <div style={styles.buttonContent}>
              <span style={styles.buttonIcon}>🔄</span>
              <span>ACTUALISER</span>
            </div>
          )}
        </button>
        
        {/* Bouton debug pour vérifier les relations */}
        <button 
          onClick={() => {
            console.log("🔍 Relations actuelles:", reseauxRecharge);
            setMessage("🔍 DONNÉES DES RELATIONS LOGGÉES DANS LA CONSOLE");
          }}
          style={styles.debugButton}
          title="Debug des relations"
        >
          <div style={styles.buttonContent}>
            <span style={styles.buttonIcon}>🐛</span>
            <span>DEBUG REL</span>
          </div>
        </button>
      </div>
    </div>
          </div>

          <div style={styles.tableCard}>
            <div style={styles.cardGlow}></div>
            {loading ? (
              <div style={styles.loadingState}>
                <div style={styles.quantumSpinner}></div>
                <p style={styles.loadingText}>CHARGEMENT DES LIAISONS RÉSEAU...</p>
              </div>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHead}>VÉHICULE</th>
                        <th style={styles.tableHead}>STATION DE RECHARGE</th>
                        <th style={styles.tableHead}>TYPE DE RELATION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRelations.map((relation, idx) => (
                        <tr 
                          key={idx} 
                          style={styles.tableRow}
                        >
                          <td style={styles.tableCell}>
                            <span style={styles.reseauBadge}>
                              {relation.vehicule || relation.reseau || relation.label || `VÉHICULE_${idx + 1}`}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.stationBadge}>
                              {relation.station || relation.label || `STATION_${idx + 1}`}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.relationType}>
                              {relation.type || 'utiliseStationRecharge'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {reseauxRecharge.length === 0 && (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🔗</div>
                    <div style={styles.emptyText}>AUCUNE LIAISON VÉHICULE-STATION DÉTECTÉE</div>
                    <div style={styles.emptySubtext}>
                      CRÉEZ DES STATIONS ET DES VÉHICULES POUR ÉTABLIR DES LIAISONS
                    </div>
                  </div>
                )}

                {/* Pagination Relations */}
                {reseauxRecharge.length > 0 && (
                  <div style={styles.paginationContainer}>
                    <div style={styles.pagination}>
                      <button 
                        onClick={goToPreviousPageRelations}
                        disabled={currentPageRelations === 1}
                        style={{
                          ...styles.paginationButton,
                          ...(currentPageRelations === 1 && styles.paginationButtonDisabled)
                        }}
                      >
                        <span style={styles.buttonIcon}>◀</span>
                        <span>PRÉCÉDENT</span>
                      </button>

                      <div style={styles.paginationNumbers}>
                        {Array.from({ length: totalPagesRelations }, (_, i) => i + 1).map(number => (
                          <button
                            key={number}
                            onClick={() => paginateRelations(number)}
                            style={{
                              ...styles.paginationNumber,
                              ...(currentPageRelations === number && styles.paginationNumberActive)
                            }}
                          >
                            {number}
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={goToNextPageRelations}
                        disabled={currentPageRelations === totalPagesRelations}
                        style={{
                          ...styles.paginationButton,
                          ...(currentPageRelations === totalPagesRelations && styles.paginationButtonDisabled)
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
    gap: '1rem',
    flexWrap: 'wrap'
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
  warningMessage: {
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    color: '#ffaa00',
    border: '1px solid rgba(255, 165, 0, 0.3)'
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
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap'
  },
  utilityButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  addButton: {
    background: 'linear-gradient(135deg, #00ff88, #00ffff)',
    color: '#0a0a0a',
    fontWeight: '700',
    padding: '1.5rem 2.5rem',
    borderRadius: '1rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 30px rgba(0, 255, 255, 0.4)',
    minWidth: '250px',
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
  testButton: {
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    color: '#ffaa00',
    fontWeight: '600',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255, 165, 0, 0.3)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px'
  },
  demoButton: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    color: '#9333ea',
    fontWeight: '600',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(147, 51, 234, 0.3)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px'
  },
  relationActions: {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center'
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
  formNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: 'rgba(255, 255, 0, 0.1)',
    borderRadius: '0.5rem',
    border: '1px solid rgba(255, 255, 0, 0.3)'
  },
  noteIcon: {
    fontSize: '1rem'
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
  stationId: {
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
    whiteSpace: 'nowrap',
    letterSpacing: '0.5px'
  },
  connecteur: {
    fontWeight: '500',
    color: '#88ffff',
    fontSize: '0.875rem'
  },
  puissance: {
    fontWeight: '600',
    color: '#00ff88',
    fontSize: '0.875rem'
  },
  statusBadge: {
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    whiteSpace: 'nowrap',
    letterSpacing: '0.5px'
  },
  reseauBadge: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    color: '#00ffff',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  stationBadge: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    color: '#00ff88',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  relationType: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    color: '#00ffff',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    letterSpacing: '0.5px',
    fontFamily: 'monospace'
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
    
    .utility-buttons {
      flex-direction: column;
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