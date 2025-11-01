# main.py
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

# ======================
# 🔧 CONFIGURATION
# ======================
load_dotenv()

# Configuration Ollama
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "codellama:7b"

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
        print("🔄 Synchronisation Fuseki → mobilite_updated.rdf ...")
        url = f"{FUSEKI_DATA_ENDPOINT}?graph=default"
        response = requests.get(url, headers={"Accept": "application/rdf+xml"})
        if response.status_code == 200 and response.text.strip():
            with open("mobilite_updated.rdf", "w", encoding="utf-8") as f:
                f.write(response.text)
            print("✅ Synchronisation réussie : fichier local mis à jour.")
        else:
            print(f"⚠️ Aucun contenu RDF récupéré (code {response.status_code}).")
    except Exception as e:
        print(f"⚠️ Erreur de synchronisation Fuseki → local : {e}")

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

def send_to_fuseki(update_query: str):
    """Envoie une requête SPARQL UPDATE à Fuseki"""
    sparql = SPARQLWrapper(FUSEKI_UPDATE_URL)
    sparql.setMethod(POST)
    sparql.setQuery(update_query)
    try:
        sparql.query()
        return True
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi à Fuseki: {e}")
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
    """Nettoie la requête SPARQL générée par l'IA - VERSION ROBUSTE"""
    query = query.strip()
    
    # Supprimer tout avant le premier PREFIX ou SELECT
    lines = query.split('\n')
    sparql_start = -1
    
    for i, line in enumerate(lines):
        if line.strip().upper().startswith(('PREFIX', 'SELECT', 'ASK', 'CONSTRUCT', 'DESCRIBE')):
            sparql_start = i
            break
    
    if sparql_start >= 0:
        query = '\n'.join(lines[sparql_start:])
    
    # Supprimer les backticks et code blocks
    query = re.sub(r"```[a-zA-Z]*", "", query)
    query = query.replace("```", "").strip()
    
    # Supprimer les explications textuelles
    query = re.sub(r"Notez que.*$", "", query, flags=re.IGNORECASE | re.MULTILINE)
    query = re.sub(r"Note:.*$", "", query, flags=re.IGNORECASE | re.MULTILINE)
    query = re.sub(r"La requête SPARQL.*est:", "", query, flags=re.IGNORECASE)
    query = re.sub(r"SPARQL:?", "", query, flags=re.IGNORECASE)
    query = re.sub(r"Voici.*requête:", "", query, flags=re.IGNORECASE)
    
    # Corriger les préfixes
    query = re.sub(r"PREFIX\s*:\s*<[^>]+>", f"PREFIX mobilite: <{MOBILITE}>", query)
    query = re.sub(r"PREFIX\s+mobilite:\s*<http://example\.org/?.*?>", f"PREFIX mobilite: <{MOBILITE}>", query)
    
    # Assurer le préfixe mobilite
    if "PREFIX mobilite:" not in query:
        query = f"PREFIX mobilite: <{MOBILITE}>\n" + query
    
    # Assurer le préfixe rdfs si nécessaire
    if "rdfs:subClassOf" in query and "PREFIX rdfs:" not in query:
        query = f"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" + query
    
    # Nettoyer l'espacement
    query = re.sub(r'\n\s*\n', '\n', query)
    query = re.sub(r'[ ]+', ' ', query)
    
    return query.strip()

# ======================
# 🧠 INTELLIGENCE ARTIFICIELLE AVEC OLLAMA
# ======================
def discover_ontology():
    """Découvre automatiquement les classes et propriétés de l'ontologie"""
    try:
        # Requête pour toutes les classes avec des instances
        classes_query = """
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
        SELECT DISTINCT ?class (COUNT(?instance) as ?instance_count) WHERE {
          ?instance a ?class .
          FILTER(STRSTARTS(STR(?class), STR(mobilite:)))
        }
        GROUP BY ?class
        ORDER BY DESC(?instance_count)
        """
        
        # Requête pour les propriétés utilisées
        properties_query = """
        PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
        SELECT DISTINCT ?property (COUNT(?s) as ?usage_count) WHERE {
          ?s ?property ?o .
          FILTER(STRSTARTS(STR(?property), STR(mobilite:)))
        }
        GROUP BY ?property
        ORDER BY DESC(?usage_count)
        LIMIT 20
        """
        
        # Exécuter les requêtes
        classes_result = execute_sparql_query(classes_query)
        properties_result = execute_sparql_query(properties_query)
        
        # Formater les résultats
        classes_info = []
        for r in classes_result["results"]["bindings"]:
            class_uri = r["class"]["value"]
            class_name = class_uri.split("#")[-1] if "#" in class_uri else class_uri.split("/")[-1]
            count = int(r["instance_count"]["value"])
            classes_info.append(f"- {class_name} ({count} instances)")
        
        properties_info = []
        for r in properties_result["results"]["bindings"]:
            prop_uri = r["property"]["value"]
            prop_name = prop_uri.split("#")[-1] if "#" in prop_uri else prop_uri.split("/")[-1]
            count = int(r["usage_count"]["value"])
            properties_info.append(f"- {prop_name} ({count} usages)")
        
        return {
            "classes": "\n".join(classes_info),
            "properties": "\n".join(properties_info)
        }
        
    except Exception as e:
        print(f"❌ Erreur découverte ontologie: {e}")
        return None
