import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigationState } from '@react-navigation/native';
import Header from '../Vue/Header';
import Footer from '../Vue/Footer';

export default function AppWrapper({ children }) {
  const navigationState = useNavigationState(state => state);
  const routeName = navigationState?.routes[navigationState?.index]?.name;
  const routeParams = navigationState?.routes[navigationState?.index]?.params || {};
  const [headerHeight, setHeaderHeight] = useState(120);
  const insets = useSafeAreaInsets();
  
  // Écrans sans header/footer
  const screensWithoutLayout = ['LoginPage', 'SignUp', 'SplashTransition', 'Profile'];
  // Hide layout when we don't yet know the route (initial load) or when on an auth screen
  const showLayout = routeName && !screensWithoutLayout.includes(routeName);
  const isHomePage = !routeName || routeName === 'HomePage';

  // Si pas de layout, affiche juste le contenu
  if (!showLayout) {
    return children;
  }
  
  // Avec layout (Header + Footer)
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']} pointerEvents="box-none">
        <View 
          style={styles.headerContainer}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setHeaderHeight(height);
          }}
        >
          <Header 
            isHomePage={isHomePage}
            city={routeParams.city}
            building={routeParams.building}
            task={routeParams.task}
          />
        </View>
      </SafeAreaView>
      <View style={[styles.content, { paddingTop: headerHeight }]}>
        {children}
      </View>
      <View style={styles.footerContainer} pointerEvents="box-none">
        <Footer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
