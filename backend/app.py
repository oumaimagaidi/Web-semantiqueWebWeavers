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

# ======================
# 🔧 CONFIGURATION
# ======================
load_dotenv()

# Configuration Ollama
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3:8b"

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
# 🧠 INTELLIGENCE ARTIFICIELLE AVEC OLLAMA
# ======================

def generate_sparql_with_ollama(user_question: str) -> str:
    """
    Génère une requête SPARQL en utilisant Ollama
    """
    prompt = f"""
Tu es un expert en RDF et SPARQL. Ta mission est de convertir des questions en français en requêtes SPARQL valides.

CONTEXTE ONTOLOGIE MOBILITÉ :
- Namespace : PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#>
- Classes principales : 
  Personne, Conducteur, Piéton, Voyageur
  ReseauTransport, TransportPublic, TransportPrive, MobiliteDouce
  Bus, Metro, Voiture, Velo, Trottinette
  Infrastructure, Route, StationsBus, StationsMetro, Parking, Batiment
  Trajet, TrajetOptimal, TrajetCourt, TrajetRecommandé
  Avis, AvisPositif, AvisNegatif
  Ticket, TicketBus, TicketMetro, TicketParking
  StationRecharge, RechargeElectrique, RechargeGaz
  Trafic, Accident, Embouteillage, Radar
  Statistiques, StatistiquesAccidents, StatistiquesPollution, StatistiquesUtilisation
  SmartCity

- Propriétés de données :
  nom, prenom, age, email, telephone, dateNaissance, genre, nationalite, languePreferee
  dateInscription, statutCompte, niveauAbonnement, scoreFidelite, preferencesAccessibilite
  numeroPermis, dateObtentionPermis, categoriePermis, pointsPermis, experienceConduite
  distance, duree, scoreOptimisation, niveauTrafic, heureDepart, heureArrivee
  vitesseMoyenne, consommationEnergie, emissionsCO2, nombreArrets, conditionsMeteo
  temperature, scoreSecurite, scoreConfort
  marque, modele, anneeFabrication, immatriculation, couleur, kilometrage
  niveauCarburant, consommationMoyenne
  commentaire, note, dateAvis, langueAvis, categorieAvis, scoreUtilite, verifie, nombreSignalements
  numeroTicket, prix, dateAchat, dateExpiration, typeTicket, classeTicket, zoneValidite
  statutTicket, methodePaiement, nombreValidations
  adresse, coordonneesGPS, dateConstruction, etatMaintenance, capaciteAccueil
  niveauAccessibilite, horairesOuverture, superficie
  capacite, prixKwh, disponible, typeConnecteur, puissanceMax, tempsRechargeMoyen
  heureOuverture, heureFermeture, operateur
  intensite, dureeIncident, causeIncident, gravite, nombreVehiculesImpliques
  vitesseMoyenneTrafic, niveauService
  vitesseMaximale, typeRadar, dateInstallation, etatFonctionnement, nombreInfractions
  valeur, dateMesure, unite, periodeMesure, margeErreur, niveauConfiance, tendance, sourceDonnees

- Propriétés objet :
  effectueTrajet, utiliseReseauTransport, donneAvis, possedeTicket, habiteA, travailleA
  prefereMoyenTransport, frequenteZone, commenceA, terminaA, utiliseMoyenTransport
  proposePar, appartientA, circuleSur, conduitPar, utiliseStationRecharge
  concerneTransport, concerneInfrastructure, valablePour, acheteA, donneAccesA
  estConnecteA, disposeDe, accueilleStation, contient, estSurveillePar, alimentePar
  maintenuPar, seProduitSur, affecteTrajet, genereAlerte, mesureSur, generePar

QUESTION À TRADUIRE : "{user_question}"

INSTRUCTIONS STRICTES :
1. Génère UNIQUEMENT la requête SPARQL complète et valide
2. Pas de texte explicatif, pas de commentaires, pas de notes
3. Pas de "SPARQL:" ou autres préfixes textuels
4. Pas de backticks Markdown
5. Utilise obligatoirement le préfixe mobilite:
6. Pour les hiérarchies, utilise rdfs:subClassOf*
7. Sois précis dans les relations

EXEMPLE :
Question: "Liste toutes les personnes"
Réponse: PREFIX mobilite: <http://www.semanticweb.org/smartcity/ontologies/mobilite#> SELECT ?personne WHERE {{ ?personne a mobilite:Personne . }}
    """

    try:
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
            timeout=120
        )
        response.raise_for_status()
        
        result = response.json()
        sparql_query = result["response"].strip()
        
        print(f"📝 Réponse brute d'Ollama:\n{sparql_query}")
        
        cleaned_query = clean_sparql_query(sparql_query)
        print(f"🧹 Requête nettoyée:\n{cleaned_query}")
        
        return cleaned_query
        
    except requests.exceptions.ConnectionError:
        raise Exception("❌ Ollama n'est pas démarré. Lancez 'ollama serve'")
    except Exception as e:
        raise Exception(f"❌ Erreur Ollama : {str(e)}")

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

        # 2. Validation de la requête
        if not validate_sparql_query(sparql_query):
            raise HTTPException(status_code=400, detail="La requête SPARQL générée n'est pas valide")

        # 3. Exécution de la requête sur Fuseki
        print("🚀 Exécution de la requête sur Fuseki...")
        results = execute_sparql_query(sparql_query)
        
        if results is None:
            raise HTTPException(status_code=500, detail="Erreur lors de l'exécution de la requête SPARQL")

        # 4. Formatage des résultats
        formatted_results = format_sparql_results(results)
        
        return {
            "question": user_question,
            "sparql_query": sparql_query,
            "results": formatted_results,
            "count": len(formatted_results)
        }

    except HTTPException:
        raise
    except Exception as e:
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
        return False
    
    # Vérifier les mots-clés SPARQL essentiels
    essential_keywords = ['SELECT', 'ASK', 'CONSTRUCT', 'DESCRIBE']
    if not any(keyword in query.upper() for keyword in essential_keywords):
        return False
    
    # Vérifier la présence des accolades
    if '{' not in query or '}' not in query:
        return False
    
    return True

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

# ======================
# 🚀 LANCEMENT DE L'APPLICATION
# ======================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)