def generate_sparql_with_ollama(user_question: str) -> str:
    """
    Génère une requête SPARQL en utilisant Ollama - VERSION DYNAMIQUE
    """
    # Découvrir l'ontologie réelle
    ontology = discover_ontology()
    
    if ontology:
        # Utiliser l'ontologie découverte
        classes_section = ontology["classes"]
        properties_section = ontology["properties"]
        source_info = "ONTOLOGIE RÉELLE - DÉCOUVERTE AUTOMATIQUE"
    else:
        # Fallback vers l'ontologie théorique
        classes_section = """
        - Personne, Conducteur, Piéton, Voyageur
        - ReseauTransport, TransportPublic, TransportPrive, MobiliteDouce
        - Bus, Metro, Voiture, Velo, Trottinette
        - Infrastructure, Route, StationsBus, StationsMetro, Parking, Batiment
        - Trajet, TrajetOptimal, TrajetCourt
        - Avis, AvisPositif, AvisNegatif
        - Ticket, TicketBus, TicketMetro, TicketParking
        - StationRecharge, RechargeElectrique
        - Statistiques, StatistiquesAccidents, StatistiquesPollution, StatistiquesUtilisation
        - SmartCity
        """
        properties_section = """
        - nom, prenom, age, email, telephone
        - numeroPermis, categoriePermis
        - distance, duree, heureDepart, heureArrivee
        - commentaire, note, dateAvis
        - prix, statutTicket, dateAchat
        - adresse, coordonneesGPS, capaciteAccueil
        - typeConnecteur, puissanceMax, disponible
        - valeur, unite, dateMesure
        """
        source_info = "ONTOLOGIE THÉORIQUE - FALLBACK"

    prompt = f"""
TU ES UN EXPERT SPARQL. Ta mission est de convertir des questions en français en requêtes SPARQL VALIDES.

# {source_info}
Namespace: PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>

## CLASSES DISPONIBLES (utiliser avec ?x a mobilite:Classe) :
{classes_section}

## PROPRIÉTÉS DISPONIBLES (utiliser avec ?x mobilite:propriete ?valeur) :
{properties_section}

## PROPRIÉTÉS OBJET (utiliser avec ?x mobilite:propriete ?y) :
- effectueTrajet, utiliseReseauTransport, donneAvis, possedeTicket
- utiliseStationRecharge, commenceA, terminaA
- utiliseMoyenTransport, circuleSur, conduitPar
- appartientA, proposePar

## RÈGLES ABSOLUES DE GÉNÉRATION :
1. POUR "montrer les X" → SELECT ?x WHERE {{ ?x a mobilite:X . }}
2. POUR "lister les Y" → SELECT ?y WHERE {{ ?y a mobilite:Y . }}
3. POUR "afficher les Z" → SELECT ?z WHERE {{ ?z a mobilite:Z . }}
4. POUR les sous-classes : utiliser ?x a/rdfs:subClassOf* mobilite:ClasseMere
5. POUR les propriétés : utiliser OPTIONAL {{ ?x mobilite:propriete ?valeur . }}
6. TOUJOURS inclure PREFIX mobilite: et PREFIX rdfs: si nécessaire

## EXEMPLES CORRECTS :
Question: "Montre les routes" → PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#> SELECT ?route WHERE {{ ?route a mobilite:Route . }}
Question: "Liste les conducteurs" → PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#> SELECT ?conducteur WHERE {{ ?conducteur a mobilite:Conducteur . }}
Question: "Avis avec notes" → PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#> SELECT ?avis ?note WHERE {{ ?avis a mobilite:Avis . OPTIONAL {{ ?avis mobilite:note ?note . }} }}
Question: "Personnes avec leurs trajets" → PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#> SELECT ?personne ?trajet WHERE {{ ?personne mobilite:effectueTrajet ?trajet . }}

## QUESTION À TRADUIRE : "{user_question}"

GÉNÈRE UNIQUEMENT LA REQUÊTE SPARQL SANS AUCUN TEXTE. COMMENCE DIRECTEMENT PAR "PREFIX" ou "SELECT".
    """

    try:
        print(f"🧠 Envoi à Ollama (modèle: {OLLAMA_MODEL})...")
        
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,
                    "top_p": 0.9,
                    "num_predict": 500
                }
            },
            timeout=90
        )
        
        if response.status_code != 200:
            raise Exception(f"Ollama error: {response.status_code}")
            
        result = response.json()
        sparql_query = result.get("response", "").strip()
        
        # Nettoyage
        cleaned_query = clean_sparql_query(sparql_query)
        print(f"🧹 Requête générée: {cleaned_query}")
        
        return cleaned_query
        
    except Exception as e:
        print(f"❌ Erreur génération Ollama: {e}")
        # Fallback vers une requête simple
        return generate_fallback_sparql(user_question)
@app.get("/health/")
async def health_check():
    """Endpoint de vérification de l'état des services"""
    status = {
        "fastapi": "OK",
        "ollama": "Unknown", 
        "fuseki": "Unknown",
        "model": OLLAMA_MODEL,
        "available_models": [],
        "model_available": False
    }
    
    # Test Ollama
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            models_data = response.json()
            status["ollama"] = "OK"
            status["available_models"] = [model["name"] for model in models_data.get("models", [])]
            status["model_available"] = OLLAMA_MODEL in status["available_models"]
        else:
            status["ollama"] = f"Error: {response.status_code}"
    except Exception as e:
        status["ollama"] = f"Error: {str(e)}"
    
    # Test Fuseki
    try:
        response = requests.get(f"{FUSEKI_BASE}/$/datasets", timeout=5)
        status["fuseki"] = "OK" if response.status_code == 200 else f"Error: {response.status_code}"
    except Exception as e:
        status["fuseki"] = f"Error: {str(e)}"
    
    return status
