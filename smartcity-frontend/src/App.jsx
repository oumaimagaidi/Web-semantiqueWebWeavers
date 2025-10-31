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

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Page d'accueil publique */}
        <Route path="/" element={<Home />} />
        
        {/* Pages d'authentification */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Application principale avec layout PROTÉGÉ */}
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
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}