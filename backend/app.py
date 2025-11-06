# main.py
import datetime
from typing import Any
import re
from fastapi import FastAPI, UploadFile, File, Request, HTTPException
from pydantic import BaseModel
from rdflib import Graph, Namespace, Literal, URIRef
from rdflib.namespace import RDF, RDFS, XSD
from SPARQLWrapper import SPARQLWrapper, JSON, POST
import requests
from owlrl import DeductiveClosure, OWLRL_Semantics
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import json
from datetime import datetime  # Ajoutez cette ligne
############################
from fastapi import HTTPException
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from rdflib import Graph, Namespace
import ollama
import re

from utils.util_ import SPARQLGenerator
from config.queries import QUERY_PATTERNS 

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


# ======================
# 🔧 CONFIGURATION
# ======================
load_dotenv()

# Configuration Ollama
OLLAMA_BASE_URL = "http://localhost:11434"
# OLLAMA_MODEL = "llama3:8b"

FUSEKI_BASE = "http://localhost:3030"
FUSEKI_QUERY_URL = f"{FUSEKI_BASE}/smartcity/sparql"
FUSEKI_UPDATE_URL = f"{FUSEKI_BASE}/smartcity/update"
FUSEKI_DATA_ENDPOINT = f"{FUSEKI_BASE}/smartcity/data"

# Namespace de votre ontologie
MOBILITE = Namespace("http://www.semanticweb.org/smartcity/ontologies/mobilite#")
INFERRED_GRAPH_URI = "http://example.org/inferred"

# Charger le graphe RDF local
g = Graph()
try:
    g.parse("mobilite.rdf")
except Exception:
    pass
g.bind("mobilite", MOBILITE)

# ======================
# 🔁 SYNCHRONISATION FUSEKI → FICHIER LOCAL
# ======================

def sync_from_fuseki_to_local():
    """
    Télécharge tous les triples de Fuseki et les enregistre localement
    """
    try:
        print("🔄 Synchronisation Fuseki → mobilite.rdf ...")
        
        # Essayer plusieurs formats et endpoints
        endpoints = [
            f"{FUSEKI_DATA_ENDPOINT}?graph=default",
            f"{FUSEKI_DATA_ENDPOINT}?default",
            FUSEKI_DATA_ENDPOINT
        ]
        
        for url in endpoints:
            try:
                response = requests.get(url, headers={"Accept": "application/rdf+xml"})
                if response.status_code == 200 and response.text.strip():
                    # Sauvegarder dans le fichier principal
                    with open("mobilite.rdf", "w", encoding="utf-8") as f:
                        f.write(response.text)
                    print(f"✅ Synchronisation réussie depuis {url}")
                    
                    # Recharger le graphe local
                    global g
                    g = Graph()
                    g.parse("mobilite.rdf")
                    return
            except Exception as e:
                print(f"⚠️ Échec avec {url}: {e}")
                continue
        
        print("❌ Aucune méthode de synchronisation n'a fonctionné")
        
    except Exception as e:
        print(f"❌ Erreur de synchronisation Fuseki → local : {e}")
# Exécuter la synchro au démarrage
sync_from_fuseki_to_local()

# ======================
# 🚀 APPLICATION FASTAPI
# ======================