def generate_fallback_sparql(user_question: str) -> str:
    """Génère une requête SPARQL de secours basée sur des motifs"""
    question_lower = user_question.lower()
    
    # Détection des motifs courants
    if any(word in question_lower for word in ["route", "rue", "avenue", "autoroute"]):
        return f"PREFIX mobilite: <{MOBILITE}>\nSELECT ?route WHERE {{ ?route a mobilite:Route . }}"
    
    elif any(word in question_lower for word in ["personne", "utilisateur", "conducteur", "piéton"]):
        return f"""
        PREFIX mobilite: <{MOBILITE}>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?personne ?nom ?prenom ?type WHERE {{
          ?personne a ?type .
          ?type rdfs:subClassOf* mobilite:Personne .
          OPTIONAL {{ ?personne mobilite:nom ?nom . }}
          OPTIONAL {{ ?personne mobilite:prenom ?prenom . }}
        }} LIMIT 20
        """
    
    elif any(word in question_lower for word in ["avis", "commentaire", "note"]):
        return f"""
        PREFIX mobilite: <{MOBILITE}>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?avis ?commentaire ?note ?type WHERE {{
          ?avis a ?type .
          ?type rdfs:subClassOf* mobilite:Avis .
          OPTIONAL {{ ?avis mobilite:commentaire ?commentaire . }}
          OPTIONAL {{ ?avis mobilite:note ?note . }}
        }} LIMIT 20
        """
    
    elif any(word in question_lower for word in ["trajet", "parcours", "itinéraire"]):
        return f"""
        PREFIX mobilite: <{MOBILITE}>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?trajet ?distance ?duree ?type WHERE {{
          ?trajet a ?type .
          ?type rdfs:subClassOf* mobilite:Trajet .
          OPTIONAL {{ ?trajet mobilite:distance ?distance . }}
          OPTIONAL {{ ?trajet mobilite:duree ?duree . }}
        }} LIMIT 20
        """
    
    elif any(word in question_lower for word in ["bus", "métro", "véhicule", "transport"]):
        return f"""
        PREFIX mobilite: <{MOBILITE}>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?vehicule ?type ?marque ?modele WHERE {{
          ?vehicule a ?type .
          ?type rdfs:subClassOf* mobilite:ReseauTransport .
          OPTIONAL {{ ?vehicule mobilite:marque ?marque . }}
          OPTIONAL {{ ?vehicule mobilite:modele ?modele . }}
        }} LIMIT 20
        """
    
    else:
        # Requête générique de secours
        return f"""
        PREFIX mobilite: <{MOBILITE}>
        SELECT ?s ?p ?o WHERE {{
          ?s ?p ?o .
        }} LIMIT 10
        """
@app.get("/test-ollama/")
async def test_ollama():
    """Test direct d'Ollama"""
    try:
        # Test de génération simple
        test_prompt = "Réponds uniquement par 'OK'"
        
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": test_prompt,
                "stream": False
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                "status": "success",
                "response": result.get("response", "No response"),
                "model_used": OLLAMA_MODEL
            }
        else:
            return {
                "status": "error",
                "code": response.status_code,
                "message": response.text
            }
            
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
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

class Vehicule(BaseModel):
    id: str
    type_vehicule: str
    marque: str
    modele: str
    immatriculation: str

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
def improve_sparql_query(user_question: str, generated_query: str) -> str:
    """Améliore ou corrige les requêtes SPARQL générées"""
    question_lower = user_question.lower()
    
    print(f"🔧 Analyse: '{user_question}'")
    print(f"🔧 Requête générée: {generated_query}")
    
    # Correction spécifique pour "infrastructures qui sont des routes"
    if "infrastructure" in question_lower and "route" in question_lower:
        if "mobilite:Infrastructure" in generated_query and "rdfs:subClassOf" in generated_query:
            print("🔄 Correction: Chercher directement les instances de Route")
            return f"""
            PREFIX mobilite: <{MOBILITE}>
            SELECT ?route WHERE {{
              ?route a mobilite:Route .
            }}
            """
    
    # Correction pour les requêtes utilisant mobilite:type (qui n'existe pas)
    if 'mobilite:type "' in generated_query:
        print("🔄 Correction: Supprimer l'usage de mobilite:type inexistant")
        # Extraire le type recherché
        match = re.search(r'mobilite:type "([^"]+)"', generated_query)
        if match:
            type_recherche = match.group(1).capitalize()
            return f"""
            PREFIX mobilite: <{MOBILITE}>
            SELECT ?instance WHERE {{
              ?instance a mobilite:{type_recherche} .
            }}
            """
    
    # Si la requête est valide, la retourner telle quelle
    return generated_query
