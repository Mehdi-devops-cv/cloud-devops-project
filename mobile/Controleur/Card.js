import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function Card({ title }) {
  return (
    <View style={styles.card}>
    </View> 
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#90a0ca',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 1,
    marginBottom: 16,
  },
  cardIcon: {
    marginRight: 16,
  },
  cardText: {
    fontSize: 25,
    color: '#414248',
    fontFamily: 'Quicksand-bold',
  },
});