app = FastAPI(title="SmartCity Mobility API", version="4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================
# ⚙️ FONCTIONS UTILITAIRES
# ======================
@app.get("/debug/fuseki/")
def debug_fuseki():
    """Endpoint de débogage pour Fuseki"""
    try:
        # Test de connexion de base
        sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
        sparql.setReturnFormat(JSON)
        sparql.setQuery("SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }")
        result = sparql.query().convert()
        total_triples = result['results']['bindings'][0]['count']['value']
        
        # Compter les tickets
        sparql.setQuery(f"""
        PREFIX mobilite: <{MOBILITE}>
        SELECT (COUNT(*) as ?count) WHERE {{
            ?ticket a ?type .
            ?type rdfs:subClassOf* mobilite:Ticket .
        }}
        """)
        ticket_result = sparql.query().convert()
        ticket_count = ticket_result['results']['bindings'][0]['count']['value']
        
        return {
            "status": "✅ Fuseki connecté",
            "total_triples": total_triples,
            "ticket_count": ticket_count,
            "fuseki_url": FUSEKI_QUERY_URL,
            "update_url": FUSEKI_UPDATE_URL
        }
    except Exception as e:
        return {"status": "❌ Fuseki non accessible", "error": str(e)}
def send_to_fuseki(update_query: str):
    """Envoie une requête SPARQL UPDATE à Fuseki avec vérification"""
    sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
    sparql.setMethod(POST)
    sparql.setQuery(update_query)
    try:
        print(f"🚀 Envoi de la requête UPDATE à Fuseki...")
        result = sparql.query()
        print(f"✅ Requête UPDATE exécutée avec succès")
        
        # Vérifier que les données sont bien ajoutées
        if "INSERT" in update_query.upper():
            # Attendre un peu pour que Fuseki traite la requête
            import time
            time.sleep(0.5)
            
            # Vérifier avec une requête COUNT
            check_query = """
            PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
            SELECT (COUNT(*) as ?count) WHERE {
                ?s ?p ?o
            }
            """
            sparql_check = SPARQLWrapper(FUSEKI_QUERY_URL)
            sparql_check.setReturnFormat(JSON)
            sparql_check.setQuery(check_query)
            check_result = sparql_check.query().convert()
            print(f"📊 Nombre total de triples dans Fuseki : {check_result['results']['bindings'][0]['count']['value']}")
        
        return True
    except Exception as e:
        print(f"❌ Erreur détaillée lors de l'envoi à Fuseki: {e}")
        print(f"📝 Requête problématique: {update_query}")
        return False
def execute_sparql_query(query: str):
    """Exécute une requête SPARQL SELECT et retourne les résultats"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(query)
    try:
        print(f"🔍 Exécution de la requête SPARQL...")
        results = sparql.query().convert()
        print(f"✅ Requête exécutée avec succès")
        return results
    except Exception as e:
        print(f"❌ Erreur SPARQL détaillée: {str(e)}")
        try:
            sparql.setReturnFormat(JSON)
            sparql.setQuery("SELECT * WHERE { ?s ?p ?o } LIMIT 1")
            test_result = sparql.query().convert()
            print("✅ Connexion Fuseki fonctionnelle")
        except Exception as conn_error:
            print(f"❌ Problème de connexion Fuseki: {conn_error}")
        
        raise Exception(f"Erreur SPARQL: {str(e)}")

def push_data_to_graph(turtle_data: bytes, graph_uri: str):
    """Pousse du TTL vers l'endpoint /data de Fuseki"""
    url = f"{FUSEKI_DATA_ENDPOINT}?graph={graph_uri}"
    headers = {"Content-Type": "text/turtle"}
    r = requests.post(url, data=turtle_data, headers=headers)
    r.raise_for_status()
    return r

def clean_sparql_query(query: str) -> str:
    """Nettoie la requête SPARQL générée par l'IA pour être compatible avec Fuseki."""
    query = query.strip()

    # Supprimer tout le texte avant la première requête SPARQL
    lines = query.split('\n')
    sparql_lines = []
    in_sparql = False
    
    for line in lines:
        if any(keyword in line.upper() for keyword in ['SELECT', 'ASK', 'CONSTRUCT', 'DESCRIBE', 'INSERT', 'DELETE', 'CREATE', 'DROP']):
            in_sparql = True
        
        if in_sparql:
            sparql_lines.append(line)
    
    if sparql_lines:
        query = '\n'.join(sparql_lines)

    # Supprimer les balises Markdown
    query = re.sub(r"```[a-zA-Z]*", "", query)
    query = query.replace("```", "").strip()
    query = query.replace("\\n", "\n")
    query = query.replace("mobilitemobilite:", "mobilite:")

    # Supprimer les notes et commentaires textuels
    query = re.sub(r"Notez que.*$", "", query, flags=re.IGNORECASE | re.MULTILINE)
    query = re.sub(r"Note:.*$", "", query, flags=re.IGNORECASE | re.MULTILINE)
    query = re.sub(r"La requête SPARQL.*est :", "", query, flags=re.IGNORECASE)
    query = re.sub(r"SPARQL:?", "", query, flags=re.IGNORECASE)

    # Corriger le préfixe mal formé
    query = re.sub(r"PREFIX\s*:\s*<[^>]+>", f"PREFIX mobilite: <{MOBILITE}>", query)
    query = re.sub(r"PREFIX\s+mobilite:\s*<http://example\.org/?.*?>", f"PREFIX mobilite: <{MOBILITE}>", query)

    # Si aucun PREFIX mobilite, on l'ajoute
    if "PREFIX mobilite:" not in query:
        query = f"PREFIX mobilite: <{MOBILITE}>\n" + query

    # Corriger les notations sans préfixe
    query = re.sub(r"(?<!\w):(\w+)", r"mobilite:\1", query)

    # Ajouter PREFIX rdfs si nécessaire
    if "rdfs:subClassOf" in query and "PREFIX rdfs:" not in query:
        query = f"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" + query

    # Ajouter PREFIX rdf si nécessaire
    if "rdf:type" in query and "PREFIX rdf:" not in query:
        query = f"PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" + query

    # Nettoyer les espaces multiples
    query = re.sub(r'\n\s*\n', '\n', query)
    query = re.sub(r'[ ]+', ' ', query)

    return query.strip()
# ======================
# 🎫 ENDPOINT POUR CRÉER UN TICKET
# ======================

# ======================
# 🎫 ENDPOINT UNIFIÉ POUR CRÉER UN TICKET
# ======================

class TicketCreate(BaseModel):
    id: str
    type_ticket: str
    prix: float
    statutTicket: str = "actif"
    utilisateur_id: str | None = None
@app.post("/create_ticket/")
def create_ticket(ticket_data: TicketCreate):
    """
    Crée un nouveau ticket et l'associe éventuellement à un utilisateur
    """
    try:
        print(f"🎫 Tentative de création du ticket: {ticket_data.id}")
        print(f"🔍 Type de ticket reçu: '{ticket_data.type_ticket}'")
        
        # VALIDATION CORRIGÉE DES TYPES DE TICKETS
        valid_types = ["TicketBus", "TicketMetro", "TicketParking"]
        type_clean = ticket_data.type_ticket
        
        # Vérification plus flexible
        if type_clean not in valid_types:
            print(f"❌ Type invalide: '{type_clean}'. Types valides: {valid_types}")
            return {
                "error": f"❌ Type '{ticket_data.type_ticket}' invalide. Doit être un de {valid_types}",
                "received_type": type_clean,
                "valid_types": valid_types
            }
        
        print(f"✅ Type de ticket validé: {type_clean}")

        # Vérifier si le ticket existe déjà
        check_query = f"""
        PREFIX mobilite: <{MOBILITE}>
        ASK WHERE {{
            mobilite:{ticket_data.id} a ?type .
            FILTER(STRSTARTS(STR(?type), STR(mobilite:)))
        }}
        """
        
        try:
            sparql_check = SPARQLWrapper(FUSEKI_QUERY_URL)
            sparql_check.setReturnFormat(JSON)
            sparql_check.setQuery(check_query)
            check_result = sparql_check.query().convert()
            
            if check_result["boolean"]:
                return {"error": f"❌ Le ticket '{ticket_data.id}' existe déjà"}
        except Exception as e:
            print(f"⚠️ Erreur lors de la vérification de l'existence du ticket: {e}")

        # Créer le ticket dans le graphe local
        ticket_uri = MOBILITE[ticket_data.id]
        g.add((ticket_uri, RDF.type, MOBILITE[type_clean]))
        g.add((ticket_uri, MOBILITE.prix, Literal(ticket_data.prix, datatype=XSD.float)))
        g.add((ticket_uri, MOBILITE.statutTicket, Literal(ticket_data.statutTicket, datatype=XSD.string)))
        
        # Sauvegarder le fichier local
        g.serialize("mobilite.rdf", format="xml")
        print(f"💾 Ticket sauvegardé localement: {ticket_data.id}")

        # Envoyer à Fuseki
        insert_query = f"""
        PREFIX mobilite: <{MOBILITE}>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        INSERT DATA {{
            mobilite:{ticket_data.id} a mobilite:{type_clean} ;
                         mobilite:prix "{ticket_data.prix}"^^xsd:float ;
                         mobilite:statutTicket "{ticket_data.statutTicket}"^^xsd:string .
        }}
        """
        
        success = send_to_fuseki(insert_query)
        
        if success:
            # Si un utilisateur est spécifié, créer la relation
            if ticket_data.utilisateur_id and ticket_data.utilisateur_id.strip():
                relation_result = create_ticket_relation(ticket_data.utilisateur_id, ticket_data.id)
                print(f"🔗 Résultat de la relation: {relation_result}")
            
            # Synchroniser le fichier local avec Fuseki
            sync_from_fuseki_to_local()
            
            response_message = f"🎫 Ticket '{ticket_data.id}' créé avec succès (type: {type_clean})."
            if ticket_data.utilisateur_id:
                response_message += f" Associé à l'utilisateur '{ticket_data.utilisateur_id}'."
                
            return {
                "message": response_message,
                "ticket_id": ticket_data.id,
                "type": type_clean,
                "prix": ticket_data.prix,
                "statut": ticket_data.statutTicket,
                "utilisateur_associe": ticket_data.utilisateur_id
            }
        else:
            return {"error": f"❌ Échec de la création du ticket '{ticket_data.id}' dans Fuseki"}
            
    except Exception as e:
        print(f"❌ Erreur lors de la création du ticket: {str(e)}")
        import traceback
        print(f"📝 Stack trace: {traceback.format_exc()}")
        return {"error": f"Erreur lors de la création du ticket: {str(e)}"}
@app.get("/debug/ticket_types/")
def debug_ticket_types():
    """Endpoint pour déboguer les types de tickets"""
    valid_types = ["TicketBus", "TicketMetro", "TicketParking"]
    
    test_cases = [
        "TicketMetro",
        "TicketBus", 
        "TicketParking",
        "ticketmetro",
        "TICKETMETRO"
    ]
    
    results = {}
    for test_case in test_cases:
        type_clean = test_case
        results[test_case] = {
            "original": test_case,
            "cleaned": type_clean,
            "is_valid": type_clean in valid_types,
            "valid_types": valid_types
        }
    
    return {
        "valid_types": valid_types,
        "test_results": results
    }
def create_ticket_relation(utilisateur_id: str, ticket_id: str):
    """
    Crée la relation entre un utilisateur et un ticket avec vérification
    """
    try:
        print(f"🔗 Tentative de création de relation: {utilisateur_id} -> {ticket_id}")
        
        # Vérifier si l'utilisateur existe
        check_user_query = f"""
        PREFIX mobilite: <{MOBILITE}>
        ASK WHERE {{
            mobilite:{utilisateur_id} a ?type .
            FILTER(STRSTARTS(STR(?type), STR(mobilite:)))
        }}
        """
        
        sparql_check = SPARQLWrapper(FUSEKI_QUERY_URL)
        sparql_check.setReturnFormat(JSON)
        sparql_check.setQuery(check_user_query)
        user_exists = sparql_check.query().convert()["boolean"]
        
        if not user_exists:
            return {"error": f"❌ L'utilisateur '{utilisateur_id}' n'existe pas"}
        
        # Vérifier si la relation existe déjà
        check_relation_query = f"""
        PREFIX mobilite: <{MOBILITE}>
        ASK WHERE {{
            mobilite:{utilisateur_id} mobilite:possedeTicket mobilite:{ticket_id} .
        }}
        """
        
        sparql_check.setQuery(check_relation_query)
        relation_exists = sparql_check.query().convert()["boolean"]
        
        if relation_exists:
            return {"warning": f"⚠️ La relation existe déjà entre {utilisateur_id} et {ticket_id}"}

        # Ajouter au graphe local
        utilisateur_uri = MOBILITE[utilisateur_id]
        ticket_uri = MOBILITE[ticket_id]
        g.add((utilisateur_uri, MOBILITE.possedeTicket, ticket_uri))
        g.serialize("mobilite.rdf", format="xml")

        # Envoyer à Fuseki
        insert_query = f"""
        PREFIX mobilite: <{MOBILITE}>
        INSERT DATA {{
            mobilite:{utilisateur_id} mobilite:possedeTicket mobilite:{ticket_id} .
        }}
        """
        
        success = send_to_fuseki(insert_query)
        
        if success:
            return {"message": f"✅ Relation créée: {utilisateur_id} → {ticket_id}"}
        else:
            return {"error": f"❌ Échec de création de la relation dans Fuseki"}
        
    except Exception as e:
        print(f"❌ Erreur lors de la création de la relation: {str(e)}")
        import traceback
        print(f"📝 Stack trace: {traceback.format_exc()}")
        return {"error": f"Erreur lors de la création de la relation: {str(e)}"}
# ======================
# 🎫 ENDPOINT POUR RÉCUPÉRER TOUS LES TICKETS
# ======================

# ======================
# 🎫 ENDPOINT POUR RÉCUPÉRER TOUS LES TICKETS - VERSION CORRIGÉE
# ======================

@app.get("/tickets/")
def get_all_tickets():
    """
    Récupère tous les tickets avec leurs détails complets - VERSION CORRIGÉE
    """
    try:
        sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
        sparql.setReturnFormat(JSON)
        
        # REQUÊTE SPARQL CORRIGÉE POUR BIEN RÉCUPÉRER LES TICKETS SANS UTILISATEUR
        query = f"""
        PREFIX mobilite: <{MOBILITE}>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        
        SELECT ?ticket ?type ?prix ?statut ?utilisateur_id ?nom_utilisateur ?prenom_utilisateur WHERE {{
          ?ticket a ?type .
          ?type rdfs:subClassOf* mobilite:Ticket .
          
          OPTIONAL {{ ?ticket mobilite:prix ?prix . }}
          OPTIONAL {{ ?ticket mobilite:statutTicket ?statut . }}
          
          # Récupération OPTIONNELLE de l'utilisateur
          OPTIONAL {{ 
            ?utilisateur mobilite:possedeTicket ?ticket .
            BIND(STR(?utilisateur) AS ?utilisateur_id)
            OPTIONAL {{ ?utilisateur mobilite:nom ?nom_utilisateur . }}
            OPTIONAL {{ ?utilisateur mobilite:prenom ?prenom_utilisateur . }}
          }}
        }}
        ORDER BY DESC(?ticket)
        """
        
        sparql.setQuery(query)
        results = sparql.query().convert()

        print(f"🔍 Résultats bruts SPARQL: {len(results['results']['bindings'])} entrées")

        tickets = []
        seen_tickets = set()

        for r in results["results"]["bindings"]:
            ticket_uri = r["ticket"]["value"]
            
            # Éviter les doublons
            if ticket_uri in seen_tickets:
                continue
            seen_tickets.add(ticket_uri)
                
            # Extraire l'ID du ticket
            ticket_id = ticket_uri.split("#")[-1] if "#" in ticket_uri else ticket_uri.split("/")[-1]
            
            # Déterminer le type de ticket
            type_uri = r["type"]["value"]
            ticket_type = type_uri.split("#")[-1] if "#" in type_uri else type_uri.split("/")[-1]
            
            # Récupérer l'utilisateur associé (peut être vide)
            utilisateur_data = None
            if "utilisateur_id" in r and r["utilisateur_id"]["value"]:
                utilisateur_uri = r["utilisateur_id"]["value"]
                utilisateur_id = utilisateur_uri.split("#")[-1] if "#" in utilisateur_uri else utilisateur_uri.split("/")[-1]
                
                nom_utilisateur = r.get("nom_utilisateur", {}).get("value", "")
                prenom_utilisateur = r.get("prenom_utilisateur", {}).get("value", "")
                
                utilisateur_data = {
                    "id": utilisateur_id,
                    "nom": nom_utilisateur,
                    "prenom": prenom_utilisateur,
                    "display_name": f"{prenom_utilisateur} {nom_utilisateur}".strip() or utilisateur_id
                }
            
            # Prix avec valeur par défaut
            prix_value = 0.0
            if "prix" in r:
                try:
                    prix_value = float(r["prix"]["value"])
                except (ValueError, TypeError):
                    prix_value = 0.0
            
            ticket_data = {
                "id": ticket_id,
                "type": ticket_type,
                "type_ticket": ticket_type,
                "prix": prix_value,
                "statutTicket": r.get("statut", {}).get("value", "actif"),
                "utilisateur": utilisateur_data
            }
            tickets.append(ticket_data)

        print(f"✅ {len(tickets)} tickets uniques trouvés")
        return tickets
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des tickets: {str(e)}")
        # Fallback vers le graphe local
        return get_tickets_from_local_graph()
def get_tickets_from_local_graph():
    """
    Récupère les tickets depuis le graphe local (fallback)
    """
    try:
        tickets = []
        # Chercher toutes les instances de Ticket et ses sous-classes
        ticket_classes = ["TicketBus", "TicketMetro", "TicketParking"]
        
        for ticket_class in ticket_classes:
            for s, p, o in g.triples((None, RDF.type, MOBILITE[ticket_class])):
                ticket_data = {
                    "id": str(s).split("#")[-1],
                    "type": ticket_class,
                    "type_ticket": ticket_class,
                    "prix": 0.0,
                    "statutTicket": "actif",
                    "utilisateur": None
                }
                
                # Récupérer les propriétés
                for s2, p2, o2 in g.triples((s, None, None)):
                    if str(p2) == str(MOBILITE.prix):
                        try:
                            ticket_data["prix"] = float(o2)
                        except (ValueError, TypeError):
                            ticket_data["prix"] = 0.0
                    elif str(p2) == str(MOBILITE.statutTicket):
                        ticket_data["statutTicket"] = str(o2)
                
                tickets.append(ticket_data)
        
        print(f"📊 Fallback: {len(tickets)} tickets du graphe local")
        return tickets
        
    except Exception as e:
        print(f"❌ Erreur dans le fallback local: {e}")
        return []
# ======================
# 🎫 ENDPOINT POUR RÉCUPÉRER LES TICKETS D'UN UTILISATEUR
# ======================

@app.get("/tickets/utilisateur/{utilisateur_id}")
def get_tickets_by_utilisateur(utilisateur_id: str):
    """
    Récupère tous les tickets d'un utilisateur spécifique
    """
    try:
        sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
        sparql.setReturnFormat(JSON)
        
        query = f"""
        PREFIX mobilite: <{MOBILITE}>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        
        SELECT ?ticket ?type ?prix ?statut WHERE {{
            mobilite:{utilisateur_id} mobilite:possedeTicket ?ticket .
            ?ticket a ?type .
            ?type rdfs:subClassOf* mobilite:Ticket .
            
            OPTIONAL {{ ?ticket mobilite:prix ?prix . }}
            OPTIONAL {{ ?ticket mobilite:statutTicket ?statut . }}
        }}
        ORDER BY ?ticket
        """
        
        sparql.setQuery(query)
        results = sparql.query().convert()

        tickets = []
        for r in results["results"]["bindings"]:
            ticket_uri = r["ticket"]["value"]
            ticket_id = ticket_uri.split("#")[-1] if "#" in ticket_uri else ticket_uri.split("/")[-1]
            
            type_uri = r["type"]["value"]
            ticket_type = type_uri.split("#")[-1] if "#" in type_uri else type_uri.split("/")[-1]
            
            tickets.append({
                "id": ticket_id,
                "type": ticket_type,
                "prix": float(r["prix"]["value"]) if "prix" in r else 0.0,
                "statutTicket": r.get("statut", {}).get("value", "actif")
            })

        return {
            "utilisateur_id": utilisateur_id,
            "tickets": tickets,
            "count": len(tickets)
        }
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des tickets de {utilisateur_id}: {str(e)}")
        return {"utilisateur_id": utilisateur_id, "tickets": [], "count": 0, "error": str(e)}
# ======================
# 🧠 INTELLIGENCE ARTIFICIELLE AVEC OLLAMA
# ======================

# def generate_sparql_with_ollama(user_question: str) -> str:
#     """
#     Génère une requête SPARQL en utilisant Ollama
#     """
#     prompt = f"""
# Tu es un expert en RDF et SPARQL. Ta mission est de convertir des questions en français en requêtes SPARQL valides.

# CONTEXTE ONTOLOGIE MOBILITÉ :
# - Namespace : PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
# - Classes principales : 
#   Personne, Conducteur, Piéton, Voyageur
#   ReseauTransport, TransportPublic, TransportPrive, MobiliteDouce
#   Bus, Metro, Voiture, Velo, Trottinette
#   Infrastructure, Route, StationsBus, StationsMetro, Parking, Batiment
#   Trajet, TrajetOptimal, TrajetCourt, TrajetRecommandé
#   Avis, AvisPositif, AvisNegatif
#   Ticket, TicketBus, TicketMetro, TicketParking
#   StationRecharge, RechargeElectrique, RechargeGaz
#   Trafic, Accident, Embouteillage, Radar
#   Statistiques, StatistiquesAccidents, StatistiquesPollution, StatistiquesUtilisation
#   SmartCity

# - Propriétés de données :
#   nom, prenom, age, email, telephone, dateNaissance, genre, nationalite, languePreferee
#   dateInscription, statutCompte, niveauAbonnement, scoreFidelite, preferencesAccessibilite
#   numeroPermis, dateObtentionPermis, categoriePermis, pointsPermis, experienceConduite
#   distance, duree, scoreOptimisation, niveauTrafic, heureDepart, heureArrivee
#   vitesseMoyenne, consommationEnergie, emissionsCO2, nombreArrets, conditionsMeteo
#   temperature, scoreSecurite, scoreConfort
#   marque, modele, anneeFabrication, immatriculation, couleur, kilometrage
#   niveauCarburant, consommationMoyenne
#   commentaire, note, dateAvis, langueAvis, categorieAvis, scoreUtilite, verifie, nombreSignalements
#   numeroTicket, prix, dateAchat, dateExpiration, typeTicket, classeTicket, zoneValidite
#   statutTicket, methodePaiement, nombreValidations
#   adresse, coordonneesGPS, dateConstruction, etatMaintenance, capaciteAccueil
#   niveauAccessibilite, horairesOuverture, superficie
#   capacite, prixKwh, disponible, typeConnecteur, puissanceMax, tempsRechargeMoyen
#   heureOuverture, heureFermeture, operateur
#   intensite, dureeIncident, causeIncident, gravite, nombreVehiculesImpliques
#   vitesseMoyenneTrafic, niveauService
#   vitesseMaximale, typeRadar, dateInstallation, etatFonctionnement, nombreInfractions
#   valeur, dateMesure, unite, periodeMesure, margeErreur, niveauConfiance, tendance, sourceDonnees

# - Propriétés objet :
#   effectueTrajet, utiliseReseauTransport, donneAvis, possedeTicket, habiteA, travailleA
#   prefereMoyenTransport, frequenteZone, commenceA, terminaA, utiliseMoyenTransport
#   proposePar, appartientA, circuleSur, conduitPar, utiliseStationRecharge
#   concerneTransport, concerneInfrastructure, valablePour, acheteA, donneAccesA
#   estConnecteA, disposeDe, accueilleStation, contient, estSurveillePar, alimentePar
#   maintenuPar, seProduitSur, affecteTrajet, genereAlerte, mesureSur, generePar

# QUESTION À TRADUIRE : "{user_question}"

# INSTRUCTIONS STRICTES :
# 1. Génère UNIQUEMENT la requête SPARQL complète et valide
# 2. Pas de texte explicatif, pas de commentaires, pas de notes
# 3. Pas de "SPARQL:" ou autres préfixes textuels
# 4. Pas de backticks Markdown
# 5. Utilise obligatoirement le préfixe mobilite:
# 6. Pour les hiérarchies, utilise rdfs:subClassOf*
# 7. Sois précis dans les relations

# EXEMPLE :
# Question: "Liste toutes les personnes"
# Réponse: PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#> SELECT ?personne WHERE {{ ?personne a mobilite:Personne . }}
#     """

#     try:
#         response = requests.post(
#             f"{OLLAMA_BASE_URL}/api/generate",
#             json={
#                 "model": OLLAMA_MODEL,
#                 "prompt": prompt,
#                 "stream": False,
#                 "options": {
#                     "temperature": 0.1,
#                     "top_p": 0.9,
#                     "num_predict": 500
#                 }
#             },
#             timeout=120
#         )
#         response.raise_for_status()
        
#         result = response.json()
#         sparql_query = result["response"].strip()
        
#         print(f"📝 Réponse brute d'Ollama:\n{sparql_query}")
        
#         cleaned_query = clean_sparql_query(sparql_query)
#         print(f"🧹 Requête nettoyée:\n{cleaned_query}")
        
#         return cleaned_query
        
#     except requests.exceptions.ConnectionError:
#         raise Exception("❌ Ollama n'est pas démarré. Lancez 'ollama serve'")
#     except Exception as e:
#         raise Exception(f"❌ Erreur Ollama : {str(e)}")

# ======================
# 📦 MODÈLES DE DONNÉES
# ======================

class Personne(BaseModel):
    id: str
    nom: str
    prenom: str
    age: int
    email: str
    type_personne: str

class Conducteur(BaseModel):
    id: str
    nom: str
    prenom: str
    age: int
    email: str
    numeroPermis: str
    categoriePermis: str

class Trajet(BaseModel):
    id: str
    distance: float
    duree: float
    heureDepart: str
    heureArrivee: str
    type_trajet: str = "Trajet"

class Vehicule(BaseModel):
    id: str
    type_vehicule: str
    marque: str
    modele: str
    immatriculation: str=""

class Avis(BaseModel):
    id: str
    commentaire: str
    note: int
    type_avis: str

class Ticket(BaseModel):
    id: str
    type_ticket: str
    prix: float
    statutTicket: str

class Infrastructure(BaseModel):
    id: str
    type_infrastructure: str
    adresse: str
    nom: str = ""

class StationRecharge(BaseModel):
    id: str
    type_connecteur: str
    puissanceMax: float
    disponible: bool

class Statistique(BaseModel):
    id: str
    type_statistique: str
    valeur: float
    unite: str

class SmartCity(BaseModel):
    id: str
    nom: str

class EffectueTrajet(BaseModel):
    personne_id: str
    trajet_id: str

class UtiliseTransport(BaseModel):
    personne_id: str
    transport_id: str

class DonneAvis(BaseModel):
    personne_id: str
    avis_id: str

class PossedeTicket(BaseModel):
    personne_id: str
    ticket_id: str

# ======================
# 🎯 ENDPOINT PRINCIPAL IA - GÉNÉRATION ET EXÉCUTION SPARQL
# ======================
class Evenement(BaseModel):
    id: str
    type_evenement: str
    description: str
    niveau_urgence: str = "medium"
    infrastructure_id: str = ""
@app.post("/add_evenement/")
def add_evenement(evenement: Evenement):
    """Ajoute un nouvel événement"""
    type_clean = evenement.type_evenement.capitalize()
    
    evenement_uri = MOBILITE[evenement.id]
    g.add((evenement_uri, RDF.type, MOBILITE[type_clean]))
    g.add((evenement_uri, MOBILITE.commentaire, Literal(evenement.description, datatype=XSD.string)))
    
    # Ajouter la relation avec l'infrastructure si spécifiée
    if evenement.infrastructure_id:
        infrastructure_uri = MOBILITE[evenement.infrastructure_id]
        g.add((evenement_uri, MOBILITE.concerneInfrastructure, infrastructure_uri))
    
    g.serialize("mobilite_updated.rdf", format="xml")

    # Construire la requête INSERT
    infrastructure_part = f" ; mobilite:concerneInfrastructure mobilite:{evenement.infrastructure_id}" if evenement.infrastructure_id else ""
    
    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    INSERT DATA {{
        mobilite:{evenement.id} a mobilite:{type_clean} ;
                     mobilite:commentaire "{evenement.description}"^^xsd:string{infrastructure_part} .
    }}
    """
    send_to_fuseki(insert_query)
    return {"message": f"🚨 Événement '{evenement.id}' ajouté (type: {type_clean})."}

@app.get("/evenements/")
def get_all_evenements():
    """Récupère tous les événements (tous les types avec commentaire)"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    SELECT ?id ?type ?description ?infrastructure WHERE {{
        ?id a ?type .
        ?id mobilite:commentaire ?description .
        OPTIONAL {{ ?id mobilite:concerneInfrastructure ?infrastructure . }}
        FILTER(STRSTARTS(STR(?type), STR(mobilite:)))
    }}
    ORDER BY DESC(?id)
    """)
    results = sparql.query().convert()

    evenements = []
    for r in results["results"]["bindings"]:
        evenements.append({
            "id": r["id"]["value"].split("#")[-1],
            "type": r["type"]["value"].split("#")[-1],
            "description": r["description"]["value"],
            "infrastructure": r["infrastructure"]["value"].split("#")[-1] if "infrastructure" in r else None
        })
    return evenements
@app.get("/trajets/")
def get_all_trajets():
    """Récupère tous les trajets (pour compatibilité)"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?id ?type ?distance ?duree ?heureDepart ?heureArrivee ?personne WHERE {{
        ?id a ?type .
        ?type rdfs:subClassOf* mobilite:Trajet .
        OPTIONAL {{ ?id mobilite:distance ?distance . }}
        OPTIONAL {{ ?id mobilite:duree ?duree . }}
        OPTIONAL {{ ?id mobilite:heureDepart ?heureDepart . }}
        OPTIONAL {{ ?id mobilite:heureArrivee ?heureArrivee . }}
        OPTIONAL {{ ?personne mobilite:effectueTrajet ?id . }}
    }}
    """)
    results = sparql.query().convert()

    trajets = []
    for r in results["results"]["bindings"]:
        trajets.append({
            "id": r["id"]["value"].split("#")[-1],
            "type": r["type"]["value"].split("#")[-1],
            "distance": float(r["distance"]["value"]) if "distance" in r else 0,
            "duree": float(r["duree"]["value"]) if "duree" in r else 0,
            "heureDepart": r["heureDepart"]["value"] if "heureDepart" in r else None,
            "heureArrivee": r["heureArrivee"]["value"] if "heureArrivee" in r else None,
            "personne": r["personne"]["value"].split("#")[-1] if "personne" in r else None
        })
    return trajets

# @app.post("/ask/")
# async def ask_question(question_data: dict):
#     """
#     Endpoint principal : Reçoit une question en français, génère la requête SPARQL avec Ollama,
#     l'exécute sur Fuseki et retourne les résultats.
#     """
#     try:
#         user_question = question_data.get("question", "").strip()
#         if not user_question:
#             raise HTTPException(status_code=400, detail="La question est requise")

