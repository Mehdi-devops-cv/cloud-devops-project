import React, { createContext, useState, useContext, useEffect } from 'react';
import Storage from '../utils/Storage';

const UserRoleContext = createContext();

export const UserRoleProvider = ({ children }) => {
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserRole();
    }, []);

    const loadUserRole = async () => {
        try {
            const role = await Storage.getItem('userRole');
            setUserRole(role || 'user');
        } catch (error) {
            console.error('Error loading user role:', error);
            setUserRole('user');
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (role) => {
        try {
            await Storage.setItem('userRole', role);
            setUserRole(role);
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const clearUserRole = async () => {
        try {
            await Storage.removeItem('userRole');
            setUserRole(null);
        } catch (error) {
            console.error('Error clearing user role:', error);
        }
    };

    // Permissions basées sur le rôle
    const canViewTask = (task) => {
        if (!userRole) return false;

        // Admin peut tout voir
        if (userRole === 'admin') return true;

        // Nettoyeur ne peut pas voir Note et Effectif
        if (userRole === 'nettoyeur') {
            return !['Note', 'Effectif'].includes(task);
        }

        // Homme clé ne peut pas voir Rapport Photo
        if (userRole === 'hommeclé') {
            return task !== 'Rapport Photo';
        }

        // Pilote peut tout voir
        if (userRole === 'pilote') return true;

        // User par défaut peut tout voir
        return true;
    };

    const canAddItem = (task) => {
        if (!userRole) return false;

        // Admin peut tout ajouter
        if (userRole === 'admin') return true;

        // Remarques: seuls pilote et admin peuvent ajouter
        if (task === 'Remarques') {
            return userRole === 'pilote' || userRole === 'admin';
        }

        // Pilote peut seulement ajouter des Remarques (déjà géré ci-dessus)
        if (userRole === 'pilote') {
            return false;
        }

        // Nettoyeur et homme clé peuvent ajouter (sauf restrictions de visibilité)
        if (userRole === 'nettoyeur' || userRole === 'hommeclé') {
            return canViewTask(task);
        }

        // User par défaut peut tout ajouter (sauf Remarques)
        return true;
    };

    const canEdit = () => {
        if (!userRole) return false;
        // Pilote ne peut pas modifier
        if (userRole === 'pilote') return false;
        return true;
    };

    const canDelete = () => {
        if (!userRole) return false;
        // Seul l'admin peut supprimer
        return userRole === 'admin';
    };

    return (
        <UserRoleContext.Provider value={{
            userRole,
            loading,
            updateUserRole,
            clearUserRole,
            canViewTask,
            canAddItem,
            canEdit,
            canDelete
        }}>
            {children}
        </UserRoleContext.Provider>
    );
};

export const useUserRole = () => {
    const context = useContext(UserRoleContext);
    if (!context) {
        throw new Error('useUserRole must be used within a UserRoleProvider');
    }
    return context;
};
