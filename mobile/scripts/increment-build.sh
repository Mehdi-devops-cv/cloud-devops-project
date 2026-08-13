#!/bin/bash

# Script pour incrémenter automatiquement le build number iOS
# Utilisation: ./scripts/increment-build.sh

set -e

APP_DIR="/Users/mehdiakounad/Desktop/ApplicationBTP/AppBTP"
INFO_PLIST="$APP_DIR/ios/AppBTP/Info.plist"
APP_JSON="$APP_DIR/app.json"

echo "Incrementation du build number..."

# Lire le build number actuel depuis Info.plist
CURRENT_BUILD=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$INFO_PLIST")
echo "Build actuel: $CURRENT_BUILD"

# Incrémenter
NEW_BUILD=$((CURRENT_BUILD + 1))
echo "Nouveau build: $NEW_BUILD"

# Mettre à jour Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $NEW_BUILD" "$INFO_PLIST"
echo "Info.plist mis a jour"

# Mettre à jour app.json
sed -i '' "s/\"buildNumber\": \"$CURRENT_BUILD\"/\"buildNumber\": \"$NEW_BUILD\"/" "$APP_JSON"
echo "app.json mis a jour"

# Git add et commit
cd "$APP_DIR"
git add ios/AppBTP/Info.plist app.json
git commit -m "Increment build number to $NEW_BUILD"

echo "Changements commites"
echo ""
echo "Build number incremente a $NEW_BUILD"
echo "Prêt pour: eas build --platform ios --profile production --non-interactive"
