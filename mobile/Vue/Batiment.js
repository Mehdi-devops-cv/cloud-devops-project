import React, { useContext, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenWrapper from '../Controleur/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { TabContext } from '../Controleur/TabContext';
import { useUserRole } from '../Controleur/UserRoleContext';

const allSections = [
    { name: 'Notes', icon: 'note', route: 'Note', task: 'Note' },
    { name: 'Constatations', icon: 'assignment', route: 'Constatation', task: 'Constatations' },
    { name: 'Rapport Photo', icon: 'photo-camera', route: 'RapportPhoto', task: 'Rapport Photo' },
    { name: 'Effectifs', icon: 'people', route: 'Effectif', task: 'Effectif' },
    { name: 'Remarques', icon: 'comment', route: 'Remarque', task: 'Remarques' },
];

const Card = ({ name, icon, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <MaterialIcons name={icon} size={40} color="#414248" />
        <Text style={styles.cardText}>{name}</Text>
    </TouchableOpacity>
);

export default function Batiment({ route, navigation }) {
    const { city, building } = route.params || {};
    const { setActiveTab } = useContext(TabContext);
    const { canViewTask } = useUserRole();

    // Filtrer les sections selon le rôle de l'utilisateur
    const sections = allSections.filter(section => canViewTask(section.task));

    useEffect(() => {
        if (building) {
            setActiveTab(building);
        }
    }, [building, setActiveTab]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (building) {
                setActiveTab(building);
            }
        });

        return unsubscribe;
    }, [navigation, building, setActiveTab]);

    return (
        <ScreenWrapper>
            <SafeAreaView style={styles.container}>
                <View style={styles.contentContainer}>
                    <ScrollView>
                        <View style={styles.cardList}>
                            {sections.map((section, index) => (
                                <Card
                                    key={index}
                                    name={section.name}
                                    icon={section.icon}
                                    onPress={() => {
                                        setActiveTab(section.task);
                                        navigation.navigate(section.route, {
                                            city,
                                            building,
                                            task: section.task
                                        });
                                    }}
                                />
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    cardList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 20,
    },
    card: {
        width: '48%',
        marginBottom: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardText: {
        fontSize: 18,
        fontFamily: 'Quicksand-Bold',
        color: '#414248',
        textAlign: 'center',
        marginTop: 8,
    },
});
