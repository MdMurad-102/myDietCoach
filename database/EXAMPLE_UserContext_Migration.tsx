/**
 * EXAMPLE: UserContext Migration from Convex to PostgreSQL
 * 
 * This is an example showing how to migrate a context provider
 * from Convex to PostgreSQL. Use this as a template for updating
 * your actual context files.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getUserByEmail,
    createOrGetUser,
    updateUserProfile as updateUserProfileDB,
    updateWaterGoal as updateWaterGoalDB,
    User
} from '../database';

interface UserContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
    updateUserProfile: (data: any) => Promise<void>;
    updateWaterGoal: (goal: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children, userEmail }: { children: React.ReactNode; userEmail: string }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load user on mount or when email changes
    useEffect(() => {
        loadUser();
    }, [userEmail]);

    async function loadUser() {
        if (!userEmail) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const userData = await getUserByEmail(userEmail);
            setUser(userData);
        } catch (err) {
            console.error('Error loading user:', err);
            setError('Failed to load user data');
        } finally {
            setLoading(false);
        }
    }

    async function refreshUser() {
        await loadUser();
    }

    async function updateUserProfile(data: any) {
        if (!user) {
            throw new Error('No user logged in');
        }

        try {
            setLoading(true);
            setError(null);
            const updatedUser = await updateUserProfileDB(user.id, data);
            setUser(updatedUser);
        } catch (err) {
            console.error('Error updating user profile:', err);
            setError('Failed to update profile');
            throw err;
        } finally {
            setLoading(false);
        }
    }

    async function updateWaterGoal(goal: number) {
        if (!user) {
            throw new Error('No user logged in');
        }

        try {
            setError(null);
            await updateWaterGoalDB(user.id, goal);
            await refreshUser();
        } catch (err) {
            console.error('Error updating water goal:', err);
            setError('Failed to update water goal');
            throw err;
        }
    }

    const value = {
        user,
        loading,
        error,
        refreshUser,
        updateUserProfile,
        updateWaterGoal,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

