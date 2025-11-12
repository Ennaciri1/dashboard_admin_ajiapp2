#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Dictionary of French to English translations
translations = {
    # Actions
    "Ajouter": "Add",
    "Créer": "Create",
    "Modifier": "Edit",
    "Enregistrer": "Save",
    "Sauvegarder": "Save",
    "Sauvegarde...": "Saving...",
    "Annuler": "Cancel",
    "Supprimer": "Delete",
    "Retour": "Back",
    "Voir": "View",
    "Rechercher": "Search",
    "Filtrer": "Filter",
    "Télécharger": "Upload",
    "Charger": "Load",
    "Chargement...": "Loading...",
    
    # Navigation
    "Retour à la liste": "Back to list",
    "Voir les détails": "View details",
    "Détails": "Details",
    
    # Fields
    "Nom": "Name",
    "Description": "Description",
    "Adresse": "Address",
    "Ville": "City",
    "Actif": "Active",
    "Active": "Active",
    "Inactif": "Inactive",
    "Statut": "Status",
    "Date": "Date",
    "Type": "Type",
    "Code": "Code",
    "Langue": "Language",
    "Langues": "Languages",
    "Prix": "Price",
    "Note": "Rating",
    "Étoiles": "Stars",
    "Images": "Images",
    "Localisation": "Location",
    "Latitude": "Latitude",
    "Longitude": "Longitude",
    "Horaires": "Hours",
    "Ouverture": "Opening",
    "Fermeture": "Closing",
    
    # Messages
    "Erreur": "Error",
    "Succès": "Success",
    "Avertissement": "Warning",
    "Information": "Information",
    "Êtes-vous sûr": "Are you sure",
    "Voulez-vous vraiment": "Do you really want to",
    "Aucun": "None",
    "Aucune": "No",
    "Tous": "All",
    "Toutes": "All",
    
    # Status
    "En attente": "Pending",
    "Approuvé": "Approved",
    "Approuvée": "Approved",
    "Approuvés": "Approved",
    "Rejeté": "Rejected",
    "Rejetés": "Rejected",
    "Rejetée": "Rejected",
    
    # Common phrases
    "Nouvelle ville": "New City",
    "Nouvel hôtel": "New Hotel",
    "Nouveau contact": "New Contact",
    "Nouvelle langue": "New Language",
    "au moins une": "at least one",
    "est requise": "is required",
    "est requis": "is required",
    "sont requises": "are required",
    "sont requis": "are required",
    "Échec": "Failed",
    "Réussi": "Success",
    
    # Page titles
    "Gestion des traductions": "Translation Management",
    "Gestion des avis": "Review Management",
    "Tableau de bord": "Dashboard",
}

def translate_file(file_path):
    """Translate French text in a file to English"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Sort by length (longest first) to avoid partial replacements
        sorted_trans = sorted(translations.items(), key=lambda x: len(x[0]), reverse=True)
        
        for french, english in sorted_trans:
            # Match whole words/phrases, case-sensitive
            content = re.sub(r'\b' + re.escape(french) + r'\b', english, content)
        
        if content != original:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Translated: {file_path}")
            return True
        return False
    except Exception as e:
        print(f"❌ Error in {file_path}: {e}")
        return False

# Find all TSX files in src/pages
src_dir = Path("src/pages")
tsx_files = list(src_dir.glob("*.tsx"))

print(f"Found {len(tsx_files)} TSX files to translate\n")

translated_count = 0
for file_path in tsx_files:
    if translate_file(file_path):
        translated_count += 1

print(f"\n✅ Translated {translated_count}/{len(tsx_files)} files")
