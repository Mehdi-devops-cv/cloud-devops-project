// Note.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
  PanResponder,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import 'moment/locale/fr';
import axios from 'axios';
import Storage from '../utils/Storage';
import { Ionicons } from '@expo/vector-icons';

import ScreenWrapper from '../Controleur/ScreenWrapper';
import { displayCalendarScreen } from './Components/Calendar';
import { useUserRole } from '../Controleur/UserRoleContext';
import { API_BASE_URL } from '../config';

moment.locale('fr');

// Fonction helper pour formater une date en YYYY-MM-DD (heure locale)
const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function Note({ route, navigation }) {
  const { city, building, task } = route.params || {};
  const scrollViewRef = useRef(null);
  const { canAddItem, canDelete } = useUserRole();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [swipedNoteId, setSwipedNoteId] = useState(null);
  const [form, setForm] = useState({
    floor: '',
    apartment: '',
    company: '',
    open: true,
    closed: false,
    openTime: '',
    closedTime: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // Suggestions pour autocomplete
  const [floorSuggestions, setFloorSuggestions] = useState([]);
  const [apartmentSuggestions, setApartmentSuggestions] = useState([]);
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [showFloorSuggestions, setShowFloorSuggestions] = useState(false);
  const [showApartmentSuggestions, setShowApartmentSuggestions] = useState(false);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);

  const updateForm = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleToggleOpen = v => {
    updateForm('open', v);
    updateForm('openTime', v ? moment().format('HH:mm') : '');
  };
  const handleToggleClosed = v => {
    updateForm('closed', v);
    updateForm('closedTime', v ? moment().format('HH:mm') : '');
  };

  // Charger l'historique des valeurs saisies
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const floorHistory = await AsyncStorage.getItem('note_floor_history');
        const apartmentHistory = await AsyncStorage.getItem('note_apartment_history');
        const companyHistory = await AsyncStorage.getItem('note_company_history');

        if (floorHistory) {
          const floors = JSON.parse(floorHistory);
          setFloorSuggestions(floors.sort((a, b) => {
            const numA = parseInt(a) || 0;
            const numB = parseInt(b) || 0;
            return numA - numB;
          }));
        }
        if (apartmentHistory) {
          const apartments = JSON.parse(apartmentHistory);
          setApartmentSuggestions(apartments.sort((a, b) => {
            const numA = parseInt(a) || 0;
            const numB = parseInt(b) || 0;
            return numA - numB;
          }));
        }
        if (companyHistory) {
          const companies = JSON.parse(companyHistory);
          setCompanySuggestions(companies.sort());
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };
    loadHistory();
  }, []);

  // Charger les notes
  useEffect(() => {
    loadNotes();
  }, [selectedDate]);

  // Refresh automatique quand la page devient active
  useFocusEffect(
    useCallback(() => {
      loadNotes();
      loadNoteDates();
    }, [selectedDate])
  );

  // Quand le formulaire s'ouvre, désactiver scroll du fond
  useEffect(() => {
    if (showForm) {
      setScrollEnabled(false);
      // Initialiser openTime si vide
      setForm(prev => ({
        ...prev,
        open: true,
        openTime: prev.openTime || moment().format('HH:mm'),
        closed: false,
        closedTime: '',
      }));
    } else {
      setScrollEnabled(true);
    }
  }, [showForm]);

  // Fonction pour charger les notes depuis l'API
  const loadNotes = async () => {
    try {
      setLoading(true);
      const token = await Storage.getItem('token');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté');
        return;
      }

      const dateStr = formatLocalDate(selectedDate);
      const response = await axios.get(`${API_BASE_URL}/notes?city=${city}&building=${building}&task=${task}&selectedDate=${dateStr}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setNotes(response.data.notes.map(note => ({
          id: note._id,
          label: note.company,
          floor: note.floor,
          apartment: note.apartment,
          openTime: note.openTime,
          closedTime: note.closedTime,
        })));
      }
    } catch (err) {
      console.error('Error loading notes:', err);
      Alert.alert('Erreur', 'Impossible de charger les notes');
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    try {
      setLoading(true);
      const token = await Storage.getItem('token');
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté');
        return;
      }

      const noteData = {
        city,
        building,
        task,
        floor: form.floor,
        apartment: form.apartment,
        company: form.company,
        openTime: form.openTime,
        closedTime: form.closedTime,
        selectedDate: formatLocalDate(selectedDate), // Format YYYY-MM-DD
      };

      const response = await axios.post(`${API_BASE_URL}/notes`, noteData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Sauvegarder dans l'historique
        const updateHistory = async (key, value, suggestions, setSuggestions) => {
          const newSuggestions = [...suggestions];
          if (!newSuggestions.includes(value)) {
            newSuggestions.push(value);
            await AsyncStorage.setItem(key, JSON.stringify(newSuggestions));

            // Trier les suggestions
            if (key.includes('floor') || key.includes('apartment')) {
              setSuggestions(newSuggestions.sort((a, b) => {
                const numA = parseInt(a) || 0;
                const numB = parseInt(b) || 0;
                return numA - numB;
              }));
            } else {
              setSuggestions(newSuggestions.sort());
            }
          }
        };

        if (form.floor.trim()) {
          await updateHistory('note_floor_history', form.floor, floorSuggestions, setFloorSuggestions);
        }
        if (form.apartment.trim()) {
          await updateHistory('note_apartment_history', form.apartment, apartmentSuggestions, setApartmentSuggestions);
        }
        if (form.company.trim()) {
          await updateHistory('note_company_history', form.company, companySuggestions, setCompanySuggestions);
        }

        // Ajouter la nouvelle note à l'état local
        setNotes(prev => [
          {
            id: response.data.note._id,
            label: form.company,
            floor: form.floor,
            apartment: form.apartment,
            openTime: form.openTime,
            closedTime: form.closedTime,
          },
          ...prev,
        ]);

        // Réinitialiser le formulaire complètement
        setForm({
          floor: '',
          apartment: '',
          company: '',
          open: true,
          closed: false,
          openTime: '',
          closedTime: '',
        });
        setShowForm(false);
        // Rafraîchir les dates marquées pour le calendrier
        loadNoteDates();
      }
    } catch (err) {
      console.error('Error adding note:', err);
      Alert.alert('Erreur', 'Impossible d\'ajouter la note');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une note
  const deleteNote = async (noteId) => {
    Alert.alert(
      'Supprimer la note',
      'Êtes-vous sûr de vouloir supprimer cette note ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const token = await Storage.getItem('token');
              if (!token) {
                Alert.alert('Erreur', 'Vous devez être connecté');
                return;
              }

              const response = await axios.delete(`${API_BASE_URL}/notes/${noteId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.data.success) {
                // Supprimer la note de l'état local
                setNotes(prev => prev.filter(note => note.id !== noteId));
                // Rafraîchir les dates marquées pour le calendrier
                loadNoteDates();
              }
            } catch (err) {
              console.error('Error deleting note:', err);
              Alert.alert('Erreur', 'Impossible de supprimer la note');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Fermer une note (ajouter l'heure de fermeture)
  const closeNote = async (noteId) => {
    const currentTime = moment().format('HH:mm');

    Alert.alert(
      'Fermer la note',
      `Voulez-vous fermer cette note à ${currentTime} ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              setLoading(true);
              const token = await Storage.getItem('token');
              if (!token) {
                Alert.alert('Erreur', 'Vous devez être connecté');
                return;
              }

              const response = await axios.put(
                `${API_BASE_URL}/notes/${noteId}`,
                { closedTime: currentTime },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (response.data.success) {
                // Mettre à jour la note dans l'état local
                setNotes(prev =>
                  prev.map(note =>
                    note.id === noteId
                      ? { ...note, closedTime: currentTime }
                      : note
                  )
                );
                Alert.alert('Succès', 'Note fermée avec succès');
              }
            } catch (err) {
              console.error('Error closing note:', err);
              Alert.alert('Erreur', `Impossible de fermer la note: ${err.response?.data?.message || err.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Charger les notes au montage du composant et quand la date change
  useEffect(() => {
    loadNotes();
  }, [city, building, task, selectedDate]);

  // Charger toutes les dates contenant des notes pour marquage global du calendrier
  const [noteDates, setNoteDates] = useState([]);
  const loadNoteDates = async () => {
    try {
      const token = await Storage.getItem('token');
      if (!token) return;
      const url = `${API_BASE_URL}/notes/dates?city=${city}&building=${building}&task=${task}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success && Array.isArray(response.data.dates)) {
        setNoteDates(response.data.dates);
      }
    } catch (e) {
      // Fallback silencieux: récupérer toutes les notes et en déduire les dates
      try {
        const token = await Storage.getItem('token');
        if (!token) return;
        const urlAll = `${API_BASE_URL}/notes?city=${city}&building=${building}&task=${task}`;
        const respAll = await axios.get(urlAll, { headers: { Authorization: `Bearer ${token}` } });
        if (respAll.data.success && Array.isArray(respAll.data.notes)) {
          const set = new Set();
          respAll.data.notes.forEach(n => {
            if (n.selectedDate) {
              const d = moment(n.selectedDate).format('YYYY-MM-DD');
              set.add(d);
            }
          });
          setNoteDates(Array.from(set));
        }
      } catch {}
    }
  };

  useEffect(() => {
    loadNoteDates();
  }, [city, building, task]);

  // Liste des dates avec notes (YYYY-MM-DD)
  const datesWithNotes = noteDates;

  // Fonction pour fermer toutes les notes swipées
  const closeSwipedNotes = () => {
    setSwipedNoteId(null);
  };

  // Composant pour une note avec swipe
  const SwipeableNoteCard = ({ note, onDelete, onClose }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const isThisNoteSwipedLeft = swipedNoteId === note.id;
    const isNoteOpen = note.openTime && !note.closedTime;

    // Fermer automatiquement si une autre note est swipée
    useEffect(() => {
      if (swipedNoteId !== note.id && swipedNoteId !== null) {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
          tension: 150,
          friction: 8,
        }).start();
      }
    }, [swipedNoteId, note.id, translateX]);

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 3 &&
          Math.abs(gestureState.dy) < 30;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(translateX._value);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Vérifier que le mouvement reste principalement horizontal
        if (Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
          return; // Annuler si trop vertical
        }

        if (gestureState.dx < 0 && gestureState.dx > -80) { // Limiter le swipe
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();

        // Vérifier une dernière fois que c'était un swipe horizontal
        if (Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
          return;
        }

        // Juste marquer comme swipé si assez à gauche, sans animation
        const currentValue = translateX._value;
        if (currentValue < -30) {
          setSwipedNoteId(note.id);
        } else if (currentValue > -10) {
          setSwipedNoteId(null);
        }

        // Pas d'animation - reste où c'est !
      },
    });

    return (
      <View style={styles.swipeContainer}>
        {/* Bouton de suppression en arrière-plan - seulement pour admin */}
        {canDelete() && (
          <View style={styles.deleteButtonBackground}>
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Ionicons name="trash" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Note avec swipe */}
        <Animated.View
          style={[styles.noteCard, { transform: [{ translateX }], zIndex: 1 }]}
          {...panResponder.panHandlers}
        >
          {/* Badge Entreprise */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {note.label}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={isNoteOpen ? 0.7 : 1}
            onPress={() => isNoteOpen && onClose && onClose()}
            disabled={!isNoteOpen}
          >
            <View style={styles.noteContent}>
              <View style={styles.noteRow}>
                <Text style={styles.noteField}>
                  Étage : {note.floor}
                </Text>
                <Text style={styles.noteField}>
                  Apt : {note.apartment}
                </Text>
                <Text style={[styles.noteField, isNoteOpen && styles.openNoteHighlight]}>
                  Ouvert : {note.openTime || '-'}
                </Text>
                <Text style={styles.noteField}>
                  Fermé : {note.closedTime || '-'}
                </Text>
              </View>
              {isNoteOpen && (
                <View style={styles.tapHint}>
                  <Text style={styles.tapHintText}>Appuyez pour fermer</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.contentContainer}
          onTouchStart={closeSwipedNotes}
          enableOnAndroid={true}
          enableAutomaticScroll={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={scrollEnabled}
        >
          {/* Calendrier */}
          <View style={styles.calendarContainer}>
            {displayCalendarScreen(selectedDate, setSelectedDate, datesWithNotes)}
          </View>

          {/* Notes existantes */}
          {(() => {
            // Séparer les notes ouvertes, fermées et autres
            const openNotes = notes.filter(note => note.openTime && !note.closedTime);
            const closedNotes = notes.filter(note => note.closedTime);
            const otherNotes = notes.filter(note => !note.openTime && !note.closedTime);
            const totalNotes = notes.length;

            return (
              <>
                {/* Titre principal Notes */}
                {totalNotes > 0 ? (
                  <Text style={styles.sectionTitle}>Notes ({totalNotes})</Text>
                ) : (
                  <Text style={styles.emptyMessage}>Aucune note pour ce jour là</Text>
                )}

                {/* Section Notes Autres */}
                {otherNotes.length > 0 && (
                  <>
                    {otherNotes.map((note, idx) => (
                      <SwipeableNoteCard
                        key={note.id || idx}
                        note={note}
                        onDelete={() => deleteNote(note.id)}
                        onClose={() => closeNote(note.id)}
                      />
                    ))}
                  </>
                )}

                {/* Section Notes Ouvertes */}
                {openNotes.length > 0 && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionHeaderText}>📂 Ouvert ({openNotes.length})</Text>
                    </View>
                    {openNotes.map((note, idx) => (
                      <SwipeableNoteCard
                        key={note.id || idx}
                        note={note}
                        onDelete={() => deleteNote(note.id)}
                        onClose={() => closeNote(note.id)}
                      />
                    ))}
                  </>
                )}

                {/* Section Notes Fermées */}
                {closedNotes.length > 0 && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionHeaderText}>✅ Fermé ({closedNotes.length})</Text>
                    </View>
                    {closedNotes.map((note, idx) => (
                      <SwipeableNoteCard
                        key={note.id || idx}
                        note={note}
                        onDelete={() => deleteNote(note.id)}
                        onClose={() => closeNote(note.id)}
                      />
                    ))}
                  </>
                )}
              </>
            );
          })()}

          {/* Bouton "＋" cercle pour ouvrir */}
          {!showForm && canAddItem('Note') && (
            <TouchableOpacity
              style={styles.toggleCircle}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.toggleCircleText}>＋</Text>
            </TouchableOpacity>
          )}
        </KeyboardAwareScrollView>

        {/* Modal formulaire */}
        <Modal
          visible={showForm}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowForm(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            {/* Fond sombre cliquable pour fermer */}
            <TouchableOpacity
              activeOpacity={1}
              style={styles.overlayBackdrop}
              onPress={() => setShowForm(false)}
            />

            <View style={styles.formCardOverlay}>
              <ScrollView
                contentContainerStyle={{ padding: 16 }}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={true}
              >
                <TouchableOpacity style={styles.closeFormBtn} onPress={() => setShowForm(false)}>
                  <Text style={styles.closeFormText}>✕</Text>
                </TouchableOpacity>

                <Text style={styles.formTitle}>Nouvelle note</Text>

                {/* Ligne Étage/Appart */}
                <View style={styles.formRow}>
                  <View style={{ flex: 1, position: 'relative' }}>
                    <Text style={styles.label}>Étage</Text>
                    <TextInput
                      value={form.floor}
                      onChangeText={(v) => updateForm('floor', v)}
                      placeholder="Ex: 1"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      returnKeyType="done"
                      style={styles.textInput}
                      onFocus={() => setShowFloorSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowFloorSuggestions(false), 200)}
                      onSubmitEditing={() => setShowFloorSuggestions(false)}
                      blurOnSubmit={false}
                    />
                    {showFloorSuggestions && floorSuggestions.length > 0 && (
                      <ScrollView
                        style={styles.suggestionsContainer}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="always"
                        showsVerticalScrollIndicator={true}
                      >
                        {floorSuggestions.map((suggestion, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.suggestionItem}
                            activeOpacity={0.7}
                            onPress={() => {
                              updateForm('floor', suggestion);
                              setShowFloorSuggestions(false);
                            }}
                          >
                            <Text style={styles.suggestionText}>{suggestion}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>

                  <View style={{ flex: 1, marginLeft: 12, position: 'relative' }}>
                    <Text style={styles.label}>Appart</Text>
                    <TextInput
                      value={form.apartment}
                      onChangeText={(v) => updateForm('apartment', v)}
                      placeholder="Ex: 101"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      returnKeyType="done"
                      style={styles.textInput}
                      onFocus={() => setShowApartmentSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowApartmentSuggestions(false), 200)}
                      onSubmitEditing={() => setShowApartmentSuggestions(false)}
                      blurOnSubmit={false}
                    />
                    {showApartmentSuggestions && apartmentSuggestions.length > 0 && (
                      <ScrollView
                        style={styles.suggestionsContainer}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="always"
                        showsVerticalScrollIndicator={true}
                      >
                        {apartmentSuggestions.map((suggestion, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.suggestionItem}
                            activeOpacity={0.7}
                            onPress={() => {
                              updateForm('apartment', suggestion);
                              setShowApartmentSuggestions(false);
                            }}
                          >
                            <Text style={styles.suggestionText}>{suggestion}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                </View>

                {/* Champ Entreprise */}
                <View style={{ marginTop: 12, position: 'relative' }}>
                  <Text style={styles.label}>Entreprise</Text>
                  <TextInput
                    value={form.company}
                    onChangeText={(v) => updateForm('company', v)}
                    placeholder="Ex: HOPRA"
                    placeholderTextColor="#999"
                    autoCapitalize="characters"
                    returnKeyType="done"
                    enablesReturnKeyAutomatically={false}
                    style={[styles.textInput, { width: '100%' }]}
                    onFocus={() => setShowCompanySuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCompanySuggestions(false), 200)}
                    onSubmitEditing={() => {
                      setShowFloorSuggestions(false);
                      setShowApartmentSuggestions(false);
                      setShowCompanySuggestions(false);
                    }}
                    blurOnSubmit={false}
                  />
                  {showCompanySuggestions && companySuggestions.length > 0 && (
                    <ScrollView
                      style={styles.suggestionsContainer}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="always"
                      showsVerticalScrollIndicator={true}
                    >
                      {companySuggestions.map((suggestion, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.suggestionItem}
                          activeOpacity={0.7}
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

                {/* Switches */}
                <View style={styles.switchRow}>
                  <View style={styles.switchWrapper}>
                    <Text style={styles.switchLabel}>Ouvert</Text>
                    <Switch value={form.open} onValueChange={handleToggleOpen} />
                  </View>
                  <View style={styles.switchWrapper}>
                    <Text style={styles.switchLabel}>Fermé</Text>
                    <Switch value={form.closed} onValueChange={handleToggleClosed} />
                  </View>
                </View>

                {/* Boutons Actions */}
                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                    <Text style={styles.cancelText}>Annuler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.addButtonOverlay} onPress={addNote}>
                    <Text style={styles.addText}>Ajouter</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  contentContainer: { padding: 16 },

  calendarContainer: { marginBottom: 24 },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },

  emptyMessage: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginVertical: 32,
    fontStyle: 'italic',
  },

  sectionHeader: {
    backgroundColor: '#f26463',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  noteCard: {
    borderWidth: 1,
    borderColor: '#f26463',
    borderRadius: 30,
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    position: 'relative',
    overflow: 'visible',
  },
  badge: {
    position: 'absolute',
    top: -10,
    left: 16,
    backgroundColor: '#f26463',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 120,
    zIndex: 100,
    elevation: 10,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },

  noteContent: {
    marginTop: 10,
    paddingHorizontal: 8,
  },
  noteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  noteField: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#111',
    paddingHorizontal: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleCircleText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 28,
    fontWeight: '600',
  },

  // Styles pour le swipe-to-delete
  swipeContainer: {
    position: 'relative',
    marginTop: 20,
    marginBottom: 16,
    overflow: 'visible',
    borderRadius: 30,
  },
  deleteButtonBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 60,
    height: '100%',
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 0,
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  openNoteHighlight: {
    fontWeight: 'bold',
    color: '#f26463',
  },
  tapHint: {
    marginTop: 8,
    alignItems: 'center',
  },
  tapHintText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  formCardOverlay: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  closeFormBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeFormText: { fontSize: 20, color: '#333', fontWeight: '600' },

  formTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center', color: '#f26463' },

  formRow: { flexDirection: 'row', alignItems: 'center' },
    formRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' },
  label: { fontSize: 13, color: '#444', marginBottom: 6, fontWeight: '500' },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    backgroundColor: '#fff',
  },
  switchWrapper: { flexDirection: 'row', alignItems: 'center' },
  switchLabel: { marginRight: 8, fontSize: 14, color: '#333' },

  formActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 8,
  },
  cancelText: { color: '#666', fontSize: 15 },

  addButtonOverlay: {
    backgroundColor: '#f26463',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Suggestions dropdown
  suggestionsContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 180,
    zIndex: 10000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  suggestionText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '400',
  },
});
