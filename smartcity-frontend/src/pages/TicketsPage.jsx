import { useEffect, useState } from "react";
import axios from "axios";

export default function TicketsPage() {
  const [voyageurId, setVoyageurId] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [ticketsVoyageur, setTicketsVoyageur] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
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

  // Calculs pour la pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = allTickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allTickets.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

      setTicketId("");
      setVoyageurId("");
      setShowForm(false);
      fetchTicketsByVoyageur(voyageurId);
      fetchAllTickets();
    } catch (err) {
      console.error("Erreur lors de l'ajout du ticket:", err);
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
      'TicketBus': '#00ff88',
      'TicketMetro': '#00ffff',
      'TicketParking': '#ffaa00',
      'default': '#8884d8'
    };
    return colors[type] || colors.default;
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
                <span style={styles.titleIcon}>🎫</span>
                SYSTÈME DE GESTION DES TICKETS
              </h1>
              <p style={styles.subtitle}>
                SURVEILLANCE ET ATTRIBUTION DES TICKETS EN TEMPS RÉEL
              </p>
            </div>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>{allTickets.length}</span>
                <span style={styles.statLabel}>TICKETS TOTAL</span>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statGlow}></div>
                <span style={styles.statNumber}>
                  {allTickets.filter(t => t.statutTicket === 'actif').length}
                </span>
                <span style={styles.statLabel}>TICKETS ACTIFS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton pour afficher le formulaire */}
        <div style={styles.addButtonContainer}>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={styles.addButton}
          >
            <span style={styles.buttonIcon}>
              {showForm ? '✖️' : '➕'}
            </span>
            <span>
              {showForm ? 'MASQUER LE FORMULAIRE' : 'AJOUTER UN TICKET'}
            </span>
          </button>
        </div>

        {/* Formulaire d'ajout (conditionnel) */}
        {showForm && (
          <div style={styles.formCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>➕ CRÉER ET ATTRIBUER UN TICKET</h3>
              <div style={styles.formIndicator}></div>
            </div>
            <form onSubmit={addTicket}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    IDENTIFIANT DU VOYAGEUR
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="ex: voyageur_001"
                      value={voyageurId}
                      onChange={(e) => handleVoyageurIdChange(e.target.value)}
                      style={styles.input}
                      required
                    />
                    <div style={styles.inputGlow}></div>
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    IDENTIFIANT DU TICKET
                    <span style={styles.required}>*</span>
                  </label>
                  <div style={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="ex: ticket_001"
                      value={ticketId}
                      onChange={(e) => handleTicketIdChange(e.target.value)}
                      style={styles.input}
                      required
                    />
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
                      <span style={styles.buttonIcon}>🎫</span>
                      <span>CRÉER ET ATTRIBUER LE TICKET</span>
                    </div>
                  )}
                </button>
                
                <button 
                  type="button"
                  onClick={() => {
                    setTicketId("");
                    setVoyageurId("");
                  }}
                  style={styles.secondaryButton}
                >
                  <span style={styles.buttonIcon}>🔄</span>
                  <span>RÉINITIALISER</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={styles.cancelButton}
                >
                  <span style={styles.buttonIcon}>❌</span>
                  <span>ANNULER</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recherche de tickets par voyageur */}
        <div style={styles.filterCard}>
          <div style={styles.cardGlow}></div>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>🔍 RECHERCHER LES TICKETS D'UN VOYAGEUR</h3>
            <div style={styles.formIndicator}></div>
          </div>
          <div style={styles.filterForm}>
            <div style={styles.filterInputGroup}>
              <div style={styles.inputContainer}>
                <input
                  type="text"
                  placeholder="ENTREZ L'IDENTIFIANT DU VOYAGEUR"
                  value={voyageurId}
                  onChange={(e) => handleVoyageurIdChange(e.target.value)}
                  style={styles.filterInput}
                />
                <div style={styles.inputGlow}></div>
              </div>
              <button
                onClick={handleSearchTickets}
                style={styles.filterButton}
                disabled={loading}
              >
                {loading ? (
                  <div style={styles.buttonContent}>
                    <div style={styles.smallSpinner}></div>
                    <span>RECHERCHE...</span>
                  </div>
                ) : (
                  <div style={styles.buttonContent}>
                    <span style={styles.buttonIcon}>🔍</span>
                    <span>RECHERCHER</span>
                  </div>
                )}
              </button>
            </div>
            
            {ticketsVoyageur.length > 0 ? (
              <div style={styles.ticketsList}>
                <h4 style={styles.listTitle}>TICKETS DU VOYAGEUR {voyageurId.toUpperCase()}</h4>
                <div style={styles.ticketsGrid}>
                  {ticketsVoyageur.map((ticket, index) => (
                    <div 
                      key={index} 
                      style={styles.ticketItem}
                    >
                      <div 
                        style={{
                          ...styles.ticketIcon,
                          backgroundColor: getTicketTypeColor(ticket.type),
                          boxShadow: `0 0 20px ${getTicketTypeColor(ticket.type)}`
                        }}
                      >
                        {getTicketTypeIcon(ticket.type)}
                      </div>
                      <div style={styles.ticketInfo}>
                        <div style={styles.ticketId}>{ticket.id}</div>
                        <div style={styles.ticketType}>{ticket.type.replace('Ticket', '').toUpperCase()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyText}>
                  {voyageurId ? `AUCUN TICKET TROUVÉ POUR "${voyageurId.toUpperCase()}"` : 'ENTREZ UN IDENTIFIANT VOYAGEUR'}
                </div>
                <div style={styles.emptySubtext}>
                  {voyageurId ? 'LE VOYAGEUR PEUT NE PAS EXISTER OU NE PAS AVOIR DE TICKETS' : 'RECHERCHEZ LES TICKETS PAR IDENTIFIANT VOYAGEUR'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tous les tickets */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📋 RÉPERTOIRE DES TICKETS ({allTickets.length})</h3>
            <div style={styles.sectionActions}>
              <button 
                onClick={fetchAllTickets}
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
                <p style={styles.loadingText}>CHARGEMENT DES TICKETS...</p>
              </div>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHead}>ID</th>
                        <th style={styles.tableHead}>TYPE</th>
                        <th style={styles.tableHead}>PRIX</th>
                        <th style={styles.tableHead}>STATUT</th>
                        <th style={styles.tableHead}>UTILISATEUR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTickets.map((ticket, idx) => (
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
                                backgroundColor: getTicketTypeColor(ticket.type_ticket || ticket.type),
                                boxShadow: `0 0 15px ${getTicketTypeColor(ticket.type_ticket || ticket.type)}`
                              }}
                            >
                              {getTicketTypeIcon(ticket.type_ticket || ticket.type)} {(ticket.type_ticket || ticket.type).replace('Ticket', '').toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.price}>
                              {ticket.prix ? `${ticket.prix} €` : 'GRATUIT'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span 
                              style={{
                                ...styles.statusBadge,
                                backgroundColor: (ticket.statutTicket === 'actif') ? '#00ff88' : '#ff00ff',
                                boxShadow: (ticket.statutTicket === 'actif') ? '0 0 15px #00ff88' : '0 0 15px #ff00ff'
                              }}
                            >
                              {(ticket.statutTicket || 'actif').toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            {ticket.utilisateur ? (
                              <span style={styles.voyageurBadge}>
                                👤 {ticket.utilisateur.toUpperCase()}
                              </span>
                            ) : (
                              <span style={styles.noVoyageur}>NON ATTRIBUÉ</span>
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
                    <div style={styles.emptyText}>AUCUN TICKET ENREGISTRÉ</div>
                    <div style={styles.emptySubtext}>
                      CRÉEZ ET ATTRIBUEZ DES TICKETS AUX VOYAGEURS POUR COMMENCER
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {allTickets.length > 0 && (
                  <div style={styles.pagination}>
                    <button 
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{
                        ...styles.paginationButton,
                        ...(currentPage === 1 && styles.paginationButtonDisabled)
                      }}
                    >
                      ‹ PRÉCÉDENT
                    </button>
                    
                    <div style={styles.paginationInfo}>
                      Page {currentPage} sur {totalPages}
                    </div>

                    <button 
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      style={{
                        ...styles.paginationButton,
                        ...(currentPage === totalPages && styles.paginationButtonDisabled)
                      }}
                    >
                      SUIVANT ›
                    </button>
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
    border: '1px solid rgba(255, 170, 0, 0.3)',
    boxShadow: '0 0 30px rgba(255, 170, 0, 0.1)',
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
    background: 'linear-gradient(90deg, transparent, rgba(255,170,0,0.05), transparent)',
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
    background: 'linear-gradient(135deg, #ffffff, #ffaa00)',
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
    gap: '1rem'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    backgroundColor: 'rgba(255, 170, 0, 0.1)',
    borderRadius: '1rem',
    border: '1px solid rgba(255, 170, 0, 0.3)',
    minWidth: '160px',
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
    background: 'radial-gradient(circle at center, rgba(255,170,0,0.1) 0%, transparent 70%)',
    animation: 'pulse 2s ease-in-out infinite'
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#ffaa00',
    textShadow: '0 0 10px rgba(255, 170, 0, 0.5)'
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#88ffff',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: '1px'
  },
  addButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem'
  },
  addButton: {
    background: 'linear-gradient(135deg, #ffaa00, #00ffff)',
    color: '#0a0a0a',
    fontWeight: '700',
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 25px rgba(255, 170, 0, 0.4)',
    minWidth: '300px',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
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
  filterCard: {
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
  formIndicator: {
    width: '4rem',
    height: '0.25rem',
    background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
    borderRadius: '2rem'
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
  primaryButton: {
    background: 'linear-gradient(135deg, #ffaa00, #00ffff)',
    color: '#0a0a0a',
    fontWeight: '700',
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 25px rgba(255, 170, 0, 0.4)',
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
  cancelButton: {
    backgroundColor: 'transparent',
    color: '#ff4444',
    fontWeight: '600',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255, 68, 68, 0.3)',
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
  filterForm: {
    width: '100%'
  },
  filterInputGroup: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  filterInput: {
    flex: '1',
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
  filterButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    color: '#00ffff',
    fontWeight: '600',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    letterSpacing: '0.5px'
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
  sectionActions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#00ffff',
    letterSpacing: '1px'
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
  ticketsList: {
    marginTop: '1.5rem'
  },
  listTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#00ffff',
    marginBottom: '1rem',
    letterSpacing: '1px'
  },
  ticketsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem'
  },
  ticketItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    borderRadius: '1rem',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)'
  },
  ticketIcon: {
    width: '4rem',
    height: '4rem',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '1.5rem',
    flexShrink: 0,
    transition: 'all 0.3s ease'
  },
  ticketInfo: {
    flex: 1
  },
  ticketId: {
    fontWeight: '700',
    color: '#ffffff',
    fontSize: '1rem',
    letterSpacing: '0.5px'
  },
  ticketType: {
    color: '#88ffff',
    fontSize: '0.8rem',
    fontWeight: '600',
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
  ticketBadge: {
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
    letterSpacing: '0.5px'
  },
  price: {
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
    textTransform: 'uppercase',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    letterSpacing: '0.5px'
  },
  voyageurBadge: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    color: '#88ffff',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    letterSpacing: '0.5px'
  },
  noVoyageur: {
    color: '#ff6b6b',
    fontStyle: 'italic',
    fontSize: '0.875rem'
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
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1.5rem',
    gap: '1rem',
    borderTop: '1px solid rgba(0, 255, 255, 0.1)'
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
    letterSpacing: '0.5px'
  },
  paginationButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed'
  },
  paginationInfo: {
    color: '#88ffff',
    fontSize: '0.9rem',
    fontWeight: '600',
    padding: '0 1rem'
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

  input:focus, select:focus, textarea:focus {
    border-color: #00ffff !important;
    background-color: rgba(0, 0, 0, 0.5) !important;
    box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.3) !important;
  }

  input:focus + .input-glow, select:focus + .input-glow, textarea:focus + .input-glow {
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5) !important;
  }

  .primary-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 0 35px rgba(255, 170, 0, 0.6);
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

  .cancel-button:hover {
    background-color: rgba(255, 68, 68, 0.1);
    border-color: rgba(255, 68, 68, 0.5);
    transform: translateY(-1px);
  }

  .filter-button:hover:not(:disabled) {
    background-color: rgba(0, 255, 255, 0.3);
    border-color: rgba(0, 255, 255, 0.6);
    transform: translateY(-1px);
  }

  .refresh-button:hover:not(:disabled) {
    background-color: rgba(0, 255, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  .add-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 35px rgba(255, 170, 0, 0.6);
  }

  .pagination-button:hover:not(:disabled) {
    background-color: rgba(0, 255, 255, 0.2);
    border-color: rgba(0, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  .ticket-item:hover {
    background-color: rgba(0, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  }

  .table-row:hover {
    background-color: rgba(0, 255, 255, 0.05);
    transform: translateX(4px);
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
    
    .primary-button, .secondary-button, .cancel-button {
      width: 100%;
      justify-content: center;
    }
    
    .filter-input-group {
      flex-direction: column;
    }
    
    .filter-input, .filter-button {
      width: 100%;
    }
    
    .tickets-grid {
      grid-template-columns: 1fr;
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
    
    .form-card, .filter-card, .table-card {
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
    
    .pagination {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
`;

// Injection des styles globaux
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}