@app.post("/ask/")
async def ask_question(question_data: dict):
    """
    Endpoint principal : Reçoit une question en français, génère la requête SPARQL avec Ollama,
    l'exécute sur Fuseki et retourne les résultats.
    """
    try:
        user_question = question_data.get("question", "").strip()
        if not user_question:
            raise HTTPException(status_code=400, detail="La question est requise")

        print(f"🧠 Question reçue: {user_question}")

        # 1. Génération de la requête SPARQL avec Ollama
        print("🔄 Génération de la requête SPARQL avec Ollama...")
        sparql_query = generate_sparql_with_ollama(user_question)
        print(f"📝 Requête SPARQL générée:\n{sparql_query}")

        # 2. Amélioration de la requête si nécessaire
        improved_query = improve_sparql_query(user_question, sparql_query)
        if improved_query != sparql_query:
            print(f"🔄 Requête améliorée:\n{improved_query}")
            sparql_query = improved_query

        # 3. Validation de la requête - si invalide, utiliser le fallback
        if not validate_sparql_query(sparql_query):
            print("🔄 Utilisation du système de fallback...")
            sparql_query = fallback_sparql_query(user_question)
            print(f"📝 Requête de fallback:\n{sparql_query}")

        # 4. Exécution de la requête sur Fuseki
        print("🚀 Exécution de la requête sur Fuseki...")
        results = execute_sparql_query(sparql_query)
        
        if results is None:
            raise HTTPException(status_code=500, detail="Erreur lors de l'exécution de la requête SPARQL")

        # 5. Formatage des résultats
        formatted_results = format_sparql_results(results)
        
        print(f"✅ {len(formatted_results)} résultats trouvés")
        
        return {
            "question": user_question,
            "sparql_query": sparql_query,
            "results": formatted_results,
            "count": len(formatted_results)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur globale: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

def format_sparql_results(results):
    """
    Formate les résultats SPARQL en un format plus lisible
    """
    if "results" not in results or "bindings" not in results["results"]:
        return []

    formatted = []
    for binding in results["results"]["bindings"]:
        item = {}
        for key, value in binding.items():
            # Extraire le nom court après le # pour les URIs
            if value["type"] == "uri" and "#" in value["value"]:
                item[key] = value["value"].split("#")[-1]
            else:
                item[key] = value["value"]
        formatted.append(item)
    
    return formatted

def validate_sparql_query(query: str) -> bool:
    """Valide la syntaxe basique d'une requête SPARQL"""
    if not query:
        print("❌ Requête vide")
        return False
    
    # Vérifier les mots-clés SPARQL essentiels
    essential_keywords = ['SELECT', 'ASK', 'CONSTRUCT', 'DESCRIBE']
    if not any(keyword in query.upper() for keyword in essential_keywords):
        print(f"❌ Aucun mot-clé SPARQL essentiel trouvé dans: {query}")
        return False
    
    # Vérifier la présence des accolades
    if '{' not in query or '}' not in query:
        print("❌ Accolades manquantes dans la requête")
        return False
    
    # Vérifier que la requête n'est pas trop générique
    if "?personne ?conducteur ?trajet ?avis ?infrastructure ?vehicule" in query:
        print("❌ Requête trop générique détectée")
        return False
    
    print("✅ Requête SPARQL validée")
    return True
def fallback_sparql_query(user_question: str) -> str:
    """Génère une requête SPARQL de secours basée sur des motifs"""
    question_lower = user_question.lower()
    
    if any(word in question_lower for word in ["personne", "utilisateur", "conducteur"]):
        if "avis" in question_lower:
            return f"""
            PREFIX mobilite: <{MOBILITE}>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            SELECT DISTINCT ?utilisateur ?nom ?prenom WHERE {{
                ?utilisateur a/rdfs:subClassOf* mobilite:Personne .
                ?utilisateur mobilite:donneAvis ?avis .
                OPTIONAL {{ ?utilisateur mobilite:nom ?nom . }}
                OPTIONAL {{ ?utilisateur mobilite:prenom ?prenom . }}
            }}
            """
        else:
            return f"""
            PREFIX mobilite: <{MOBILITE}>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            SELECT ?personne ?nom ?prenom ?type WHERE {{
                ?personne a ?type .
                ?type rdfs:subClassOf* mobilite:Personne .
                OPTIONAL {{ ?personne mobilite:nom ?nom . }}
                OPTIONAL {{ ?personne mobilite:prenom ?prenom . }}
            }} LIMIT 20
            """
    
    elif "statistique" in question_lower or "pollution" in question_lower:
        return f"""
        PREFIX mobilite: <{MOBILITE}>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?statistique ?valeur ?unite WHERE {{
            ?statistique a/rdfs:subClassOf* mobilite:StatistiquesPollution .
            OPTIONAL {{ ?statistique mobilite:valeur ?valeur . }}
            OPTIONAL {{ ?statistique mobilite:unite ?unite . }}
        }}
        """
    
    elif "trajet" in question_lower:
        return f"""
        PREFIX mobilite: <{MOBILITE}>
        SELECT ?trajet ?distance ?duree ?personne WHERE {{
            ?trajet a mobilite:Trajet .
            OPTIONAL {{ ?trajet mobilite:distance ?distance . }}
            OPTIONAL {{ ?trajet mobilite:duree ?duree . }}
            OPTIONAL {{ ?personne mobilite:effectueTrajet ?trajet . }}
        }} LIMIT 10
        """
    
    else:
        # Requête générique de secours
        return f"""
        PREFIX mobilite: <{MOBILITE}>
        SELECT ?s ?p ?o WHERE {{
            ?s ?p ?o .
        }} LIMIT 10
        """
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
    g.serialize("mobilite_updated.rdf", format="xml")

    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    INSERT DATA {{
        mobilite:{vehicule.id} a mobilite:{type_clean} ;
                       mobilite:marque "{vehicule.marque}"^^xsd:string ;
                       mobilite:modele "{vehicule.modele}"^^xsd:string ;
                       mobilite:immatriculation "{vehicule.immatriculation}"^^xsd:string .
    }}
    """
    send_to_fuseki(insert_query)

    return {"message": f"🚗 Véhicule de type '{type_clean}' ajouté : '{vehicule.marque} {vehicule.modele}'."}

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

@app.post("/add_ticket/")
def add_ticket(ticket: Ticket):
    type_clean = ticket.type_ticket.capitalize()
    valid_types = ["TicketBus", "TicketMetro", "TicketParking"]

    if type_clean not in valid_types:
        return {"error": f"❌ Type '{ticket.type_ticket}' invalide. Doit être un de {valid_types}"}

    ticket_uri = MOBILITE[ticket.id]
    g.add((ticket_uri, RDF.type, MOBILITE[type_clean]))
    g.add((ticket_uri, MOBILITE.prix, Literal(ticket.prix, datatype=XSD.float)))
    g.add((ticket_uri, MOBILITE.statutTicket, Literal(ticket.statutTicket, datatype=XSD.string)))
    g.serialize("mobilite_updated.rdf", format="xml")

    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    INSERT DATA {{
        mobilite:{ticket.id} a mobilite:{type_clean} ;
                     mobilite:prix "{ticket.prix}"^^xsd:float ;
                     mobilite:statutTicket "{ticket.statutTicket}"^^xsd:string .
    }}
    """
    send_to_fuseki(insert_query)
    return {"message": f"🎫 Ticket '{ticket.id}' ajouté (type: {type_clean})."}

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

    infra_uri = MOBILITE[infra.id]
    g.add((infra_uri, RDF.type, MOBILITE[type_clean]))
    g.add((infra_uri, MOBILITE.adresse, Literal(infra.adresse, datatype=XSD.string)))
    if infra.nom:
        g.add((infra_uri, MOBILITE.nom, Literal(infra.nom, datatype=XSD.string)))
    g.serialize("mobilite_updated.rdf", format="xml")

    nom_part = f' ; mobilite:nom "{infra.nom}"^^xsd:string' if infra.nom else ""
    
    insert_query = f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    INSERT DATA {{
        mobilite:{infra.id} a mobilite:{type_clean} ;
                     mobilite:adresse "{infra.adresse}"^^xsd:string{nom_part} .
    }}
    """
    send_to_fuseki(insert_query)
    return {"message": f"🏗️ Infrastructure '{infra.id}' ajoutée (type: {type_clean})."}

# ======================
# ⚡ STATIONS RECHARGE - ENDPOINTS
# ======================

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
# 📊 STATISTIQUES - ENDPOINTS MANQUANTS
# ======================

@app.post("/add_statistique_pollution/")
def add_statistique_pollution(data: dict):
    """Endpoint pour ajouter une statistique de pollution"""
    try:
        statistique = Statistique(
            id=data.get("id", ""),
            type_statistique="StatistiquesPollution",
            valeur=float(data.get("tauxPollution", 0)),
            unite="µg/m³"
        )
        return add_statistique(statistique)
    except Exception as e:
        return {"error": f"Erreur lors de l'ajout de la statistique pollution: {str(e)}"}

@app.post("/add_statistique_accident/")
def add_statistique_accident(data: dict):
    """Endpoint pour ajouter une statistique d'accident"""
    try:
        statistique = Statistique(
            id=data.get("id", ""),
            type_statistique="StatistiquesAccidents", 
            valeur=float(data.get("nbreDaccident", 0)),
            unite="accidents"
        )
        return add_statistique(statistique)
    except Exception as e:
        return {"error": f"Erreur lors de l'ajout de la statistique accident: {str(e)}"}

@app.post("/add_observation/")
def add_observation(data: dict):
    """Endpoint pour ajouter une observation"""
    try:
        # Créer d'abord une relation entre utilisateur et statistique
        # Pour l'instant, on va simplement créer une nouvelle statistique d'observation
        observation_id = f"obs_{data.get('utilisateur_id')}_{data.get('statistique_id')}"
        
        statistique = Statistique(
            id=observation_id,
            type_statistique="StatistiquesUtilisation",
            valeur=1.0,  # Valeur par défaut pour une observation
            unite="observations"
        )
        
        result = add_statistique(statistique)
        
        # Associer l'utilisateur à cette statistique
        if data.get("utilisateur_id"):
            # Utiliser une propriété existante ou créer une nouvelle relation
            # Pour l'instant, on utilise la relation existante
            pass
            
        return {"message": f"✅ Observation ajoutée avec succès: {observation_id}"}
    except Exception as e:
        return {"error": f"Erreur lors de l'ajout de l'observation: {str(e)}"}

# Endpoint pour les observations (alias de statistiques avec filtre)
@app.get("/observations/")
def get_observations():
    """Récupère les observations (statistiques d'utilisation)"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?stat ?type ?valeur ?unite ?utilisateur WHERE {{
        ?stat a mobilite:StatistiquesUtilisation ;
              mobilite:valeur ?valeur ;
              mobilite:unite ?unite .
        OPTIONAL {{
            ?utilisateur ?relation ?stat .
            FILTER(STRSTARTS(STR(?relation), STR(mobilite:)))
        }}
    }}
    """)
    results = sparql.query().convert()

    observations = []
    for r in results["results"]["bindings"]:
        stat_uri = r["stat"]["value"]
        utilisateur_uri = r.get("utilisateur", {}).get("value", "")
        
        observations.append({
            "id": stat_uri.split("#")[-1],
            "utilisateur": utilisateur_uri.split("#")[-1] if utilisateur_uri else "Utilisateur inconnu",
            "statistique": stat_uri.split("#")[-1],
            "valeur": float(r["valeur"]["value"]) if "valeur" in r else 0,
            "unite": r.get("unite", {}).get("value", "")
        })

    return observations
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
# 🔍 ENDPOINT DE RECHERCHE GÉNÉRALE
# ======================

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
# 🏠 ENDPOINT RACINE
# ======================

