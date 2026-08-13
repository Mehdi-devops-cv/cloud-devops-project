import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Platform } from 'react-native';

export default function MobileBreadcrumb({ segments = [], navigation, onNavigate, currentCity, currentBuilding }) {
  const [visible, setVisible] = useState(false);
  const [activeItems, setActiveItems] = useState([]);
  const [activeLabel, setActiveLabel] = useState('');
  const [stack, setStack] = useState([]); // stack of { label, items }

  const openMenu = (segment) => {
    const items = segment.items || [];
    console.log('🔍 Opening menu for segment:', segment.label, 'Items count:', items.length, 'Items:', items.map(i => i.label));
    if (!items || items.length === 0) return;
    
    // push current menu to stack
    setStack((s) => [...s, { label: segment.label || '', items }]);
    setActiveItems(items);
    setActiveLabel(segment.label || '');
    setVisible(true);
  };

  const handleSelect = (item) => {
    const children = item.children || item.items || [];
    
    // Si l'item a une route, c'est une tâche - naviguer directement
    if (item.route) {
      setVisible(false);
      setStack([]);
      if (navigation && typeof navigation.replace === 'function') {
        navigation.replace(item.route, item.params || {});
      }
      return;
    }
    
    // Si on est au niveau 1 du stack
    if (stack.length === 1) {
      // Si l'item a des children ET que le premier child n'a pas de route, c'est une ville
      const firstChild = children && children.length > 0 ? children[0] : null;
      const isCity = firstChild && !firstChild.route;
      
      if (isCity) {
        console.log('🏢 Navigating to Chantier with city:', item.label);
        setVisible(false);
        setStack([]);
        if (navigation && typeof navigation.navigate === 'function') {
          navigation.navigate('Chantier', { city: item.label });
        }
        return;
      }
      
      // Sinon c'est un bâtiment - utiliser currentCity comme ville
      const cityLabel = currentCity || '';
      console.log('🏢 Navigation from breadcrumb - currentCity:', currentCity, 'building:', item.label);
      console.log('🏢 Navigating to Batiment with city:', cityLabel, 'building:', item.label);
      setVisible(false);
      setStack([]);
      if (navigation && typeof navigation.navigate === 'function') {
        navigation.navigate('Batiment', { 
          city: cityLabel, 
          building: item.label
        });
      }
      return;
    }
    
    // Si on a des enfants, on continue à naviguer dans les menus
    if (children && children.length > 0) {
      setStack((s) => [...s, { label: item.label || '', items: children }]);
      setActiveItems(children);
      setActiveLabel(item.label || '');
      return;
    }

    // Selection finale
    setVisible(false);
    setStack([]);
    if (onNavigate) onNavigate(item);
  };

  const handleBack = () => {
    // pop stack
    setStack((s) => {
      if (!s || s.length <= 1) {
        // closing
        setVisible(false);
        setActiveItems([]);
        setActiveLabel('');
        return [];
      }
      const next = s.slice(0, -1);
      const top = next[next.length - 1];
      setActiveItems(top.items || []);
      setActiveLabel(top.label || '');
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {segments.map((s, idx) => (
          <TouchableOpacity
            key={`${s.label}-${idx}`}
            onPress={() => openMenu(s)}
            activeOpacity={s.items && s.items.length > 0 ? 0.7 : 1}
            style={styles.segment}
          >
            <Text style={styles.segmentText}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => { setVisible(false); setStack([]); }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              {stack.length > 1 ? (
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                  <Text style={styles.backText}>‹ Retour</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.backPlaceholder} />
              )}
              <Text style={styles.modalTitle}>{activeLabel ? `Choisir — ${activeLabel}` : 'Choisir'}</Text>
              <TouchableOpacity onPress={() => { setVisible(false); setStack([]); }} style={styles.closeIcon}>
                <Text style={styles.closeIconText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={activeItems}
              keyExtractor={(i, idx) => `${i.label || i.route || idx}-${idx}`}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleSelect(item)}>
                  <Text style={styles.modalItemText}>{item.label || item.route}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 12, backgroundColor: '#fff', marginTop: 20 },
  row: { flexDirection: 'row' },
  segment: { marginRight: 16 },
  segmentText: { color: '#7b7c7e', fontSize: 15, fontWeight: '600' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    maxHeight: '70%',
    width: '100%',
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  backText: { color: '#007aff' },
  backPlaceholder: { width: 56 },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  closeIcon: { paddingHorizontal: 8, paddingVertical: 6 },
  closeIconText: { color: '#f26463', fontWeight: '700' },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalItemText: { fontSize: 15 },
});

