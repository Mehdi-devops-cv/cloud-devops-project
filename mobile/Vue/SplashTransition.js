import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SplashTransition() {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animate = async () => {
      // Attendre un peu avant de commencer l'animation
      await new Promise(resolve => setTimeout(resolve, 300));

      // Animation de zoom-in (grossissement puis disparition)
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Naviguer vers HomePage après l'animation
        navigation.replace('HomePage');
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
          source={require('../assets/logo1.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '70%',
    height: '70%',
  },
});
