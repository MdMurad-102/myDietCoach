/**
 * API Configuration
 * This file provides network-independent API configuration
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Get the API base URL based on the environment
 * This works across different WiFi networks without hardcoding IPs
 */
export const getApiUrl = (): string => {
    // Production URL (when app is deployed)
    if (!__DEV__) {
        return 'https://your-backend-url.com/api';
    }

    // Development configuration
    const DEV_API_PORT = 3000;

    /**
     * For Expo Go on physical devices:
     * - Uses Expo's manifest to get the device URL
     * - This automatically works on any WiFi network
     */
    if ((Constants.manifest as any)?.debuggerHost) {
        // Extract the IP address from Expo's debugger host
        // debuggerHost format: "192.168.x.x:19000"
        const host = ((Constants.manifest as any).debuggerHost as string).split(':')[0];
        return `http://${host}:${DEV_API_PORT}/api`;
    }

    /**
     * For iOS Simulator / Android Emulator:
     */
    if (Platform.OS === 'android') {
        // Android emulator uses 10.0.2.2 to access host machine's localhost
        return `http://10.0.2.2:${DEV_API_PORT}/api`;
    }

    if (Platform.OS === 'ios') {
        // iOS simulator can use localhost
        return `http://localhost:${DEV_API_PORT}/api`;
    }

    // Fallback for web or other platforms
    return `http://localhost:${DEV_API_PORT}/api`;
};

/**
 * API Configuration
 */
export const API_CONFIG = {
    baseURL: getApiUrl(),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
};

// Log the API URL for debugging
console.log('🌐 API Configuration:', {
    baseURL: API_CONFIG.baseURL,
    platform: Platform.OS,
    isDev: __DEV__,
});
