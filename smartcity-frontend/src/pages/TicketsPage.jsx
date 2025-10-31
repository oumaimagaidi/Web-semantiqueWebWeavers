import { useEffect, useState } from "react";
import axios from "axios";

export default function TicketsPage() {
  const [voyageurId, setVoyageurId] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [ticketsVoyageur, setTicketsVoyageur] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // ------------------- Ajouter un ticket -------------------
  const addTicket = async (e) => {
    e.preventDefault();
    if (!voyageurId || !ticketId) return;

    try {
      setLoading(true);
      // Utiliser l'endpoint existant pour créer un ticket
      const ticketRes = await axios.post("http://localhost:8000/add_ticket/", {
        id: ticketId,
        type_ticket: "TicketBus", // Type par défaut
        prix: 0.0,
        statutTicket: "actif"
      });

      // Associer le ticket au voyageur
      const linkRes = await axios.post("http://localhost:8000/personne/possede_ticket/", {
        personne_id: voyageurId,
        ticket_id: ticketId
      });

      alert("✅ Ticket créé et attribué avec succès !");
      setTicketId("");
      fetchTicketsByVoyageur(voyageurId);
      fetchAllTickets();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Récupérer tickets d'un voyageur -------------------
  const fetchTicketsByVoyageur = async (vid) => {
    if (!vid) return;
    try {
      setLoading(true);
      // Utiliser l'endpoint de recherche générique
      const res = await axios.get(`http://localhost:8000/search/?query=${vid}`);
      const tickets = res.data.results.filter(item => 
        item.type.includes("Ticket") && item.label.includes(vid)
      );
      setTicketsVoyageur(tickets);
    } catch (err) {
      console.error("Erreur lors de la recherche des tickets:", err);
      setTicketsVoyageur([]);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Récupérer tous les tickets -------------------
  const fetchAllTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/tickets/");
      setAllTickets(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des tickets:", err);
      setAllTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const handleVoyageurIdChange = (value) => {
    setVoyageurId(value);
  };

  const handleTicketIdChange = (value) => {
    setTicketId(value);
  };

  const handleSearchTickets = () => {
    fetchTicketsByVoyageur(voyageurId);
  };

  const getTicketTypeIcon = (type) => {
    const icons = {
      'TicketBus': '🚌',
      'TicketMetro': '🚇',
      'TicketParking': '🅿️',
      'default': '🎫'
    };
    return icons[type] || icons.default;
  };

  const getTicketTypeColor = (type) => {
    const colors = {
      'TicketBus': '#3b82f6',
      'TicketMetro': '#dc2626',
      'TicketParking': '#d97706',
      'default': '#6b7280'
    };
    return colors[type] || colors.default;
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* En-tête */}
        <div style={styles.header}>
          <h1 style={styles.title}>🎟️ Gestion des Tickets</h1>
          <p style={styles.subtitle}>Attribuez et consultez les tickets des voyageurs</p>
        </div>

        {/* Formulaire ajout ticket */}
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>➕ Créer et attribuer un ticket</h3>
          <form onSubmit={addTicket}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>ID Voyageur</label>
                <input
                  type="text"
                  placeholder="ex: voyageur_001"
                  value={voyageurId}
                  onChange={(e) => handleVoyageurIdChange(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>ID Ticket</label>
                <input
                  type="text"
                  placeholder="ex: ticket_001"
                  value={ticketId}
                  onChange={(e) => handleTicketIdChange(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              style={styles.primaryButton}
              disabled={loading}
            >
              {loading ? (
                <div style={styles.buttonContent}>
                  <div style={styles.spinner}></div>
                  <span>Création en cours...</span>
                </div>
              ) : (
                <div style={styles.buttonContent}>
                  <span style={styles.buttonIcon}>🎫</span>
                  <span>Créer et attribuer le ticket</span>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Tickets par voyageur */}
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>🔍 Rechercher les tickets d'un voyageur</h3>
          <div style={styles.searchSection}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>ID Voyageur</label>
              <input
                type="text"
                placeholder="ex: voyageur_001"
                value={voyageurId}
                onChange={(e) => handleVoyageurIdChange(e.target.value)}
                style={styles.input}
              />
            </div>
            <button
              onClick={handleSearchTickets}
              style={styles.secondaryButton}
              disabled={loading}
            >
              {loading ? '🔄' : '🔍'} Rechercher
            </button>
          </div>
          
          {ticketsVoyageur.length > 0 ? (
            <div style={styles.ticketsList}>
              <h4 style={styles.listTitle}>Tickets du voyageur {voyageurId}</h4>
              <div style={styles.ticketsGrid}>
                {ticketsVoyageur.map((ticket, index) => (
                  <div 
                    key={index} 
                    style={styles.ticketItem}
                  >
                    <div 
                      style={{
                        ...styles.ticketIcon,
                        backgroundColor: getTicketTypeColor(ticket.type)
                      }}
                    >
                      {getTicketTypeIcon(ticket.type)}
                    </div>
                    <div style={styles.ticketInfo}>
                      <div style={styles.ticketId}>{ticket.id}</div>
                      <div style={styles.ticketType}>{ticket.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyText}>
                {voyageurId ? `Aucun ticket trouvé pour "${voyageurId}"` : 'Entrez un ID voyageur'}
              </div>
              <div style={styles.emptySubtext}>
                {voyageurId ? 'Le voyageur peut ne pas exister ou ne pas avoir de tickets' : 'Recherchez les tickets par ID voyageur'}
              </div>
            </div>
          )}
        </div>

        {/* Tous les tickets */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📋 Tous les tickets ({allTickets.length})</h3>
            <button 
              onClick={fetchAllTickets}
              style={styles.refreshButton}
              disabled={loading}
            >
              {loading ? '🔄' : '🔄'} Actualiser
            </button>
          </div>
          <div style={styles.tableCard}>
            {loading ? (
              <div style={styles.loadingState}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Chargement des tickets...</p>
              </div>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHead}>ID</th>
                        <th style={styles.tableHead}>Type</th>
                        <th style={styles.tableHead}>Prix</th>
                        <th style={styles.tableHead}>Statut</th>
                        <th style={styles.tableHead}>Utilisateur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTickets.map((ticket, idx) => (
                        <tr 
                          key={idx} 
                          style={styles.tableRow}
                        >
                          <td style={styles.tableCell}>
                            <span style={styles.ticketBadge}>
                              {ticket.id}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span 
                              style={{
                                ...styles.typeBadge,
                                backgroundColor: getTicketTypeColor(ticket.type)
                              }}
                            >
                              {getTicketTypeIcon(ticket.type)} {ticket.type}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.price}>
                              {ticket.prix ? `${ticket.prix} €` : 'Gratuit'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.status}>
                              {ticket.statut || 'Actif'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            {ticket.utilisateur ? (
                              <span style={styles.voyageurBadge}>
                                {ticket.utilisateur}
                              </span>
                            ) : (
                              <span style={styles.noVoyageur}>Non attribué</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {allTickets.length === 0 && (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🎫</div>
                    <div style={styles.emptyText}>Aucun ticket enregistré</div>
                    <div style={styles.emptySubtext}>
                      Créez et attribuez des tickets aux voyageurs pour commencer
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
    backgroundColor: '#f8fafc',
    padding: '0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  wrapper: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1.5rem'
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center'
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #d97706, #b45309)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '1.125rem'
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
    marginBottom: '2rem'
  },
  formTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1.5rem'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  searchSection: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-end',
    marginBottom: '1.5rem'
  },
  inputGroup: {
    flex: 1
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: '#fafafa'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #d97706, #b45309)',
    color: 'white',
    fontWeight: '600',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(217, 119, 6, 0.3)',
    width: '100%'
  },
  secondaryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    fontWeight: '600',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
    minWidth: '140px'
  },
  refreshButton: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease'
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    justifyContent: 'center'
  },
  buttonIcon: {
    fontSize: '1.125rem'
  },
  spinner: {
    width: '1.25rem',
    height: '1.25rem',
    border: '2px solid transparent',
    borderTop: '2px solid currentColor',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
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
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937'
  },
  ticketsList: {
    marginTop: '1rem'
  },
  listTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '1rem'
  },
  ticketsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem'
  },
  ticketItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    border: '1px solid #fef3c7',
    borderRadius: '0.75rem',
    transition: 'all 0.3s ease',
    backgroundColor: '#fffbeb'
  },
  ticketIcon: {
    width: '3rem',
    height: '3rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '1.25rem',
    flexShrink: 0
  },
  ticketInfo: {
    flex: 1
  },
  ticketId: {
    fontWeight: '600',
    color: '#92400e',
    fontSize: '0.875rem'
  },
  ticketType: {
    color: '#b45309',
    fontSize: '0.75rem'
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
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
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e5e7eb'
  },
  tableHead: {
    padding: '1rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap'
  },
  tableRow: {
    transition: 'all 0.3s ease',
    borderBottom: '1px solid #f3f4f6'
  },
  tableCell: {
    padding: '1rem 1.5rem',
    fontSize: '0.875rem',
    color: '#374151',
    whiteSpace: 'nowrap'
  },
  ticketBadge: {
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#374151'
  },
  typeBadge: {
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'capitalize',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  price: {
    fontWeight: '600',
    color: '#059669'
  },
  status: {
    color: '#6b7280',
    fontSize: '0.875rem'
  },
  voyageurBadge: {
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  noVoyageur: {
    color: '#9ca3af',
    fontStyle: 'italic',
    fontSize: '0.875rem'
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2rem',
    gap: '1rem'
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '1rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 2rem'
  },
  emptyIcon: {
    fontSize: '3rem',
    opacity: 0.5,
    marginBottom: '1rem'
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: '1.125rem',
    marginBottom: '0.5rem'
  },
  emptySubtext: {
    color: '#6b7280',
    fontSize: '0.875rem'
  }
};

// Media queries et animations
const mediaQueries = `
  @media (max-width: 768px) {
    .search-section {
      flex-direction: column;
      align-items: stretch;
    }
    
    .section-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
    
    .tickets-grid {
      grid-template-columns: 1fr;
    }
    
    .table-cell, .table-head {
      padding: 0.75rem 1rem;
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  input:focus {
    border-color: #d97706;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
    transform: translateY(-1px);
  }

  .primary-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(217, 119, 6, 0.3);
  }

  .primary-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .secondary-button:hover:not(:disabled) {
    background-color: #2563eb;
    transform: translateY(-1px);
  }

  .refresh-button:hover:not(:disabled) {
    background-color: #e5e7eb;
  }

  .ticket-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .table-row:hover {
    background-color: #fffbeb;
    transform: translateX(4px);
  }
`;

// Injection des styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = mediaQueries;
  document.head.appendChild(styleSheet);
}