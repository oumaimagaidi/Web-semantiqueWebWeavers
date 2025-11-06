import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (userData && token) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleHome = () => {
    navigate("/");
  };

  const handleProfile = () => {
    if (user) {
      navigate("/profile");
    } else {
      navigate("/signin");
    }
  };

  const handleAssistant = () => {
    navigate("/assistant");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header style={styles.header}>
      {/* Logo */}
      <div style={styles.logo} onClick={handleHome}>
        <div style={styles.logoOrb}>
          <div style={styles.orbGlow}></div>
          <span style={styles.logoIcon}>⚡</span>
        </div>
        <div style={styles.logoTextContainer}>
          <span style={styles.logoText}>SMARTCITY</span>
          <span style={styles.logoSubtext}>URBAN INTELLIGENCE</span>
        </div>
      </div>

      {/* Navigation Desktop */}
      <nav style={styles.nav}>
        <button 
          style={{
            ...styles.navButton,
            ...(isActive("/") && styles.navButtonActive)
          }}
          onClick={handleHome}
        >
          <span style={styles.navIcon}>🏠</span>
          <span style={styles.navText}>ACCUEIL</span>
          {isActive("/") && <div style={styles.activeIndicator}></div>}
        </button>

        <button 
          style={{
            ...styles.navButton,
            ...(isActive("/assistant") && styles.navButtonActive)
          }}
          onClick={handleAssistant}
        >
          <span style={styles.navIcon}>🤖</span>
          <span style={styles.navText}>ASSISTANT IA</span>
          {isActive("/assistant") && <div style={styles.activeIndicator}></div>}
        </button>

        <button 
          style={{
            ...styles.navButton,
            ...(isActive("/profile") && styles.navButtonActive)
          }}
          onClick={handleProfile}
        >
          <span style={styles.navIcon}>👤</span>
          <span style={styles.navText}>
            {user ? user.name || 'PROFIL' : 'CONNEXION'}
          </span>
          {isActive("/profile") && <div style={styles.activeIndicator}></div>}
        </button>

        {/* Indicateur de statut utilisateur */}
        {user && (
          <div style={styles.userStatus}>
            <div style={styles.statusDot}></div>
            <span style={styles.statusText}>Connecté</span>
          </div>
        )}
      </nav>

      {/* Menu Mobile */}
      <div style={styles.mobileMenu}>
        <button 
          style={styles.menuToggle}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div style={styles.hamburger}>
            <div style={{...styles.hamburgerLine, transform: isMenuOpen ? 'rotate(45deg)' : 'none'}}></div>
            <div style={{...styles.hamburgerLine, opacity: isMenuOpen ? 0 : 1}}></div>
            <div style={{...styles.hamburgerLine, transform: isMenuOpen ? 'rotate(-45deg)' : 'none'}}></div>
          </div>
        </button>

        {isMenuOpen && (
          <div style={styles.mobileDropdown}>
            <button 
              style={styles.mobileNavButton}
              onClick={() => {
                handleHome();
                setIsMenuOpen(false);
              }}
            >
              <span style={styles.navIcon}>🏠</span>
              ACCUEIL
            </button>
            
            <button 
              style={styles.mobileNavButton}
              onClick={() => {
                handleAssistant();
                setIsMenuOpen(false);
              }}
            >
              <span style={styles.navIcon}>🤖</span>
              ASSISTANT IA
            </button>
            
            <button 
              style={styles.mobileNavButton}
              onClick={() => {
                handleProfile();
                setIsMenuOpen(false);
              }}
            >
              <span style={styles.navIcon}>👤</span>
              {user ? 'PROFIL' : 'CONNEXION'}
            </button>

            {user && (
              <button 
                style={styles.mobileNavButton}
                onClick={handleLogout}
              >
                <span style={styles.navIcon}>🚪</span>
                DÉCONNEXION
              </button>
            )}
          </div>
        )}
      </div>

      {/* Styles CSS globaux */}
      <style jsx="true" global="true">{`
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

        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
          }
          50% { 
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.6);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}

const styles = {
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: "1rem 2rem",
    background: "rgba(10, 15, 35, 0.9)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(0, 255, 255, 0.2)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    cursor: "pointer",
    transition: "all 0.3s ease"
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
    boxShadow: "0 0 20px rgba(0, 255, 255, 0.5)",
    animation: "pulse 3s ease-in-out infinite"
  },
  orbGlow: {
    position: "absolute",
    top: "-2px",
    left: "-2px",
    right: "-2px",
    bottom: "-2px",
    background: "linear-gradient(135deg, #00ffff, #0099ff)",
    borderRadius: "50%",
    filter: "blur(6px)",
    opacity: 0.4
  },
  logoIcon: {
    fontSize: "1.5rem",
    filter: "drop-shadow(0 0 6px rgba(255,255,255,0.5))",
    zIndex: 2
  },
  logoTextContainer: {
    display: "flex",
    flexDirection: "column"
  },
  logoText: {
    fontSize: "1.8rem",
    fontWeight: "900",
    background: "linear-gradient(135deg, #00ffff, #0099ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "2px"
  },
  logoSubtext: {
    fontSize: "0.6rem",
    fontWeight: "300",
    color: "#88ffff",
    letterSpacing: "1px",
    marginTop: "0.1rem"
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    "@media (max-width: 768px)": {
      display: "none"
    }
  },
  navButton: {
    position: "relative",
    padding: "0.8rem 1.5rem",
    background: "rgba(0, 255, 255, 0.05)",
    border: "1px solid rgba(0, 255, 255, 0.2)",
    borderRadius: "1rem",
    color: "#88ffff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.3s ease",
    fontWeight: "600",
    fontSize: "0.9rem",
    letterSpacing: "1px"
  },
  navButtonActive: {
    background: "rgba(0, 255, 255, 0.15)",
    border: "1px solid rgba(0, 255, 255, 0.5)",
    color: "#00ffff",
    boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)"
  },
  navIcon: {
    fontSize: "1.2rem"
  },
  navText: {
    whiteSpace: "nowrap"
  },
  activeIndicator: {
    position: "absolute",
    bottom: "-3px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "20px",
    height: "2px",
    backgroundColor: "#00ffff",
    borderRadius: "1px"
  },
  userStatus: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "rgba(0, 255, 0, 0.1)",
    border: "1px solid rgba(0, 255, 0, 0.3)",
    borderRadius: "2rem",
    marginLeft: "1rem"
  },
  statusDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#00ff00",
    borderRadius: "50%",
    animation: "pulse 2s ease-in-out infinite"
  },
  statusText: {
    fontSize: "0.8rem",
    color: "#88ff88",
    fontWeight: "600"
  },
  mobileMenu: {
    display: "none",
    position: "relative",
    "@media (max-width: 768px)": {
      display: "block"
    }
  },
  menuToggle: {
    background: "rgba(0, 255, 255, 0.1)",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    borderRadius: "0.5rem",
    padding: "0.5rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  hamburger: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    width: "20px",
    height: "20px"
  },
  hamburgerLine: {
    width: "100%",
    height: "2px",
    backgroundColor: "#00ffff",
    transition: "all 0.3s ease",
    borderRadius: "1px"
  },
  mobileDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "0.5rem",
    background: "rgba(10, 15, 35, 0.95)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0, 255, 255, 0.3)",
    borderRadius: "1rem",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    minWidth: "200px",
    animation: "slideDown 0.3s ease-out"
  },
  mobileNavButton: {
    padding: "1rem 1.5rem",
    background: "rgba(0, 255, 255, 0.05)",
    border: "1px solid rgba(0, 255, 255, 0.2)",
    borderRadius: "0.75rem",
    color: "#88ffff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    transition: "all 0.3s ease",
    fontWeight: "600",
    fontSize: "0.9rem"
  }
};

// Media queries pour le responsive
const mediaQueries = `
  @media (max-width: 768px) {
    .header {
      padding: 1rem;
    }
    
    .logoText {
      font-size: 1.5rem;
    }
    
    .logoSubtext {
      font-size: 0.5rem;
    }
    
    .logoOrb {
      width: 40px;
      height: 40px;
    }
  }
`;

// Ajouter les media queries au style global
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(mediaQueries, styleSheet.cssRules.length);