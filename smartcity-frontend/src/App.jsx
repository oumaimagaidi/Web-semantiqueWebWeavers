import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Transports from "./pages/Transports";
import AIQuery from "./pages/AIQuery";
import EventsPage from "./pages/EventsPage";
import InfrastructuresPage from "./pages/InfrastructuresPage";
import AvisPage from "./pages/AvisPage";
import RechargePage from "./pages/RechargePage";
import TicketsPage from "./pages/TicketsPage";
import SmartCitiesPage from "./pages/SmartCitiesPage";
import TrajetsPage from "./pages/TrajetsPage";
import Statistiques from "./pages/StatistiquesPage";
import Profile from "./pages/Profile";
import Header from "./pages/Header";
import { useState, useEffect } from "react";
import axios from "axios";

// Composant de route protégée
function ProtectedRoute({ children, requiredRole = "user" }) {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      
      if (!user || !token) {
        setIsAuthorized(false);
        return;
      }

      // Vérifier le rôle de l'utilisateur
      const response = await axios.get(`http://localhost:8000/auth/user-role/${user.email}`);
      const role = response.data.role;
      setUserRole(role);

      if (requiredRole === "admin" && role !== "admin") {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error("Erreur de vérification:", error);
      setIsAuthorized(false);
    }
  };

  if (isAuthorized === null) {
    return (
      <div style={loadingStyles}>
        <div style={spinnerStyles}></div>
        <p>Vérification des permissions...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    // Rediriger vers la page AIQuery pour les users simples
    if (userRole === "user") {
      return <Navigate to="/app/ai" replace />;
    }
    return <Navigate to="/signin" replace />;
  }

  return children;
}

// Composant pour les pages avec Header
function PageWithHeader({ children }) {
  return (
    <div style={pageWithHeaderStyles}>
      <Header />
      <main style={mainContentStyles}>
        {children}
      </main>
    </div>
  );
}

// Composant pour les pages sans Header (authentification)
function PageWithoutHeader({ children }) {
  return (
    <div>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Page d'accueil publique AVEC Header */}
        <Route path="/" element={
          <PageWithHeader>
            <Home />
          </PageWithHeader>
        } />
        
        {/* Page de profil publique */}
        <Route path="/profile" element={
          <PageWithHeader>
            <Profile />
          </PageWithHeader>
        } />
        {/* NOUVELLE ROUTE - Assistant IA publique */}
        <Route path="/assistant" element={
          <PageWithHeader>
            <AIQuery />
          </PageWithHeader>
        } />
        {/* Pages d'authentification SANS Header */}
        <Route path="/signin" element={
          <PageWithoutHeader>
            <SignIn />
          </PageWithoutHeader>
        } />
        <Route path="/signup" element={
          <PageWithoutHeader>
            <SignUp />
          </PageWithoutHeader>
        } />
        
        {/* Application principale avec layout PROTÉGÉ */}
        <Route path="/app" element={
          <ProtectedRoute requiredRole="user">
            <Layout />
          </ProtectedRoute>
        }>
          {/* Routes ADMIN seulement */}
          <Route path="dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute requiredRole="admin">
              <Users />
            </ProtectedRoute>
          } />
          <Route path="transports" element={
            <ProtectedRoute requiredRole="admin">
              <Transports />
            </ProtectedRoute>
          } />
          <Route path="infrastructures" element={
            <ProtectedRoute requiredRole="admin">
              <InfrastructuresPage />
            </ProtectedRoute>
          } />
          <Route path="events" element={
            <ProtectedRoute requiredRole="admin">
              <EventsPage />
            </ProtectedRoute>
          } />
          <Route path="avis" element={
            <ProtectedRoute requiredRole="admin">
              <AvisPage />
            </ProtectedRoute>
          } />
          <Route path="recharge" element={
            <ProtectedRoute requiredRole="admin">
              <RechargePage />
            </ProtectedRoute>
          } />
          <Route path="tickets" element={
            <ProtectedRoute requiredRole="admin">
              <TicketsPage />
            </ProtectedRoute>
          } />
          <Route path="smartcitiespage" element={
            <ProtectedRoute requiredRole="admin">
              <SmartCitiesPage />
            </ProtectedRoute>
          } />
          <Route path="trajetspage" element={
            <ProtectedRoute requiredRole="admin">
              <TrajetsPage />
            </ProtectedRoute>
          } />
          <Route path="statistiques" element={
            <ProtectedRoute requiredRole="admin">
              <Statistiques />
            </ProtectedRoute>
          } />
          
          {/* Route accessible à TOUS les utilisateurs connectés */}
          <Route path="ai" element={<AIQuery />} />
          
          {/* Route par défaut - redirige selon le rôle */}
          <Route index element={<NavigateToAppropriatePage />} />
        </Route>

        {/* Redirection par défaut */}
        <Route path="*" element={
          <PageWithHeader>
            <Home />
          </PageWithHeader>
        } />
      </Routes>
    </Router>
  );
}

// Composant de redirection intelligente
// Composant de redirection intelligente - REDIRECTION IMMÉDIATE
function NavigateToAppropriatePage() {
  // Vérifier IMMÉDIATEMENT le rôle stocké dans localStorage
  const userRole = localStorage.getItem("userRole");
  const user = JSON.parse(localStorage.getItem("user"));
  
  console.log("Redirection - User:", user?.email, "Rôle:", userRole);
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  // REDIRECTION IMMÉDIATE - Admin vers dashboard, User vers HOME
  if (userRole === "admin") {
    console.log("Redirection ADMIN vers /app/dashboard");
    return <Navigate to="/app/dashboard" replace />;
  } else {
    console.log("Redirection USER vers / (home)");
    return <Navigate to="/" replace />;
  }
}
const pageWithHeaderStyles = {
  minHeight: "100vh",
  backgroundColor: "#0a0a0a",
};

const mainContentStyles = {
  paddingTop: "80px",
};

const loadingStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  backgroundColor: "#0a0a0a",
  color: "#00ffff",
  fontFamily: "'Orbitron', sans-serif"
};

const spinnerStyles = {
  width: "40px",
  height: "40px",
  border: "3px solid rgba(0, 255, 255, 0.3)",
  borderTop: "3px solid #00ffff",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  marginBottom: "1rem"
};