#         print(f"🧠 Question reçue: {user_question}")

#         # 1. Génération de la requête SPARQL avec Ollama
#         print("🔄 Génération de la requête SPARQL avec Ollama...")
#         sparql_query = generate_sparql_with_ollama(user_question)
#         print(f"📝 Requête SPARQL générée:\n{sparql_query}")

#         # 2. Validation de la requête
#         if not validate_sparql_query(sparql_query):
#             raise HTTPException(status_code=400, detail="La requête SPARQL générée n'est pas valide")

#         # 3. Exécution de la requête sur Fuseki
#         print("🚀 Exécution de la requête sur Fuseki...")
#         results = execute_sparql_query(sparql_query)
        
#         if results is None:
#             raise HTTPException(status_code=500, detail="Erreur lors de l'exécution de la requête SPARQL")

#         # 4. Formatage des résultats
#         formatted_results = format_sparql_results(results)
        
#         return {
#             "question": user_question,
#             "sparql_query": sparql_query,
#             "results": formatted_results,
#             "count": len(formatted_results)
#         }

#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

# def format_sparql_results(results):
#     """
#     Formate les résultats SPARQL en un format plus lisible
#     """
#     if "results" not in results or "bindings" not in results["results"]:
#         return []

#     formatted = []
#     for binding in results["results"]["bindings"]:
#         item = {}
#         for key, value in binding.items():
#             # Extraire le nom court après le # pour les URIs
#             if value["type"] == "uri" and "#" in value["value"]:
#                 item[key] = value["value"].split("#")[-1]
#             else:
#                 item[key] = value["value"]
#         formatted.append(item)
    
