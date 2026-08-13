import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import Storage from './utils/Storage';
import LoginPage from "./Vue/LoginPage";
import SignUp from "./Vue/SignUp";
import HomePage from "./Vue/HomePage";
import SplashTransition from "./Vue/SplashTransition";
import Profile from './Vue/Profile';
import Chantier from './Vue/Chantier';
import Batiment from './Vue/Batiment';
import Note from './Vue/Note';
import RapportPhoto from './Vue/RapportPhoto';
import Constatation from './Vue/Constatation';
import Remarque from './Vue/Remarque';
import Effectif from './Vue/Effectif';
import PrivacyPolicy from './Vue/PrivacyPolicy';
import { TabProvider } from './Controleur/TabContext';
import { UserRoleProvider } from './Controleur/UserRoleContext';
import ErrorBoundary from './Controleur/ErrorBoundary';
import AppWrapper from './Controleur/AppWrapper';
import axios from 'axios';
import { API_BASE_URL } from './config';
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Quicksand-Bold': require('./assets/fonts/Quicksand-Bold.ttf'),
  });

  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState("LoginPage");
  const [loading, setLoading] = useState(false);

  const loadUser = useCallback(async (token: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000, // Timeout de 10 secondes
      });

      const { data } = response;
      if (data.user) {
        setInitialRoute("HomePage");
      }
    } catch (err) {
      console.log("Error loading user:", err);
      // Ne pas bloquer l'app si l'API ne répond pas
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await Storage.getItem('token');
        if (token) {
          await loadUser(token);
        }
      } catch (err) {
        console.log("Error checking token:", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, [loadUser]);

  useEffect(() => {
    if (!isLoading && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync(); // Fermer l'écran de démarrage après le chargement des polices et la vérification du token
    }
  }, [isLoading, fontsLoaded, fontError]);

  // Afficher le loader pendant le chargement
  if (isLoading || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#F85F6A" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <UserRoleProvider>
          <TabProvider>
            <NavigationContainer>
              <AppWrapper>
                <Stack.Navigator initialRouteName={initialRoute}>
              <Stack.Screen name="LoginPage" component={LoginPage} options={{ headerShown: false }} />
              <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
              <Stack.Screen name="SplashTransition" component={SplashTransition} options={{ headerShown: false }} />
              <Stack.Screen name="HomePage" component={HomePage} options={{ headerShown: false }} />
              <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
              <Stack.Screen name="Chantier" component={Chantier} options={{ headerShown: false }} />
              <Stack.Screen name="Batiment" component={Batiment} options={{ headerShown: false }} />
              <Stack.Screen name="Note" component={Note} options={{ headerShown: false }} />
              <Stack.Screen name="RapportPhoto" component={RapportPhoto} options={{ headerShown: false }} />
              <Stack.Screen name="Constatation" component={Constatation} options={{ headerShown: false }} />
              <Stack.Screen name="Remarque" component={Remarque} options={{ headerShown: false }} />
              <Stack.Screen name="Effectif" component={Effectif} options={{ headerShown: false }} />
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={{ headerShown: false }} />
            </Stack.Navigator>
              </AppWrapper>
            </NavigationContainer>
          </TabProvider>
        </UserRoleProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
