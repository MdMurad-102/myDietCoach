// Theme Context for Dark Mode Support
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface ThemeColors {
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryLight: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    shadow: string;
}

const lightTheme: ThemeColors = {
    background: '#f8f9fa',
    surface: '#ffffff',
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    primary: '#667eea',
    primaryLight: '#E3E8FF',
    border: '#e0e0e0',
    error: '#e74c3c',
    success: '#4CAF50',
    warning: '#f39c12',
    info: '#3498db',
    shadow: '#000000',
};

const darkTheme: ThemeColors = {
    background: '#121212',
    surface: '#1e1e1e',
    card: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    primary: '#667eea',
    primaryLight: '#3d3d5c',
    border: '#3d3d3d',
    error: '#ef5350',
    success: '#66bb6a',
    warning: '#ffa726',
    info: '#42a5f5',
    shadow: '#000000',
};

interface ThemeContextType {
    isDarkMode: boolean;
    colors: ThemeColors;
    toggleTheme: () => void;
    setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

const THEME_STORAGE_KEY = '@myDietCoach:theme';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Load theme preference from storage
    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme !== null) {
                setIsDarkMode(savedTheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    };

    const saveTheme = async (isDark: boolean) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newValue = !prev;
            saveTheme(newValue);
            return newValue;
        });
    };

    const setDarkMode = (value: boolean) => {
        setIsDarkMode(value);
        saveTheme(value);
    };

    const colors = isDarkMode ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ isDarkMode, colors, toggleTheme, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
