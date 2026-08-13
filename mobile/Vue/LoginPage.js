import React, { useState, useCallback, useEffect } from 'react';
import {
    StyleSheet,
    Alert,
    Keyboard,
    TouchableOpacity,
    View,
    Text,
    ActivityIndicator,
    Image,
    TextInput,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import Storage from '../utils/Storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import useNavigationCustom from '../Controleur/useNavigationCustom';
import { useUserRole } from '../Controleur/UserRoleContext';
import { API_BASE_URL } from '../config';

// Configuration Axios
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 secondes timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour les erreurs
api.interceptors.response.use(
    response => response,
    error => {
        if (error.code === 'ECONNABORTED') {
            throw new Error('La requête a expiré. Vérifiez votre connexion réseau.');
        }
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
        }
        throw error;
    }
);

export default function LoginPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const { goBack, navigateTo } = useNavigationCustom();
    const { updateUserRole } = useUserRole();
    const { handleSubmit, control, formState: { errors }, reset } = useForm({
        mode: 'onBlur',
        defaultValues: {
            email: '',
            password: '',
        },
    });

    useEffect(() => {
        console.log("🎯 Form initialized with errors:", errors);
    }, [errors]);

    const loadUser = useCallback(async token => {
        try {
            setLoading(true);
            console.log("Sending token:", token);
            const response = await api.get('/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const { data } = response;
            if (!data.success) {
                throw new Error(data.message);
            }

            if (!data.user) {
                throw new Error('Utilisateur introuvable');
            }

            setUser(data.user);

            // Stocker le rôle de l'utilisateur
            if (data.user.role) {
                await updateUserRole(data.user.role);
            }
        } catch (err) {
            console.log("Error loading user:", err);
            const message = err.response?.data?.message ?? err.message ?? 'Il y a un soucis';
            Alert.alert('Oops !', message);
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
        console.log("🚀 onSubmit called with data:", data);
        setLoading(true);
        
        // Keyboard.dismiss() peut poser problème sur web
        if (Platform.OS !== 'web') {
            Keyboard.dismiss();
        }

        try {
            console.log("🌐 Making request to:", `${API_BASE_URL}/login`);
            const response = await api.post('/login', data);
            console.log("✅ API response:", response.data);

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            if (!response.data.token) {
                throw new Error('Token non fourni par le serveur');
            }

            const { token } = response.data;

            await Storage.setItem('token', token);
            console.log("Token saved:", token);

            await loadUser(token);

            reset();

            navigateTo('SplashTransition');

        } catch (err) {
            console.error("❌ Login error:", err);
            console.error("❌ Error details:", err.response?.data || err.message);
            
            // Afficher un message clair pour les erreurs d'authentification
            if (err.response?.status === 400 || err.response?.status === 401) {
                Alert.alert('Erreur', 'Email ou mot de passe incorrect');
            } else {
                const message = err.response?.data?.message ?? err.message ?? 'Il y a un soucis !';
                Alert.alert('Oops !', message);
            }
        } finally {
            setLoading(false);
        }
    };

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
                            <Image
                                alt="App Logo"
                                resizeMode="contain"
                                style={styles.headerImg}
                                source={require('../assets/logo1.png')} />

                            <Text style={styles.title}>
                                Connexion
                            </Text>

                            <Text style={styles.subtitle}>
                                Accédez au compte pro
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.input}>
                                <Text style={styles.inputLabel}>Adresse E-mail</Text>

                                <>
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <TextInput
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                                clearButtonMode="while-editing"
                                                keyboardType="email-address"
                                                returnKeyType="next"
                                                enablesReturnKeyAutomatically={true}
                                                placeholder="exemple@email.com"
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
                                                message: 'Adresse E-mail requis.',
                                            },

                                            pattern: {
                                                value: /\S+@\S+\.\S+/,
                                                message: 'Entrez une adresse E-mail.',
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
                                <Text style={styles.inputLabel}>Mot de passe</Text>
                                <>
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <TextInput
                                                autoCorrect={false}
                                                clearButtonMode="while-editing"
                                                returnKeyType="done"
                                                enablesReturnKeyAutomatically={true}
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
                                                message: 'Mot de passe requis.',
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

                            <View style={styles.formAction}>
                                {Platform.OS === 'web' ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            console.log("🔘 Web button clicked!");
                                            handleSubmit(onSubmit)();
                                        }}
                                        style={{
                                            borderRadius: 30,
                                            paddingVertical: 10,
                                            paddingHorizontal: 20,
                                            backgroundColor: '#F85F6A',
                                            border: '1px solid #F85F6A',
                                            color: 'white',
                                            fontSize: 18,
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            width: '100%',
                                            padding: '12px'
                                        }}
                                    >
                                        Connexion
                                    </button>
                                ) : (
                                    <TouchableOpacity 
                                        onPress={() => {
                                            console.log("🔘 Mobile button pressed!");
                                            handleSubmit(onSubmit)();
                                        }}
                                        accessible={true}
                                        accessibilityRole="button"
                                    >
                                        <View style={styles.btn}>
                                            <Text style={styles.btnText}>Connexion</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <Text style={styles.formLink}>Mot de passe oublié ?</Text>
                        </View>
                    </KeyboardAwareScrollView>

                    <TouchableOpacity
                        onPress={() => navigateTo('SignUp')}
                        style={{ marginTop: 'auto' }}>
                        <Text style={styles.formFooter}>
                            Pas de compte ?{' '}
                            <Text style={{ textDecorationLine: 'underline' }}>Cliquez ici</Text>
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
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#929292',
        marginBottom: -10,
    },
    loggedIn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 25,
    },
    headerImg: {
        width: 200,
        height: 80,
        alignSelf: 'center',
        marginBottom: 20,
        marginTop: -30,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    /** Form */
    form: {
        marginBottom: 24,
        marginTop: 15,
        paddingHorizontal: 24,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
    },
    formAction: {
        marginTop: 35,
        marginBottom: 16,
    },
    formLink: {
        fontSize: 16,
        fontWeight: '600',
        color: '#989EB1',
        textAlign: 'center',
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
        marginBottom: 25,
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
        marginTop: -30,
    },
    btnText: {
        fontSize: 18,
        lineHeight: 26,
        fontWeight: '600',
        color: '#ffffff',
    },
});
