import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [loading, setLoading] = useState(true);
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

  // Menu items pour les utilisateurs simples - AUCUN ACCÈS
  const userMenuItems = [
    // Les users normaux n'ont plus accès à l'application
  ];

  // Menu items réservés aux admins
  const adminMenuItems = [
    { path: "/app", icon: "🏠", label: "DASHBOARD", role: "admin" },
    { path: "/app/users", icon: "👤", label: "UTILISATEURS", role: "admin" },
    { path: "/app/transports", icon: "🚆", label: "RÉSEAUX", role: "admin" },
    { path: "/app/events", icon: "📅", label: "ÉVÉNEMENTS", role: "admin" },
    { path: "/app/infrastructures", icon: "🏗", label: "INFRASTRUCTURES", role: "admin" },
    { path: "/app/avis", icon: "💬", label: "AVIS", role: "admin" },
    { path: "/app/recharge", icon: "⚡", label: "RECHARGE", role: "admin" },
    { path: "/app/tickets", icon: "🎫", label: "TICKETS", role: "admin" },
    { path: "/app/smartcitiespage", icon: "🏙", label: "SMARTCITY", role: "admin" },
    { path: "/app/trajetspage", icon: "🛣", label: "TRAJETS", role: "admin" },
    { path: "/app/statistiques", icon: "📊", label: "STATISTIQUES", role: "admin" },
    { path: "/app/ai", icon: "🧠", label: "INTELLIGENCE ARTIFICIELLE", role: "admin" }
  ];

  // Menu items combinés selon le rôle
  const getMenuItems = () => {
    if (userRole === "admin") {
      return adminMenuItems;
    }
    return userMenuItems; // Retourne tableau vide pour les users simples
  };

  const menuItems = getMenuItems();

  // Vérifier l'authentification et le rôle - AVEC STOCKAGE DU RÔLE
  useEffect(() => {
    const checkAuthAndRole = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (token && userData) {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        
        try {
          // Vérifier le rôle de l'utilisateur
          const response = await axios.get(`http://localhost:8000/auth/user-role/${userObj.email}`);
          const role = response.data.role;
          setUserRole(role);
          
          // STOCKER LE RÔLE DANS LOCALSTORAGE POUR UN ACCÈS IMMÉDIAT
          localStorage.setItem("userRole", role);
          
          // Rediriger les users simples vers la HOME s'ils essaient d'accéder à une page admin
          if (role === "user") {
            console.log("Utilisateur normal détecté, redirection vers la home page");
            navigate("/", { replace: true });
            return;
          }
        } catch (error) {
          console.error("Erreur de vérification du rôle:", error);
          const defaultRole = "user";
          setUserRole(defaultRole);
          localStorage.setItem("userRole", defaultRole);
          
          // Rediriger vers home en cas d'erreur aussi
          navigate("/", { replace: true });
        }
      } else {
        console.log("Utilisateur non connecté, redirection vers /signin");
        navigate("/signin", { replace: true });
      }
      setLoading(false);
    };

    checkAuthAndRole();
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole"); // NETTOYER LE RÔLE AUSSI
    setUser(null);
    setUserRole("user");
    navigate("/signin");
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const isAdmin = userRole === "admin";

  // Vérifier si l'utilisateur actuel a accès à la page courante
  const hasAccessToCurrentPage = () => {
    if (isAdmin) return true; // Les admins ont accès à tout
    
    // Les users simples n'ont accès à AUCUNE page de l'app
    return false;
  };

  if (loading) {
    return (
      <div style={loadingStyles.container}>
        <div style={loadingStyles.neuralNetwork}>
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              style={{
                ...loadingStyles.neuralParticle,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>
        <div style={loadingStyles.content}>
          <div style={loadingStyles.quantumSpinner}></div>
          <p style={loadingStyles.text}>CHARGEMENT DU SYSTÈME...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas admin, ne rien afficher (sera redirigé)
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Réseau neuronal cybernétique en arrière-plan */}
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

      {/* Sidebar cybernétique */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarGlow}></div>
        
        <div style={styles.logo}>
          <div style={styles.logoOrb}>
            <div style={styles.orbGlow}></div>
            <span style={styles.logoIcon}>⚡</span>
          </div>
          <div style={styles.logoTextContainer}>
            <span style={styles.logoText}>smart city</span>
            <span style={styles.logoSubtext}>
              {isAdmin ? "CONTROL PANEL" : "ACCÈS RESTREINT"}
            </span>
          </div>
        </div>
        
        {/* Badge de rôle */}
        <div style={styles.roleBadgeContainer}>
          <div style={{
            ...styles.roleBadge,
            ...(isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeUser)
          }}>
            {isAdmin ? "🚀 ADMIN" : "⛔ ACCÈS REFUSÉ"}
          </div>
        </div>
        
        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navLink,
                ...(isActiveLink(item.path) ? styles.navLinkActive : {})
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
              {isActiveLink(item.path) && <div style={styles.activeIndicator}></div>}
            </Link>
          ))}
        </nav>
        
        {/* Indicateur de permissions - Uniquement pour les admins */}
        <div style={styles.permissionsPanel}>
          <div style={styles.permissionsHeader}>PERMISSIONS ACTUELLES</div>
          <div style={styles.permissionsList}>
            {isAdmin ? (
              <>
                <div style={styles.permissionItem}>
                  <span style={styles.permissionIcon}>✅</span>
                  <span>Accès complet au système</span>
                </div>
                <div style={styles.permissionItem}>
                  <span style={styles.permissionIcon}>🔓</span>
                  <span>Toutes les fonctionnalités</span>
                </div>
                <div style={styles.permissionItem}>
                  <span style={styles.permissionIcon}>⚡</span>
                  <span>Privilèges administrateur</span>
                </div>
              </>
            ) : (
              <>
                <div style={styles.permissionItem}>
                  <span style={styles.permissionIcon}>⛔</span>
                  <span>Accès réservé aux administrateurs</span>
                </div>
                <div style={styles.permissionItem}>
                  <span style={styles.permissionIcon}>🔒</span>
                  <span>Fonctionnalités restreintes</span>
                </div>
                <div style={styles.permissionItem}>
                  <span style={styles.permissionIcon}>🏠</span>
                  <span>Redirection vers l'accueil</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div style={styles.sidebarFooter}>
          {user && (
            <div style={styles.userInfoSidebar}>
              <div style={styles.userAvatarSidebar}>
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt="Profile" 
                    style={styles.avatarImageSidebar}
                  />
                ) : (
                  <span style={styles.avatarIconSidebar}>👤</span>
                )}
                <div style={styles.avatarGlow}></div>
              </div>
              <div style={styles.userDetailsSidebar}>
                <div style={styles.userNameSidebar}>{user.prenom} {user.nom}</div>
                <div style={styles.userEmailSidebar}>{user.email}</div>
                <div style={styles.userStatus}>
                  <div style={styles.statusIndicator}></div>
                  <span style={styles.statusText}>
                    {isAdmin ? "ADMIN CONNECTÉ" : "ACCÈS REFUSÉ"}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} style={styles.logoutButton} title="Déconnexion">
                <span style={styles.logoutIcon}>🚪</span>
              </button>
            </div>
          )}
          <div style={styles.version}>NEXUS OS v2.4.1</div>
        </div>
      </aside>

      {/* Main content */}
      <div style={styles.mainContent}>
        {/* Header holographique */}
        <header style={styles.header}>
          <div style={styles.headerGlow}></div>
          
          <div style={styles.headerLeft}>
            <h1 style={styles.headerTitle}>
              {menuItems.find(item => item.path === location.pathname)?.label || 'DASHBOARD ADMIN'}
            </h1>
            <div style={styles.breadcrumb}>
              <span style={styles.breadcrumbText}>
                {isAdmin ? "SYSTÈME NEXUS ADMIN / " : "ACCÈS RESTREINT / "}
              </span>
              <span style={styles.breadcrumbCurrent}>
                {menuItems.find(item => item.path === location.pathname)?.label || 'TABLEAU DE BORD'}
              </span>
            </div>
          </div>
          
          <div style={styles.headerRight}>
            {user && (
              <div style={styles.userInfo}>
                <div style={styles.userAvatar}>
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt="Profile" 
                      style={styles.avatarImage}
                    />
                  ) : (
                    <span style={styles.avatarText}>
                      {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                    </span>
                  )}
                  <div style={styles.avatarPulse}></div>
                </div>
                <div style={styles.userDetails}>
                  <div style={styles.userName}>{user.prenom} {user.nom}</div>
                  <div style={styles.userRole}>
                    {isAdmin ? 'ADMINISTRATEUR SYSTÈME' : 'ACCÈS NON AUTORISÉ'}
                  </div>
                </div>
                <div style={styles.headerActions}>
                  {isAdmin && (
                    <button style={styles.notificationButton}>
                      <span style={styles.notificationIcon}>🔔</span>
                      <div style={styles.notificationBadge}>3</div>
                    </button>
                  )}
                  <button onClick={handleLogout} style={styles.logoutButtonHeader}>
                    <span style={styles.logoutIconHeader}>⏻</span>
                    <span>DÉCONNEXION</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main style={styles.main}>
          <div style={styles.contentWrapper}>
            {/* Protection pour les users simples - NE DOIT JAMAIS S'AFFICHER CAR REDIRIGÉS PLUS TÔT */}
            {!hasAccessToCurrentPage() ? (
              <div style={styles.accessDenied}>
                <div style={styles.accessDeniedIcon}>⛔</div>
                <h2 style={styles.accessDeniedTitle}>ACCÈS RESTREINT</h2>
                <p style={styles.accessDeniedText}>
                  Cette fonctionnalité est réservée aux administrateurs du système.
                  <br />Votre accès est limité aux fonctionnalités publiques.
                </p>
                <button 
                  onClick={() => navigate("/")}
                  style={styles.accessDeniedButton}
                >
                  RETOURNER À L'ACCUEIL
                </button>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </main>

        {/* Footer cybernétique */}
        <footer style={styles.footer}>
          <div style={styles.footerGlow}></div>
          <div style={styles.footerContent}>
            <div style={styles.footerText}>
              © 2025 NEXUS URBAN INTELLIGENCE NETWORK. {isAdmin ? "ACCÈS ADMIN COMPLET" : "ACCÈS RESTREINT"}
            </div>
            <div style={styles.footerLinks}>
              <span style={styles.footerLink}>PROTOCOLE DE CONFIDENTIALITÉ</span>
              <span style={styles.footerLink}>CONDITIONS D'UTILISATION</span>
              <span style={styles.footerLink}>SUPPORT TECHNIQUE</span>
            </div>
            <div style={styles.securityBadge}>
              <span style={styles.securityIcon}>🛡️</span>
              <span style={styles.securityText}>
                {isAdmin ? "SYSTÈME CERTIFIÉ ISO-27001" : "ACCÈS SÉCURISÉ"}
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Styles CSS globaux */}
      <style jsx global>{`
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
            boxShadow: 0 0 20px #00ffff;
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        @keyframes slideIn {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
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
      `}</style>
    </div>
  );
}

