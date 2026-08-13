import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenWrapper from '../Controleur/ScreenWrapper';
import Header from './Header';

export default function PrivacyPolicy({ navigation }) {
  const handleContact = async () => {
    const email = 'kijiramer@icloud.com';
    const subject = encodeURIComponent('Question sur la politique de confidentialité');
    const url = `mailto:${email}?subject=${subject}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  };

  return (
    <ScreenWrapper>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Politique de confidentialité</Text>
          <Text style={styles.updated}>Dernière mise à jour: 13 août 2025</Text>

          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Cette politique de confidentialité explique comment nous collectons, utilisons, conservons et protégeons vos
            données personnelles lorsque vous utilisez l’application. En utilisant l’application, vous acceptez les termes
            de cette politique.
          </Text>

          <Text style={styles.sectionTitle}>2. Données que nous collectons</Text>
          <Text style={styles.paragraph}>
            Nous pouvons collecter les catégories de données suivantes:
          </Text>
          <Text style={styles.listItem}>• Informations de compte: nom, adresse e-mail, mot de passe (haché).</Text>
          <Text style={styles.listItem}>• Données d’utilisation: actions réalisées dans l’application (ex: notes, effectifs saisis).</Text>
          <Text style={styles.listItem}>• Données techniques: identifiant d’appareil, version de l’app, journaux d’erreurs.</Text>

          <Text style={styles.sectionTitle}>3. Finalités et bases légales</Text>
          <Text style={styles.paragraph}>Nous utilisons vos données pour:</Text>
          <Text style={styles.listItem}>• Fournir les fonctionnalités de l’application et gérer votre compte.</Text>
          <Text style={styles.listItem}>• Assurer la sécurité, prévenir la fraude et résoudre les incidents.</Text>
          <Text style={styles.listItem}>• Améliorer l’application et l’expérience utilisateur.</Text>
          <Text style={styles.paragraph}>
            Bases légales: exécution du contrat (utilisation de l’app), intérêt légitime (sécurité et amélioration) et
            consentement lorsque requis.
          </Text>

          <Text style={styles.sectionTitle}>4. Partage des données</Text>
          <Text style={styles.paragraph}>
            Nous ne vendons pas vos données. Nous pouvons partager des informations avec des prestataires techniques
            nécessaires au fonctionnement de l’application (hébergement, maintenance), soumis à des obligations de
            confidentialité, ou lorsque la loi l’exige.
          </Text>

          <Text style={styles.sectionTitle}>5. Conservation des données</Text>
          <Text style={styles.paragraph}>
            Vos données sont conservées pendant la durée nécessaire aux finalités décrites ci-dessus et conformément aux
            obligations légales applicables. Lorsque vos données ne sont plus nécessaires, elles sont supprimées ou
            anonymisées.
          </Text>

          <Text style={styles.sectionTitle}>6. Sécurité</Text>
          <Text style={styles.paragraph}>
            Nous mettons en place des mesures de sécurité appropriées (contrôles d’accès, chiffrement en transit, pratiques
            de développement sécurisées) pour protéger vos données contre l’accès non autorisé, la divulgation, l’altération
            ou la destruction.
          </Text>

          <Text style={styles.sectionTitle}>7. Vos droits</Text>
          <Text style={styles.paragraph}>
            Selon la réglementation applicable (ex: RGPD), vous disposez de droits d’accès, de rectification, d’effacement,
            de limitation, d’opposition et de portabilité sur vos données. Vous pouvez également retirer votre consentement
            à tout moment lorsque celui-ci constitue la base du traitement.
          </Text>

          <Text style={styles.sectionTitle}>8. Contact</Text>
          <Text style={styles.paragraph}>
            Pour toute question ou demande relative à vos données, contactez-nous à l’adresse suivante:
            {' '}<Text style={styles.link}>kijiramer@icloud.com</Text>.
          </Text>
          <TouchableOpacity style={styles.contactBtn} onPress={handleContact}>
            <Text style={styles.contactBtnText}>Nous contacter</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>9. Modifications</Text>
          <Text style={styles.paragraph}>
            Nous pouvons mettre à jour cette politique pour refléter des changements légaux, techniques ou liés aux
            fonctionnalités. La version la plus récente est toujours disponible dans l’application. Nous vous informerons en
            cas de modification importante.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24 },
  content: { paddingBottom: 40, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#1c1c1c', marginBottom: 6 },
  updated: { fontSize: 12, color: '#888', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 14, marginBottom: 8 },
  paragraph: { fontSize: 14, color: '#444', lineHeight: 20 },
  listItem: { fontSize: 14, color: '#444', lineHeight: 20, marginLeft: 8, marginBottom: 4 },
  link: { color: '#007afe' },
  contactBtn: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#007afe', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  contactBtnText: { color: '#fff', fontWeight: '600' },
});