#     return formatted

# def validate_sparql_query(query: str) -> bool:
#     """Valide la syntaxe basique d'une requête SPARQL"""
#     if not query:
#         return False
    
#     # Vérifier les mots-clés SPARQL essentiels
#     essential_keywords = ['SELECT', 'ASK', 'CONSTRUCT', 'DESCRIBE']
#     if not any(keyword in query.upper() for keyword in essential_keywords):
#         return False
    
#     # Vérifier la présence des accolades
#     if '{' not in query or '}' not in query:
#         return False
    
#     return True

# ======================
# 👤 PERSONNES - ENDPOINTS
# ======================

@app.post("/add_personne/")
def add_personne(personne: Personne):
    classe_type = personne.type_personne.capitalize()
    if classe_type not in ["Conducteur", "Pieton", "Voyageur"]:
        classe_type = "Personne"

    personne_uri = MOBILITE[personne.id]
    g.add((personne_uri, RDF.type, MOBILITE[classe_type]))
    g.add((personne_uri, MOBILITE.nom, Literal(personne.nom, datatype=XSD.string)))
    g.add((personne_uri, MOBILITE.prenom, Literal(personne.prenom, datatype=XSD.string)))
    g.add((personne_uri, MOBILITE.age, Literal(personne.age, datatype=XSD.integer)))
    g.add((personne_uri, MOBILITE.email, Literal(personne.email, datatype=XSD.string)))
    g.serialize("mobilite_updated.rdf", format="xml")

    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    INSERT DATA {{
        mobilite:{personne.id} a mobilite:{classe_type} ;
                     mobilite:nom "{personne.nom}"^^xsd:string ;
                     mobilite:prenom "{personne.prenom}"^^xsd:string ;
                     mobilite:age "{personne.age}"^^xsd:integer ;
                     mobilite:email "{personne.email}"^^xsd:string .
    }}
    """
    send_to_fuseki(insert_query)
    return {"message": f"✅ {classe_type} '{personne.prenom} {personne.nom}' ajouté."}

@app.post("/add_conducteur/")
def add_conducteur(conducteur: Conducteur):
    conducteur_uri = MOBILITE[conducteur.id]
    g.add((conducteur_uri, RDF.type, MOBILITE.Conducteur))
    g.add((conducteur_uri, MOBILITE.nom, Literal(conducteur.nom, datatype=XSD.string)))
    g.add((conducteur_uri, MOBILITE.prenom, Literal(conducteur.prenom, datatype=XSD.string)))
    g.add((conducteur_uri, MOBILITE.age, Literal(conducteur.age, datatype=XSD.integer)))
    g.add((conducteur_uri, MOBILITE.email, Literal(conducteur.email, datatype=XSD.string)))
    g.add((conducteur_uri, MOBILITE.numeroPermis, Literal(conducteur.numeroPermis, datatype=XSD.string)))
    g.add((conducteur_uri, MOBILITE.categoriePermis, Literal(conducteur.categoriePermis, datatype=XSD.string)))
    g.serialize("mobilite_updated.rdf", format="xml")

    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    INSERT DATA {{
        mobilite:{conducteur.id} a mobilite:Conducteur ;
                     mobilite:nom "{conducteur.nom}"^^xsd:string ;
                     mobilite:prenom "{conducteur.prenom}"^^xsd:string ;
                     mobilite:age "{conducteur.age}"^^xsd:integer ;
                     mobilite:email "{conducteur.email}"^^xsd:string ;
                     mobilite:numeroPermis "{conducteur.numeroPermis}"^^xsd:string ;
                     mobilite:categoriePermis "{conducteur.categoriePermis}"^^xsd:string .
    }}
    """
    send_to_fuseki(insert_query)
    return {"message": f"✅ Conducteur '{conducteur.prenom} {conducteur.nom}' ajouté."}

@app.get("/personnes/")
def get_all_personnes():
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT DISTINCT ?id ?type ?nom ?prenom ?age ?email WHERE {{
        ?id a ?type .
        OPTIONAL {{ ?id mobilite:nom ?nom . }}
        OPTIONAL {{ ?id mobilite:prenom ?prenom . }}
        OPTIONAL {{ ?id mobilite:age ?age . }}
        OPTIONAL {{ ?id mobilite:email ?email . }}
        ?type rdfs:subClassOf* mobilite:Personne .
    }}
    """)
    results = sparql.query().convert()

    personnes = []
    seen = set()

    for r in results["results"]["bindings"]:
        uid = r["id"]["value"]
        if uid not in seen:
            seen.add(uid)
            personnes.append({
                "id": uid.split("#")[-1],
                "type": r["type"]["value"].split("#")[-1],
                "nom": r["nom"]["value"] if "nom" in r else None,
                "prenom": r["prenom"]["value"] if "prenom" in r else None,
                "age": int(r["age"]["value"]) if "age" in r else None,
                "email": r["email"]["value"] if "email" in r else None
            })
    return personnes

# ======================
# 🛣️ TRAJETS - ENDPOINTS
# ======================

@app.post("/add_trajet/")
def add_trajet(trajet: Trajet):
    trajet_uri = MOBILITE[trajet.id]
    g.add((trajet_uri, RDF.type, MOBILITE.Trajet))
    g.add((trajet_uri, MOBILITE.distance, Literal(trajet.distance, datatype=XSD.float)))
    g.add((trajet_uri, MOBILITE.duree, Literal(trajet.duree, datatype=XSD.float)))
    g.add((trajet_uri, MOBILITE.heureDepart, Literal(trajet.heureDepart, datatype=XSD.string)))
    g.add((trajet_uri, MOBILITE.heureArrivee, Literal(trajet.heureArrivee, datatype=XSD.string)))
    g.serialize("mobilite_updated.rdf", format="xml")

    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    INSERT DATA {{
        mobilite:{trajet.id} a mobilite:Trajet ;
                       mobilite:distance "{trajet.distance}"^^xsd:float ;
                       mobilite:duree "{trajet.duree}"^^xsd:float ;
                       mobilite:heureDepart "{trajet.heureDepart}"^^xsd:string ;
                       mobilite:heureArrivee "{trajet.heureArrivee}"^^xsd:string .
    }}
    """
    send_to_fuseki(insert_query)
    return {"message": f"🛣️ Trajet '{trajet.id}' ajouté avec succès."}

@app.post("/personne/effectue_trajet/")
def add_effectue_trajet(link: EffectueTrajet):
    personne_uri = MOBILITE[link.personne_id]
    trajet_uri = MOBILITE[link.trajet_id]
    g.add((personne_uri, MOBILITE.effectueTrajet, trajet_uri))
    g.serialize("mobilite_updated.rdf", format="xml")

    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    INSERT DATA {{
        mobilite:{link.personne_id} mobilite:effectueTrajet mobilite:{link.trajet_id} .
    }}
    """
    send_to_fuseki(insert_query)
    return {"message": f"👤 Personne '{link.personne_id}' effectue le trajet '{link.trajet_id}'."}

# ======================
# 🚗 VÉHICULES - ENDPOINTS
# ======================

@app.post("/add_vehicule/")
def add_vehicule(vehicule: Vehicule):
    type_clean = vehicule.type_vehicule.capitalize()
    valid_types = ["Voiture", "Bus", "Metro", "Velo", "Trottinette"]

    if type_clean not in valid_types:
        return {"error": f"❌ Type '{vehicule.type_vehicule}' invalide. Doit être un de {valid_types}"}

    vehicule_uri = MOBILITE[vehicule.id]
    g.add((vehicule_uri, RDF.type, MOBILITE[type_clean]))
    g.add((vehicule_uri, MOBILITE.marque, Literal(vehicule.marque, datatype=XSD.string)))
    g.add((vehicule_uri, MOBILITE.modele, Literal(vehicule.modele, datatype=XSD.string)))
    g.add((vehicule_uri, MOBILITE.immatriculation, Literal(vehicule.immatriculation, datatype=XSD.string)))
    if vehicule.immatriculation:
        g.add((vehicule_uri, MOBILITE.immatriculation, Literal(vehicule.immatriculation, datatype=XSD.string)))
    
    g.serialize("mobilite_updated.rdf", format="xml")
    immatriculation_part = f' ; mobilite:immatriculation "{vehicule.immatriculation}"^^xsd:string' if vehicule.immatriculation else ""

    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    INSERT DATA {{
        mobilite:{vehicule.id} a mobilite:{type_clean} ;
                       mobilite:marque "{vehicule.marque}"^^xsd:string ;
                       mobilite:modele "{vehicule.modele}"^^xsd:string{immatriculation_part} .
    }}
    """
    send_to_fuseki(insert_query)

    return {"message": f"🚗 Véhicule de type '{type_clean}' ajouté : '{vehicule.marque} {vehicule.modele}'."}
