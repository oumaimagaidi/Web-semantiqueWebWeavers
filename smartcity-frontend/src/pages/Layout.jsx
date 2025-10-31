// src/components/Layout.jsx
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { path: "/app", icon: "🏠", label: "Dashboard" },
    { path: "/app/users", icon: "👤", label: "Utilisateurs" },
    { path: "/app/transports", icon: "🚆", label: "Réseaux" },
    { path: "/app/events", icon: "📅", label: "Events" },
    { path: "/app/infrastructures", icon: "🏗", label: "Infrastructures" },
    { path: "/app/avis", icon: "💬", label: "Avis" },
    { path: "/app/recharge", icon: "⚡", label: "Recharge" },
    { path: "/app/tickets", icon: "🎫", label: "Tickets" },
    { path: "/app/smartcitiespage", icon: "🏙", label: "SmartCity" },
    { path: "/app/trajetspage", icon: "🛣", label: "Trajets" },
    { path: "/app/statistiques", icon: "📊", label: "Statistiques" },
    { path: "/app/ai", icon: "🧠", label: "IA" }
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setLoading(false);
    } else {
      // Rediriger vers la page de connexion si non connecté
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

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div style={loadingStyles.container}>
        <div style={loadingStyles.spinner}></div>
        <p style={loadingStyles.text}>Chargement...</p>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, ne pas afficher le layout
  if (!user) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🏙️</div>
          <div style={styles.logoText}>SmartCity</div>
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
              onMouseOver={(e) => {
                if (!isActiveLink(item.path)) {
                  e.currentTarget.style.backgroundColor = '#1e40af';
                }
              }}
              onMouseOut={(e) => {
                if (!isActiveLink(item.path)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div style={styles.sidebarFooter}>
          {user && (
            <div style={styles.userInfoSidebar}>
              <div style={styles.userAvatarSidebar}>👤</div>
              <div style={styles.userDetailsSidebar}>
                <div style={styles.userNameSidebar}>{user.prenom} {user.nom}</div>
                <div style={styles.userEmailSidebar}>{user.email}</div>
              </div>
              <button onClick={handleLogout} style={styles.logoutButton}>
                🚪
              </button>
            </div>
          )}
          <div style={styles.version}>Version 1.0.0</div>
        </div>
      </aside>

      {/* Main content */}
      <div style={styles.mainContent}>
        {/* Navbar */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.headerTitle}>
              {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
            <div style={styles.breadcrumb}>
              SmartCity Mobility Platform
            </div>
          </div>
          <div style={styles.headerRight}>
            {user && (
              <div style={styles.userInfo}>
                <div style={styles.userAvatar}>
                  {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                </div>
                <div style={styles.userDetails}>
                  <div style={styles.userName}>{user.prenom} {user.nom}</div>
                  <div style={styles.userRole}>{user.email}</div>
                </div>
                <button onClick={handleLogout} style={styles.logoutButtonHeader}>
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main style={styles.main}>
          <Outlet />
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.footerText}>
              © 2025 SmartCity. Tous droits réservés.
            </div>
            <div style={styles.footerLinks}>
              <span style={styles.footerLink}>Confidentialité</span>
              <span style={styles.footerLink}>Conditions</span>
              <span style={styles.footerLink}>Support</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  sidebar: {
    width: '280px',
    backgroundColor: '#5356b9ff',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0
  },
  logo: {
    padding: '1.5rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  logoIcon: {
    fontSize: '1.5rem'
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 'bold'
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    padding: '1rem 0.75rem'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    color: 'white',
    transition: 'all 0.2s',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  navLinkActive: {
    backgroundColor: '#3b82f6',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },
  navIcon: {
    fontSize: '1.125rem',
    width: '24px',
    textAlign: 'center'
  },
  navLabel: {
    flex: 1
  },
  sidebarFooter: {
    padding: '1rem 1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  },
  userInfoSidebar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '0.5rem'
  },
  userAvatarSidebar: {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: 'bold'
  },
  userDetailsSidebar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  userNameSidebar: {
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  userEmailSidebar: {
    fontSize: '0.625rem',
    opacity: 0.8
  },
  logoutButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
    transition: 'background-color 0.2s'
  },
  version: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
  },
  header: {
    backgroundColor: 'white',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e5e7eb'
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  headerTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  },
  breadcrumb: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500'
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
    borderRadius: '0.5rem',
    backgroundColor: '#f8fafc'
  },
  userAvatar: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    backgroundColor: '#7c3aed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: 'white'
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1f2937'
  },
  userRole: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  logoutButtonHeader: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  main: {
    flex: 1,
    padding: '2rem',
    backgroundColor: '#f8fafc',
    overflow: 'auto'
  },
  footer: {
    backgroundColor: 'white',
    borderTop: '1px solid #e5e7eb',
    padding: '1.5rem 2rem'
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  footerText: {
    color: '#6b7280',
    fontSize: '0.875rem'
  },
  footerLinks: {
    display: 'flex',
    gap: '1.5rem'
  },
  footerLink: {
    color: '#6b7280',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'color 0.2s'
  }
};

const loadingStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  },
  spinner: {
    width: '3rem',
    height: '3rem',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #7c3aed',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  text: {
    color: '#6b7280',
    fontSize: '1rem'
  }
};

// Media queries pour le responsive
const mediaQueries = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .sidebar {
      width: 80px;
    }
    .nav-label, .logo-text, .user-details-sidebar, .user-details, .breadcrumb, .logout-button-header {
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
      gap: 0.5rem;
      text-align: center;
    }
    .user-info-sidebar {
      justify-content: center;
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

  .footer-link:hover {
    color: #b1c1daff;
  }

  .nav-link:hover:not(.nav-link-active) {
    background-color: #8599d9ff;
    transform: translateX(2px);
  }

  .logout-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .logout-button-header:hover {
    background-color: #dc2626;
  }
`;

// Injection des media queries
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = mediaQueries;
  document.head.appendChild(styleSheet);
}