// Styles complets (inchangés)
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    color: '#ffffff',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    position: 'relative',
    overflow: 'hidden'
  },
  neuralNetwork: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1
  },
  neuralParticle: {
    position: 'absolute',
    backgroundColor: '#00ffff',
    borderRadius: '50%',
    animation: 'neuralFloat 10s ease-in-out infinite',
    boxShadow: '0 0 8px #00ffff, 0 0 16px #00ffff'
  },
  dataStream: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none'
  },
  dataLine: {
    position: 'absolute',
    width: '1px',
    height: '100%',
    background: 'linear-gradient(to bottom, transparent, #00ffff, transparent)',
    animation: 'dataFlow 3s linear infinite',
    opacity: 0.3
  },
  sidebar: {
    width: '280px',
    background: 'rgba(10, 15, 30, 0.9)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(0, 255, 255, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 2,
    boxShadow: '0 0 30px rgba(0, 255, 255, 0.1)'
  },
  sidebarGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, #00ffff, #ff00ff)',
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
  },
  logo: {
    padding: '2rem 1.5rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    borderBottom: '1px solid rgba(0, 255, 255, 0.1)'
  },
  logoOrb: {
    position: 'relative',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
  },
  orbGlow: {
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
    filter: 'blur(8px)',
    opacity: 0.6,
    animation: 'pulse 2s ease-in-out infinite'
  },
  logoIcon: {
    fontSize: '1.5rem',
    zIndex: 1
  },
  logoTextContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  logoText: {
    fontSize: '1.2rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '1px'
  },
  logoSubtext: {
    fontSize: '0.7rem',
    color: '#88ffff',
    fontWeight: '300',
    letterSpacing: '2px',
    marginTop: '0.2rem'
  },
  roleBadgeContainer: {
    padding: '0 1.5rem 1rem 1.5rem',
  },
  roleBadge: {
    padding: '0.4rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
    textAlign: 'center',
    border: '1px solid',
    backdropFilter: 'blur(10px)'
  },
  roleBadgeAdmin: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    color: '#ff00ff',
    borderColor: 'rgba(255, 0, 255, 0.3)',
    boxShadow: '0 0 15px rgba(255, 0, 255, 0.2)'
  },
  roleBadgeUser: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    color: '#ff6b6b',
    borderColor: 'rgba(255, 0, 0, 0.3)',
    boxShadow: '0 0 15px rgba(255, 0, 0, 0.2)'
  },
  nav: {
    flex: 1,
    padding: '1rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    color: '#88ffff',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    position: 'relative',
    border: '1px solid transparent'
  },
  navLinkActive: {
    background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
    color: '#ffffff',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)'
  },
  navIcon: {
    fontSize: '1.2rem',
    marginRight: '1rem',
    width: '20px',
    textAlign: 'center'
  },
  navLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    letterSpacing: '0.5px',
    flex: 1
  },
  activeIndicator: {
    position: 'absolute',
    right: '1rem',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
    boxShadow: '0 0 8px #00ffff'
  },
  permissionsPanel: {
    margin: '1rem 1rem 2rem 1rem',
    padding: '1rem',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '0.75rem',
    border: '1px solid rgba(0, 255, 255, 0.1)'
  },
  permissionsHeader: {
    fontSize: '0.65rem',
    fontWeight: '700',
    color: '#88ffff',
    marginBottom: '0.75rem',
    letterSpacing: '0.5px',
    textAlign: 'center'
  },
  permissionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  permissionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.6rem',
    color: '#88ffff'
  },
  permissionIcon: {
    fontSize: '0.7rem'
  },
  sidebarFooter: {
    padding: '1.5rem',
    borderTop: '1px solid rgba(0, 255, 255, 0.1)'
  },
  userInfoSidebar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem'
  },
  userAvatarSidebar: {
    position: 'relative',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarImageSidebar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  avatarIconSidebar: {
    fontSize: '1rem'
  },
  avatarGlow: {
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
    filter: 'blur(4px)',
    opacity: 0.5,
    animation: 'pulse 2s ease-in-out infinite'
  },
  userDetailsSidebar: {
    flex: 1
  },
  userNameSidebar: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#ffffff'
  },
  userEmailSidebar: {
    fontSize: '0.65rem',
    color: '#88ffff',
    opacity: 0.8
  },
  userStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.2rem'
  },
  statusIndicator: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00ff88, #00ffff)',
    boxShadow: '0 0 8px #00ff88',
    animation: 'pulse 2s ease-in-out infinite'
  },
  statusText: {
    fontSize: '0.6rem',
    color: '#88ffff',
    fontWeight: '600'
  },
  logoutButton: {
    background: 'rgba(255, 0, 0, 0.1)',
    border: '1px solid rgba(255, 0, 0, 0.3)',
    color: '#ff6b6b',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoutIcon: {
    fontSize: '0.8rem'
  },
  version: {
    fontSize: '0.6rem',
    color: '#88ffff',
    opacity: 0.6,
    textAlign: 'center',
    letterSpacing: '1px'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 2
  },
  header: {
    background: 'rgba(10, 15, 30, 0.8)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
    padding: '1.5rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative'
  },
  headerGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)'
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  headerTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  breadcrumbText: {
    fontSize: '0.8rem',
    color: '#88ffff',
    opacity: 0.7
  },
  breadcrumbCurrent: {
    fontSize: '0.8rem',
    color: '#ffffff',
    fontWeight: '600'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.5rem 1rem',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '1rem',
    border: '1px solid rgba(0, 255, 255, 0.1)'
  },
  userAvatar: {
    position: 'relative',
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '0.9rem'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  avatarText: {
    color: '#0a0a0a',
    fontWeight: '700'
  },
  avatarPulse: {
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
    filter: 'blur(4px)',
    opacity: 0.5,
    animation: 'pulse 2s ease-in-out infinite'
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#ffffff'
  },
  userRole: {
    fontSize: '0.7rem',
    color: '#88ffff',
    fontWeight: '600'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginLeft: '1rem'
  },
  notificationButton: {
    position: 'relative',
    background: 'rgba(136, 255, 255, 0.1)',
    border: '1px solid rgba(136, 255, 255, 0.3)',
    color: '#88ffff',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  notificationIcon: {
    fontSize: '0.9rem'
  },
  notificationBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: 'linear-gradient(135deg, #ff00ff, #ff6b6b)',
    color: '#ffffff',
    fontSize: '0.6rem',
    fontWeight: '700',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoutButtonHeader: {
    background: 'linear-gradient(135deg, #ff5252, #e100e1)',
    border: 'none',
    color: '#ffffff',
    padding: '0.6rem 1rem',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px'
  },
  logoutIconHeader: {
    fontSize: '0.9rem'
  },
  main: {
    flex: 1,
    padding: '2rem',
    overflow: 'auto',
    position: 'relative'
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  accessDenied: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: '2rem'
  },
  accessDeniedIcon: {
    fontSize: '4rem',
    marginBottom: '1.5rem'
  },
  accessDeniedTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#ff6b6b',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #ff6b6b, #ff00ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  accessDeniedText: {
    color: '#88ffff',
    fontSize: '1rem',
    marginBottom: '2rem',
    maxWidth: '400px',
    lineHeight: '1.5'
  },
  accessDeniedButton: {
    background: 'linear-gradient(135deg, #00ff88, #00ffff)',
    color: '#0a0a0a',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.9rem',
    letterSpacing: '1px',
    boxShadow: '0 0 25px rgba(0, 255, 255, 0.4)',
    transition: 'all 0.3s ease'
  },
  footer: {
    background: 'rgba(10, 15, 30, 0.8)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(0, 255, 255, 0.2)',
    padding: '1.5rem 2rem',
    position: 'relative'
  },
  footerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)'
  },
  footerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  footerText: {
    fontSize: '0.8rem',
    color: '#88ffff',
    opacity: 0.7
  },
  footerLinks: {
    display: 'flex',
    gap: '2rem'
  },
  footerLink: {
    fontSize: '0.7rem',
    color: '#88ffff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    opacity: 0.7
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'rgba(0, 255, 255, 0.1)',
    borderRadius: '1rem',
    border: '1px solid rgba(0, 255, 255, 0.3)'
  },
  securityIcon: {
    fontSize: '0.8rem'
  },
  securityText: {
    fontSize: '0.7rem',
    color: '#88ffff',
    fontWeight: '600'
  }
};

const loadingStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    position: 'relative',
    overflow: 'hidden'
  },
  neuralNetwork: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  neuralParticle: {
    position: 'absolute',
    backgroundColor: '#00ffff',
    borderRadius: '50%',
    animation: 'neuralFloat 10s ease-in-out infinite',
    boxShadow: '0 0 8px #00ffff, 0 0 16px #00ffff'
  },
  content: {
    textAlign: 'center',
    zIndex: 2
  },
  quantumSpinner: {
    width: '4rem',
    height: '4rem',
    border: '3px solid transparent',
    borderTop: '3px solid #00ffff',
    borderRight: '3px solid #ff00ff',
    borderRadius: '50%',
    animation: 'quantumSpin 1s linear infinite',
    margin: '0 auto 2rem',
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
  },
  text: {
    color: '#88ffff',
    fontSize: '1rem',
    fontWeight: '300',
    letterSpacing: '2px'
  }
};