@app.get("/")
def home():
    return {"message": "🚀 Bienvenue dans l'API SmartCity Mobility RDF + Fuseki + Ollama"}
# ======================
# 🆕 ENDPOINTS MANQUANTS POUR LE FRONTEND
# ======================

# Endpoint pour les infrastructures (compatible frontend)
@app.get("/infrastructures/")
def get_infrastructures():
    """Récupère toutes les infrastructures"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT DISTINCT ?id ?type ?nom ?adresse WHERE {{
        ?id a ?type ;
            mobilite:nom ?nom .
        OPTIONAL {{ ?id mobilite:adresse ?adresse . }}
        ?type rdfs:subClassOf* mobilite:Infrastructure .
        FILTER(?type != mobilite:Infrastructure)
    }}
    """)
    results = sparql.query().convert()

    infrastructures = []
    seen = set()

    for r in results["results"]["bindings"]:
        iid = r["id"]["value"]
        if iid not in seen:
            seen.add(iid)
            infrastructures.append({
                "id": iid.split("#")[-1],
                "type": r["type"]["value"].split("#")[-1],
                "nom": r["nom"]["value"],
                "adresse": r.get("adresse", {}).get("value", "")
            })

    return infrastructures

# Endpoint pour les trajets (compatible frontend)
@app.get("/trajets/")
def get_trajets():
    """Récupère tous les trajets"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?trajet ?type ?distance ?duree ?personne WHERE {{
        ?trajet a ?type .
        ?type rdfs:subClassOf* mobilite:Trajet .
        OPTIONAL {{ ?trajet mobilite:distance ?distance . }}
        OPTIONAL {{ ?trajet mobilite:duree ?duree . }}
        OPTIONAL {{ ?personne mobilite:effectueTrajet ?trajet . }}
    }}
    """)
    results = sparql.query().convert()

    trajets = []
    for r in results["results"]["bindings"]:
        trajets.append({
            "id": r["trajet"]["value"].split("#")[-1],
            "type": r["type"]["value"].split("#")[-1],
            "distance": float(r["distance"]["value"]) if "distance" in r else None,
            "duree": float(r["duree"]["value"]) if "duree" in r else None,
            "personne": r["personne"]["value"].split("#")[-1] if "personne" in r else None
        })
    return trajets

