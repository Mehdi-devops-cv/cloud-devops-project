#!/bin/bash

# Script complet pour build iOS avec auto-increment et submit
# Utilisation: ./scripts/build-and-submit.sh

set -e

APP_DIR="/Users/mehdiakounad/Desktop/ApplicationBTP/AppBTP"

echo "Build et soumission iOS automatique"
echo "========================================"

# 1. Incrémenter le build number
echo ""
echo "Étape 1/3: Incrémentation du build number"
bash "$APP_DIR/scripts/increment-build.sh"

# 2. Lancer le build
echo ""
echo "Étape 2/3: Lancement du build iOS"
cd "$APP_DIR"
eas build --platform ios --profile production --non-interactive

# 3. Soumettre à App Store Connect
echo ""
echo "Étape 3/3: Soumission à App Store Connect"
eas submit --platform ios --latest

echo ""
echo "Build et soumission termines!"
