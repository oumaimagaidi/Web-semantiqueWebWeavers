// src/components/Layout.jsx
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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

  const menuItems = [
    { path: "/app", icon: "🏠", label: "DASHBOARD" },
    { path: "/app/users", icon: "👤", label: "UTILISATEURS" },
    { path: "/app/transports", icon: "🚆", label: "RÉSEAUX" },
    { path: "/app/events", icon: "📅", label: "ÉVÉNEMENTS" },
    { path: "/app/infrastructures", icon: "🏗", label: "INFRASTRUCTURES" },
    { path: "/app/avis", icon: "💬", label: "AVIS" },
    { path: "/app/recharge", icon: "⚡", label: "RECHARGE" },
    { path: "/app/tickets", icon: "🎫", label: "TICKETS" },
    { path: "/app/smartcitiespage", icon: "🏙", label: "SMARTCITY" },
    { path: "/app/trajetspage", icon: "🛣", label: "TRAJETS" },
    { path: "/app/statistiques", icon: "📊", label: "STATISTIQUES" },
    { path: "/app/ai", icon: "🧠", label: "INTELLIGENCE ARTIFICIELLE" }
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setLoading(false);
    } else {
      console.log("Utilisateur non connecté, redirection vers /signin");
      navigate("/signin", { replace: true });
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/signin");
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
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

  if (!user) {
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
            <span style={styles.logoSubtext}>CONTROL PANEL</span>
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
                  <span style={styles.statusText}>CONNECTÉ</span>
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
              {menuItems.find(item => item.path === location.pathname)?.label || 'DASHBOARD PRINCIPAL'}
            </h1>
            <div style={styles.breadcrumb}>
              <span style={styles.breadcrumbText}>SYSTÈME NEXUS / </span>
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
                  <div style={styles.userRole}>{user.type_personne || 'UTILISATEUR PRIVILÉGIÉ'}</div>
                </div>
                <div style={styles.headerActions}>
                  <button style={styles.notificationButton}>
                    <span style={styles.notificationIcon}>🔔</span>
                    <div style={styles.notificationBadge}>3</div>
                  </button>
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
            <Outlet />
          </div>
        </main>

        {/* Footer cybernétique */}
        <footer style={styles.footer}>
          <div style={styles.footerGlow}></div>
          <div style={styles.footerContent}>
            <div style={styles.footerText}>
              © 2025 NEXUS URBAN INTELLIGENCE NETWORK. TOUS DROITS CRYPTÉS.
            </div>
            <div style={styles.footerLinks}>
              <span style={styles.footerLink}>PROTOCOLE DE CONFIDENTIALITÉ</span>
              <span style={styles.footerLink}>CONDITIONS D'UTILISATION</span>
              <span style={styles.footerLink}>SUPPORT TECHNIQUE</span>
            </div>
            <div style={styles.securityBadge}>
              <span style={styles.securityIcon}>🛡️</span>
              <span style={styles.securityText}>SYSTÈME CERTIFIÉ ISO-27001</span>
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
            box-shadow: 0 0 20px #00ffff;
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

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    backgroundColor: "#0a0a0a",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Orbitron', 'Rajdhani', monospace"
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
  sidebar: {
    width: '300px',
    backgroundColor: "rgba(10, 15, 35, 0.85)",
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    borderRight: "1px solid rgba(0, 255, 255, 0.3)",
    boxShadow: "0 0 40px rgba(0, 255, 255, 0.1)",
    backdropFilter: "blur(15px)",
    position: "relative",
    zIndex: 2
  },
  sidebarGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(circle at left, rgba(0,255,255,0.1) 0%, transparent 70%)",
    animation: "hologramGlow 4s ease-in-out infinite",
    pointerEvents: "none"
  },
  logo: {
    padding: '2rem 1.5rem',
    borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  logoOrb: {
    position: "relative",
    width: "50px",
    height: "50px",
    background: "linear-gradient(135deg, #00ffff, #0099ff)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 20px rgba(0, 255, 255, 0.5)"
  },
  orbGlow: {
    position: "absolute",
    top: "-3px",
    left: "-3px",
    right: "-3px",
    bottom: "-3px",
    background: "linear-gradient(135deg, #00ffff, #0099ff)",
    borderRadius: "50%",
    filter: "blur(8px)",
    opacity: 0.5,
    animation: "pulse 2s ease-in-out infinite"
  },
  logoIcon: {
    fontSize: '1.5rem',
    filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))'
  },
  logoTextContainer: {
    textAlign: 'left'
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #00ffff, #0099ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    display: 'block',
    lineHeight: '1',
    letterSpacing: '2px'
  },
  logoSubtext: {
    fontSize: '0.6rem',
    fontWeight: '300',
    color: '#88ffff',
    letterSpacing: '1.5px',
    display: 'block',
    marginTop: '0.2rem'
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1.5rem 1rem'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.25rem',
    borderRadius: '0.75rem',
    textDecoration: 'none',
    color: '#88ffff',
    transition: 'all 0.3s ease',
    fontSize: '0.8rem',
    fontWeight: '500',
    letterSpacing: '0.5px',
    position: 'relative',
    border: '1px solid transparent'
  },
  navLinkActive: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    color: '#00ffff',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)'
  },
  navIcon: {
    fontSize: '1.125rem',
    width: '24px',
    textAlign: 'center',
    filter: 'drop-shadow(0 0 5px currentColor)'
  },
  navLabel: {
    flex: 1,
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  activeIndicator: {
    position: 'absolute',
    right: '1rem',
    width: '6px',
    height: '6px',
    backgroundColor: '#00ffff',
    borderRadius: '50%',
    boxShadow: '0 0 10px #00ffff'
  },
  sidebarFooter: {
    padding: '1.5rem 1.25rem',
    borderTop: '1px solid rgba(0, 255, 255, 0.2)'
  },
  userInfoSidebar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderRadius: '1rem',
    border: '1px solid rgba(0, 255, 255, 0.1)'
  },
  userAvatarSidebar: {
    position: 'relative',
    width: '3rem',
    height: '3rem',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 'bold',
    overflow: 'hidden',
    flexShrink: 0
  },
  avatarImageSidebar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%'
  },
  avatarIconSidebar: {
    fontSize: '1.25rem'
  },
  avatarGlow: {
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    borderRadius: '50%',
    border: '2px solid #00ffff',
    filter: 'blur(4px)',
    opacity: 0.6,
    animation: 'pulse 2s ease-in-out infinite'
  },
  userDetailsSidebar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  userNameSidebar: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#00ffff',
    marginBottom: '0.25rem'
  },
  userEmailSidebar: {
    fontSize: '0.65rem',
    color: '#88ffff',
    opacity: 0.8,
    marginBottom: '0.5rem'
  },
  userStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  statusIndicator: {
    width: '6px',
    height: '6px',
    backgroundColor: '#00ff88',
    borderRadius: '50%',
    boxShadow: '0 0 8px #00ff88'
  },
  statusText: {
    fontSize: '0.6rem',
    color: '#00ff88',
    fontWeight: '600'
  },
  logoutButton: {
    background: 'rgba(255, 0, 0, 0.1)',
    border: '1px solid rgba(255, 0, 0, 0.3)',
    color: '#ff6b6b',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  version: {
    fontSize: '0.7rem',
    color: 'rgba(136, 255, 255, 0.6)',
    textAlign: 'center',
    letterSpacing: '1px'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    position: 'relative',
    zIndex: 1
  },
  header: {
    backgroundColor: 'rgba(10, 15, 35, 0.9)',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  headerTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #ffffff, #88ffff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
    letterSpacing: '1px'
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  breadcrumbText: {
    fontSize: '0.8rem',
    color: '#88ffff',
    fontWeight: '300'
  },
  breadcrumbCurrent: {
    fontSize: '0.8rem',
    color: '#00ffff',
    fontWeight: '600'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderRadius: '1rem',
    border: '1px solid rgba(0, 255, 255, 0.2)'
  },
  userAvatar: {
    position: 'relative',
    width: '3rem',
    height: '3rem',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: 'white',
    overflow: 'hidden',
    flexShrink: 0
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%'
  },
  avatarText: {
    fontSize: '0.875rem',
    fontWeight: 'bold'
  },
  avatarPulse: {
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    borderRadius: '50%',
    border: '2px solid #00ffff',
    filter: 'blur(4px)',
    opacity: 0.6,
    animation: 'pulse 2s ease-in-out infinite'
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#00ffff',
    marginBottom: '0.25rem'
  },
  userRole: {
    fontSize: '0.7rem',
    color: '#88ffff',
    fontWeight: '300',
    letterSpacing: '0.5px'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  notificationButton: {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#88ffff',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    transition: 'all 0.3s ease'
  },
  notificationIcon: {
    filter: 'drop-shadow(0 0 5px currentColor)'
  },
  notificationBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#ff00ff',
    color: 'white',
    fontSize: '0.6rem',
    fontWeight: 'bold',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 8px #ff00ff'
  },
  logoutButtonHeader: {
    background: 'linear-gradient(135deg, #ff6b6b, #ff00ff)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    padding: '0.75rem 1.25rem',
    borderRadius: '0.75rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    letterSpacing: '0.5px',
    boxShadow: '0 0 15px rgba(255, 0, 255, 0.3)'
  },
  logoutIconHeader: {
    fontSize: '1rem'
  },
  main: {
    flex: 1,
    padding: '2rem',
    backgroundColor: 'transparent',
    overflow: 'auto',
    position: 'relative'
  },
  contentWrapper: {
    animation: 'slideIn 0.5s ease-out'
  },
  footer: {
    backgroundColor: 'rgba(10, 15, 35, 0.9)',
    borderTop: '1px solid rgba(0, 255, 255, 0.2)',
    padding: '1.5rem 2rem',
    backdropFilter: 'blur(15px)',
    position: 'relative'
  },
  footerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, #00ffff, transparent)'
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  footerText: {
    color: '#88ffff',
    fontSize: '0.7rem',
    fontWeight: '300',
    letterSpacing: '0.5px'
  },
  footerLinks: {
    display: 'flex',
    gap: '2rem'
  },
  footerLink: {
    color: '#88ffff',
    fontSize: '0.65rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: '300',
    letterSpacing: '0.5px'
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: '2rem',
    border: '1px solid rgba(0, 255, 255, 0.3)'
  },
  securityIcon: {
    fontSize: '0.8rem'
  },
  securityText: {
    color: '#88ffff',
    fontSize: '0.6rem',
    fontWeight: '600',
    letterSpacing: '0.5px'
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

// Media queries pour le responsive
const mediaQueries = `
  @media (max-width: 768px) {
    .sidebar {
      width: 80px;
    }
    .nav-label, .logo-text, .user-details-sidebar, .user-details, .breadcrumb, .logout-button-header span:last-child {
      display: none;
    }
    .logo {
      justify-content: center;
      padding: 1rem 0.5rem;
    }
    .nav-link {
      justify-content: center;
      padding: 0.75rem 0.5rem;
    }
    .header {
      padding: 1rem;
    }
    .header-title {
      font-size: 1.25rem;
    }
    .main {
      padding: 1rem;
    }
    .footer-content {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
    .user-info-sidebar {
      justify-content: center;
    }
    .user-info {
      padding: 0.5rem 1rem;
    }
  }

  @media (max-width: 480px) {
    .sidebar {
      width: 60px;
    }
    .nav-icon {
      font-size: 1rem;
    }
    .header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
    .header-right {
      width: 100%;
    }
    .user-info {
      width: 100%;
      justify-content: center;
    }
  }

  .nav-link:hover:not(.nav-link-active) {
    background-color: rgba(0, 255, 255, 0.05);
    border: 1px solid rgba(0, 255, 255, 0.2);
    transform: translateX(5px);
  }

  .logout-button:hover {
    background-color: rgba(255, 0, 0, 0.2);
    box-shadow: 0 0 15px rgba(255, 0, 0, 0.3);
  }

  .logout-button-header:hover {
    background: linear-gradient(135deg, #ff5252, #e100e1);
    box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
    transform: translateY(-2px);
  }

  .notification-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 15px rgba(136, 255, 255, 0.3);
  }

  .footer-link:hover {
    color: #00ffff;
    text-shadow: 0 0 8px #00ffff;
  }
`;

// Injection des media queries
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = mediaQueries;
  document.head.appendChild(styleSheet);
}