# Endpoint pour les avis (compatible frontend)
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

# Endpoint pour les réseaux de transport (alias de vehicules)
@app.get("/reseaux_transport/")
def get_reseaux_transport():
    """Endpoint pour le frontend - alias de get_all_vehicules()"""
    return get_all_vehicules()

# Endpoint pour les événements (alias de trajets)
@app.get("/events/")
def get_events():
    """Endpoint pour le frontend - alias de get_trajets()"""
    return get_trajets()

# Endpoint compatible avec l'ancien nom
@app.get("/get_infrastructures/")
def get_infrastructures_old():
    """Endpoint compatible avec l'ancien nom"""
    return get_infrastructures()

# Endpoint pour les stations de recharge
@app.get("/stations_recharge/")
def get_stations_recharge():
    """Récupère toutes les stations de recharge"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?station ?type ?connecteur ?puissance ?disponible WHERE {{
        ?station a ?type .
        ?type rdfs:subClassOf* mobilite:StationRecharge .
        OPTIONAL {{ ?station mobilite:typeConnecteur ?connecteur . }}
        OPTIONAL {{ ?station mobilite:puissanceMax ?puissance . }}
        OPTIONAL {{ ?station mobilite:disponible ?disponible . }}
    }}
    """)
    results = sparql.query().convert()

    stations = []
    for r in results["results"]["bindings"]:
        stations.append({
            "id": r["station"]["value"].split("#")[-1],
            "type": r["type"]["value"].split("#")[-1],
            "connecteur": r.get("connecteur", {}).get("value", ""),
            "puissance": float(r["puissance"]["value"]) if "puissance" in r else None,
            "disponible": r.get("disponible", {}).get("value", "true") == "true"
        })
    return stations

# Endpoint pour les tickets
@app.get("/tickets/")
def get_tickets():
    """Récupère tous les tickets"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?ticket ?type ?prix ?statut ?utilisateur WHERE {{
        ?ticket a ?type .
        ?type rdfs:subClassOf* mobilite:Ticket .
        OPTIONAL {{ ?ticket mobilite:prix ?prix . }}
        OPTIONAL {{ ?ticket mobilite:statutTicket ?statut . }}
        OPTIONAL {{ ?utilisateur mobilite:possedeTicket ?ticket . }}
    }}
    """)
    results = sparql.query().convert()

    tickets = []
    for r in results["results"]["bindings"]:
        tickets.append({
            "id": r["ticket"]["value"].split("#")[-1],
            "type": r["type"]["value"].split("#")[-1],
            "prix": float(r["prix"]["value"]) if "prix" in r else None,
            "statut": r.get("statut", {}).get("value", ""),
            "utilisateur": r["utilisateur"]["value"].split("#")[-1] if "utilisateur" in r else None
        })
    return tickets

# Endpoint pour les smart cities
@app.get("/smartcities/")
def get_smartcities():
    """Récupère toutes les smart cities"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    SELECT ?city ?nom WHERE {{
        ?city a mobilite:SmartCity ;
              mobilite:nom ?nom .
    }}
    """)
    results = sparql.query().convert()

    return [
        {
            "id": r["city"]["value"].split("#")[-1],
            "nom": r["nom"]["value"]
        }
        for r in results["results"]["bindings"]
    ]

