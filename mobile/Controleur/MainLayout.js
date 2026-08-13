import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../Vue/Header';
import Footer from '../Vue/Footer';
import { useRoute } from '@react-navigation/native';

export default function MainLayout({ children, navigation }) {
  const route = useRoute();
  
  // Écrans sans header/footer
  const screensWithoutLayout = ['LoginPage', 'SignUp', 'SplashTransition'];
  const showLayout = !screensWithoutLayout.includes(route.name);

  if (!showLayout) {
    return children;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header navigation={navigation} isHomePage={route.name === 'HomePage'} {...route.params} />
      <View style={styles.content}>
        {children}
      </View>
      <Footer navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});
