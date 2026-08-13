import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenWrapper from '../Controleur/ScreenWrapper';
import { MaterialIcons as MaterialIcon } from '@expo/vector-icons';
import { TabContext } from '../Controleur/TabContext';
import axios from 'axios'; // Import axios for API calls
import { API_BASE_URL } from '../config';

const Card = ({ name, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <MaterialIcon name="home-work" size={40} color="#414248" />
    <Text style={styles.cardText}>{name}</Text>
  </TouchableOpacity>
);

export default function Chantier({ route, navigation }) {
  const { city } = route.params;
  const { setActiveTab } = useContext(TabContext);
  const [buildings, setBuildings] = useState([]); // State to store buildings

  useEffect(() => {
    setActiveTab(city);
  }, [city, setActiveTab]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setActiveTab(city);
    });

    return unsubscribe;
  }, [navigation, city, setActiveTab]);

  // Fetch buildings from API
  useEffect(() => {
  axios.get(`${API_BASE_URL}/buildings`)
      .then(response => {
        // Filtrer les bâtiments pour la ville actuelle
        const buildingsForCity = response.data.filter(b => b.city === city);
        setBuildings(buildingsForCity);
      })
      .catch(error => {
        console.error('Error fetching buildings:', error);
      });
  }, [city]);

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <ScrollView>
            <View style={styles.cardList}>
              {buildings.map((building, index) => (
                <Card 
                  key={index} 
                  name={building.name} 
                  onPress={() => {
                    setActiveTab(building.name);
                    navigation.navigate('Batiment', { city, building: building.name });
                  }}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  cardList: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Enable wrapping
    justifyContent: 'space-between', // Distribute space between the cards
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  card: {
    width: '48%', // Adjust width to fit two cards per row
    marginBottom: 20, // Add some space between rows
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardText: {
    fontSize: 25,
    fontFamily: 'Quicksand-Bold',
    color: '#414248',
    textAlign: "center",
  },
});