# Endpoint pour les statistiques détaillées
@app.get("/statistiques/")
def get_statistiques():
    """Récupère les statistiques détaillées"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?stat ?type ?valeur ?unite WHERE {{
        ?stat a ?type .
        ?type rdfs:subClassOf* mobilite:Statistiques .
        OPTIONAL {{ ?stat mobilite:valeur ?valeur . }}
        OPTIONAL {{ ?stat mobilite:unite ?unite . }}
    }}
    """)
    results = sparql.query().convert()

    statistiques = []
    for r in results["results"]["bindings"]:
        statistiques.append({
            "id": r["stat"]["value"].split("#")[-1],
            "type": r["type"]["value"].split("#")[-1],
            "valeur": float(r["valeur"]["value"]) if "valeur" in r else None,
            "unite": r.get("unite", {}).get("value", "")
        })
    return statistiques

# Endpoint pour les observations (alias de avis)
@app.get("/observations/")
def get_observations():
    """Endpoint pour le frontend - alias de get_avis()"""
    return get_avis()

# Endpoint pour les relations de recharge
@app.get("/reseaux/seRecharge")
def get_relations_recharge():
    """Récupère les relations de recharge"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    SELECT ?reseau ?station WHERE {{
        ?reseau mobilite:utiliseStationRecharge ?station .
    }}
    """)
    results = sparql.query().convert()

    relations = []
    for r in results["results"]["bindings"]:
        relations.append({
            "reseau": r["reseau"]["value"].split("#")[-1],
            "station": r["station"]["value"].split("#")[-1]
        })
    return relations

# Endpoint pour les trajets par utilisateur
@app.get("/utilisateurs/trajets/")
def get_trajets_utilisateurs():
    """Récupère les trajets par utilisateur"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    SELECT ?utilisateur ?trajet ?typeTrajet ?distance ?duree WHERE {{
        ?utilisateur mobilite:effectueTrajet ?trajet .
        ?trajet a ?typeTrajet .
        OPTIONAL {{ ?trajet mobilite:distance ?distance . }}
        OPTIONAL {{ ?trajet mobilite:duree ?duree . }}
    }}
    """)
    results = sparql.query().convert()

    trajets_utilisateurs = []
    for r in results["results"]["bindings"]:
        trajets_utilisateurs.append({
            "utilisateur": r["utilisateur"]["value"].split("#")[-1],
            "trajet": r["trajet"]["value"].split("#")[-1],
            "typeTrajet": r["typeTrajet"]["value"].split("#")[-1],
            "distance": float(r["distance"]["value"]) if "distance" in r else None,
            "duree": float(r["duree"]["value"]) if "duree" in r else None
        })
    return trajets_utilisateurs
# ======================
# 📝 AVIS - ENDPOINTS GET
# ======================

@app.get("/avis/")
def get_avis():
    """Récupère tous les avis avec leurs détails complets"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?avis ?type ?commentaire ?note ?utilisateur ?nom_utilisateur WHERE {{
        ?avis a ?type .
        ?type rdfs:subClassOf* mobilite:Avis .
        OPTIONAL {{ ?avis mobilite:commentaire ?commentaire . }}
        OPTIONAL {{ ?avis mobilite:note ?note . }}
        OPTIONAL {{ 
            ?utilisateur mobilite:donneAvis ?avis .
            OPTIONAL {{ ?utilisateur mobilite:nom ?nom_utilisateur . }}
        }}
    }}
    ORDER BY DESC(?note)
    """)
    results = sparql.query().convert()

    avis_list = []
    seen = set()

    for r in results["results"]["bindings"]:
        avis_uri = r["avis"]["value"]
        if avis_uri not in seen:
            seen.add(avis_uri)
            
            # Déterminer le type d'avis
            avis_type = r["type"]["value"].split("#")[-1]
            
            # Récupérer l'utilisateur
            utilisateur = None
            if "utilisateur" in r:
                utilisateur_uri = r["utilisateur"]["value"]
                utilisateur = {
                    "id": utilisateur_uri.split("#")[-1],
                    "nom": r.get("nom_utilisateur", {}).get("value", "Utilisateur inconnu")
                }
            
            avis_list.append({
                "id": avis_uri.split("#")[-1],
                "type": avis_type,
                "commentaire": r.get("commentaire", {}).get("value", ""),
                "note": int(r["note"]["value"]) if "note" in r else 0,
                "utilisateur": utilisateur,
                "statut": "Positif" if avis_type == "AvisPositif" else "Négatif" if avis_type == "AvisNegatif" else "Neutre"
            })

    return avis_list

@app.get("/avis/{utilisateur_id}")
def get_avis_par_utilisateur(utilisateur_id: str):
    """Récupère tous les avis d'un utilisateur spécifique"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?avis ?type ?commentaire ?note WHERE {{
        mobilite:{utilisateur_id} mobilite:donneAvis ?avis .
        ?avis a ?type .
        ?type rdfs:subClassOf* mobilite:Avis .
        OPTIONAL {{ ?avis mobilite:commentaire ?commentaire . }}
        OPTIONAL {{ ?avis mobilite:note ?note . }}
    }}
    ORDER BY DESC(?note)
    """)
    results = sparql.query().convert()

    avis_utilisateur = []
    for r in results["results"]["bindings"]:
        avis_type = r["type"]["value"].split("#")[-1]
        avis_utilisateur.append({
            "id": r["avis"]["value"].split("#")[-1],
            "type": avis_type,
            "commentaire": r.get("commentaire", {}).get("value", ""),
            "note": int(r["note"]["value"]) if "note" in r else 0,
            "statut": "Positif" if avis_type == "AvisPositif" else "Négatif" if avis_type == "AvisNegatif" else "Neutre"
        })

    return {
        "utilisateur_id": utilisateur_id,
        "avis": avis_utilisateur,
        "count": len(avis_utilisateur)
    }

