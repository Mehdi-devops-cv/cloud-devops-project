import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Une erreur est survenue</Text>
          <Text style={styles.message}>
            L'application a rencontré un problème. Veuillez réessayer.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.error}>{this.state.error.toString()}</Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#F85F6A',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  error: {
    marginTop: 20,
    fontSize: 12,
    color: '#999',
  },
});

export default ErrorBoundary;
