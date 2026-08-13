import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Garder le splash screen natif visible pendant le chargement
SplashScreen.preventAutoHideAsync();

export default function AnimatedSplashScreen({ children, onAnimationEnd }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animate = async () => {
      // Attendre un peu avant de commencer l'animation
      await new Promise(resolve => setTimeout(resolve, 500));

      // Animation de zoom-in (grossissement puis disparition)
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(async () => {
        // Cacher le splash screen natif
        await SplashScreen.hideAsync();
        
        // Notifier que l'animation est terminée
        if (onAnimationEnd) {
          onAnimationEnd();
        }
      });
    };

    animate();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.splashContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../assets/logoHopra.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <View style={styles.childrenContainer}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logo: {
    width: '80%',
    height: '80%',
  },
  childrenContainer: {
    flex: 1,
  },
});
