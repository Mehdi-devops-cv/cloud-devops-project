import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Alert,
  Keyboard,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import Storage from '../utils/Storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Feather as FeatherIcon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useNavigationCustom from '../Controleur/useNavigationCustom';
import { API_BASE_URL } from '../config';


export default function SignUp() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const { goBack, navigateTo } = useNavigationCustom();
    const {
        handleSubmit,
        control, 
        formState: { errors },
        reset,
        watch,
    } = useForm({
        mode: 'onBlur',
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

  const loadUser = useCallback(async token => {
    try {
      setLoading(true);
  const { data } = await axios.get(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!data.user) {
        throw new Error('User not found.');
      }

      setUser(data.user);
    } catch (err) {
      const message =
        err.response?.data?.message ?? err.message ?? 'Something went wrong!';
      Alert.alert('Oops!', message);

      if (err.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadExistingUser = async () => {
  const token = await Storage.getItem('token');

      if (!token) {
        return;
      }

      await loadUser(token);
    };
    loadExistingUser();
  }, [loadUser]);

  const onSubmit = async data => {
    setLoading(true);
    Keyboard.dismiss();

    try {
  const response = await axios.post(`${API_BASE_URL}/signup`, data);
      const { token } = response.data;

  await Storage.setItem('token', token);
      await loadUser(token);

      reset();
    } catch (err) {
      const message =
        err.response?.data?.message ?? err.message ?? 'Something went wrong!';
      Alert.alert('Oops!', message);
    } finally {
      setLoading(false);
      Alert.alert(
        'Successful submission!',
        'New account is created, navigating to the next screen!',
        [
          {
            text: "OK",
            onPress: () => navigateTo('LoginPage')
          }
        ]
      );
    }
  };

  /* if (user) {
    return (
      <View style={styles.loggedIn}>
        <Text style={styles.loggedInTitle}>Welcome, {user.name}!</Text>

        <TouchableOpacity
          onPress={async () => {
            await Storage.removeItem('token');
            setUser(null);
          }}>
          <Text style={styles.loggedInLink}>Log out</Text>
        </TouchableOpacity>
      </View>
    );
  } */

  return (
    <>
      {loading && (
        <View style={styles.activityOverflow}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      <SafeAreaView style={{ flex: 1, backgroundColor: '#e8ecf4' }}>
        <View style={styles.container}>
          <KeyboardAwareScrollView>
            <View style={styles.header}>
              <View style={styles.headerBack}>
                <FeatherIcon
                  color="#1D2A32"
                  name="chevron-left"
                  size={30} />
              </View>

              <Text style={styles.title}>Let's Get Started!</Text>

              <Text style={styles.subtitle}>
                Fill in the fields below to get started with your new account.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.input}>
                <Text style={styles.inputLabel}>Full Name</Text>

                <>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        clearButtonMode="while-editing"
                        placeholder="John Doe"
                        placeholderTextColor="#6b7280"
                        style={styles.inputControl}
                        onBlur={onBlur}
                        onChangeText={name => onChange(name)}
                        value={value} />
                    )}
                    name="name"
                    rules={{
                      required: {
                        value: true,
                        message: 'Full Name is required.',
                      },
                    }}
                  />
                  {errors.name && (
                    <Text style={styles.inputError}>{errors.name.message}</Text>
                  )}
                </>
              </View>

              <View style={styles.input}>
                <Text style={styles.inputLabel}>Email Address</Text>

                <>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        clearButtonMode="while-editing"
                        keyboardType="email-address"
                        placeholder="john@example.com"
                        placeholderTextColor="#6b7280"
                        style={styles.inputControl}
                        onBlur={onBlur}
                        onChangeText={email => onChange(email)}
                        value={value} />
                    )}
                    name="email"
                    rules={{
                      required: {
                        value: true,
                        message: 'Email Address is required.',
                      },

                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: 'Please enter a valid email address.',
                      },
                    }}
                  />
                  {errors.email && (
                    <Text style={styles.inputError}>
                      {errors.email.message}
                    </Text>
                  )}
                </>
              </View>

              <View style={styles.input}>
                <Text style={styles.inputLabel}>Password</Text>

                <>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        autoCorrect={false}
                        clearButtonMode="while-editing"
                        placeholder="********"
                        placeholderTextColor="#6b7280"
                        style={styles.inputControl}
                        secureTextEntry={true}
                        onBlur={onBlur}
                        onChangeText={password => onChange(password)}
                        value={value} />
                    )}
                    name="password"
                    rules={{
                      required: {
                        value: true,
                        message: 'Password is required.',
                      },

                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters.',
                      },
                    }}
                  />
                  {errors.password && (
                    <Text style={styles.inputError}>
                      {errors.password.message}
                    </Text>
                  )}
                </>
              </View>

              <View style={styles.input}>
                <Text style={styles.inputLabel}>Confirm Password</Text>

                <>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        autoCorrect={false}
                        clearButtonMode="while-editing"
                        placeholder="********"
                        placeholderTextColor="#6b7280"
                        style={styles.inputControl}
                        secureTextEntry={true}
                        onBlur={onBlur}
                        onChangeText={confirmPassword =>
                          onChange(confirmPassword)
                        }
                        value={value} />
                    )}
                    name="confirmPassword"
                    rules={{
                      required: {
                        value: true,
                        message: 'Confirm Password is required.',
                      },

                      validate: val => {
                        if (watch('password') !== val) {
                          return 'Passwords must match.';
                        }
                      },
                    }}
                  />
                  {errors.confirmPassword && (
                    <Text style={styles.inputError}>
                      {errors.confirmPassword.message}
                    </Text>
                  )}
                </>
              </View>

              <View style={styles.formAction}>
                <TouchableOpacity onPress={handleSubmit(onSubmit)}>
                  <View style={styles.btn}>
                    <Text style={styles.btnText}>Get Started</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>

          <TouchableOpacity
            onPress={() => {
              // handle link
            }}
            style={{ marginTop: 'auto' }}>
            <Text style={styles.formFooter}>
              Already have an account?{' '}
              <Text style={{ textDecorationLine: 'underline' }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  activityOverflow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  container: {
    paddingVertical: 24,
    paddingHorizontal: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  title: {
    fontSize: 31,
    fontWeight: '700',
    color: '#1D2A32',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#929292',
  },
  loggedIn: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loggedInTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1d1d1d',
    marginBottom: 6,
  },
  loggedInLink: {
    fontSize: 15,
    color: '#007aff',
    textDecorationLine: 'underline',
  },
  /** Header */
  header: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  headerBack: {
    padding: 8,
    paddingTop: 0,
    position: 'relative',
    marginLeft: -16,
    marginBottom: 6,
  },
  /** Form */
  form: {
    marginBottom: 24,
    paddingHorizontal: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  formAction: {
    marginTop: 20,
    marginBottom: 16,
  },
  formFooter: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    letterSpacing: 0.15,
  },
  /** Input */
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  inputControl: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#C9D3DB',
    borderStyle: 'solid',
  },
  inputError: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: 'red',
  },
  /** Button */
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#F85F6A',
    borderColor: '#F85F6A',
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },
});
