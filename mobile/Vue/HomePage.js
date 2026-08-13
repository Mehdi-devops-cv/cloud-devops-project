import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Image, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../config';
import bannerImage from '../assets/Banner.jpg';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../Controleur/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios'; // Import axios for API calls

export default function Home({ navigation }) {
  const [cities, setCities] = useState([]); // State to store cities

  // Fetch cities from API
  useEffect(() => {
    axios.get(`${API_BASE_URL}/cities`)
      .then(response => {
        setCities(response.data);
      })
      .catch(error => {
        console.error('Error fetching cities:', error);
      });
  }, []);

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={[styles.content, { backgroundColor: '#f5f5f5' }]}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.bannerContainer, { marginTop: 20, alignSelf: 'center', width: '95%' }]}> 
            <Image source={bannerImage} style={styles.bannerImage} />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Bienvenue dans votre application</Text>
              <Text style={styles.bannerText}>Voici la liste de vos chantiers</Text>
            </View>
          </View>
          {/* Ombre subtile sous la bannière */}
          <LinearGradient
            colors={["#fff", "#e5e5e5AA", "#fff0"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ height: 12, width: '95%', alignSelf: 'center' }}
          />
          <View style={styles.cardList}>
            {cities.map((city, index) => (
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={() => navigation.navigate('Chantier', { city: city.name })}
              >
                <MaterialIcons name="engineering" color="#414248" size={35} style={styles.cardIcon} />
                <Text style={styles.cardText}>{city.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerContainer: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    position: 'relative',
    alignSelf: 'center',
    width: '95%',
  },
  bannerImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  bannerTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bannerTitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  bannerText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '400',
  },
  content: {
    paddingTop: 12,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  cardList: {
    marginTop: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 25,
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
