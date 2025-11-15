#!/bin/bash

# Script pour générer automatiquement les 3 pages restantes
# en utilisant CitiesList.tsx comme template

echo "🚀 Génération automatique des pages refactorisées..."
echo ""

# Fonction pour créer ContactsList
generate_contacts() {
    echo "📝 Génération de ContactsList.tsx..."
    
    # Copier la base
    cp src/pages/cities/CitiesList.tsx src/pages/contacts/ContactsList.tsx.tmp
    
    # Remplacements globaux
    sed -i '' 's/City/Contact/g' src/pages/contacts/ContactsList.tsx.tmp
    sed -i '' 's/city/contact/g' src/pages/contacts/ContactsList.tsx.tmp
    sed -i '' 's/cities/contacts/g' src/pages/contacts/ContactsList.tsx.tmp
    sed -i '' "s/'..\/..\/api\/contacts'/'..\/..\/api\/contacts'/g" src/pages/contacts/ContactsList.tsx.tmp
    
    # Adapter les imports (déjà faits par les remplacements globaux)
    
    # Adapter le payload du updateContact
    sed -i '' 's/nameTranslations: contact.nameTranslations,/nameTranslations: contact.nameTranslations,\n        link: contact.link,\n        icon: contact.icon,/g' src/pages/contacts/ContactsList.tsx.tmp
    
    # Remplacer "Management" par le bon titre
    sed -i '' 's/Contacts Management/Contacts Management/g' src/pages/contacts/ContactsList.tsx.tmp
    
    # Sauvegarder
    mv src/pages/contacts/ContactsList.tsx.tmp src/pages/contacts/ContactsList.tsx
    
    echo "✅ ContactsList.tsx généré"
}

# Fonction pour créer TouristSpotsList
generate_tourist_spots() {
    echo "📝 Génération de TouristSpotsList.tsx..."
    
    # Copier la base
    cp src/pages/cities/CitiesList.tsx src/pages/tourist-spots/TouristSpotsList.tsx.tmp
    
    # Remplacements globaux
    sed -i '' 's/City/TouristSpot/g' src/pages/tourist-spots/TouristSpotsList.tsx.tmp
    sed -i '' 's/city/spot/g' src/pages/tourist-spots/TouristSpotsList.tsx.tmp
    sed -i '' 's/cities/spots/g' src/pages/tourist-spots/TouristSpotsList.tsx.tmp
    sed -i '' 's/spot\.id/spot.id/g' src/pages/tourist-spots/TouristSpotsList.tsx.tmp
    sed -i '' "s/'..\/..\/api\/spots'/'..\/..\/api\/touristSpots'/g" src/pages/tourist-spots/TouristSpotsList.tsx.tmp
    sed -i '' "s/getAdminspots/getAdminTouristSpots/g" src/pages/tourist-spots/TouristSpotsList.tsx.tmp
    sed -i '' "s/deletespot/deleteTouristSpot/g" src/pages/tourist-spots/TouristSpotsList.tsx.tmp
    sed -i '' "s/updatespot/updateTouristSpot/g" src/pages/tourist-spots/TouristSpotsList.tsx.tmp
    
    # Adapter le payload du updateTouristSpot
    sed -i '' 's/nameTranslations: spot.nameTranslations,/nameTranslations: spot.nameTranslations,\n        spotId: spot.spotId,/g' src/pages/tourist-spots/TouristSpotsList.tsx.tmp
    
    # Remplacer les URL
    sed -i '' "s/\/spots\//\/tourist-spots\//g" src/pages/tourist-spots/TouristSpotsList.tsx.tmp
    
    # Sauvegarder
    mv src/pages/tourist-spots/TouristSpotsList.tsx.tmp src/pages/tourist-spots/TouristSpotsList.tsx
    
    echo "✅ TouristSpotsList.tsx généré"
}

# Fonction pour créer LanguagesList
generate_languages() {
    echo "📝 Génération de LanguagesList.tsx..."
    
    # Copier la base
    cp src/pages/cities/CitiesList.tsx src/pages/languages/LanguagesList.tsx.tmp
    
    # Remplacements globaux
    sed -i '' 's/City/SupportedLanguage/g' src/pages/languages/LanguagesList.tsx.tmp
    sed -i '' 's/city/language/g' src/pages/languages/LanguagesList.tsx.tmp
    sed -i '' 's/cities/languages/g' src/pages/languages/LanguagesList.tsx.tmp
    sed -i '' "s/'..\/..\/api\/languages'/'..\/..\/api\/languages'/g" src/pages/languages/LanguagesList.tsx.tmp
    sed -i '' "s/getAdminlanguages/getSupportedLanguages/g" src/pages/languages/LanguagesList.tsx.tmp
    sed -i '' "s/deletelanguage/deleteSupportedLanguage/g" src/pages/languages/LanguagesList.tsx.tmp
    sed -i '' "s/updatelanguage/updateSupportedLanguage/g" src/pages/languages/LanguagesList.tsx.tmp
    
    # Adapter le payload du updateSupportedLanguage
    sed -i '' 's/nameTranslations: language.nameTranslations,/code: language.code,\n        name: language.name,/g' src/pages/languages/LanguagesList.tsx.tmp
    
    # Remplacer les URL
    sed -i '' "s/\/languages\//\/languages\//g" src/pages/languages/LanguagesList.tsx.tmp
    
    # Sauvegarder
    mv src/pages/languages/LanguagesList.tsx.tmp src/pages/languages/LanguagesList.tsx
    
    echo "✅ LanguagesList.tsx généré"
}

# Exécuter les générations
generate_contacts
echo ""
generate_tourist_spots
echo ""
generate_languages
echo ""

echo "🎉 Toutes les pages ont été générées !"
echo ""
echo "📋 Fichiers générés :"
echo "  ✅ src/pages/contacts/ContactsList.tsx"
echo "  ✅ src/pages/tourist-spots/TouristSpotsList.tsx"
echo "  ✅ src/pages/languages/LanguagesList.tsx"
echo ""
echo "⚠️  ATTENTION : Ces fichiers ont besoin de quelques ajustements manuels :"
echo "  1. Vérifier les imports API"
echo "  2. Adapter les payloads de update"
echo "  3. Tester dans le navigateur"
echo ""
echo "📖 Consultez QUICK_FINISH_GUIDE.md pour les détails"

