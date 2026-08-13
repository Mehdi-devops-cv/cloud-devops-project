import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import useNavigationCustom from '../Controleur/useNavigationCustom';

export default function Footer() {

    const {navigateTo}= useNavigationCustom();
  return (
    <View style={styles.overlay}>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnFooter} onPress={() => { navigateTo('HomePage') }} >
          <MaterialIcons name="home" color="#414248" size={35} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnFooter} onPress={() => { navigateTo('Profile') }}>
          <MaterialIcons name="account-circle" color="#414248" size={35} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Modification pour centrer les éléments horizontalement
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',  // Réduction de la largeur pour laisser de l'espace sur les côtés
  },
  btnFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,  // Ajout de padding horizontal pour espacer les boutons
  },
});
