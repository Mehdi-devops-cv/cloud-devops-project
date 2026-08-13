import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Pressable, Image, Alert, TextInput, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import moment from 'moment';
import axios from 'axios';
import Storage from '../utils/Storage';
import { API_BASE_URL } from '../config';

import ScreenWrapper from '../Controleur/ScreenWrapper';
import { displayCalendarScreen } from './Components/Calendar';
import { useUserRole } from '../Controleur/UserRoleContext';

// Fonction helper pour formater une date en YYYY-MM-DD (heure locale)
const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function RapportPhoto({ route, navigation }) {

    // Formulaire pour ajout de photos
    // Nouvelle structure : liste de photos avant/après
    const [photoFormList, setPhotoFormList] = useState([]); // [{avant: uri, apres: uri|null}]
    const { city, building, task } = route.params;
    const { canAddItem, canDelete, userRole } = useUserRole();

    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showFolderForm, setShowFolderForm] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [editingFolder, setEditingFolder] = useState(null);
    const [hasLibraryPermission, setHasLibraryPermission] = useState(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [expandedFolders, setExpandedFolders] = useState({});
    const [folderPhotos, setFolderPhotos] = useState({});
    const [datesWithFolders, setDatesWithFolders] = useState([]);
    // Suggestions entreprise
    const [companySuggestions, setCompanySuggestions] = useState([]);
    const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
    // Aperçu photo
    const [previewImage, setPreviewImage] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewFolderPhotos, setPreviewFolderPhotos] = useState([]); // Galerie de photos
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0); // Index de la photo actuelle
    // Form pour créer un dossier
    const [form, setForm] = useState({
        chantierName: city || '',
        company: '',
        mission: '',
        startDate: new Date(),
        endDate: null,
    });

    // Fonction utilitaire pour mettre à jour le formulaire
    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // Ajouter une paire de photos à un dossier
    const addPhotosToFolder = async () => {
        if (!selectedFolder) {
            Alert.alert('Erreur', 'Aucun dossier sélectionné');
            return;
        }
        if (!photoFormList.length) {
            Alert.alert('Erreur', 'Aucune photo à envoyer');
            return;
        }
        try {
            setLoading(true);
            const token = await Storage.getItem('token');
            if (!token) {
                Alert.alert('Erreur', 'Vous devez être connecté');
                return;
            }
            // Pour chaque entrée de photoFormList, upload et envoi à l'API
            for (let i = 0; i < photoFormList.length; i++) {
                const item = photoFormList[i];
                if (!item.avant) {
                    continue;
                }
                const formData = new FormData();
                formData.append('imageAvant', {
                    uri: item.avant,
                    name: `avant_${i}.jpg`,
                    type: 'image/jpeg',
                });
                if (item.apres) {
                    formData.append('imageApres', {
                        uri: item.apres,
                        name: `apres_${i}.jpg`,
                        type: 'image/jpeg',
                    });
                }
                const uploadRes = await axios.post(`${API_BASE_URL}/uploadConstatationPhoto`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!uploadRes.data.success) {
                    Alert.alert('Erreur', `Upload Cloudinary échoué pour la photo ${i + 1}`);
                    continue;
                }
                // Création sur le serveur
                const photoData = {
                    imageAvant: uploadRes.data.imageAvant,
                    imageApres: uploadRes.data.imageApres || null,
                };
                const response = await axios.post(`${API_BASE_URL}/folders/${selectedFolder._id}/photos`, photoData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.data.success) {
                    Alert.alert('Erreur', `Erreur serveur pour la photo ${i + 1}`);
                }
            }
            // Réinitialiser la liste et fermer le modal
            setPhotoFormList([]);
            setShowPhotoModal(false);
            await loadFolderPhotos(selectedFolder._id);
            Alert.alert('Succès', 'Toutes les photos ont été envoyées');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Impossible d\'ajouter les photos';
            Alert.alert('Erreur', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Ajout d'une photo avant dans la liste
    const openImageSourceModalList = () => {
        Alert.alert(
            'Ajouter une photo avant',
            'Sélectionnez la source de votre photo',
            [
                {
                    text: 'Prendre une photo',
                    onPress: async () => {
                        try {
                            const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: ['images'],
                                quality: 0.7,
                                allowsEditing: true,
                            });
                            if (!result.canceled) {
                                setPhotoFormList(prev => [...prev, { avant: result.assets[0].uri, apres: null }]);
                            }
                        } catch (e) {
                            Alert.alert('Erreur', 'Impossible de prendre la photo');
                        }
                    }
                },
                {
                    text: 'Choisir depuis la galerie',
                    onPress: async () => {
                        try {
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ['images'],
                                quality: 0.7,
                                allowsEditing: true,
                            });
                            if (!result.canceled) {
                                setPhotoFormList(prev => [...prev, { avant: result.assets[0].uri, apres: null }]);
                            }
                        } catch (e) {
                            Alert.alert('Erreur', "Impossible de sélectionner l'image");
                        }
                    }
                },
                { text: 'Annuler', style: 'cancel' }
            ]
        );
    };

    // Supprimer une photo avant
    const deletePhotoFromList = (index) => {
        setPhotoFormList(prev => prev.filter((_, i) => i !== index));
    };

    // Ouvrir un aperçu d'image en plein écran avec galerie
    const openPreview = (imageUri, allPhotos = []) => {
        setPreviewImage(imageUri);
        // Créer une galerie avec toutes les images avant/après
        let galleryPhotos = [];
        allPhotos.forEach((photo, idx) => {
            // Gérer deux formats : {imageAvant, imageApres, _id} (BD) ou {avant, apres} (formulaire)
            const avant = photo.imageAvant || photo.avant;
            const apres = photo.imageApres || photo.apres;
            const photoId = photo._id || '';
            
            if (avant) {
                galleryPhotos.push({
                    uri: avant,
                    label: 'Avant',
                    photoId: photoId
                });
            }
            if (apres) {
                galleryPhotos.push({
                    uri: apres,
                    label: 'Après',
                    photoId: photoId
                });
            }
        });
        setPreviewFolderPhotos(galleryPhotos);
        // Trouver l'index de l'image cliquée
        const index = galleryPhotos.findIndex(p => p.uri === imageUri);
        setCurrentPhotoIndex(index >= 0 ? index : 0);
        setShowPreviewModal(true);
    };

    // Ajouter une photo après pour une photo avant existante (dans le modal)
    const addPhotoApres = async (index) => {
        Alert.alert(
            'Ajouter une photo après',
            'Sélectionnez la source de votre photo',
            [
                {
                    text: 'Prendre une photo',
                    onPress: async () => {
                        try {
                            const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: ['images'],
                                quality: 0.7,
                                allowsEditing: true,
                            });
                            if (!result.canceled) {
                                setPhotoFormList(prev => {
                                    const newList = [...prev];
                                    newList[index].apres = result.assets[0].uri;
                                    return newList;
                                });
                            }
                        } catch (e) {
                            Alert.alert('Erreur', 'Impossible de prendre la photo');
                        }
                    }
                },
                {
                    text: 'Choisir depuis la galerie',
                    onPress: async () => {
                        try {
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ['images'],
                                quality: 0.7,
                                allowsEditing: true,
                            });
                            if (!result.canceled) {
                                setPhotoFormList(prev => {
                                    const newList = [...prev];
                                    newList[index].apres = result.assets[0].uri;
                                    return newList;
                                });
                            }
                        } catch (e) {
                            Alert.alert('Erreur', "Impossible de sélectionner l'image");
                        }
                    }
                },
                { text: 'Annuler', style: 'cancel' }
            ]
        );
    };

    // Ajouter une photo après à une photo existante du dossier
    const addPhotoApresExisting = async (photoId, folderId) => {
        Alert.alert(
            'Ajouter une photo après',
            'Sélectionnez la source de votre photo',
            [
                {
                    text: 'Prendre une photo',
                    onPress: async () => {
                        try {
                            const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: ['images'],
                                quality: 0.7,
                                allowsEditing: true,
                            });
                            if (!result.canceled) {
                                await uploadAndUpdatePhoto(photoId, folderId, result.assets[0].uri);
                            }
                        } catch (e) {
                            Alert.alert('Erreur', 'Impossible de prendre la photo');
                        }
                    }
                },
                {
                    text: 'Choisir depuis la galerie',
                    onPress: async () => {
                        try {
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ['images'],
                                quality: 0.7,
                                allowsEditing: true,
                            });
                            if (!result.canceled) {
                                await uploadAndUpdatePhoto(photoId, folderId, result.assets[0].uri);
                            }
                        } catch (e) {
                            Alert.alert('Erreur', "Impossible de sélectionner l'image");
                        }
                    }
                },
                { text: 'Annuler', style: 'cancel' }
            ]
        );
    };

    // Upload et mettre à jour une photo existante avec imageApres
    const uploadAndUpdatePhoto = async (photoId, folderId, imageUri) => {
        try {
            setLoading(true);
            const token = await Storage.getItem('token');
            if (!token) {
                Alert.alert('Erreur', 'Vous devez être connecté');
                return;
            }

            // Upload de l'image
            const formData = new FormData();
            formData.append('imageApres', {
                uri: imageUri,
                name: 'apres.jpg',
                type: 'image/jpeg',
            });

            const uploadRes = await axios.post(`${API_BASE_URL}/uploadConstatationPhoto`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!uploadRes.data.success) {
                Alert.alert('Erreur', 'Upload de l\'image échoué');
                return;
            }


            // Mise à jour de la photo avec imageApres
            const response = await axios.put(`${API_BASE_URL}/photos/${photoId}`, {
                imageApres: uploadRes.data.imageApres,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                await loadFolderPhotos(folderId);
                Alert.alert('Succès', 'Photo après ajoutée avec succès');
            } else {
                Alert.alert('Erreur', 'Erreur lors de la mise à jour');
            }
        } catch (err) {
            Alert.alert('Erreur', 'Impossible d\'ajouter la photo après');
        } finally {
            setLoading(false);
        }
    };

    // Charger les dossiers depuis l'API
    const loadFolders = async () => {
        try {
            setLoading(true);
            const token = await Storage.getItem('token');
            if (!token) {
                Alert.alert('Erreur', 'Vous devez être connecté');
                return;
            }

            const dateStr = formatLocalDate(selectedDate);
            const response = await axios.get(`${API_BASE_URL}/folders?city=${city}&building=${building}&task=${task}&startDate=${dateStr}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                if (response.data.folders.length > 0) {
                }
                setFolders(response.data.folders);
                // Charger les photos pour chaque dossier
                response.data.folders.forEach(folder => loadFolderPhotos(folder._id));
            }
        } catch (err) {
            Alert.alert('Erreur', 'Impossible de charger les dossiers');
        } finally {
            setLoading(false);
        }
    };

    // Charger les photos d'un dossier
    const loadFolderPhotos = async (folderId) => {
        try {
            const token = await Storage.getItem('token');
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/folders/${folderId}/photos`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                setFolderPhotos(prev => ({
                    ...prev,
                    [folderId]: response.data.photos
                }));
            }
        } catch (err) {
        }
    };

        <ScreenWrapper>
            <SafeAreaView style={styles.container}>
                <KeyboardAwareScrollView
                    contentContainerStyle={styles.contentContainer}
                    enableOnAndroid={true}
                    enableAutomaticScroll={false}
                    extraScrollHeight={20}
                    keyboardShouldPersistTaps="handled"
                    enableResetScrollToCoords={false}
                    scrollEnabled={scrollEnabled}
                >
                    {/* Calendrier */}
                    <View style={styles.calendarContainer}>
                        {displayCalendarScreen(selectedDate, setSelectedDate, datesWithFolders)}
                    </View>

                    {/* Titre de la section ou message si vide */}
                    {folders.length > 0 ? (
                        <Text style={styles.sectionTitle}>Rapport photo :</Text>
                    ) : (
                        <Text style={styles.emptyMessage}>Aucun rapport photo pour ce jour là</Text>
                    )}

                    {/* Liste des dossiers */}
                    {folders.map((folder) => {
                        const isExpanded = expandedFolders[folder._id] || false;
                        const photos = folderPhotos[folder._id] || [];
                        const displayedPhotos = isExpanded ? photos : photos.slice(0, 2);
                        const hasMore = photos.length > 2;

                        return (
                            <View key={folder._id} style={styles.folderCard}>
                                {/* Header du dossier */}
                                <View style={styles.folderHeader}>
                                    <View style={styles.folderTitleContainer}>
                                        <Text style={styles.folderNumber}>📁 Dossier #{folder.reportNumber}</Text>
                                        <Text style={styles.folderTitle}>{folder.chantierName}</Text>
                                        <Text style={styles.folderSubtitle}>{folder.company}</Text>
                                    </View>
                                    {canDelete() && (
                                        <TouchableOpacity
                                            style={styles.deleteFolderBtn}
                                            onPress={() => editFolder(folder)}
                                        >
                                            <Text style={styles.deleteFolderText}>✏️</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Photos du dossier */}
                                {displayedPhotos.map((photo, idx) => {
                                    return (
                                    <View key={photo._id} style={styles.photoCard}>
                                        <View style={styles.imageRow}>
                                            <View style={styles.imageWrapper}>
                                                <Text style={styles.imageLabel}>Avant</Text>
                                                <TouchableOpacity onPress={() => openPreview(photo.imageAvant, photos)}>
                                                    <Image
                                                        source={{ uri: photo.imageAvant }}
                                                        style={styles.image}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                            <View style={styles.imageWrapper}>
                                                <Text style={styles.imageLabel}>Après</Text>
                                                {photo.imageApres ? (
                                                    <TouchableOpacity onPress={() => openPreview(photo.imageApres, photos)}>
                                                        <Image
                                                            source={{ uri: photo.imageApres }}
                                                            style={styles.image}
                                                        />
                                                    </TouchableOpacity>
                                                ) : null}
                                            </View>
                                        </View>
                                    </View>
                                    );
                                })}
                                {/* ...suite du composant... */}
                            </View>
                        );
                    })}
                    {/* ...autres composants... */}
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </ScreenWrapper>

    // Supprimer un dossier
    const editFolder = (folder) => {
        // Remplir le formulaire avec les données du dossier
        setEditingFolder(folder);
        setForm({
            // intituleMission supprimé
            chantierName: folder.chantierName || '',
            company: folder.company || '',
            mission: folder.mission || '',
            startDate: folder.startDate ? new Date(folder.startDate) : new Date(),
            endDate: folder.endDate ? new Date(folder.endDate) : null,
        });
        setShowFolderForm(true);
    };

    // Créer ou modifier un dossier
    const createFolder = async () => {
        if (!form.chantierName.trim()) {
            Alert.alert('Erreur', 'Le nom du chantier est requis');
            return;
        }
        if (!form.company.trim()) {
            Alert.alert('Erreur', 'L\'entreprise est requise');
            return;
        }

        try {
            setLoading(true);
            const token = await Storage.getItem('token');
            if (!token) {
                Alert.alert('Erreur', 'Vous devez être connecté');
                return;
            }

            const folderData = {
                chantierName: form.chantierName,
                company: form.company,
                mission: form.mission,
                startDate: form.startDate,
                endDate: form.endDate,
            };

            let response;
            if (editingFolder) {
                // Modification
                response = await axios.put(
                    `${API_BASE_URL}/folders/${editingFolder._id}`,
                    folderData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                Alert.alert('Succès', 'Dossier modifié');
            } else {
                // Création
                response = await axios.post(
                    `${API_BASE_URL}/folders`,
                    {
                        ...folderData,
                        city,
                        building,
                        task,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                Alert.alert('Succès', 'Dossier créé');
            }

            // Réinitialiser le formulaire et fermer le modal
            setShowFolderForm(false);
            setEditingFolder(null);
            setForm({
                chantierName: city || '',
                company: '',
                mission: '',
                startDate: new Date(),
                endDate: null,
            });

            // Recharger les dossiers
            await loadFolders();
            await loadFolderDates();
        } catch (err) {
            console.error('Erreur création/modif dossier:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Impossible de créer/modifier le dossier';
            Alert.alert('Erreur', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Supprimer une photo
    const deletePhoto = async (photoId, folderId) => {
        Alert.alert(
            'Confirmer la suppression',
            'Voulez-vous vraiment supprimer cette paire de photos ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await Storage.getItem('token');
                            if (!token) return;

                            await axios.delete(`${API_BASE_URL}/photos/${photoId}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });

                            await loadFolderPhotos(folderId);
                            Alert.alert('Succès', 'Photos supprimées');
                        } catch (err) {
                            Alert.alert('Erreur', 'Impossible de supprimer les photos');
                        }
                    }
                }
            ]
        );
    };

    // Exporter un dossier en PDF
    const exportToPDF = async (folder) => {

        const photos = folderPhotos[folder._id] || [];
        if (photos.length === 0) {
            Alert.alert('Erreur', 'Ce dossier ne contient aucune photo à exporter');
            return;
        }
        try {
            setLoading(true);
            // Fonction helper pour convertir une URI en base64
            const convertUriToBase64 = async (uri) => {
                if (!uri) return null;
                try {
                    // Si c'est déjà du base64 (commence par data:), retourner tel quel
                    if (uri.startsWith('data:image')) {
                        return uri;
                    }
                    // Si c'est une URL HTTP/HTTPS, télécharger et convertir
                    if (uri.startsWith('http://') || uri.startsWith('https://')) {
                        const response = await fetch(uri);
                        if (!response.ok) throw new Error('Failed to fetch image');
                        const blob = await response.blob();
                        return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.onerror = () => reject(new Error('FileReader error'));
                            reader.readAsDataURL(blob);
                        });
                    }
                    // Si c'est un chemin local (file://)
                    if (uri.startsWith('file://')) {
                        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
                        return `data:image/jpeg;base64,${base64}`;
                    }
                    // Sinon, essayer avec FileSystem (chemin local simple)
                    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
                    return `data:image/jpeg;base64,${base64}`;
                } catch (error) {
                    console.error('Erreur conversion image:', error);
                    return null;
                }
            };
            // Récupérer le logo et le convertir en base64
            const { Asset } = require('expo-asset');
            const logoAsset = Asset.fromModule(require('../assets/logo.jpg'));
            await logoAsset.downloadAsync();
            const logoBase64 = await convertUriToBase64(logoAsset.localUri || logoAsset.uri);
            // Convertir toutes les photos en base64 SANS modifier folderPhotos/photoFormList
            const photosWithBase64 = await Promise.all(
                photos.map(async (photo) => {
                    if (!photo.imageAvant) return null;
                    const avantBase64 = await convertUriToBase64(photo.imageAvant);
                    const apresBase64 = photo.imageApres ? await convertUriToBase64(photo.imageApres) : null;
                    return { ...photo, avantBase64, apresBase64 };
                })
            );
            const validPhotos = photosWithBase64.filter(p => p !== null && p.avantBase64);
            if (validPhotos.length === 0) {
                Alert.alert('Erreur', 'Impossible de charger les images');
                return;
            }

            // Générer le HTML
            let htmlPages = '';
            let currentPageNumber = 1;
            let photosOnCurrentPage = 0;
            const maxPhotosFirstPage = 3;
            const maxPhotosOtherPages = 4;

            // Header du dossier (tableau d'informations)
            const folderHeader = `
                <div style="width: 420px; margin: 0 auto 25px auto; border: 2px solid #000; border-radius: 8px; padding: 0; overflow: hidden;">
                    <div style="padding: 10px 8px; border-bottom: 1px solid #000;">
                        <div style="font-size: 9pt; font-weight: bold;">
                            Promoteur: ${folder.company.toUpperCase()} - Ville: ${folder.city.toUpperCase()}
                        </div>
                    </div>
                    <div style="padding: 10px 8px; border-bottom: 1px solid #000;">
                        <div style="font-size: 9pt;">Mission: ${folder.mission}</div>
                    </div>
                    <div style="padding: 10px 8px;">
                        <div style="font-size: 9pt;">Intervention le : ${new Date(folder.startDate).toLocaleDateString('fr-FR')}</div>
                    </div>
                </div>
            `;

            // Photos du dossier
            for (let i = 0; i < validPhotos.length; i++) {
                const photo = validPhotos[i];
                const maxPhotosOnPage = currentPageNumber === 1 ? maxPhotosFirstPage : maxPhotosOtherPages;

                // Nouvelle page si nécessaire
                if (photosOnCurrentPage >= maxPhotosOnPage) {
                    htmlPages += '</div></div>'; // Fermer page précédente
                    currentPageNumber++;
                    photosOnCurrentPage = 0;

                    // Nouvelle page avec logo en haut à gauche (plus petit)
                    htmlPages += `
                    <div class="page">
                        <div style="margin-bottom: 20px;">
                            <img src="${logoBase64}" style="width: 80px; height: 40px; object-fit: contain;" />
                        </div>
                        <div class="content">
                    `;
                }

                // Si première photo de la page, ajouter le header uniquement sur la page 1
                if (photosOnCurrentPage === 0 && currentPageNumber === 1) {
                    // Page 1: Logo centré + titre + header
                    htmlPages = `
                    <div class="page">
                        <div style="text-align: center; margin-bottom: 15px;">
                            <img src="${logoBase64}" style="width: 160px; height: 80px; object-fit: contain;" />
                        </div>
                        <div style="text-align: center; font-family: 'Times New Roman', Times, serif; font-size: 20pt; font-weight: bold; margin-bottom: 20px;">
                            <span style="border-bottom: 2px solid #000; padding-bottom: 2px;">Rapport Photo - ${folder.chantierName}</span>
                        </div>
                        <div class="content">
                    ` + folderHeader;
                }

                // Paire de photos
                htmlPages += `
                    <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 20px; page-break-inside: avoid;">
                        <div style="text-align: center;">
                            <div style="font-weight: bold; font-size: 10pt; margin-bottom: 5px;">AVANT</div>
                            <img src="${photo.avantBase64}" style="width: 185px; height: 132px; object-fit: cover; border: 1px solid #999;" />
                        </div>
                        <div style="margin: 0 15px;">
                            <svg width="40" height="20" style="display: block;">
                                <line x1="0" y1="10" x2="32" y2="10" stroke="black" stroke-width="2"/>
                                <polygon points="40,10 32,6 32,14" fill="black"/>
                            </svg>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-weight: bold; font-size: 10pt; margin-bottom: 5px;">APRÈS</div>
                            <img src="${photo.apresBase64}" style="width: 185px; height: 132px; object-fit: cover; border: 1px solid #999;" />
                        </div>
                    </div>
                `;

                photosOnCurrentPage++;
            }

            // Fermer la dernière page
            htmlPages += '</div></div>';

            // Compter le nombre total de pages
            const totalPages = currentPageNumber;

            // HTML complet
            const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            @page { size: A4; margin: 15mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Helvetica, Arial, sans-serif; background: white; color: #000; }
            .page { page-break-after: always; padding: 10px 20px; position: relative; min-height: 800px; }
            .page:last-child { page-break-after: auto; }
            .content { margin-bottom: 40px; }
            .footer { position: absolute; bottom: 10px; left: 0; right: 0; text-align: center; font-size: 10pt; }
        </style>
    </head>
    <body>
    ${htmlPages}
    <script>
        const pages = document.querySelectorAll('.page');
        pages.forEach((page, index) => {
            const footer = document.createElement('div');
            footer.className = 'footer';
            footer.textContent = 'Page ' + (index + 1) + ' / ' + ${totalPages};
            page.appendChild(footer);
        });
    </script>
    </body>
    </html>
            `;

            // Créer le PDF
            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                width: 595,
                height: 842
            });

            const fileName = `dossier-${folder.reportNumber}-${folder.chantierName.replace(/\s+/g, '-')}.pdf`;

            // Partager le PDF
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: fileName,
                    UTI: 'com.adobe.pdf'
                });
                Alert.alert('Succès', 'PDF exporté avec succès');
            } else {
                Alert.alert('Erreur', 'Le partage n\'est pas disponible sur cet appareil');
            }
        } catch (err) {
            Alert.alert('Erreur', `Impossible d'exporter le PDF: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Charger toutes les dates contenant des dossiers pour marquage global du calendrier
    const loadFolderDates = async () => {
        try {
            const token = await Storage.getItem('token');
            if (!token) return;
            const url = `${API_BASE_URL}/folders/dates?city=${city}&building=${building}&task=${task}`;
            const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success && Array.isArray(response.data.dates)) {
                setDatesWithFolders(response.data.dates);
            }
        } catch (e) {
            // Fallback silencieux: récupérer tous les dossiers et en déduire les dates
            try {
                const token = await Storage.getItem('token');
                if (!token) return;
                const urlAll = `${API_BASE_URL}/folders?city=${city}&building=${building}&task=${task}&startDate=${formatLocalDate(selectedDate)}`;
                const respAll = await axios.get(urlAll, { headers: { Authorization: `Bearer ${token}` } });
                if (respAll.data.success && Array.isArray(respAll.data.folders)) {
                    const set = new Set();
                    respAll.data.folders.forEach(f => {
                        if (f.startDate) {
                            const d = moment(f.startDate).format('YYYY-MM-DD');
                            set.add(d);
                        }
                    });
                    setDatesWithFolders(Array.from(set));
                }
            } catch {}
        }
    };

    // Charger les dossiers au montage et quand la date change
    useEffect(() => {
        loadFolders();
        loadFolderDates();
    }, [city, building, task, selectedDate]);

    return (
        <ScreenWrapper>
            <SafeAreaView style={styles.container}>
                <KeyboardAwareScrollView
                    contentContainerStyle={styles.contentContainer}
                    enableOnAndroid={true}
                    enableAutomaticScroll={false}
                    extraScrollHeight={20}
                    keyboardShouldPersistTaps="handled"
                    enableResetScrollToCoords={false}
                    scrollEnabled={scrollEnabled}
                >
                    {/* Calendrier */}
                    <View style={styles.calendarContainer}>
                        {displayCalendarScreen(selectedDate, setSelectedDate, datesWithFolders)}
                    </View>

                    {/* Titre de la section ou message si vide */}
                    {folders.length > 0 ? (
                        <Text style={styles.sectionTitle}>Rapport photo :</Text>
                    ) : (
                        <Text style={styles.emptyMessage}>Aucun rapport photo pour ce jour là</Text>
                    )}

                    {/* Liste des dossiers */}
                    {folders.map((folder) => {
                        const isExpanded = expandedFolders[folder._id] || false;
                        const photos = folderPhotos[folder._id] || [];
                        const displayedPhotos = isExpanded ? photos : photos.slice(0, 2);
                        const hasMore = photos.length > 2;

                        return (
                            <View key={folder._id} style={styles.folderCard}>
                                {/* Header du dossier */}
                                <View style={styles.folderHeader}>
                                    <View style={styles.folderTitleContainer}>
                                        <Text style={styles.folderNumber}>📁 Dossier #{folder.reportNumber}</Text>
                                        <Text style={styles.folderTitle}>{folder.chantierName}</Text>
                                        <Text style={styles.folderSubtitle}>{folder.company}</Text>
                                    </View>
                                    {canDelete() && (
                                        <TouchableOpacity
                                            style={styles.deleteFolderBtn}
                                            onPress={() => editFolder(folder)}
                                        >
                                            <Text style={styles.deleteFolderText}>✏️</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Photos du dossier */}
                                {displayedPhotos.map((photo, idx) => {
                                    return (
                                    <View key={photo._id} style={styles.photoCard}>
                                        <View style={styles.imageRow}>
                                            <View style={styles.imageWrapper}>
                                                <Text style={styles.imageLabel}>Avant</Text>
                                                <Image
                                                    source={{ uri: photo.imageAvant }}
                                                    style={styles.image}
                                                />
                                            </View>
                                            <View style={styles.imageWrapper}>
                                                <Text style={styles.imageLabel}>Après</Text>
                                                {photo.imageApres ? (
                                                    <Image
                                                        source={{ uri: photo.imageApres }}
                                                        style={styles.image}
                                                    />
                                                ) : (
                                                    <TouchableOpacity
                                                        style={styles.imagePlaceholder}
                                                        onPress={() => addPhotoApresExisting(photo._id, folder._id)}
                                                    >
                                                        <Text style={styles.imagePlaceholderIcon}>＋</Text>
                                                        <Text style={styles.imagePlaceholderText}>Ajouter une photo</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                        {canDelete() && (
                                            <TouchableOpacity
                                                style={styles.deletePhotoBtn}
                                                onPress={() => deletePhoto(photo._id, folder._id)}
                                            >
                                                <Text style={styles.deletePhotoText}>Supprimer cette paire</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    );
                                })}

                                {/* Bouton voir plus/moins */}
                                {!isExpanded && hasMore && (
                                    <TouchableOpacity
                                        style={styles.seeMoreButton}
                                        onPress={() => setExpandedFolders(prev => ({ ...prev, [folder._id]: true }))}
                                    >
                                        <Text style={styles.seeMoreText}>Voir {photos.length - 2} de plus...</Text>
                                    </TouchableOpacity>
                                )}
                                {isExpanded && hasMore && (
                                    <TouchableOpacity
                                        style={styles.seeMoreButton}
                                        onPress={() => setExpandedFolders(prev => ({ ...prev, [folder._id]: false }))}
                                    >
                                        <Text style={styles.seeMoreText}>Voir moins</Text>
                                    </TouchableOpacity>
                                )}

                                {/* Bouton ajouter photos */}
                                <TouchableOpacity
                                    style={styles.addPhotosBtn}
                                    onPress={() => {
                                        setSelectedFolder(folder);
                                        setShowPhotoModal(true);
                                    }}
                                >
                                    <Text style={styles.addPhotosBtnText}>📸 Ajouter photos avant/après</Text>
                                </TouchableOpacity>

                                {/* Bouton exporter en PDF (sauf nettoyeur) */}
                                {photos.length > 0 && userRole !== 'nettoyeur' && (
                                    <TouchableOpacity
                                        style={styles.exportButton}
                                        onPress={() => exportToPDF(folder)}
                                        disabled={loading}
                                    >
                                        <Text style={styles.exportButtonText}>
                                            {loading ? 'Export en cours...' : '📄 Exporter en PDF'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}

                    {/* Bouton créer un nouveau dossier */}
                    {!showFolderForm && canAddItem('Rapport Photo') && (
                        <TouchableOpacity
                            style={styles.toggleCircle}
                            onPress={() => setShowFolderForm(true)}
                        >
                            <Text style={styles.toggleCircleText}>＋</Text>
                        </TouchableOpacity>
                    )}
                </KeyboardAwareScrollView>

                {/* Modal formulaire création dossier */}
                <Modal
                    visible={showFolderForm}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => {
                        setShowFolderForm(false);
                        setEditingFolder(null);
                        setForm({
                            intituleMission: '',
                            chantierName: city || '',
                            company: '',
                            mission: '',
                            startDate: new Date(),
                            endDate: null,
                        });
                    }}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContainer}
                    >
                        <TouchableOpacity
                            activeOpacity={1}
                            style={styles.overlayBackdrop}
                            onPress={() => {
                                setShowFolderForm(false);
                                setEditingFolder(null);
                                setForm({
                                    // intituleMission supprimé
                                    chantierName: city || '',
                                    company: '',
                                    mission: '',
                                    startDate: new Date(),
                                    endDate: null,
                                });
                            }}
                        />

                        <View style={styles.formCardOverlay}>
                            <ScrollView
                                contentContainerStyle={{ padding: 16, paddingBottom: 200 }}
                                keyboardShouldPersistTaps="always"
                                showsVerticalScrollIndicator={true}
                            >
                                <TouchableOpacity
                                    style={styles.closeFormBtn}
                                    onPress={() => {
                                        setShowFolderForm(false);
                                        setEditingFolder(null);
                                        setForm({
                                            // intituleMission supprimé
                                            chantierName: city || '',
                                            company: '',
                                            mission: '',
                                            startDate: new Date(),
                                            endDate: null,
                                        });
                                    }}
                                >
                                    <Text style={styles.closeFormText}>✕</Text>
                                </TouchableOpacity>

                                <Text style={styles.formTitle}>{editingFolder ? 'Modifier le Dossier' : 'Créer un nouveau dossier'}</Text>

                                {/* Champ Intitulé Mission supprimé */}

                                {/* Nom du chantier */}
                                <Text style={styles.label}>Nom du chantier :</Text>
                                <View style={{ position: 'relative' }}>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Ex: Chantier XYZ"
                                        placeholderTextColor="#999"
                                        value={form.chantierName}
                                        onChangeText={v => updateForm('chantierName', v)}
                                        returnKeyType="done"
                                        blurOnSubmit={false}
                                    />
                                </View>

                                {/* Entreprise */}
                                <Text style={styles.label}>Promoteur :</Text>
                                <View style={{ position: 'relative' }}>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Ex: Promoteur X"
                                        placeholderTextColor="#999"
                                        value={form.company}
                                        onChangeText={v => updateForm('company', v)}
                                        autoCapitalize="characters"
                                        returnKeyType="done"
                                        enablesReturnKeyAutomatically={false}
                                                                                onFocus={() => setShowCompanySuggestions(true)}
                                                                                onBlur={() => setTimeout(() => setShowCompanySuggestions(false), 200)}
                                                                                onSubmitEditing={() => {
                                                                                    setShowCompanySuggestions(false);
                                                                                }}
                                        blurOnSubmit={false}
                                    />
                                    {showCompanySuggestions && companySuggestions.length > 0 && (
                                        <ScrollView
                                            style={styles.suggestionsContainer}
                                            nestedScrollEnabled={true}
                                            keyboardShouldPersistTaps="always"
                                        >
                                            {companySuggestions.map((suggestion, idx) => (
                                                <TouchableOpacity
                                                    key={idx}
                                                    style={styles.suggestionItem}
                                                    onPress={() => {
                                                        updateForm('company', suggestion);
                                                        setShowCompanySuggestions(false);
                                                    }}
                                                >
                                                    <Text style={styles.suggestionText}>{suggestion}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    )}
                                </View>

                                {/* Ville (lecture seule) */}
                                <Text style={styles.label}>Ville :</Text>
                                <Text style={styles.readOnlyText}>{city}</Text>

                                {/* Zone d'intervention (lecture seule) */}
                                <Text style={styles.label}>Zone d'intervention :</Text>
                                <Text style={styles.readOnlyText}>{building}</Text>

                                {/* Mission */}
                                <Text style={styles.label}>Mission (optionnel) :</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Mission"
                                    placeholderTextColor="#999"
                                    value={form.mission}
                                    onChangeText={v => updateForm('mission', v)}
                                    returnKeyType="done"
                                    blurOnSubmit={false}
                                />

                                {/* Date de début (pour l'instant on utilise la date actuelle) */}
                                <Text style={styles.label}>Date de début :</Text>
                                <Text style={styles.readOnlyText}>{form.startDate.toLocaleDateString('fr-FR')}</Text>

                                {/* Date de fin (optionnel) */}
                                <Text style={styles.label}>Date de fin (optionnel) :</Text>
                                <Text style={styles.readOnlyText}>{form.endDate ? form.endDate.toLocaleDateString('fr-FR') : 'Non définie'}</Text>

                                {/* Bouton Créer */}
                                <TouchableOpacity
                                    style={styles.validateButton}
                                    onPress={createFolder}
                                    disabled={loading}
                                >
                                    <Text style={styles.validateText}>{loading ? (editingFolder ? 'Modification...' : 'Création...') : (editingFolder ? 'Modifier le dossier' : 'Créer le dossier')}</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* Modal ajout de photos */}
                <Modal
                    visible={showPhotoModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowPhotoModal(false)}
                >
                    <View style={styles.modalContainer}>
                        <TouchableOpacity
                            activeOpacity={1}
                            style={styles.overlayBackdrop}
                            onPress={() => setShowPhotoModal(false)}
                        />

                        <View style={styles.photoModalCard}>
                            <TouchableOpacity
                                style={styles.closeFormBtn}
                                onPress={() => setShowPhotoModal(false)}
                            >
                                <Text style={styles.closeFormText}>✕</Text>
                            </TouchableOpacity>

                            <Text style={styles.formTitle}>Ajouter des photos</Text>
                            <Text style={styles.formSubtitle}>Dossier #{selectedFolder?.reportNumber}</Text>


                            {/* Ajout multiple photos avant */}
                            <Text style={styles.label}>Photos Avant :</Text>
                            <TouchableOpacity
                                style={styles.photoButton}
                                onPress={() => openImageSourceModalList('avant')}
                            >
                                <Text style={styles.photoButtonText}>＋ Ajouter une photo avant</Text>
                            </TouchableOpacity>
                            {/* Affichage de la liste des photos avant/après */}
                            {photoFormList.length === 0 ? (
                                <Text style={{ textAlign: 'center', marginVertical: 20, color: '#999' }}>Aucune photo avant ajoutée.</Text>
                            ) : (
                                <ScrollView style={{ maxHeight: 400 }}>
                                    {photoFormList.map((item, idx) => (
                                        <View key={idx} style={styles.photoPreviewCard}>
                                            <View style={styles.photoPreviewRow}>
                                                {/* Photo Avant */}
                                                <View style={styles.photoPreviewWrapper}>
                                                    <Text style={styles.photoPreviewLabel}>Avant</Text>
                                                    <Image
                                                        source={{ uri: item.avant }}
                                                        style={styles.photoPreviewImage}
                                                    />
                                                </View>

                                                {/* Photo Après ou Placeholder */}
                                                <View style={styles.photoPreviewWrapper}>
                                                    <Text style={styles.photoPreviewLabel}>Après</Text>
                                                    {item.apres ? (
                                                        <Image
                                                            source={{ uri: item.apres }}
                                                            style={styles.photoPreviewImage}
                                                        />
                                                    ) : (
                                                        <TouchableOpacity
                                                            style={styles.photoPlaceholder}
                                                            onPress={() => addPhotoApres(idx)}
                                                        >
                                                            <Text style={styles.photoPlaceholderIcon}>＋</Text>
                                                            <Text style={styles.photoPlaceholderText}>Ajouter une photo</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}

                            {/* Bouton Ajouter */}
                            <TouchableOpacity
                                style={styles.validateButton}
                                onPress={addPhotosToFolder}
                                disabled={loading}
                            >
                                <Text style={styles.validateText}>{loading ? 'Ajout...' : 'Ajouter les photos'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Modal d'aperçu photo en plein écran avec galerie */}
                <Modal
                    visible={showPreviewModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowPreviewModal(false)}
                >
                    <View style={styles.previewModalContainer}>
                        <TouchableOpacity
                            style={styles.previewCloseButton}
                            onPress={() => setShowPreviewModal(false)}
                        >
                            <Text style={styles.previewCloseText}>✕</Text>
                        </TouchableOpacity>
                        
                        {/* Image principale */}
                        <TouchableOpacity
                            activeOpacity={1}
                            style={styles.previewBackdrop}
                            onPress={() => setShowPreviewModal(false)}
                        >
                            {previewImage && (
                                <Image
                                    source={{ uri: previewImage }}
                                    style={styles.previewImage}
                                    resizeMode="contain"
                                />
                            )}
                        </TouchableOpacity>
                        
                        {/* Indicateur et galerie de miniatures */}
                        {previewFolderPhotos.length > 0 && (
                            <View style={styles.previewGalleryContainer}>
                                <Text style={styles.previewPhotoCounter}>
                                    {currentPhotoIndex + 1} / {previewFolderPhotos.length}
                                </Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.previewThumbnailsScroll}
                                    contentContainerStyle={styles.previewThumbnailsContent}
                                >
                                    {previewFolderPhotos.map((photo, idx) => (
                                        <TouchableOpacity
                                            key={idx}
                                            style={[
                                                styles.previewThumbnail,
                                                idx === currentPhotoIndex && styles.previewThumbnailActive
                                            ]}
                                            onPress={() => {
                                                setPreviewImage(photo.uri);
                                                setCurrentPhotoIndex(idx);
                                            }}
                                        >
                                            <Image
                                                source={{ uri: photo.uri }}
                                                style={styles.previewThumbnailImage}
                                            />
                                            <Text style={styles.previewThumbnailLabel}>{photo.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                </Modal>
            </SafeAreaView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    previewModalContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.97)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
        },
        previewBackdrop: {
            flex: 1,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
        },
        previewImage: {
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            resizeMode: 'contain',
        },
        previewCloseButton: {
            position: 'absolute',
            top: 40,
            right: 20,
            zIndex: 10001,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 20,
            padding: 8,
        },
        previewCloseText: {
            color: '#fff',
            fontSize: 28,
            fontWeight: 'bold',
        },
        previewGalleryContainer: {
            width: '100%',
            height: 120,
            backgroundColor: 'rgba(0,0,0,0.8)',
            paddingVertical: 12,
            paddingHorizontal: 8,
            borderTopWidth: 1,
            borderTopColor: '#444',
        },
        previewPhotoCounter: {
            color: '#fff',
            fontSize: 14,
            textAlign: 'center',
            marginBottom: 8,
            fontWeight: '600',
        },
        previewThumbnailsScroll: {
            flex: 1,
            height: 100,
        },
        previewThumbnailsContent: {
            paddingHorizontal: 8,
            gap: 8,
        },
        previewThumbnail: {
            alignItems: 'center',
            marginRight: 8,
            borderWidth: 2,
            borderColor: 'transparent',
            borderRadius: 8,
            padding: 4,
            backgroundColor: 'rgba(255,255,255,0.1)',
        },
        previewThumbnailActive: {
            borderColor: '#f26463',
            backgroundColor: 'rgba(242, 100, 99, 0.2)',
        },
        previewThumbnailImage: {
            width: 70,
            height: 70,
            borderRadius: 6,
        },
        previewThumbnailLabel: {
            color: '#fff',
            fontSize: 10,
            marginTop: 4,
            fontWeight: '500',
        },
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    contentContainer: { padding: 16 },
    calendarContainer: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        marginTop: 8,
    },
    emptyMessage: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginVertical: 32,
        fontStyle: 'italic',
    },

    // Styles pour les dossiers
    folderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#f26463',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    folderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 12,
    },
    folderTitleContainer: {
        flex: 1,
    },
    folderNumber: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    folderTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#414248',
        marginBottom: 4,
    },
    folderSubtitle: {
        fontSize: 14,
        color: '#f26463',
        fontWeight: '500',
    },
    deleteFolderBtn: {
        padding: 8,
    },
    deleteFolderText: {
        fontSize: 20,
    },

    // Styles pour les photos dans un dossier
    photoCard: {
        marginBottom: 12,
        padding: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    imageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    imageWrapper: {
        width: '48%',
        alignItems: 'center',
    },
    imageLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
        color: '#666',
    },
    image: {
        width: '100%',
        height: 120,
        borderRadius: 8,
    },
    imagePlaceholder: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#2196f3',
        borderStyle: 'dashed',
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderIcon: {
        fontSize: 28,
        color: '#2196f3',
        marginBottom: 4,
    },
    imagePlaceholderText: {
        fontSize: 11,
        color: '#2196f3',
        fontWeight: '600',
        textAlign: 'center',
    },
    deletePhotoBtn: {
        backgroundColor: '#ff6b6b',
        padding: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    deletePhotoText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },

    addPhotosBtn: {
        backgroundColor: '#4caf50',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    addPhotosBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },

    exportButton: {
        backgroundColor: '#2196f3',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    exportButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },

    seeMoreButton: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 8,
    },
    seeMoreText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },

    toggleCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f26463',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 24,
        elevation: 5,
    },
    toggleCircleText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '600',
    },

    // Modal styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    formCardOverlay: {
        width: '92%',
        backgroundColor: '#fff',
        borderRadius: 12,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },
    photoModalCard: {
        width: '92%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },
    closeFormBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    closeFormText: {
        fontSize: 20,
        color: '#666',
        fontWeight: 'bold',
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#414248',
        marginBottom: 8,
        textAlign: 'center',
    },
    formSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 12,
        color: '#333',
    },
    textInput: {
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 10,
        fontSize: 14,
    },
    readOnlyText: {
        marginTop: 4,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
        fontSize: 14,
        color: '#666',
    },
    photoButton: {
        backgroundColor: '#f26463',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 8,
    },
    photoButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    preview: {
        marginTop: 8,
        width: '100%',
        height: 150,
        borderRadius: 8,
    },
    validateButton: {
        marginTop: 20,
        backgroundColor: '#4caf50',
        padding: 14,
        borderRadius: 6,
        alignItems: 'center',
    },
    validateText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },

    // Suggestions d'autocomplétion
    suggestionsContainer: {
        position: 'absolute',
        top: 42,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderTopWidth: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        maxHeight: 150,
        zIndex: 10000,
        elevation: 8,
    },
    suggestionItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e8e8e8',
    },
    suggestionText: {
        fontSize: 14,
        color: '#333',
    },

    // Styles pour l'aperçu des photos avant/après dans le modal
    photoPreviewCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 12,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    photoPreviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    photoPreviewWrapper: {
        width: '48%',
        alignItems: 'center',
    },
    photoPreviewLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    photoPreviewImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
    },
    removePhotoButton: {
        marginTop: 6,
        paddingVertical: 4,
        paddingHorizontal: 12,
        backgroundColor: '#ff6b6b',
        borderRadius: 6,
    },
    removePhotoText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    photoPlaceholder: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#2196f3',
        borderStyle: 'dashed',
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoPlaceholderIcon: {
        fontSize: 32,
        color: '#2196f3',
        marginBottom: 4,
    },
    photoPlaceholderText: {
        fontSize: 12,
        color: '#2196f3',
        fontWeight: '600',
        textAlign: 'center',
    },

    // Styles pour le modal d'aperçu photo
    previewModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewBackdrop: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '90%',
        height: '80%',
    },
    previewCloseButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewCloseText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
});