@app.get("/infrastructures/")
def get_all_infrastructures():
    """Récupère tous les trajets (pour compatibilité)"""
    try:
        sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
        sparql.setReturnFormat(JSON)
        query = f"""
        PREFIX mobilite: <{MOBILITE}>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?id ?type ?adresse ?nom WHERE {{
            ?id a ?type .
            ?type rdfs:subClassOf* mobilite:Infrastructure .
            OPTIONAL {{ ?id mobilite:adresse ?adresse . }}
            OPTIONAL {{ ?id mobilite:nom ?nom . }}
        }}
        ORDER BY DESC(?id)
        """
        sparql.setQuery(query)
        results = sparql.query().convert()

        data = []
        for r in results["results"]["bindings"]:
            data.append({
                "id": r["id"]["value"].split("#")[-1],
                "type": r["type"]["value"].split("#")[-1],
                "adresse": r["adresse"]["value"] if "adresse" in r else None,
                "nom": r["nom"]["value"] if "nom" in r else None
            })
        
        print(f"📊 {len(data)} infrastructures récupérées de Fuseki")
        return data
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des infrastructures: {e}")
        # Fallback: retourner les données du graphe local
        data = []
        for s, p, o in g.triples((None, RDF.type, None)):
            if str(s).startswith(str(MOBILITE)):
                if any(subclass in str(o) for subclass in ["Route", "Parking", "StationsBus", "StationsMetro", "Batiment"]):
                    infra_data = {"id": str(s).split("#")[-1], "type": str(o).split("#")[-1]}
                    # Récupérer les propriétés
                    for s2, p2, o2 in g.triples((s, None, None)):
                        if str(p2) == str(MOBILITE.adresse):
                            infra_data["adresse"] = str(o2)
                        if str(p2) == str(MOBILITE.nom):
                            infra_data["nom"] = str(o2)
                    data.append(infra_data)
        print(f"📊 Fallback: {len(data)} infrastructures du graphe local")
        return data
@app.get("/avis/")
def get_avis():
    """Récupère tous les avis avec leurs détails complets - VERSION CORRIGÉE"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    
    # REQUÊTE SPARQL CORRIGÉE
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT ?avis ?type ?commentaire ?note ?utilisateur_id ?nom_utilisateur ?prenom_utilisateur WHERE {{
      ?avis a ?type .
      ?type rdfs:subClassOf* mobilite:Avis .
      
      OPTIONAL {{ ?avis mobilite:commentaire ?commentaire . }}
      OPTIONAL {{ ?avis mobilite:note ?note . }}
      
      OPTIONAL {{ 
        ?utilisateur mobilite:donneAvis ?avis .
        BIND(STR(?utilisateur) AS ?utilisateur_id)
        OPTIONAL {{ ?utilisateur mobilite:nom ?nom_utilisateur . }}
        OPTIONAL {{ ?utilisateur mobilite:prenom ?prenom_utilisateur . }}
      }}
    }}
    ORDER BY DESC(?note)
    """)
    
    try:
        results = sparql.query().convert()
        print(f"🔍 Résultats SPARQL bruts: {results}")

        avis_list = []
        seen = set()

        for r in results["results"]["bindings"]:
            avis_uri = r["avis"]["value"]
            if avis_uri not in seen:
                seen.add(avis_uri)
                
                # Extraire l'ID de l'avis
                avis_id = avis_uri.split("#")[-1] if "#" in avis_uri else avis_uri.split("/")[-1]
                
                # Déterminer le type d'avis
                type_uri = r["type"]["value"]
                avis_type = type_uri.split("#")[-1] if "#" in type_uri else type_uri.split("/")[-1]
                
                # Récupérer l'utilisateur
                utilisateur_data = None
                if "utilisateur_id" in r:
                    utilisateur_uri = r["utilisateur_id"]["value"]
                    utilisateur_id = utilisateur_uri.split("#")[-1] if "#" in utilisateur_uri else utilisateur_uri.split("/")[-1]
                    
                    nom_utilisateur = r.get("nom_utilisateur", {}).get("value", "")
                    prenom_utilisateur = r.get("prenom_utilisateur", {}).get("value", "")
                    
                    utilisateur_data = {
                        "id": utilisateur_id,
                        "nom": nom_utilisateur,
                        "prenom": prenom_utilisateur,
                        "display_name": f"{prenom_utilisateur} {nom_utilisateur}".strip() or utilisateur_id
                    }
                
                avis_list.append({
                    "id": avis_id,
                    "type": avis_type,
                    "commentaire": r.get("commentaire", {}).get("value", ""),
                    "note": int(r["note"]["value"]) if "note" in r else 0,
                    "utilisateur": utilisateur_data,
                    "statut": "Positif" if avis_type == "AvisPositif" else "Négatif" if avis_type == "AvisNegatif" else "Neutre"
                })

        print(f"✅ {len(avis_list)} avis trouvés et transformés")
        return avis_list
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des avis: {str(e)}")
        return []
@app.get("/vehicules/")
def get_all_vehicules():
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?id ?type ?marque ?modele ?immatriculation WHERE {{
        ?id a ?type .
        ?type rdfs:subClassOf* mobilite:ReseauTransport .
        OPTIONAL {{ ?id mobilite:marque ?marque . }}
        OPTIONAL {{ ?id mobilite:modele ?modele . }}
        OPTIONAL {{ ?id mobilite:immatriculation ?immatriculation . }}
    }}
    """)
    results = sparql.query().convert()

    data = []
    for r in results["results"]["bindings"]:
        data.append({
            "id": r["id"]["value"].split("#")[-1],
            "type": r["type"]["value"].split("#")[-1],
            "marque": r["marque"]["value"] if "marque" in r else None,
            "modele": r["modele"]["value"] if "modele" in r else None,
            "immatriculation": r["immatriculation"]["value"] if "immatriculation" in r else None
        })
    return data

@app.post("/personne/utilise_transport/")
def add_utilise_transport(link: UtiliseTransport):
    personne_uri = MOBILITE[link.personne_id]
    transport_uri = MOBILITE[link.transport_id]
    g.add((personne_uri, MOBILITE.utiliseReseauTransport, transport_uri))
    g.serialize("mobilite_updated.rdf", format="xml")

    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    INSERT DATA {{
        mobilite:{link.personne_id} mobilite:utiliseReseauTransport mobilite:{link.transport_id} .
    }}
    """
    send_to_fuseki(insert_query)
    return {"message": f"👤 Personne '{link.personne_id}' utilise le transport '{link.transport_id}'."}

# ======================
# 📝 AVIS - ENDPOINTS
# ======================

@app.post("/add_avis/")
def add_avis(avis: Avis):
    type_clean = "AvisPositif" if avis.note >= 3 else "AvisNegatif"
    if avis.type_avis:
        type_clean = avis.type_avis

    avis_uri = MOBILITE[avis.id]
    g.add((avis_uri, RDF.type, MOBILITE[type_clean]))
    g.add((avis_uri, MOBILITE.commentaire, Literal(avis.commentaire, datatype=XSD.string)))
    g.add((avis_uri, MOBILITE.note, Literal(avis.note, datatype=XSD.integer)))
    g.serialize("mobilite_updated.rdf", format="xml")

    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    INSERT DATA {{
        mobilite:{avis.id} a mobilite:{type_clean} ;
                     mobilite:commentaire "{avis.commentaire}"^^xsd:string ;
                     mobilite:note "{avis.note}"^^xsd:integer .
    }}
    """
    send_to_fuseki(insert_query)
    return {"message": f"✅ Avis '{avis.id}' ajouté (type: {type_clean})."}

@app.post("/personne/donne_avis/")
def add_donne_avis(link: DonneAvis):
    personne_uri = MOBILITE[link.personne_id]
    avis_uri = MOBILITE[link.avis_id]
    g.add((personne_uri, MOBILITE.donneAvis, avis_uri))
    g.serialize("mobilite_updated.rdf", format="xml")

    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    INSERT DATA {{
        mobilite:{link.personne_id} mobilite:donneAvis mobilite:{link.avis_id} .
    }}
    """
    send_to_fuseki(insert_query)
    return {"message": f"👤 Personne '{link.personne_id}' donne l'avis '{link.avis_id}'."}

# ======================
# 🎫 TICKETS - ENDPOINTS
# ======================


@app.post("/personne/possede_ticket/")
def add_possede_ticket(link: PossedeTicket):
    personne_uri = MOBILITE[link.personne_id]
    ticket_uri = MOBILITE[link.ticket_id]
    g.add((personne_uri, MOBILITE.possedeTicket, ticket_uri))
    g.serialize("mobilite_updated.rdf", format="xml")

    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    INSERT DATA {{
        mobilite:{link.personne_id} mobilite:possedeTicket mobilite:{link.ticket_id} .
    }}
    """
    send_to_fuseki(insert_query)
    return {"message": f"👤 Personne '{link.personne_id}' possède le ticket '{link.ticket_id}'."}

# ======================
# 🏗️ INFRASTRUCTURES - ENDPOINTS
# ======================

@app.post("/add_infrastructure/")
def add_infrastructure(infra: Infrastructure):
    type_clean = infra.type_infrastructure.capitalize()
    valid_types = ["Route", "Parking", "StationsBus", "StationsMetro", "Batiment"]

    if type_clean not in valid_types:
        return {"error": f"❌ Type '{infra.type_infrastructure}' invalide. Doit être un de {valid_types}"}

    # 1. Ajouter au graphe local
    infra_uri = MOBILITE[infra.id]
    g.add((infra_uri, RDF.type, MOBILITE[type_clean]))
    g.add((infra_uri, MOBILITE.adresse, Literal(infra.adresse, datatype=XSD.string)))
    if infra.nom:
        g.add((infra_uri, MOBILITE.nom, Literal(infra.nom, datatype=XSD.string)))
    
    # Sauvegarder le fichier local
    g.serialize("mobilite.rdf", format="xml")
    print(f"💾 Infrastructure sauvegardée localement: {infra.id}")

    # 2. Envoyer à Fuseki
    nom_part = f' ; mobilite:nom "{infra.nom}"^^xsd:string' if infra.nom else ""
    
    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    INSERT DATA {{
        mobilite:{infra.id} a mobilite:{type_clean} ;
                     mobilite:adresse "{infra.adresse}"^^xsd:string{nom_part} .
    }}
    """
    
    success = send_to_fuseki(insert_query)
    
    if success:
        # Synchroniser le fichier local avec Fuseki pour être sûr
        sync_from_fuseki_to_local()
        return {"message": f"🏗️ Infrastructure '{infra.id}' ajoutée (type: {type_clean})."}
    else:
        return {"error": f"❌ Échec de l'ajout de l'infrastructure '{infra.id}' à Fuseki"}
