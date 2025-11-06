import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import Header from "./pages/Header"; // Import du Header

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
        <Route path="/profile" element={
          <PageWithHeader>
            <Profile />
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
        
        {/* Application principale avec layout PROTÉGÉ - Header géré dans Layout */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="transports" element={<Transports />} />
          <Route path="infrastructures" element={<InfrastructuresPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="avis" element={<AvisPage />} />
          <Route path="recharge" element={<RechargePage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="smartcitiespage" element={<SmartCitiesPage />} />
          <Route path="trajetspage" element={<TrajetsPage />} />
          <Route path="statistiques" element={<Statistiques />} />
          <Route path="ai" element={<AIQuery />} />
          <Route path="profile" element={<Profile />} />
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

const pageWithHeaderStyles = {
  minHeight: "100vh",
  backgroundColor: "#0a0a0a",
};

const mainContentStyles = {
  paddingTop: "80px", // Compense la hauteur du header fixe
};