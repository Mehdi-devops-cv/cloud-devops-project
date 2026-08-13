import React, { useState, useContext, useEffect } from 'react';
import MobileBreadcrumb from './MobileBreadcrumb';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import logo from '../assets/logo1.png';
import { LinearGradient } from 'expo-linear-gradient';
import { TabContext } from '../Controleur/TabContext';
import { API_BASE_URL } from '../config';

export default function Header({ isHomePage, city, building, task }) {
  console.log('Header rendu - isHomePage:', isHomePage, 'city:', city, 'building:', building, 'task:', task);
  const navigation = useNavigation();
  const { activeTab, setActiveTab } = useContext(TabContext);
  const [tabItems, setTabItems] = useState([]);
  const [cityItems, setCityItems] = useState([]);

  useEffect(() => {
    const items = [];
    if (city) items.push({ name: city });
    if (building) items.push({ name: building });
    if (task) items.push({ name: task });
    setTabItems(items);
  }, [city, building, task]);

  // Try to fetch a list of cities from the API to populate breadcrumb menus.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // fetch cities and buildings in parallel
        const [resCities, resBuildings] = await Promise.all([
          fetch(`${API_BASE_URL}/cities`),
          fetch(`${API_BASE_URL}/buildings`),
        ]);

        if (!mounted) return;

        const pages = ['Notes', 'Constatations', 'Effectifs'];

        let cities = [];
        if (resCities.ok) {
          const data = await resCities.json();
          // Accept both { cities: [...] } or direct array
          cities = Array.isArray(data.cities) ? data.cities : Array.isArray(data) ? data : data.cities || [];
        }

        let buildings = [];
        if (resBuildings.ok) {
          const dataB = await resBuildings.json();
          buildings = Array.isArray(dataB) ? dataB : dataB.buildings || [];
        }

        // Build nested structure: city -> buildings -> pages
        const mapped = (cities.length ? cities : [city, 'Saint Ouen', 'Paris 17eme'].filter(Boolean)).map((c) => {
          const cityName = c.name || c;
          console.log('🔍 Filtering buildings for city:', cityName);
          const bForCity = buildings.filter(b => {
            const matches = b.city && b.city === cityName;
            console.log('  Building:', b.name, 'City:', b.city, 'Matches:', matches);
            return matches;
          });

          const buildingNodes = (bForCity.length ? bForCity : []).map(b => {
            const bName = b.name || b.building || String(b);
            return {
              label: bName,
              children: pages.map(p => ({
                label: p,
                route: p === 'Notes' ? 'Note' : p === 'Constatations' ? 'Constatation' : 'Effectif',
                params: { city: cityName, building: bName, task: p },
              })),
            };
          });

          // Si aucun bâtiment n'est trouvé, créer un bâtiment par défaut
          const cityChildren = buildingNodes.length > 0 ? buildingNodes : [
            {
              label: 'Bâtiment par défaut',
              children: pages.map(p => ({
                label: p,
                route: p === 'Notes' ? 'Note' : p === 'Constatations' ? 'Constatation' : 'Effectif',
                params: { city: cityName, building: 'Bâtiment par défaut', task: p },
              })),
            }
          ];

          return { label: cityName, children: cityChildren };
        });

        setCityItems(mapped);
        return;
      } catch (e) {
        // ignore and fallback below
      }

      // fallback: build a small static list containing current city + examples
      const fallbackCities = [city, 'Saint Ouen', 'Paris 17eme'].filter(Boolean);
      const pages = ['Notes', 'Constatations', 'Effectifs'];
      setCityItems(fallbackCities.map((c) => ({
        label: c,
        children: pages.map(p => ({
          label: p,
          route: p === 'Notes' ? 'Note' : p === 'Constatations' ? 'Constatation' : 'Effectif',
          params: { city: c, task: p },
        })),
      })));
    })();
    return () => { mounted = false; };
  }, [city]);

  useEffect(() => {
    if (tabItems.length > 0 && !activeTab) {
      setActiveTab(tabItems[0].name);
    }
  }, [tabItems, activeTab, setActiveTab]);

  // Build breadcrumb segments from tabItems. Provide menus when possible.
  const segments = [];
  // City level
  if (tabItems.length > 0) {
    segments.push({ label: tabItems[0].name, items: cityItems });
  }
  // Building level (if present)
  if (tabItems.length > 1) {
    const currentCity = cityItems.find(c => c.label === tabItems[0].name);
    const buildingsForCity = currentCity?.children || [];
    segments.push({ label: tabItems[1].name, items: buildingsForCity });
  }
  // Task/last level: provide quick pages menu
  if (tabItems.length > 2) {
    segments.push({
      label: tabItems[2].name,
      items: [
        { label: 'Notes', route: 'Note', params: { city, building, task: 'Notes' } },
        { label: 'Constatations', route: 'Constatation', params: { city, building, task: 'Constatations' } },
        { label: 'Effectifs', route: 'Effectif', params: { city, building, task: 'Effectifs' } },
      ],
    });
  }

  const renderTabs = (items) => {
    return (
      <View style={styles.tabs}>
        {items.map(({ name }) => {
          const isActive = activeTab === name;

          return (
            <View key={name} style={styles.tabsItemWrapper}>
              <View style={styles.tabsItem}>
                <Text
                  style={[
                    styles.tabsItemText,
                    isActive && { color: '#F26463' },
                  ]}
                >
                  {name}
                </Text>
              </View>

              {isActive && <View style={styles.tabsItemLine} />}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={{position: 'relative'}}>
      <View style={styles.header}>
        {!isHomePage ? (
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" color="#414248" size={30} />
          </TouchableOpacity>
        ) : <View style={styles.headerButton} />}

        <View style={styles.logoContainer}>
          <Image
            source={logo}
            style={styles.logo}
          />
        </View>

        {!isHomePage ? (
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="search" color="#414248" size={30} />
          </TouchableOpacity>
        ) : <View style={styles.headerButton} />}
      </View>
      {/* Breadcrumb ou espace réservé selon la page */}
      {isHomePage ? (
        <View style={{height: 32, backgroundColor: '#fff'}} />
      ) : (
        <>
          <MobileBreadcrumb 
            segments={segments} 
            navigation={navigation} 
            currentCity={tabItems[0]?.name} 
            currentBuilding={tabItems[1]?.name}
          />
          {/* Ombre subtile avec LinearGradient */}
          <LinearGradient
            colors={["#fff", "#e5e5e5AA", "#fff0"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              height: 8,
              width: '100%',
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 24,
    // marginBottom supprimé pour coller le header au breadcrumb
    position: 'relative',
    backgroundColor: '#fff',
    // ombre supprimée ici
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 24,
    bottom: 0,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 80,
    resizeMode: 'contain',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  tabsItemWrapper: {
    marginRight: 28,
  },
  tabsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  tabsItemText: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 20,
    color: '#7b7c7e',
  },
  tabsItemLine: {
    width: 20,
    height: 3,
    backgroundColor: '#f26463',
    borderRadius: 24,
  },
});