@app.get("/avis/statistiques/")
def get_statistiques_avis():
    """Récupère les statistiques des avis"""
    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?type (COUNT(?avis) as ?count) (AVG(?note) as ?moyenne_note) WHERE {{
        ?avis a ?type .
        ?type rdfs:subClassOf* mobilite:Avis .
        OPTIONAL {{ ?avis mobilite:note ?note . }}
    }}
    GROUP BY ?type
    """)
    results = sparql.query().convert()

    stats = {}
    total_avis = 0
    total_notes = 0
    count_notes = 0

    for r in results["results"]["bindings"]:
        avis_type = r["type"]["value"].split("#")[-1]
        count = int(r["count"]["value"])
        moyenne = float(r["moyenne_note"]["value"]) if "moyenne_note" in r and r["moyenne_note"]["value"] != "NaN" else 0
        
        stats[avis_type] = {
            "count": count,
            "moyenne_note": round(moyenne, 2)
        }
        
        total_avis += count
        if moyenne > 0:
            total_notes += moyenne
            count_notes += 1

    # Statistiques globales
    stats["global"] = {
        "total_avis": total_avis,
        "moyenne_generale": round(total_notes / count_notes, 2) if count_notes > 0 else 0,
        "pourcentage_positifs": round((stats.get("AvisPositif", {}).get("count", 0) / total_avis * 100), 2) if total_avis > 0 else 0
    }

    return stats

@app.get("/avis/recherche/")
def rechercher_avis(texte: str = "", note_min: int = None, note_max: int = None, type_avis: str = None):
    """Recherche des avis avec filtres"""
    
    # Construction de la requête SPARQL dynamique
    filters = []
    
    if texte:
        filters.append(f'FILTER(CONTAINS(LCASE(?commentaire), LCASE("{texte}")))')
    
    if note_min is not None:
        filters.append(f'FILTER(?note >= {note_min})')
    
    if note_max is not None:
        filters.append(f'FILTER(?note <= {note_max})')
    
    if type_avis:
        filters.append(f'FILTER(?type = mobilite:{type_avis})')
    
    where_clause = " . ".join([
        "?avis a ?type",
        "?type rdfs:subClassOf* mobilite:Avis",
        "OPTIONAL { ?avis mobilite:commentaire ?commentaire }",
        "OPTIONAL { ?avis mobilite:note ?note }",
        "OPTIONAL { ?utilisateur mobilite:donneAvis ?avis }"
    ])
    
    if filters:
        where_clause += " . " + " . ".join(filters)

    query = f"""
    PREFIX mobilite: <{MOBILITE}>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?avis ?type ?commentaire ?note ?utilisateur WHERE {{
        {where_clause}
    }}
    ORDER BY DESC(?note)
    LIMIT 100
    """

    sparql = SPARQLWrapper(FUSEKI_QUERY_URL)
    sparql.setReturnFormat(JSON)
    sparql.setQuery(query)
    results = sparql.query().convert()

    avis_trouves = []
    for r in results["results"]["bindings"]:
        avis_type = r["type"]["value"].split("#")[-1]
        avis_trouves.append({
            "id": r["avis"]["value"].split("#")[-1],
            "type": avis_type,
            "commentaire": r.get("commentaire", {}).get("value", ""),
            "note": int(r["note"]["value"]) if "note" in r else 0,
            "utilisateur": r["utilisateur"]["value"].split("#")[-1] if "utilisateur" in r else None,
            "statut": "Positif" if avis_type == "AvisPositif" else "Négatif" if avis_type == "AvisNegatif" else "Neutre"
        })

    return {
        "criteres": {
            "texte": texte,
            "note_min": note_min,
            "note_max": note_max,
            "type_avis": type_avis
        },
        "resultats": avis_trouves,
        "count": len(avis_trouves)
    }
# ======================
# 🆕 ENDPOINTS POST MANQUANTS
# ======================

@app.post("/add_reseau_transport/")
def add_reseau_transport(data: dict):
    """Endpoint pour ajouter un réseau de transport (compatible frontend)"""
    try:
        vehicule = Vehicule(
            id=data.get("id", ""),
            type_vehicule=data.get("type_reseau", "Bus"),
            marque=data.get("nom", ""),
            modele=data.get("type_reseau", "Standard"),
            immatriculation=""
        )
        return add_vehicule(vehicule)
    except Exception as e:
        return {"error": f"Erreur lors de l'ajout du réseau: {str(e)}"}

@app.post("/add_event/")
def add_event(data: dict):
    """Endpoint pour ajouter un événement (compatible frontend)"""
    try:
        trajet = Trajet(
            id=data.get("id", ""),
            distance=0.0,
            duree=0.0,
            heureDepart="",
            heureArrivee=""
        )
        return add_trajet(trajet)
    except Exception as e:
        return {"error": f"Erreur lors de l'ajout de l'événement: {str(e)}"}
# ======================
# 🚀 LANCEMENT DE L'APPLICATION
# ======================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)