# ======================
# ⚡ STATIONS RECHARGE - ENDPOINTS
# ======================
@app.get("/debug/infrastructures/")
def debug_infrastructures():
    """Endpoint de debug pour vérifier les infrastructures dans Fuseki"""
    
    # Requête pour compter toutes les infrastructures
    count_query = """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT (COUNT(?id) as ?count) WHERE {
        ?id a ?type .
        ?type rdfs:subClassOf* mobilite:Infrastructure .
    }
    """
    
    # Requête pour lister toutes les infrastructures avec détails
    detail_query = """
    PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?id ?type ?adresse ?nom WHERE {
        ?id a ?type .
        ?type rdfs:subClassOf* mobilite:Infrastructure .
        OPTIONAL { ?id mobilite:adresse ?adresse . }
        OPTIONAL { ?id mobilite:nom ?nom . }
    }
    ORDER BY ?id
    """
    
    try:
        # Compter
        sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
        sparql.setReturnFormat(JSON)
        sparql.setQuery(count_query)
        count_result = sparql.query().convert()
        count = count_result['results']['bindings'][0]['count']['value']
        
        # Détails
        sparql.setQuery(detail_query)
        detail_result = sparql.query().convert()
        
        infrastructures = []
        for r in detail_result["results"]["bindings"]:
            infrastructures.append({
                "id": r["id"]["value"].split("#")[-1],
                "type": r["type"]["value"].split("#")[-1],
                "adresse": r["adresse"]["value"] if "adresse" in r else None,
                "nom": r["nom"]["value"] if "nom" in r else None
            })
        
        return {
            "total_count": count,
            "infrastructures": infrastructures,
            "fuseki_url": FUSEKI_QUERY_URL,
            "fuseki_update_url": FUSEKI_UPDATE_URL
        }
        
    except Exception as e:
        return {"error": f"Erreur de diagnostic: {str(e)}"}
@app.post("/add_station_recharge/")
def add_station_recharge(station: StationRecharge):
    type_clean = "RechargeElectrique"  # Par défaut électrique

    station_uri = MOBILITE[station.id]
    g.add((station_uri, RDF.type, MOBILITE[type_clean]))
    g.add((station_uri, MOBILITE.typeConnecteur, Literal(station.type_connecteur, datatype=XSD.string)))
    g.add((station_uri, MOBILITE.puissanceMax, Literal(station.puissanceMax, datatype=XSD.float)))
    g.add((station_uri, MOBILITE.disponible, Literal(station.disponible, datatype=XSD.boolean)))
    g.serialize("mobilite_updated.rdf", format="xml")

    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    INSERT DATA {{
        mobilite:{station.id} a mobilite:{type_clean} ;
                     mobilite:typeConnecteur "{station.type_connecteur}"^^xsd:string ;
                     mobilite:puissanceMax "{station.puissanceMax}"^^xsd:float ;
                     mobilite:disponible "{str(station.disponible).lower()}"^^xsd:boolean .
    }}
    """
    send_to_fuseki(insert_query)
    return {"message": f"⚡ Station de recharge '{station.id}' ajoutée avec succès."}

# ======================
# 📊 STATISTIQUES - ENDPOINTS
# ======================

@app.post("/add_statistique/")
def add_statistique(stat: Statistique):
    type_clean = stat.type_statistique.capitalize()
    valid_types = ["StatistiquesAccidents", "StatistiquesPollution", "StatistiquesUtilisation"]

    if type_clean not in valid_types:
        return {"error": f"❌ Type '{stat.type_statistique}' invalide. Doit être un de {valid_types}"}

    stat_uri = MOBILITE[stat.id]
    g.add((stat_uri, RDF.type, MOBILITE[type_clean]))
    g.add((stat_uri, MOBILITE.valeur, Literal(stat.valeur, datatype=XSD.float)))
    g.add((stat_uri, MOBILITE.unite, Literal(stat.unite, datatype=XSD.string)))
    g.serialize("mobilite_updated.rdf", format="xml")

    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    INSERT DATA {{
        mobilite:{stat.id} a mobilite:{type_clean} ;
                     mobilite:valeur "{stat.valeur}"^^xsd:float ;
                     mobilite:unite "{stat.unite}"^^xsd:string .
    }}
    """
    send_to_fuseki(insert_query)
    return {"message": f"📊 Statistique '{stat.id}' ajoutée (type: {type_clean})."}

# ======================
# 🏙️ SMART CITY - ENDPOINTS
# ======================

@app.post("/add_smartcity/")
def add_smartcity(city: SmartCity):
    city_uri = MOBILITE[city.id]
    g.add((city_uri, RDF.type, MOBILITE.SmartCity))
    g.add((city_uri, MOBILITE.nom, Literal(city.nom, datatype=XSD.string)))
    g.serialize("mobilite_updated.rdf", format="xml")

    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    INSERT DATA {{
        mobilite:{city.id} a mobilite:SmartCity ;
                     mobilite:nom "{city.nom}"^^xsd:string .
    }}
    """
    send_to_fuseki(insert_query)
    return {"message": f"🏙️ SmartCity '{city.id}' ajoutée avec succès."}

# ======================
# 🗑️ SUPPRESSION - ENDPOINTS
# ======================

@app.delete("/delete/{instance_id}")
def delete_instance(instance_id: str):
    try:
        g.remove((MOBILITE[instance_id], None, None))
        g.serialize("mobilite_updated.rdf", format="xml")

        delete_query = f"""
        PREFIX mobilite: <{MOBILITE}>
        DELETE WHERE {{
            mobilite:{instance_id} ?p ?o .
        }}
        """
        send_to_fuseki(delete_query)

        return {"message": f"🗑️ Instance '{instance_id}' supprimée avec succès."}
    except Exception as e:
        return {"error": str(e)}

# ======================
# 📊 STATISTIQUES GÉNÉRALES
# ======================

@app.get("/stats/")
def get_stats():
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    SELECT ?class (COUNT(?s) AS ?count)
    WHERE {{
        ?s a ?class .
        FILTER(STRSTARTS(STR(?class), STR(mobilite:)))
    }}
    GROUP BY ?class
    """)
    results = sparql.query().convert()

    stats = [
        {"class": r["class"]["value"].split("#")[-1], "count": int(r["count"]["value"])}
        for r in results["results"]["bindings"]
    ]
    return {"stats": stats}

# ======================
# ⚡ STATIONS RECHARGE - ENDPOINTS
# ======================

@app.get("/stations_recharge/")
def get_all_stations_recharge():
    """Récupère toutes les stations de recharge"""
    try:
        sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
        sparql.setReturnFormat(JSON)
        
        query = f"""
        PREFIX mobilite: <{MOBILITE}>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        SELECT ?id ?type ?type_connecteur ?puissanceMax ?disponible WHERE {{
            ?id a ?type .
            ?type rdfs:subClassOf* mobilite:RechargeElectrique .
            
            OPTIONAL {{ ?id mobilite:typeConnecteur ?type_connecteur . }}
            OPTIONAL {{ ?id mobilite:puissanceMax ?puissanceMax . }}
            OPTIONAL {{ ?id mobilite:disponible ?disponible . }}
        }}
        ORDER BY ?id
        """
        
        sparql.setQuery(query)
        results = sparql.query().convert()

        stations = []
        for r in results["results"]["bindings"]:
            station_data = {
                "id": r["id"]["value"].split("#")[-1],
                "type": r["type"]["value"].split("#")[-1],
                "type_connecteur": r.get("type_connecteur", {}).get("value"),
                "puissanceMax": float(r["puissanceMax"]["value"]) if "puissanceMax" in r else 22.0,
                "disponible": r.get("disponible", {}).get("value") == "true" if "disponible" in r else True
            }
            stations.append(station_data)
        
        print(f"📊 {len(stations)} stations de recharge récupérées de Fuseki")
        return stations
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des stations: {e}")
        # Fallback: retourner les données du graphe local
        stations = []
        for s, p, o in g.triples((None, RDF.type, None)):
            if str(s).startswith(str(MOBILITE)):
                if any(subclass in str(o) for subclass in ["RechargeElectrique", "RechargeGaz"]):
                    station_data = {
                        "id": str(s).split("#")[-1],
                        "type": str(o).split("#")[-1],
                        "type_connecteur": "Type2",
                        "puissanceMax": 22.0,
                        "disponible": True
                    }
                    # Récupérer les propriétés spécifiques
                    for s2, p2, o2 in g.triples((s, None, None)):
                        if str(p2) == str(MOBILITE.typeConnecteur):
                            station_data["type_connecteur"] = str(o2)
                        elif str(p2) == str(MOBILITE.puissanceMax):
                            try:
                                station_data["puissanceMax"] = float(o2)
                            except (ValueError, TypeError):
                                station_data["puissanceMax"] = 22.0
                        elif str(p2) == str(MOBILITE.disponible):
                            station_data["disponible"] = str(o2).lower() == "true"
                    
                    stations.append(station_data)
        
        print(f"📊 Fallback: {len(stations)} stations du graphe local")
        return stations
    
# ======================
# 🔗 RELATIONS VÉHICULE-STATION - ENDPOINTS
# ======================

class VehiculeStationLink(BaseModel):
    vehicule_id: str
    station_id: str

@app.post("/vehicule/utilise_station/")
def add_vehicule_station_link(link: VehiculeStationLink):
    """Crée une relation entre un véhicule et une station de recharge"""
    try:
        print(f"🔄 Création de relation: {link.vehicule_id} → {link.station_id}")
        
        # 1. Ajouter au graphe local
        vehicule_uri = MOBILITE[link.vehicule_id]
        station_uri = MOBILITE[link.station_id]
        g.add((vehicule_uri, MOBILITE.utiliseStationRecharge, station_uri))
        
        # Sauvegarder le fichier local
        g.serialize("mobilite.rdf", format="xml")
        print(f"💾 Relation sauvegardée localement: {link.vehicule_id} → {link.station_id}")

        # 2. Envoyer à Fuseki
        insert_query = f"""
        PREFIX mobilite: <{MOBILITE}>
        INSERT DATA {{
            mobilite:{link.vehicule_id} mobilite:utiliseStationRecharge mobilite:{link.station_id} .
        }}
        """
        
        success = send_to_fuseki(insert_query)
        
        if success:
            # Synchroniser le fichier local avec Fuseki
            sync_from_fuseki_to_local()
            return {
                "message": f"✅ Relation créée avec succès: {link.vehicule_id} → {link.station_id}",
                "vehicule_id": link.vehicule_id,
                "station_id": link.station_id,
                "relation_type": "utiliseStationRecharge"
            }
        else:
            return {"error": f"❌ Échec de création de la relation dans Fuseki"}
            
    except Exception as e:
        print(f"❌ Erreur lors de la création de la relation: {str(e)}")
        return {"error": f"Erreur lors de la création de la relation: {str(e)}"}

