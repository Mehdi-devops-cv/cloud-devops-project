// ScreenWrapper.js - Simple wrapper sans logique de layout
// La gestion du Header/Footer se fait directement dans chaque écran
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function ScreenWrapper({ children }) {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
