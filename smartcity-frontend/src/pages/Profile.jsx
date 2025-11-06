import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [particles, setParticles] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    dateNaissance: "",
    genre: "",
    nationalite: "",
    languePreferee: "Français",
    niveauAbonnement: "Standard"
  });

  // Système de particules futuriste
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 2 + 1,
      delay: Math.random() * 10
    }));
    setParticles(newParticles);
  }, []);

  // Charger les données utilisateur
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        nom: parsedUser.nom || "",
        prenom: parsedUser.prenom || "",
        email: parsedUser.email || "",
        telephone: parsedUser.telephone || "",
        dateNaissance: parsedUser.dateNaissance || "",
        genre: parsedUser.genre || "",
        nationalite: parsedUser.nationalite || "",
        languePreferee: parsedUser.languePreferee || "Français",
        niveauAbonnement: parsedUser.niveauAbonnement || "Standard"
      });
      
      // Charger l'image de profil si elle existe
      if (parsedUser.profileImage) {
        setImagePreview(parsedUser.profileImage);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Gérer la sélection de fichier
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setError("Veuillez sélectionner une image valide");
        return;
      }

      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }

      setProfileImage(file);
      
      // Créer un preview de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Uploader l'image
  const handleImageUpload = async () => {
    if (!profileImage) return;

    setUploading(true);
    setError("");

    try {
      // Simulation d'upload - À REMPLACER par votre API réelle
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Générer une URL simulée pour l'image
      const imageUrl = imagePreview;
      
      // Mettre à jour l'utilisateur avec la nouvelle image
      const updatedUser = { 
        ...user, 
        profileImage: imageUrl 
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setProfileImage(null);
      
      setSuccess("✅ Image de profil mise à jour avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Erreur lors du téléchargement de l'image");
    } finally {
      setUploading(false);
    }
  };

  // Supprimer l'image de profil
  const handleRemoveImage = () => {
    const updatedUser = { ...user };
    delete updatedUser.profileImage;
    
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setImagePreview(null);
    setProfileImage(null);
    
    setSuccess("✅ Image de profil supprimée avec succès !");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simulation de mise à jour - à remplacer par votre API
      const updatedUser = { ...user, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setSuccess("✅ Profil mis à jour avec succès !");
      setEditMode(false);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: user.nom || "",
      prenom: user.prenom || "",
      email: user.email || "",
      telephone: user.telephone || "",
      dateNaissance: user.dateNaissance || "",
      genre: user.genre || "",
      nationalite: user.nationalite || "",
      languePreferee: user.languePreferee || "Français",
      niveauAbonnement: user.niveauAbonnement || "Standard"
    });
    setEditMode(false);
    setError("");
  };

  const getAbonnementColor = (niveau) => {
    switch(niveau) {
      case "Premium": return "#00ff88";
      case "Étudiant": return "#ffd93d";
      case "Famille": return "#8b5cf6";
      default: return "#00ffff";
    }
  };

  const getStatusColor = () => {
    return user?.isActive ? "#00ff88" : "#ff6b6b";
  };

  return (
    <div style={styles.container} ref={containerRef}>
      {/* Arrière-plan cybernétique */}
      <div style={styles.cyberBackground}>
        {particles.map(particle => (
          <div
            key={particle.id}
            style={{
              ...styles.floatingOrb,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.speed * 10}s`
            }}
          />
        ))}
      </div>

      <div style={styles.mainContent}>
        {/* En-tête */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>
              <span style={styles.titleMain}>PROFIL UTILISATEUR</span>
              <span style={styles.titleSub}>Gestion de votre identité numérique</span>
            </h1>
          </div>
         
        </header>

        {/* Alertes */}
        {error && (
          <div style={styles.errorAlert}>
            <div style={styles.alertContent}>
              <span style={styles.alertIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            <div style={styles.alertContent}>
              <span style={styles.alertIcon}>✅</span>
              <span>{success}</span>
            </div>
          </div>
        )}

        <div style={styles.profileGrid}>
          {/* Carte de profil */}
          <div style={styles.profileCard}>
            <div style={styles.cardHeader}>
              <div style={styles.avatarSection}>
                <div style={styles.avatarContainer}>
                  <div 
                    style={styles.avatar}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Profile" 
                        style={styles.avatarImage}
                      />
                    ) : (
                      <span style={styles.avatarIcon}>👤</span>
                    )}
                    <div style={styles.statusIndicator}></div>
                    <div style={styles.avatarOverlay}>
                      <span style={styles.uploadIcon}>📷</span>
                    </div>
                  </div>
                  
                  {/* Input fichier caché */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    style={styles.fileInput}
                  />
                  
                  {/* Boutons d'action pour l'image */}
                  {(profileImage || imagePreview) && (
                    <div style={styles.imageActions}>
                      {profileImage && (
                        <button 
                          style={styles.uploadButton}
                          onClick={handleImageUpload}
                          disabled={uploading}
                        >
                          {uploading ? "📤 UPLOAD..." : "💾 SAUVEGARDER"}
                        </button>
                      )}
                      {(imagePreview && !profileImage) && (
                        <button 
                          style={styles.removeImageButton}
                          onClick={handleRemoveImage}
                        >
                          🗑 SUPPRIMER
                        </button>
                      )}
                      {profileImage && (
                        <button 
                          style={styles.cancelImageButton}
                          onClick={() => {
                            setProfileImage(null);
                            setImagePreview(user?.profileImage || null);
                          }}
                        >
                          ❌ ANNULER
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                <div style={styles.avatarInfo}>
                  <h2 style={styles.userName}>
                    {user?.prenom} {user?.nom}
                  </h2>
                  <div style={styles.userEmail}>{user?.email}</div>
                  <div style={styles.imageHint}>
                    Cliquez sur l'avatar pour modifier
                  </div>
                </div>
              </div>
              
              <div style={styles.badgeSection}>
                <div 
                  style={{
                    ...styles.abonnementBadge,
                    backgroundColor: getAbonnementColor(user?.niveauAbonnement)
                  }}
                >
                  {user?.niveauAbonnement || "STANDARD"}
                </div>
                <div 
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor()
                  }}
                >
                  {user?.isActive ? "ACTIF" : "INACTIF"}
                </div>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>0</div>
                <div style={styles.statLabel}>TRAJETS</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>0</div>
                <div style={styles.statLabel}>POINTS</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>0</div>
                <div style={styles.statLabel}>BADGES</div>
              </div>
            </div>

            <div style={styles.actionButtons}>
              <button 
                style={styles.primaryButton}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? "ANNULER" : "MODIFIER LE PROFIL"}
              </button>
              <button style={styles.secondaryButton}>
                CHANGER MOT DE PASSE
              </button>
            </div>
          </div>

          {/* Formulaire d'édition */}
          <div style={styles.formSection}>
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>
                {editMode ? "ÉDITION DU PROFIL" : "INFORMATIONS PERSONNELLES"}
              </h3>

              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelText}>PRÉNOM</span>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        style={styles.input}
                        disabled={!editMode}
                      />
                    </label>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelText}>NOM</span>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        style={styles.input}
                        disabled={!editMode}
                      />
                    </label>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <span style={styles.labelText}>EMAIL</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={styles.input}
                      disabled={!editMode}
                    />
                  </label>
                </div>

                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelText}>TÉLÉPHONE</span>
                      <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        style={styles.input}
                        disabled={!editMode}
                      />
                    </label>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelText}>DATE DE NAISSANCE</span>
                      <input
                        type="date"
                        name="dateNaissance"
                        value={formData.dateNaissance}
                        onChange={handleChange}
                        style={styles.input}
                        disabled={!editMode}
                      />
                    </label>
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelText}>GENRE</span>
                      <select
                        name="genre"
                        value={formData.genre}
                        onChange={handleChange}
                        style={styles.input}
                        disabled={!editMode}
                      >
                        <option value="">Sélectionnez</option>
                        <option value="Masculin">Masculin</option>
                        <option value="Féminin">Féminin</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </label>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelText}>LANGUE</span>
                      <select
                        name="languePreferee"
                        value={formData.languePreferee}
                        onChange={handleChange}
                        style={styles.input}
                        disabled={!editMode}
                      >
                        <option value="Français">Français</option>
                        <option value="Anglais">Anglais</option>
                        <option value="Espagnol">Espagnol</option>
                        <option value="Arabe">Arabe</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelText}>NATIONALITÉ</span>
                      <input
                        type="text"
                        name="nationalite"
                        value={formData.nationalite}
                        onChange={handleChange}
                        style={styles.input}
                        disabled={!editMode}
                      />
                    </label>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      <span style={styles.labelText}>ABONNEMENT</span>
                      <select
                        name="niveauAbonnement"
                        value={formData.niveauAbonnement}
                        onChange={handleChange}
                        style={styles.input}
                        disabled={!editMode}
                      >
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                        <option value="Étudiant">Étudiant</option>
                        <option value="Famille">Famille</option>
                      </select>
                    </label>
                  </div>
                </div>

                {editMode && (
                  <div style={styles.formActions}>
                    <button 
                      type="submit" 
                      style={styles.submitButton}
                      disabled={loading}
                    >
                      {loading ? "MISE À JOUR..." : "SAUVEGARDER"}
                    </button>
                    <button 
                      type="button" 
                      style={styles.cancelButton}
                      onClick={handleCancel}
                    >
                      ANNULER
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Section sécurité */}
            <div style={styles.securityCard}>
              <h3 style={styles.formTitle}>SÉCURITÉ</h3>
              <div style={styles.securityList}>
                <div style={styles.securityItem}>
                  <span style={styles.securityIcon}>🔐</span>
                  <div style={styles.securityInfo}>
                    <div style={styles.securityTitle}>Mot de passe</div>
                    <div style={styles.securityDesc}>Dernière modification: Jamais</div>
                  </div>
                  <button style={styles.securityAction}>
                    MODIFIER
                  </button>
                </div>
                
                <div style={styles.securityItem}>
                  <span style={styles.securityIcon}>📧</span>
                  <div style={styles.securityInfo}>
                    <div style={styles.securityTitle}>Vérification email</div>
                    <div style={styles.securityDesc}>Status: Vérifié</div>
                  </div>
                  <button style={styles.securityAction}>
                    RÉVÉRIFIER
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true" global="true">{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-10px) rotate(180deg);
            opacity: 0.7;
          }
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: scale(1.1);
            opacity: 1;
          }
        }

        .avatar:hover .avatar-overlay {
          opacity: 1;
        }
        
        .avatar:hover {
          transform: scale(1.05);
          border-color: #00ffff;
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        }
        
        .upload-button:hover {
          background-color: rgba(0, 255, 136, 0.3) !important;
          transform: translateY(-1px);
        }
        
        .cancel-image-button:hover,
        .remove-image-button:hover {
          background-color: rgba(255, 107, 107, 0.3) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0a0a0a",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
    color: "#ffffff",
    fontFamily: "'Orbitron', 'Rajdhani', monospace",
    padding: "2rem",
    position: "relative",
    overflow: "hidden"
  },
  cyberBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0
  },
  floatingOrb: {
    position: "absolute",
    width: "3px",
    height: "3px",
    backgroundColor: "#00ffff",
    borderRadius: "50%",
    animation: "float 15s ease-in-out infinite",
    boxShadow: "0 0 8px #00ffff"
  },
  mainContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1200px",
    margin: "0 auto"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2rem"
  },
  headerLeft: {
    flex: 1
  },
  title: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },
  titleMain: {
    fontSize: "2.5rem",
    fontWeight: "900",
    background: "linear-gradient(135deg, #ffffff, #00ffff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "2px"
  },
  titleSub: {
    fontSize: "1.1rem",
    color: "#88ffff",
    fontWeight: "300",
    letterSpacing: "1px"
  },
  headerRight: {
    display: "flex",
    gap: "1rem"
  },
  backButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "rgba(0, 255, 255, 0.1)",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    borderRadius: "0.75rem",
    color: "#00ffff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
    transition: "all 0.3s ease"
  },
  errorAlert: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    color: "#ff6b6b",
    padding: "1rem 1.5rem",
    borderRadius: "1rem",
    marginBottom: "2rem",
    border: "1px solid rgba(255, 0, 0, 0.3)"
  },
  successAlert: {
    backgroundColor: "rgba(0, 255, 0, 0.1)",
    color: "#6bcf7f",
    padding: "1rem 1.5rem",
    borderRadius: "1rem",
    marginBottom: "2rem",
    border: "1px solid rgba(0, 255, 0, 0.3)"
  },
  alertContent: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem"
  },
  alertIcon: {
    fontSize: "1.2rem"
  },
  profileGrid: {
    display: "grid",
    gridTemplateColumns: "350px 1fr",
    gap: "2rem",
    alignItems: "start"
  },
  profileCard: {
    backgroundColor: "rgba(10, 15, 35, 0.8)",
    padding: "2rem",
    borderRadius: "1.5rem",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
  },
  cardHeader: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    marginBottom: "2rem"
  },
  avatarSection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem"
  },
  avatarContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem"
  },
  avatar: {
    position: "relative",
    width: "80px",
    height: "80px",
    backgroundColor: "rgba(0, 255, 255, 0.2)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    overflow: "hidden",
    transition: "all 0.3s ease",
    border: "2px solid rgba(0, 255, 255, 0.5)"
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%"
  },
  avatarIcon: {
    fontSize: "2.5rem"
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.3s ease",
    borderRadius: "50%"
  },
  uploadIcon: {
    fontSize: "1.5rem"
  },
  statusIndicator: {
    position: "absolute",
    bottom: "5px",
    right: "5px",
    width: "15px",
    height: "15px",
    backgroundColor: "#00ff88",
    borderRadius: "50%",
    border: "2px solid #0a0a0a",
    zIndex: 2
  },
  fileInput: {
    display: "none"
  },
  imageActions: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    width: "100%"
  },
  uploadButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "rgba(0, 255, 136, 0.2)",
    border: "1px solid rgba(0, 255, 136, 0.5)",
    borderRadius: "0.5rem",
    color: "#00ff88",
    cursor: "pointer",
    fontSize: "0.7rem",
    fontWeight: "600",
    transition: "all 0.3s ease"
  },
  cancelImageButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    border: "1px solid rgba(255, 107, 107, 0.5)",
    borderRadius: "0.5rem",
    color: "#ff6b6b",
    cursor: "pointer",
    fontSize: "0.7rem",
    fontWeight: "600",
    transition: "all 0.3s ease"
  },
  removeImageButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    border: "1px solid rgba(255, 107, 107, 0.5)",
    borderRadius: "0.5rem",
    color: "#ff6b6b",
    cursor: "pointer",
    fontSize: "0.7rem",
    fontWeight: "600",
    transition: "all 0.3s ease"
  },
  avatarInfo: {
    flex: 1
  },
  userName: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "0.25rem",
    color: "#ffffff"
  },
  userEmail: {
    color: "#88ffff",
    fontSize: "0.9rem"
  },
  imageHint: {
    fontSize: "0.7rem",
    color: "#88ffff",
    marginTop: "0.5rem",
    fontStyle: "italic"
  },
  badgeSection: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap"
  },
  abonnementBadge: {
    padding: "0.5rem 1rem",
    borderRadius: "2rem",
    fontSize: "0.8rem",
    fontWeight: "700",
    color: "#0a0a0a"
  },
  statusBadge: {
    padding: "0.5rem 1rem",
    borderRadius: "2rem",
    fontSize: "0.8rem",
    fontWeight: "700",
    color: "#0a0a0a"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginBottom: "2rem"
  },
  statItem: {
    textAlign: "center",
    padding: "1rem",
    backgroundColor: "rgba(0, 255, 255, 0.05)",
    borderRadius: "1rem",
    border: "1px solid rgba(0, 255, 255, 0.2)"
  },
  statNumber: {
    fontSize: "1.5rem",
    fontWeight: "900",
    color: "#00ffff",
    marginBottom: "0.25rem"
  },
  statLabel: {
    fontSize: "0.7rem",
    color: "#88ffff",
    fontWeight: "600",
    letterSpacing: "1px"
  },
  actionButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  },
  primaryButton: {
    padding: "1rem 1.5rem",
    background: "linear-gradient(135deg, #00ffff, #0099ff)",
    border: "none",
    borderRadius: "1rem",
    color: "#0a0a0a",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "0.9rem",
    transition: "all 0.3s ease"
  },
  secondaryButton: {
    padding: "1rem 1.5rem",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "1rem",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
    transition: "all 0.3s ease"
  },
  formSection: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem"
  },
  formCard: {
    backgroundColor: "rgba(10, 15, 35, 0.8)",
    padding: "2rem",
    borderRadius: "1.5rem",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    backdropFilter: "blur(10px)"
  },
  formTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#00ffff",
    marginBottom: "1.5rem",
    letterSpacing: "1px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },
  labelText: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#88ffff",
    letterSpacing: "1px"
  },
  input: {
    padding: "1rem 1.25rem",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    borderRadius: "1rem",
    fontSize: "1rem",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    color: "#ffffff",
    transition: "all 0.3s ease",
    outline: "none"
  },
  formActions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
    marginTop: "1rem"
  },
  submitButton: {
    padding: "1rem 2rem",
    background: "linear-gradient(135deg, #00ff88, #00ffff)",
    border: "none",
    borderRadius: "1rem",
    color: "#0a0a0a",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "0.9rem"
  },
  cancelButton: {
    padding: "1rem 2rem",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "1rem",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem"
  },
  securityCard: {
    backgroundColor: "rgba(10, 15, 35, 0.8)",
    padding: "2rem",
    borderRadius: "1.5rem",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    backdropFilter: "blur(10px)"
  },
  securityList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  },
  securityItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1.5rem",
    backgroundColor: "rgba(0, 255, 255, 0.05)",
    borderRadius: "1rem",
    border: "1px solid rgba(0, 255, 255, 0.2)"
  },
  securityIcon: {
    fontSize: "1.5rem"
  },
  securityInfo: {
    flex: 1
  },
  securityTitle: {
    fontWeight: "600",
    marginBottom: "0.25rem"
  },
  securityDesc: {
    fontSize: "0.8rem",
    color: "#88ffff"
  },
  securityAction: {
    padding: "0.5rem 1rem",
    backgroundColor: "rgba(0, 255, 255, 0.1)",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    borderRadius: "0.5rem",
    color: "#00ffff",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "600"
  }
};