@app.get("/relations_recharge/")
def get_relations_recharge():
    """Récupère toutes les relations véhicule -> station de recharge"""
    try:
        sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
        sparql.setReturnFormat(JSON)
        
        query = f"""
        PREFIX mobilite: <{MOBILITE}>
        SELECT ?vehicule ?station WHERE {{
            ?vehicule mobilite:utiliseStationRecharge ?station .
        }}
        ORDER BY ?vehicule
        """
        
        sparql.setQuery(query)
        results = sparql.query().convert()

        relations = []
        for r in results["results"]["bindings"]:
            vehicule_id = r["vehicule"]["value"].split("#")[-1]
            station_id = r["station"]["value"].split("#")[-1]
            
            relations.append({
                "vehicule": vehicule_id,
                "station": station_id,
                "type": "utiliseStationRecharge"
            })
        
        print(f"🔗 {len(relations)} relations de recharge trouvées")
        return relations
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des relations: {e}")
        # Fallback: chercher dans le graphe local
        relations = []
        for s, p, o in g.triples((None, MOBILITE.utiliseStationRecharge, None)):
            if str(s).startswith(str(MOBILITE)) and str(o).startswith(str(MOBILITE)):
                relations.append({
                    "vehicule": str(s).split("#")[-1],
                    "station": str(o).split("#")[-1],
                    "type": "utiliseStationRecharge"
                })
        print(f"📊 Fallback: {len(relations)} relations du graphe local")
        return relations
