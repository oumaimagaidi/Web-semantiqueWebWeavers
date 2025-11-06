# config/queries.py
"""
Module contenant les modèles de requêtes SPARQL prédéfinies pour l'ontologie Smart City Mobilité
"""

# Dictionnaire des requêtes templates avec des noms discrets
QUERY_PATTERNS = {
    # REQUÊTES PERSONNES
    "user_travel": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?trajet ?typeTrajet ?depart ?arrivee ?transport ?duree ?distance 
           ?heureDepart ?heureArrivee ?conditionsMeteo ?scoreConfort ?scoreSecurite
           ?consommationEnergie ?emissionsCO2 ?vitesseMoyenne
    WHERE {
      mobilite:{user} mobilite:effectueTrajet ?trajet .
      ?trajet rdf:type ?typeTrajet .
      ?trajet mobilite:commenceA ?depart .
      ?trajet mobilite:termineA ?arrivee .
      OPTIONAL { ?trajet mobilite:utiliseMoyenTransport ?transport . }
      OPTIONAL { ?trajet mobilite:duree ?duree . }
      OPTIONAL { ?trajet mobilite:distance ?distance . }
      OPTIONAL { ?trajet mobilite:heureDepart ?heureDepart . }
      OPTIONAL { ?trajet mobilite:heureArrivee ?heureArrivee . }
      OPTIONAL { ?trajet mobilite:conditionsMeteo ?conditionsMeteo . }
      OPTIONAL { ?trajet mobilite:scoreConfort ?scoreConfort . }
      OPTIONAL { ?trajet mobilite:scoreSecurite ?scoreSecurite . }
      OPTIONAL { ?trajet mobilite:consommationEnergie ?consommationEnergie . }
      OPTIONAL { ?trajet mobilite:emissionsCO2 ?emissionsCO2 . }
      OPTIONAL { ?trajet mobilite:vitesseMoyenne ?vitesseMoyenne . }
    }
    ORDER BY ?heureDepart
    """,
    
    "user_profile": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?prenom ?nom ?age ?habitation ?travail ?transportPrefere ?typePersonne
           ?email ?telephone ?nationalite ?genre ?dateNaissance ?dateInscription
           ?niveauAbonnement ?scoreFidelite ?statutCompte ?languePreferee
           ?preferencesAccessibilite
    WHERE {
      mobilite:{user} mobilite:prenom ?prenom .
      mobilite:{user} mobilite:nom ?nom .
      OPTIONAL { mobilite:{user} mobilite:age ?age . }
      OPTIONAL { mobilite:{user} mobilite:habiteA ?habitation . }
      OPTIONAL { mobilite:{user} mobilite:travailleA ?travail . }
      OPTIONAL { mobilite:{user} mobilite:prefereMoyenTransport ?transportPrefere . }
      OPTIONAL { mobilite:{user} mobilite:email ?email . }
      OPTIONAL { mobilite:{user} mobilite:telephone ?telephone . }
      OPTIONAL { mobilite:{user} mobilite:nationalite ?nationalite . }
      OPTIONAL { mobilite:{user} mobilite:genre ?genre . }
      OPTIONAL { mobilite:{user} mobilite:dateNaissance ?dateNaissance . }
      OPTIONAL { mobilite:{user} mobilite:dateInscription ?dateInscription . }
      OPTIONAL { mobilite:{user} mobilite:niveauAbonnement ?niveauAbonnement . }
      OPTIONAL { mobilite:{user} mobilite:scoreFidelite ?scoreFidelite . }
      OPTIONAL { mobilite:{user} mobilite:statutCompte ?statutCompte . }
      OPTIONAL { mobilite:{user} mobilite:languePreferee ?languePreferee . }
      OPTIONAL { mobilite:{user} mobilite:preferencesAccessibilite ?preferencesAccessibilite . }
      OPTIONAL { 
        mobilite:{user} rdf:type ?typePersonne . 
        FILTER(?typePersonne != mobilite:Personne) 
      }
    }
    """,
    
    "user_tickets": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    SELECT ?ticket ?typeTicket ?prix ?statut ?dateExpiration ?numeroTicket 
           ?zoneValidite ?classeTicket ?dateAchat ?methodePaiement ?acheteA
           ?valablePour ?donneAccesA ?nombreValidations
    WHERE {
      mobilite:{user} mobilite:possedeTicket ?ticket .
      ?ticket mobilite:typeTicket ?typeTicket .
      OPTIONAL { ?ticket mobilite:prix ?prix . }
      OPTIONAL { ?ticket mobilite:statutTicket ?statut . }
      OPTIONAL { ?ticket mobilite:dateExpiration ?dateExpiration . }
      OPTIONAL { ?ticket mobilite:numeroTicket ?numeroTicket . }
      OPTIONAL { ?ticket mobilite:zoneValidite ?zoneValidite . }
      OPTIONAL { ?ticket mobilite:classeTicket ?classeTicket . }
      OPTIONAL { ?ticket mobilite:dateAchat ?dateAchat . }
      OPTIONAL { ?ticket mobilite:methodePaiement ?methodePaiement . }
      OPTIONAL { ?ticket mobilite:acheteA ?acheteA . }
      OPTIONAL { ?ticket mobilite:valablePour ?valablePour . }
      OPTIONAL { ?ticket mobilite:donneAccesA ?donneAccesA . }
      OPTIONAL { ?ticket mobilite:nombreValidations ?nombreValidations . }
    }
    ORDER BY DESC(?dateAchat)
    """,
    
    "user_reviews": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    SELECT ?avis ?note ?commentaire ?dateAvis ?categorie ?scoreUtilite ?langueAvis
           ?verifie ?nombreSignalements ?concerneTransport ?concerneInfrastructure
    WHERE {
      mobilite:{user} mobilite:donneAvis ?avis .
      ?avis mobilite:note ?note .
      ?avis mobilite:commentaire ?commentaire .
      ?avis mobilite:dateAvis ?dateAvis .
      OPTIONAL { ?avis mobilite:categorieAvis ?categorie . }
      OPTIONAL { ?avis mobilite:scoreUtilite ?scoreUtilite . }
      OPTIONAL { ?avis mobilite:langueAvis ?langueAvis . }
      OPTIONAL { ?avis mobilite:verifie ?verifie . }
      OPTIONAL { ?avis mobilite:nombreSignalements ?nombreSignalements . }
      OPTIONAL { ?avis mobilite:concerneTransport ?concerneTransport . }
      OPTIONAL { ?avis mobilite:concerneInfrastructure ?concerneInfrastructure . }
    }
    ORDER BY DESC(?dateAvis)
    """,
    
    # REQUÊTES GÉNÉRALES
    "student_tickets_list": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    SELECT ?personne ?prenom ?nom ?ticket ?typeTicket ?prix ?numeroTicket ?dateAchat
           ?dateExpiration ?statutTicket ?zoneValidite ?classeTicket
    WHERE {
      ?personne mobilite:possedeTicket ?ticket .
      ?personne mobilite:prenom ?prenom .
      ?personne mobilite:nom ?nom .
      ?ticket mobilite:typeTicket "Étudiant" .
      OPTIONAL { ?ticket mobilite:prix ?prix . }
      OPTIONAL { ?ticket mobilite:numeroTicket ?numeroTicket . }
      OPTIONAL { ?ticket mobilite:dateAchat ?dateAchat . }
      OPTIONAL { ?ticket mobilite:dateExpiration ?dateExpiration . }
      OPTIONAL { ?ticket mobilite:statutTicket ?statutTicket . }
      OPTIONAL { ?ticket mobilite:zoneValidite ?zoneValidite . }
      OPTIONAL { ?ticket mobilite:classeTicket ?classeTicket . }
    }
    ORDER BY ?prenom
    """,
    
    "all_trajets": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?trajet ?typeTrajet ?personne ?prenom ?depart ?arrivee ?duree ?distance
           ?heureDepart ?heureArrivee ?transport
    WHERE {
      ?personne mobilite:effectueTrajet ?trajet .
      ?personne mobilite:prenom ?prenom .
      ?trajet rdf:type ?typeTrajet .
      ?trajet mobilite:commenceA ?depart .
      ?trajet mobilite:termineA ?arrivee .
      OPTIONAL { ?trajet mobilite:duree ?duree . }
      OPTIONAL { ?trajet mobilite:distance ?distance . }
      OPTIONAL { ?trajet mobilite:heureDepart ?heureDepart . }
      OPTIONAL { ?trajet mobilite:heureArrivee ?heureArrivee . }
      OPTIONAL { ?trajet mobilite:utiliseMoyenTransport ?transport . }
    }
    ORDER BY ?prenom
    """,
    
    # REQUÊTES INFRASTRUCTURES
    "infrastructure_details": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?infrastructure ?typeInfrastructure ?adresse ?coordonneesGPS 
           ?capaciteAccueil ?superficie ?etatMaintenance ?horairesOuverture
           ?dateConstruction ?niveauAccessibilite
    WHERE {
      ?infrastructure rdf:type mobilite:Infrastructure .
      ?infrastructure rdf:type ?typeInfrastructure .
      FILTER(?typeInfrastructure != mobilite:Infrastructure)
      OPTIONAL { ?infrastructure mobilite:adresse ?adresse . }
      OPTIONAL { ?infrastructure mobilite:coordonneesGPS ?coordonneesGPS . }
      OPTIONAL { ?infrastructure mobilite:capaciteAccueil ?capaciteAccueil . }
      OPTIONAL { ?infrastructure mobilite:superficie ?superficie . }
      OPTIONAL { ?infrastructure mobilite:etatMaintenance ?etatMaintenance . }
      OPTIONAL { ?infrastructure mobilite:horairesOuverture ?horairesOuverture . }
      OPTIONAL { ?infrastructure mobilite:dateConstruction ?dateConstruction . }
      OPTIONAL { ?infrastructure mobilite:niveauAccessibilite ?niveauAccessibilite . }
    }
    ORDER BY ?typeInfrastructure
    """,
    
    "stations_recharge": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?station ?adresse ?puissanceMax ?prixKwh ?disponible
    WHERE {
      ?station rdf:type mobilite:RechargeElectrique ;
               mobilite:adresse ?adresse ;
               mobilite:puissanceMax ?puissanceMax ;
               mobilite:prixKwh ?prixKwh ;
               mobilite:disponible ?disponible .
    }
    """,
    
    # REQUÊTES TRANSPORTS
    "transports_details": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?transport ?typeTransport ?marque ?modele ?immatriculation ?couleur
           ?anneeFabrication ?kilometrage ?consommationMoyenne ?niveauCarburant
           ?conduitPar ?appartientA ?circuleSur ?utiliseStationRecharge
    WHERE {
      ?transport rdf:type mobilite:ReseauTransport .
      ?transport rdf:type ?typeTransport .
      FILTER(?typeTransport != mobilite:ReseauTransport)
      OPTIONAL { ?transport mobilite:marque ?marque . }
      OPTIONAL { ?transport mobilite:modele ?modele . }
      OPTIONAL { ?transport mobilite:immatriculation ?immatriculation . }
      OPTIONAL { ?transport mobilite:couleur ?couleur . }
      OPTIONAL { ?transport mobilite:anneeFabrication ?anneeFabrication . }
      OPTIONAL { ?transport mobilite:kilometrage ?kilometrage . }
      OPTIONAL { ?transport mobilite:consommationMoyenne ?consommationMoyenne . }
      OPTIONAL { ?transport mobilite:niveauCarburant ?niveauCarburant . }
      OPTIONAL { ?transport mobilite:conduitPar ?conduitPar . }
      OPTIONAL { ?transport mobilite:appartientA ?appartientA . }
      OPTIONAL { ?transport mobilite:circuleSur ?circuleSur . }
      OPTIONAL { ?transport mobilite:utiliseStationRecharge ?utiliseStationRecharge . }
    }
    ORDER BY ?typeTransport
    """,
    
    # REQUÊTES STATISTIQUES
    "statistiques_accidents": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    SELECT ?valeur ?unite ?periodeMesure ?tendance ?niveauConfiance
    WHERE {
      mobilite:StatsAccidentsA1 mobilite:valeur ?valeur ;
                            mobilite:unite ?unite ;
                            mobilite:periodeMesure ?periodeMesure ;
                            mobilite:tendance ?tendance ;
                            mobilite:niveauConfiance ?niveauConfiance .
    }
    """,
    
    # REQUÊTES TRAFIC
    "incidents_trafic": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?incident ?typeIncident ?cause ?gravite ?dureeIncident ?vitesseMoyenneTrafic
    WHERE {
      ?incident rdf:type ?type ;
                mobilite:causeIncident ?cause ;
                mobilite:gravite ?gravite ;
                mobilite:dureeIncident ?dureeIncident ;
                mobilite:vitesseMoyenneTrafic ?vitesseMoyenneTrafic .
      FILTER(?type IN (mobilite:Embouteillage, mobilite:Accident))
    }
    """,
    
    # REQUÊTES RADARS
    "radars_details": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?radar ?typeRadar ?vitesseMaximale ?nombreInfractions ?etatFonctionnement
    WHERE {
      ?radar rdf:type mobilite:Radar ;
             mobilite:typeRadar ?typeRadar ;
             mobilite:vitesseMaximale ?vitesseMaximale ;
             mobilite:nombreInfractions ?nombreInfractions ;
             mobilite:etatFonctionnement ?etatFonctionnement .
    }
    """,
    
    # REQUÊTES AVIS
    "all_avis": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?avis ?typeAvis ?note ?commentaire ?dateAvis ?categorieAvis ?scoreUtilite
           ?langueAvis ?verifie ?nombreSignalements ?personne ?prenom
           ?concerneTransport ?concerneInfrastructure
    WHERE {
      ?avis rdf:type mobilite:Avis .
      ?avis rdf:type ?typeAvis .
      FILTER(?typeAvis != mobilite:Avis)
      ?avis mobilite:note ?note .
      ?avis mobilite:commentaire ?commentaire .
      ?avis mobilite:dateAvis ?dateAvis .
      ?personne mobilite:donneAvis ?avis .
      ?personne mobilite:prenom ?prenom .
      OPTIONAL { ?avis mobilite:categorieAvis ?categorieAvis . }
      OPTIONAL { ?avis mobilite:scoreUtilite ?scoreUtilite . }
      OPTIONAL { ?avis mobilite:langueAvis ?langueAvis . }
      OPTIONAL { ?avis mobilite:verifie ?verifie . }
      OPTIONAL { ?avis mobilite:nombreSignalements ?nombreSignalements . }
      OPTIONAL { ?avis mobilite:concerneTransport ?concerneTransport . }
      OPTIONAL { ?avis mobilite:concerneInfrastructure ?concerneInfrastructure . }
    }
    ORDER BY DESC(?dateAvis)
    """,
    
    # NOUVELLES REQUÊTES SPÉCIFIQUES
    "trajets_oumaima": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?trajet ?typeTrajet ?heureDepart ?heureArrivee
    WHERE {
      mobilite:Oumaima mobilite:effectueTrajet ?trajet .
      ?trajet rdf:type ?typeTrajet .
      ?trajet mobilite:heureDepart ?heureDepart .
      ?trajet mobilite:heureArrivee ?heureArrivee .
    }
    """,
    
    "details_trajet_wala": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    SELECT ?distance ?duree ?vitesseMoyenne ?emissionsCO2
    WHERE {
      mobilite:TrajetDomicileTravailWala mobilite:distance ?distance ;
                                          mobilite:duree ?duree ;
                                          mobilite:vitesseMoyenne ?vitesseMoyenne ;
                                          mobilite:emissionsCO2 ?emissionsCO2 .
    }
    """,
    
    "tickets_utilisateurs": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    SELECT ?personne ?nom ?ticket ?typeTicket ?prix
    WHERE {
      ?personne mobilite:possedeTicket ?ticket ;
                mobilite:nom ?nom ;
                mobilite:prenom ?prenom .
      ?ticket mobilite:typeTicket ?typeTicket ;
              mobilite:prix ?prix .
    }
    """,
    
    "avis_utilisateurs": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    SELECT ?personne ?avis ?note ?commentaire ?dateAvis
    WHERE {
      ?personne mobilite:donneAvis ?avis .
      ?avis mobilite:note ?note ;
            mobilite:commentaire ?commentaire ;
            mobilite:dateAvis ?dateAvis .
    }
    """,
    
    "vehicules_conducteurs": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    SELECT ?vehicule ?marque ?modele ?conducteur ?prenom ?nom
    WHERE {
      ?vehicule mobilite:conduitPar ?conducteur ;
                mobilite:marque ?marque ;
                mobilite:modele ?modele .
      ?conducteur mobilite:prenom ?prenom ;
                  mobilite:nom ?nom .
    }
    """,
    
    "trajets_points": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?trajet ?typeTrajet ?depart ?arrivee ?distance ?duree
    WHERE {
      ?trajet mobilite:commenceA ?depart ;
              mobilite:termineA ?arrivee ;
              mobilite:distance ?distance ;
              mobilite:duree ?duree .
      ?trajet rdf:type ?typeTrajet .
    }
    """,
    
    "transports_preferes": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?personne ?prenom ?nom ?moyenTransport ?typeTransport
    WHERE {
      ?personne mobilite:prefereMoyenTransport ?moyenTransport ;
                mobilite:prenom ?prenom ;
                mobilite:nom ?nom .
      ?moyenTransport rdf:type ?typeTransport .
    }
    """,
    
    "reseaux_transport": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?personne ?prenom ?nom ?reseauTransport ?typeReseau
    WHERE {
      ?personne mobilite:utiliseReseauTransport ?reseauTransport ;
                mobilite:prenom ?prenom ;
                mobilite:nom ?nom .
      ?reseauTransport rdf:type ?typeReseau .
    }
    """,
    
    "batiments_equipements": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?batiment ?adresse ?equipement ?typeEquipement
    WHERE {
      ?batiment rdf:type mobilite:Batiment ;
                mobilite:adresse ?adresse ;
                mobilite:disposeDe ?equipement .
      ?equipement rdf:type ?typeEquipement .
    }
    """,
    
    "trajets_optimaux": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?trajet ?scoreOptimisation ?scoreConfort ?scoreSecurite ?consommationEnergie
    WHERE {
      ?trajet rdf:type mobilite:TrajetOptimal ;
              mobilite:scoreOptimisation ?scoreOptimisation ;
              mobilite:scoreConfort ?scoreConfort ;
              mobilite:scoreSecurite ?scoreSecurite ;
              mobilite:consommationEnergie ?consommationEnergie .
    }
    """,
    
    "zones_frequentees": """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?personne ?prenom ?nom ?zone ?typeZone ?adresse
    WHERE {
      ?personne mobilite:frequenteZone ?zone ;
                mobilite:prenom ?prenom ;
                mobilite:nom ?nom .
      ?zone mobilite:adresse ?adresse ;
            rdf:type ?typeZone .
    }
    """
}

# Mapping des questions courantes vers les templates
QUESTION_MAPPING = {
    # Personnes
    "trajet": "user_travel",
    "parcours": "user_travel", 
    "déplacement": "user_travel",
    "itinéraire": "user_travel",
    "qui est": "user_profile",
    "informations": "user_profile",
    "profil": "user_profile",
    "personne": "user_profile",
    
    # Tickets
    "ticket étudiant": "student_tickets_list",
    "tickets étudiant": "student_tickets_list",
    "billet étudiant": "student_tickets_list",
    "étudiants tickets": "student_tickets_list",
    "mes tickets": "user_tickets",
    "mes billets": "user_tickets",
    
    # Avis
    "avis": "user_reviews",
    "commentaire": "user_reviews",
    "review": "user_reviews",
    "évaluation": "user_reviews",
    "tous les avis": "all_avis",
    
    # Transports
    "tous les trajets": "all_trajets",
    "liste trajets": "all_trajets",
    "transports": "transports_details",
    "véhicules": "transports_details",
    
    # Infrastructures
    "infrastructures": "infrastructure_details",
    "bâtiments": "infrastructure_details",
    "stations": "stations_recharge",
    "recharge": "stations_recharge",
    
    # Trafic
    "incidents": "incidents_trafic",
    "trafic": "incidents_trafic",
    "embouteillages": "incidents_trafic",
    "accidents": "incidents_trafic",
    
    # Statistiques
    "statistiques": "statistiques_accidents",
    "stats": "statistiques_accidents",
    
    # Radars
    "radars": "radars_details",
    
    # Nouvelles requêtes spécifiques
    "trajets oumaima": "trajets_oumaima",
    "détails trajet wala": "details_trajet_wala",
    "tous les tickets": "tickets_utilisateurs",
    "tous les avis utilisateurs": "avis_utilisateurs",
    "véhicules et conducteurs": "vehicules_conducteurs",
    "trajets avec points": "trajets_points",
    "transports préférés": "transports_preferes",
    "réseaux transport utilisés": "reseaux_transport",
    "bâtiments équipements": "batiments_equipements",
    "trajets optimaux": "trajets_optimaux",
    "zones fréquentées": "zones_frequentees"
}

# Liste des utilisateurs connus
KNOWN_USERS = ["Wala", "Oumaima"]

# Liste des infrastructures principales
KNOWN_INFRASTRUCTURES = [
    "AppartementWala", "SiegeSocial", "ResidenceOumaima", "UniversiteCarthage",
    "StationBusUniversite", "StationRechargeElectriqueNord", "ParkingSiegeSocial",
    "AutorouteA1", "AvenueMohamedV", "CampusUniversitaire", "ZoneAffaires"
]

# Liste des transports
KNOWN_TRANSPORTS = [
    "VoitureWala", "BusLigne28"
]

# Liste des trajets
KNOWN_TRAJETS = [
    "TrajetDomicileTravailWala", "TrajetUniversiteOumaima", "TrajetMarcheOumaima"
]