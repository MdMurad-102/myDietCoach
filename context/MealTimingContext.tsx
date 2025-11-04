// Meal Timing Context - Store meal times and notification settings
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export interface MealTime {
    hour: number;
    minute: number;
    enabled: boolean;
}

export interface MealTimings {
    breakfast: MealTime;
    lunch: MealTime;
    dinner: MealTime;
    snack?: MealTime;
}

interface MealTimingContextType {
    mealTimings: MealTimings;
    setMealTime: (mealType: keyof MealTimings, hour: number, minute: number) => Promise<void>;
    toggleMealNotification: (mealType: keyof MealTimings, enabled: boolean) => Promise<void>;
    getNextMeal: () => { mealType: string; timeRemaining: number } | null;
    requestNotificationPermissions: () => Promise<boolean>;
}

const defaultMealTimings: MealTimings = {
    breakfast: { hour: 8, minute: 0, enabled: true },
    lunch: { hour: 13, minute: 0, enabled: true },
    dinner: { hour: 19, minute: 0, enabled: true },
    snack: { hour: 16, minute: 0, enabled: false },
};

const MealTimingContext = createContext<MealTimingContextType | undefined>(undefined);

const STORAGE_KEY = '@meal_timings';

export const MealTimingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mealTimings, setMealTimingsState] = useState<MealTimings>(defaultMealTimings);

    // Load meal timings from storage
    useEffect(() => {
        loadMealTimings();
    }, []);

    const loadMealTimings = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setMealTimingsState(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading meal timings:', error);
        }
    };

    const saveMealTimings = async (timings: MealTimings) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timings));
            setMealTimingsState(timings);
        } catch (error) {
            console.error('Error saving meal timings:', error);
        }
    };

    const requestNotificationPermissions = async (): Promise<boolean> => {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Notification permissions not granted');
                return false;
            }

            // For Android, create notification channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('meal-reminders', {
                    name: 'Meal Reminders',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF6B35',
                });
            }

            return true;
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
            return false;
        }
    };

    const scheduleNotification = async (mealType: string, hour: number, minute: number) => {
        try {
            // Cancel existing notification for this meal
            const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
            const existingNotification = scheduledNotifications.find(
                (n) => n.content.data?.mealType === mealType
            );
            if (existingNotification) {
                await Notifications.cancelScheduledNotificationAsync(existingNotification.identifier);
            }

            // Schedule new notification
            const trigger = {
                hour,
                minute,
                repeats: true,
            } as any; // Daily trigger with repeat

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: `🍽️ Time for ${mealType}!`,
                    body: `It's time to enjoy your ${mealType}. Stay on track with your nutrition goals!`,
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                    data: { mealType },
                },
                trigger,
            });

            console.log(`Notification scheduled for ${mealType} at ${hour}:${minute}`);
        } catch (error) {
            console.error(`Error scheduling notification for ${mealType}:`, error);
        }
    };

    const cancelNotification = async (mealType: string) => {
        try {
            const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
            const notification = scheduledNotifications.find(
                (n) => n.content.data?.mealType === mealType
            );
            if (notification) {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                console.log(`Notification cancelled for ${mealType}`);
            }
        } catch (error) {
            console.error(`Error cancelling notification for ${mealType}:`, error);
        }
    };

    const setMealTime = async (mealType: keyof MealTimings, hour: number, minute: number) => {
        const updatedTimings = {
            ...mealTimings,
            [mealType]: {
                ...mealTimings[mealType],
                hour,
                minute,
            },
        };

        await saveMealTimings(updatedTimings);

        // Reschedule notification if enabled
        if (updatedTimings[mealType].enabled) {
            await scheduleNotification(mealType, hour, minute);
        }
    };

    const toggleMealNotification = async (mealType: keyof MealTimings, enabled: boolean) => {
        const updatedTimings = {
            ...mealTimings,
            [mealType]: {
                ...mealTimings[mealType],
                enabled,
            },
        };

        await saveMealTimings(updatedTimings);

        if (enabled) {
            const meal = updatedTimings[mealType];
            await scheduleNotification(mealType, meal.hour, meal.minute);
        } else {
            await cancelNotification(mealType);
        }
    };

    const getNextMeal = (): { mealType: string; timeRemaining: number } | null => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        const meals = Object.entries(mealTimings)
            .filter(([_, meal]) => meal.enabled)
            .map(([type, meal]) => ({
                mealType: type,
                timeInMinutes: meal.hour * 60 + meal.minute,
            }))
            .sort((a, b) => a.timeInMinutes - b.timeInMinutes);

        // Find next meal today
        const nextMealToday = meals.find((meal) => meal.timeInMinutes > currentTimeInMinutes);

        if (nextMealToday) {
            const timeRemaining = nextMealToday.timeInMinutes - currentTimeInMinutes;
            return {
                mealType: nextMealToday.mealType.charAt(0).toUpperCase() + nextMealToday.mealType.slice(1),
                timeRemaining,
            };
        }

        // If no meal today, return first meal tomorrow
        if (meals.length > 0) {
            const firstMealTomorrow = meals[0];
            const timeRemaining = 24 * 60 - currentTimeInMinutes + firstMealTomorrow.timeInMinutes;
            return {
                mealType: firstMealTomorrow.mealType.charAt(0).toUpperCase() + firstMealTomorrow.mealType.slice(1),
                timeRemaining,
            };
        }

        return null;
    };

    return (
        <MealTimingContext.Provider
            value={{
                mealTimings,
                setMealTime,
                toggleMealNotification,
                getNextMeal,
                requestNotificationPermissions,
            }}
        >
            {children}
        </MealTimingContext.Provider>
    );
};

export const useMealTiming = () => {
    const context = useContext(MealTimingContext);
    if (!context) {
        throw new Error('useMealTiming must be used within MealTimingProvider');
    }
    return context;
};