@app.get("/search/")
def search_instances(query: str = ""):
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    
    search_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    SELECT DISTINCT ?instance ?type ?label WHERE {{
        ?instance a ?type .
        FILTER(STRSTARTS(STR(?type), STR(mobilite:)))
        OPTIONAL {{
            ?instance mobilite:nom ?nom .
            ?instance mobilite:prenom ?prenom .
            BIND(CONCAT(STR(?prenom), " ", STR(?nom)) AS ?label)
        }}
        OPTIONAL {{
            ?instance mobilite:commentaire ?label .
        }}
        OPTIONAL {{
            ?instance mobilite:adresse ?label .
        }}
        FILTER(STRSTARTS(STR(?type), STR(mobilite:)))
        FILTER(CONTAINS(LCASE(COALESCE(?label, STR(?instance))), LCASE("{query}")))
    }} LIMIT 50
    """
    
    sparql.setQuery(search_query)
    results = sparql.query().convert()

    instances = []
    for r in results["results"]["bindings"]:
        instance_uri = r["instance"]["value"]
        instances.append({
            "id": instance_uri.split("#")[-1],
            "type": r["type"]["value"].split("#")[-1],
            "label": r["label"]["value"] if "label" in r else instance_uri.split("#")[-1]
        })
    
    return {"results": instances, "count": len(instances)}
# ======================
# 🔐 AUTHENTIFICATION - MODÈLES ET ENDPOINTS
# ======================

class UserSignUp(BaseModel):
    # Champs obligatoires (comme dans le RDF)
    nom: str
    prenom: str
    age: int
    email: str
    telephone: str
    type_personne: str = "Personne"  # Nouveau champ : Personne, Conducteur, Pieton, Voyageur
    
    # Champs optionnels (comme dans le RDF)
    dateNaissance: str = None
    genre: str = ""
    nationalite: str = ""
    languePreferee: str = "Français"
    
    # Champs pour l'authentification (non stockés dans RDF)
    username: str  # Pour l'authentification uniquement
    password: str  # Pour l'authentification uniquement
    
    # Champs avec valeurs par défaut (comme dans le RDF)
    niveauAbonnement: str = "Standard"
    preferencesAccessibilite: str = "Aucune"

class UserSignIn(BaseModel):
    email: str
    password: str

# Stockage temporaire des utilisateurs (remplacez par une base de données)
users_db = {}

@app.post("/auth/signup/")
def sign_up(user: UserSignUp):
    """Inscription d'un nouvel utilisateur avec type spécifique"""
    try:
        # Vérifier si l'email existe déjà
        if user.email in users_db:
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
        
        # Déterminer le type de personne
        type_personne = user.type_personne.capitalize()
        valid_types = ["Personne", "Conducteur", "Pieton", "Voyageur"]
        if type_personne not in valid_types:
            type_personne = "Personne"  # Valeur par défaut
        
        # Créer l'utilisateur dans la base temporaire
        user_id = f"user_{len(users_db) + 1}"
        current_time = datetime.now().isoformat()
        
        users_db[user.email] = {
            "id": user_id,
            "username": user.username,
            "email": user.email,
            "password": user.password,
            "nom": user.nom,
            "prenom": user.prenom,
            "age": user.age,
            "telephone": user.telephone,
            "type_personne": type_personne,
            "created_at": current_time
        }

        # Créer l'utilisateur dans le graphe RDF avec le type spécifique
        user_uri = MOBILITE[user_id]
        
        # Type spécifique (Conducteur, Pieton, Voyageur ou Personne par défaut)
        g.add((user_uri, RDF.type, MOBILITE[type_personne]))
        
        # Propriétés principales
        g.add((user_uri, MOBILITE.nom, Literal(user.nom, datatype=XSD.string)))
        g.add((user_uri, MOBILITE.prenom, Literal(user.prenom, datatype=XSD.string)))
        g.add((user_uri, MOBILITE.age, Literal(user.age, datatype=XSD.integer)))
        g.add((user_uri, MOBILITE.email, Literal(user.email, datatype=XSD.string)))
        g.add((user_uri, MOBILITE.telephone, Literal(user.telephone, datatype=XSD.string)))
        g.add((user_uri, MOBILITE.dateInscription, Literal(current_time, datatype=XSD.string)))
        g.add((user_uri, MOBILITE.statutCompte, Literal("Actif", datatype=XSD.string)))
        g.add((user_uri, MOBILITE.niveauAbonnement, Literal(user.niveauAbonnement, datatype=XSD.string)))
        g.add((user_uri, MOBILITE.scoreFidelite, Literal(0, datatype=XSD.integer)))
        g.add((user_uri, MOBILITE.preferencesAccessibilite, Literal(user.preferencesAccessibilite, datatype=XSD.string)))
        
        # Propriétés optionnelles
        if user.dateNaissance:
            g.add((user_uri, MOBILITE.dateNaissance, Literal(user.dateNaissance, datatype=XSD.string)))
        if user.genre:
            g.add((user_uri, MOBILITE.genre, Literal(user.genre, datatype=XSD.string)))
        if user.nationalite:
            g.add((user_uri, MOBILITE.nationalite, Literal(user.nationalite, datatype=XSD.string)))
        if user.languePreferee:
            g.add((user_uri, MOBILITE.languePreferee, Literal(user.languePreferee, datatype=XSD.string)))
        
        g.serialize("mobilite_updated.rdf", format="xml")

        # Synchroniser avec Fuseki
        insert_query = f"""
        PREFIX mobilite: <{MOBILITE}>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        INSERT DATA {{
            mobilite:{user_id} a mobilite:{type_personne} ;
                         mobilite:nom "{user.nom}"^^xsd:string ;
                         mobilite:prenom "{user.prenom}"^^xsd:string ;
                         mobilite:age "{user.age}"^^xsd:integer ;
                         mobilite:email "{user.email}"^^xsd:string ;
                         mobilite:telephone "{user.telephone}"^^xsd:string ;
                         mobilite:dateInscription "{current_time}"^^xsd:string ;
                         mobilite:statutCompte "Actif"^^xsd:string ;
                         mobilite:niveauAbonnement "{user.niveauAbonnement}"^^xsd:string ;
                         mobilite:scoreFidelite "0"^^xsd:integer ;
                         mobilite:preferencesAccessibilite "{user.preferencesAccessibilite}"^^xsd:string
        """
        
        # Ajouter les champs conditionnels
        if user.dateNaissance:
            insert_query += f' ; mobilite:dateNaissance "{user.dateNaissance}"^^xsd:string'
        if user.genre:
            insert_query += f' ; mobilite:genre "{user.genre}"^^xsd:string'
        if user.nationalite:
            insert_query += f' ; mobilite:nationalite "{user.nationalite}"^^xsd:string'
        if user.languePreferee:
            insert_query += f' ; mobilite:languePreferee "{user.languePreferee}"^^xsd:string'
        
        insert_query += " . }"
        
        send_to_fuseki(insert_query)

        return {
            "message": f"✅ {type_personne} créé avec succès dans le système RDF",
            "user_id": user_id,
            "type_personne": type_personne,
            "email": user.email
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'inscription: {str(e)}")

@app.post("/auth/signin/")
def sign_in(user: UserSignIn):
    """Connexion d'un utilisateur"""
    try:
        # Vérifier si l'utilisateur existe
        if user.email not in users_db:
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
        
        stored_user = users_db[user.email]
        
        # Vérifier le mot de passe (en production, utiliser bcrypt)
        if stored_user["password"] != user.password:
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
        
        # Générer un token simple (en production, utiliser JWT)
        token = f"token_{stored_user['id']}_{int(datetime.now().timestamp())}"
        
        return {
            "message": "✅ Connexion réussie",
            "token": token,
            "user": {
                "id": stored_user["id"],
                "username": stored_user["username"],
                "email": stored_user["email"],
                "nom": stored_user["nom"],
                "prenom": stored_user["prenom"]
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la connexion: {str(e)}")

@app.get("/auth/me/")
def get_current_user(token: str):
    """Récupérer les informations de l'utilisateur connecté"""
    try:
        # Vérifier le token (simplifié)
        if not token.startswith("token_"):
            raise HTTPException(status_code=401, detail="Token invalide")
        
        # Extraire l'ID utilisateur du token
        user_id = token.split("_")[1]
        
        # Trouver l'utilisateur
        user_data = None
        for email, user in users_db.items():
            if user["id"] == user_id:
                user_data = user
                break
        
        if not user_data:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        return {
            "user": {
                "id": user_data["id"],
                "username": user_data["username"],
                "email": user_data["email"],
                "nom": user_data["nom"],
                "prenom": user_data["prenom"],
                "age": user_data["age"],
                "telephone": user_data["telephone"]
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

# ======================
# 🏠 ENDPOINT RACINE
# ======================

@app.get("/")
def home():
    return {"message": "🚀 Bienvenue dans l'API SmartCity Mobility RDF + Fuseki + Ollama"}


###########################wala
# Initialisation discrète
sparql_gen = SPARQLGenerator()

# Conversion RDF en texte (sans référence aux templates)
def rdf_to_text():
    txt = "Structure des données RDF :\n\n"
    for s, p, o in g:
        s_clean = str(s).split("#")[-1] if "#" in str(s) else str(s)
        p_clean = str(p).split("#")[-1] if "#" in str(p) else str(p)
        o_clean = str(o).split("#")[-1] if "#" in str(o) else str(o)
        txt += f"{s_clean} → {p_clean} → {o_clean}\n"
    return txt

RDF_TEXT = rdf_to_text()

# PROMPT PÉDAGOGIQUE AMÉLIORÉ
PROMPT_TEMPLATE = """
Tu es un expert SPARQL. Génère UNIQUEMENT la requête SPARQL pour cette question.

ONTOLOGIE MOBILITÉ :
- Préfixe : PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
- Classes principales : Personne, Conducteur, Avis, AvisPositif, AvisNegatif, Trajet, Ticket, Infrastructure
- Propriétés principales : commentaire, note, dateAvis, scoreUtilite, categorieAvis, langueAvis, nom, prenom, age, email, distance, duree

PRINCIPES FONDAMENTAUX :

1. COMPRÉHENSION SÉMANTIQUE :
   - "positif/positive" → classe AvisPositif
   - "négatif/négative" → classe AvisNegatif  
   - "avis" général → classe Avis
   - "personne" → classe Personne
   - "trajet" → classe Trajet

2. SÉLECTION INTELLIGENTE :
   - Utilise des noms de variables SIGNIFICATIFS : ?commentaire, ?note, ?dateAvis, etc.
   - Ne JAMAIS utiliser ?var1, ?var2, ?var3
   - Sélectionne TOUJOURS les propriétés pertinentes :
     * Avis : ?commentaire ?note ?dateAvis ?scoreUtilite ?categorieAvis ?langueAvis
     * Personne : ?nom ?prenom ?age ?email ?telephone
     * Trajet : ?distance ?duree ?heureDepart ?heureArrivee

3. SYNTAXE CORRECTE :
   - Pattern : SELECT ?avis ?commentaire ?note WHERE {{ ?avis a mobilite:AvisPositif ; mobilite:commentaire ?commentaire ; mobilite:note ?note . }}
   - "a" pour le type de classe
   - ";" pour séparer les propriétés
   - "." pour terminer

QUESTION : "{user_question}"

GÉNÈRE UNIQUEMENT LA REQUÊTE SPARQL COMPLÈTE AVEC DES VARIABLES SIGNIFICATIVES.
"""

def safe_format_prompt(question):
    """Format sécurisé du prompt pour éviter les erreurs avec les accolades"""
    return PROMPT_TEMPLATE.format(user_question=question.replace("{", "{{").replace("}", "}}"))

def extract_sparql(text):
    """Extrait la requête SPARQL du texte généré"""
    if not text:
        return None
    
    # Essayer d'abord le pattern complet
    pattern = r'PREFIX.*?\}'
    matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
    
    if matches:
        return matches[0].strip()
    
    # Si pas trouvé, chercher juste le bloc WHERE
    where_pattern = r'SELECT.*?WHERE\s*\{.*?\}'
    matches = re.findall(where_pattern, text, re.DOTALL | re.IGNORECASE)
    
    if matches:
        sparql = matches[0].strip()
        # Ajouter le préfixe manquant si nécessaire
        if not sparql.startswith('PREFIX mobilite:'):
            sparql = 'PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>\n' + sparql
        return sparql
    
    return None

def format_results(results):
    """Formate les résultats de requête"""
    formatted = []
    for row in results:
        row_dict = {}
        for k, v in row.asdict().items():
            if v:
                if "#" in str(v):
                    row_dict[k] = str(v).split("#")[-1]
                else:
                    row_dict[k] = str(v)
            else:
                row_dict[k] = None
        formatted.append(row_dict)
    return formatted

def ensure_detailed_sparql(sparql_query, user_question):
    """S'assure que la requête n'est pas trop basique - correction GÉNÉRIQUE uniquement"""
    if not sparql_query:
        return sparql_query
    
    sparql_lower = sparql_query.lower()
    question_lower = user_question.lower()
    
    # Détecter si c'est une requête de comptage
    is_count_query = "count(" in sparql_lower or any(word in question_lower for word in ["nombre", "combien", "compter"])
    
    if is_count_query:
        return sparql_query  # Les comptages peuvent avoir une variable simple
    
    # CORRECTION : Remplacer les variables génériques par des noms significatifs
    sparql_query = fix_generic_variables(sparql_query, question_lower)
    
    # Vérifier si la requête est trop basique (SELECT avec 1-2 variables max)
    select_match = re.search(r'SELECT\s+(.*?)\s+WHERE', sparql_lower, re.DOTALL)
    if select_match:
        select_vars = re.findall(r'\?(\w+)', select_match.group(1))
        
        # Si requête trop simple, l'enrichir GÉNÉRIQUEMENT
        if len(select_vars) <= 2:
            return enhance_generic_query(sparql_query, question_lower)
    
    return sparql_query

def fix_generic_variables(sparql, question_lower):
    """Corrige les variables génériques (?var1, ?var2) par des noms significatifs"""
    
    # Détecter le type d'entité principal
    if "avis" in question_lower:
        # Remplacer les variables génériques pour les avis
        replacements = {
            r'\?var1': '?commentaire',
            r'\?var2': '?note', 
            r'\?var3': '?dateAvis',
            r'\?var4': '?scoreUtilite',
            r'\?var5': '?categorieAvis',
            r'\?var6': '?langueAvis'
        }
    elif "personne" in question_lower or "utilisateur" in question_lower:
        # Remplacer pour les personnes
        replacements = {
            r'\?var1': '?nom',
            r'\?var2': '?prenom',
            r'\?var3': '?age',
            r'\?var4': '?email',
            r'\?var5': '?telephone',
            r'\?var6': '?dateInscription'
        }
    elif "trajet" in question_lower:
        # Remplacer pour les trajets
        replacements = {
            r'\?var1': '?distance',
            r'\?var2': '?duree',
            r'\?var3': '?heureDepart',
            r'\?var4': '?heureArrivee',
            r'\?var5': '?vitesseMoyenne',
            r'\?var6': '?scoreOptimisation'
        }
    else:
        return sparql
    
    # Appliquer les remplacements
    for generic, meaningful in replacements.items():
        sparql = re.sub(generic, meaningful, sparql, flags=re.IGNORECASE)
    
    return sparql

def enhance_generic_query(sparql, question_lower):
    """Enrichissement GÉNÉRIQUE sans logique prédéfinie"""
    
    # CORRECTIONS SYSTAXIQUES UNIQUEMENT
    sparql = re.sub(r'\?(\w+)\s+mobilite:donneAvis', r'?\1 a', sparql)
    
    # Si la requête a un pattern basique ?var WHERE { ?var a mobilite:Classe }
    basic_pattern = re.search(r'SELECT\s+(\?\w+)\s+WHERE\s*\{\s*\1\s+a\s+(mobilite:\w+)', sparql, re.IGNORECASE)
    
    if basic_pattern:
        var_name = basic_pattern.group(1)
        class_name = basic_pattern.group(2)
        
        # Enrichissement basé sur la classe - GÉNÉRIQUE
        if "avis" in class_name.lower():
            new_select = f"SELECT {var_name} ?commentaire ?note ?dateAvis ?scoreUtilite ?categorieAvis ?langueAvis"
            new_where = f"{var_name} a {class_name} ; mobilite:commentaire ?commentaire ; mobilite:note ?note ; mobilite:dateAvis ?dateAvis ; mobilite:scoreUtilite ?scoreUtilite ; mobilite:categorieAvis ?categorieAvis ; mobilite:langueAvis ?langueAvis"
            
        elif "personne" in class_name.lower():
            new_select = f"SELECT {var_name} ?nom ?prenom ?age ?email ?telephone ?dateInscription"
            new_where = f"{var_name} a {class_name} ; mobilite:nom ?nom ; mobilite:prenom ?prenom ; mobilite:age ?age ; mobilite:email ?email ; mobilite:telephone ?telephone ; mobilite:dateInscription ?dateInscription"
            
        elif "trajet" in class_name.lower():
            new_select = f"SELECT {var_name} ?distance ?duree ?heureDepart ?heureArrivee ?vitesseMoyenne"
            new_where = f"{var_name} a {class_name} ; mobilite:distance ?distance ; mobilite:duree ?duree ; mobilite:heureDepart ?heureDepart ; mobilite:heureArrivee ?heureArrivee ; mobilite:vitesseMoyenne ?vitesseMoyenne"
            
        else:
            # Pour les autres classes, ne pas modifier
            return sparql
        
        sparql = sparql.replace(f"SELECT {var_name}", new_select)
        sparql = re.sub(rf'\{{\s*{var_name}\s+a\s+{class_name}\s*', f'{{ {new_where} ', sparql)
    
    return sparql



@app.post("/ask/")  # Changé de GET à POST et ajouté le slash
async def ask(question_data: dict):
    """Endpoint principal pour les questions avec POST"""
    try:
        user_question = question_data.get("question", "").strip()
        if not user_question:
            raise HTTPException(status_code=400, detail="La question est requise")
        
        print(f"🧠 Question reçue: {user_question}")

        # Vérifier d'abord si la question correspond à un template prédéfini
        if sparql_gen.is_predefined_query(user_question):
            result = sparql_gen.generate_sparql(user_question)
            if isinstance(result, tuple) and len(result) == 2:
                sparql, source = result
            else:
                sparql = result
                source = "template"
        else:
            # Utiliser l'IA
            source = "ia"
            prompt = safe_format_prompt(user_question)
            try:
                raw_response = ollama.generate(
                    model="codellama:7b", 
                    prompt=prompt, 
                    options={"temperature": 0.1}
                )["response"]
                sparql = extract_sparql(raw_response)
                
                if sparql:
                    sparql = ensure_detailed_sparql(sparql, user_question)
                    
            except Exception as e:
                return {"error": f"Erreur avec l'IA: {str(e)}", "question": user_question}
        
        if not sparql:
            return {"error": "Requête SPARQL non générée", "question": user_question}
        
        try:
            results = list(g.query(sparql))
            formatted_results = format_results(results)
            
            return {
                "question": user_question,
                "sparql_query": sparql,  # Changé de 'sparql' à 'sparql_query'
                "results": formatted_results,
                "count": len(results),
                "source": source
            }
            
        except Exception as e:
            return {"error": f"Erreur d'exécution: {str(e)}", "sparql_query": sparql}
            
    except Exception as e:
        return {"error": f"Erreur générale: {str(e)}", "question": user_question}
    
@app.get("/check-query")
async def check_query(q: str = Query(...)):
    """Endpoint pour vérifier si une requête est prédéfinie"""
    is_predefined = sparql_gen.is_predefined_query(q)
    query_type = sparql_gen.detect_query_type(q)
    user = sparql_gen.extract_user_name(q)
    
    return {
        "question": q,
        "is_predefined": is_predefined,
        "query_type": query_type,
        "detected_user": user,
        "suggested_questions": sparql_gen.get_suggested_questions() if not is_predefined else None
    }

@app.get("/examples")
async def get_examples():
    """Endpoint pour les exemples (sans révéler la logique)"""
    return {
        "example_questions": [
            "Quel est le trajet de Wala?",
            "Donne les informations sur Oumaima", 
            "Liste les tickets étudiants disponibles",
            "Quels tickets possède Wala?",
            "Affiche les avis de Oumaima"
        ],
        "predefined_queries_count": len(QUERY_PATTERNS),
        "known_users": sparql_gen.known_users
    }

@app.get("/health")
async def health_check():
    """Endpoint de santé"""
    return {"status": "active", "triplets": len(g)}



###########################
# ======================
# 🚀 LANCEMENT DE L'APPLICATION
# ======================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)