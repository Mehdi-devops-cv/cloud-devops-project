import React, { useState, useEffect } from 'react';
import { Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StyleSheet, View, Text, TouchableOpacity, Alert, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Storage from '../utils/Storage';
import { API_BASE_URL } from '../config';
import { useUserRole } from '../Controleur/UserRoleContext';

import ScreenWrapper from '../Controleur/ScreenWrapper';

export default function Profile({ navigation }) {
    const [user, setUser] = useState({
        name: 'Mehdi Akounad',
        email: 'kijiramer@hotmail.fr',
        address: '1 rue du moutier, 93400 Saint-Ouen-Sur-Seine',
        role: 'Admin',
        avatar: null,
    });
        // ...existing code...
    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission requise', 'Vous devez autoriser l’accès à la galerie pour choisir une photo.');
                return;
            }
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            if (!result.canceled) {
                let imageUri = null;
                if (result.assets && result.assets.length > 0) {
                    imageUri = result.assets[0].uri;
                } else if (result.uri) {
                    imageUri = result.uri;
                }
                if (imageUri) {
                    setUser({ ...user, avatar: imageUri });
                    // Envoi au serveur via Cloudinary
                    try {
                        const formData = new FormData();
                        formData.append('photo', {
                            uri: imageUri,
                            name: 'avatar.jpg',
                            type: 'image/jpeg',
                        });
                        const token = await Storage.getItem('token');
                        const uploadUrl = `${API_BASE_URL}/user/uploadPhoto`;
                        const response = await axios.post(
                            uploadUrl,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );
                        if (response.data.avatarUrl) {
                            setUser(prev => ({ ...prev, avatar: response.data.avatarUrl }));
                        }
                    } catch (err) {
                        Alert.alert('Erreur', 'Impossible d’uploader la photo sur le serveur.');
                    }
                }
            }
        } catch (err) {
            Alert.alert('Erreur', 'Impossible de sélectionner une image.');
        }
    };
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const { clearUserRole } = useUserRole();
    const [form, setForm] = useState({
        name: '',
        email: ''
    });

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        // Cette fonction est vide ou à compléter selon la logique API
        // Pour le moment, elle ne fait rien
    };

    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Voulez-vous vraiment vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Se déconnecter',
                    style: 'destructive',
                    onPress: async () => {
                        await Storage.removeItem('token');
                        await Storage.removeItem('user');
                        await clearUserRole();
                        navigation.replace('LoginPage');
                    },
                },
            ]
        );
    };

    return (
        <ScreenWrapper>
            <SafeAreaView style={styles.container}>
                <>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarCircle}>
                            {user.avatar ? (
                                <Image source={{ uri: user.avatar }} style={{ width: 90, height: 90, borderRadius: 45 }} />
                            ) : null}
                        </View>
                        <TouchableOpacity style={styles.avatarEditBtn} onPress={pickImage}>
                            <View style={styles.avatarEditCircle}>
                                <Text style={styles.avatarEditIcon}>📷</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.profileName}>{user?.name || 'Mehdi Akounad'} — {user?.role || 'Admin'}</Text>
                    <Text style={styles.profileEmail}>{user?.email || 'kijiramer@hotmail.fr'}</Text>
                    <Text style={styles.profileAddress}>{user?.address || '1 rue du moutier, 93400 Saint-Ouen-Sur-Seine'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PRÉFÉRENCES</Text>
                    <TouchableOpacity style={styles.itemRow} onPress={() => navigation.navigate('ChangeEmail')}> 
                        <View style={[styles.iconCircle, { backgroundColor: '#007aff' }]}> 
                            <Text style={styles.icon}>✉️</Text>
                        </View>
                        <Text style={styles.itemText}>Modifier mon adresse E-mail</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.itemRow} onPress={() => navigation.navigate('ChangePassword')}> 
                        <View style={[styles.iconCircle, { backgroundColor: '#50b96a' }]}> 
                            <Text style={styles.icon}>🔑</Text>
                        </View>
                        <Text style={styles.itemText}>Changer mon mot de passe</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>RESOURCES</Text>
                    <TouchableOpacity style={styles.itemRow} onPress={() => {
                        const email = 'kijiramer@hotmail.fr';
                        const subject = encodeURIComponent('Contact Application BTP');
                        const body = encodeURIComponent('Bonjour, ...');
                        const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
                        Linking.openURL(mailtoUrl);
                    }}>
                        <View style={[styles.iconCircle, { backgroundColor: '#007aff' }]}> 
                            <Text style={styles.icon}>✉️</Text>
                        </View>
                        <Text style={styles.itemText}>Nous contacter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.itemRow} onPress={() => navigation.navigate('PrivacyPolicy')}> 
                        <View style={[styles.iconCircle, { backgroundColor: '#ff9800' }]}> 
                            <Text style={styles.icon}>🛡️</Text>
                        </View>
                        <Text style={styles.itemText}>Politique de confidentialité</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Déconnexion</Text>
                </TouchableOpacity>
                </>
            </SafeAreaView>
        </ScreenWrapper>
    );
// ...déclaration du composant Profile...
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    profileHeader: {
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 16,
    },
    time: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111',
        alignSelf: 'flex-start',
        marginLeft: 24,
        marginBottom: 8,
    },
    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEditBtn: {
        position: 'absolute',
        right: -2,
        bottom: -2,
    },
    avatarEditCircle: {
        backgroundColor: '#007aff',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatarEditIcon: {
        color: '#fff',
        fontSize: 18,
    },
    profileName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#414248',
        marginBottom: 2,
        textAlign: 'center',
    },
    profileEmail: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginBottom: 2,
    },
    profileAddress: {
        fontSize: 15,
        color: '#bbb',
        textAlign: 'center',
        marginBottom: 16,
    },
    section: {
        marginTop: 18,
        marginBottom: 8,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 13,
        color: '#aaa',
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 1.2,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 18,
    },
    itemText: {
        fontSize: 16,
        color: '#111',
        fontWeight: '500',
    },
    logoutBtn: {
        marginTop: 32,
        alignSelf: 'center',
    },
    logoutText: {
        color: '#e85c5c',
        fontSize: 17,
        fontWeight: '600',
    },
    editButton: {
        backgroundColor: '#f26463',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    cancelButton: {
        backgroundColor: '#999',
    },
    saveButton: {
        backgroundColor: '#f26463',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#ff4444',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
