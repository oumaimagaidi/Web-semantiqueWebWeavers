# utils/sparql_helper.py
import re
from config.queries import QUERY_PATTERNS, QUESTION_MAPPING, KNOWN_USERS

class SPARQLGenerator:
    def __init__(self):
        self.known_users = KNOWN_USERS
    
    def extract_user_name(self, question):
        """Extrait le nom d'utilisateur de la question"""
        question_lower = question.lower()
        for user in self.known_users:
            if user.lower() in question_lower:
                return user
        return None
    
    def detect_query_type(self, question):
        """Détecte le type de requête de manière discrète"""
        question_lower = question.lower()
        
        for keyword, query_type in QUESTION_MAPPING.items():
            if keyword in question_lower:
                return query_type
        return None
    
    def generate_sparql(self, question):
        """Génère la requête SPARQL appropriée"""
        user = self.extract_user_name(question)
        query_type = self.detect_query_type(question)
        
        if query_type and user:
            # Utiliser le template prédéfini avec utilisateur
            template = QUERY_PATTERNS[query_type]
            # Échapper les accolades pour éviter les KeyError
            safe_template = template.replace('{', '{{').replace('}', '}}')
            # Remplacer uniquement {user}
            safe_template = safe_template.replace('{{user}}', '{user}')
            sparql_query = safe_template.format(user=user)
            return sparql_query, "template"
        elif query_type and query_type in ["student_tickets_list", "all_trajets", "all_avis", 
                                         "infrastructure_details", "transports_details", 
                                         "statistiques_accidents", "incidents_trafic", 
                                         "radars_details", "stations_recharge"]:
            # Requête sans utilisateur spécifique
            return QUERY_PATTERNS[query_type], "template"
        else:
            # Fallback vers l'IA
            return None, "ia"
    
    def is_predefined_query(self, question):
        """Vérifie si la question correspond à un template prédéfini"""
        user = self.extract_user_name(question)
        query_type = self.detect_query_type(question)
        
        # Vérifier si on a un type de requête valide
        if query_type is None:
            return False
            
        # Vérifier si la requête nécessite un utilisateur et si on l'a trouvé
        if query_type in ["user_travel", "user_profile", "user_tickets", "user_reviews"]:
            return user is not None
        else:
            # Pour les requêtes générales, pas besoin d'utilisateur
            return True
    
    def get_suggested_questions(self):
        """Retourne des questions suggérées pour l'interface"""
        return [
            "Quel est le trajet de Wala?",
            "Qui est Oumaima?",
            "Liste les tickets étudiants",
            "Quels sont les avis de Wala?",
            "Affiche tous les trajets",
            "Donne les détails des infrastructures",
            "Montre les statistiques d'accidents",
            "Liste les incidents de trafic",
            "Affiche les stations de recharge"
        ]