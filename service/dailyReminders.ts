import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { GenerateRecipeAi } from './AiModel';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export interface NotificationPermissionStatus {
    granted: boolean;
    canAskAgain: boolean;
}

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<NotificationPermissionStatus> {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        return {
            granted: finalStatus === 'granted',
            canAskAgain: existingStatus === 'undetermined',
        };
    } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return {
            granted: false,
            canAskAgain: false,
        };
    }
}

/**
 * Schedule all daily meal reminders
 */
export async function scheduleDailyMealReminders(): Promise<void> {
    try {
        // Cancel existing reminders first
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Breakfast reminder - 8:30 AM
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🌅 Good Morning! Time for Breakfast',
                body: 'Start your day right with a healthy breakfast. Check your meal plan!',
                data: { type: 'breakfast' },
                sound: true,
            },
            trigger: {
                hour: 8,
                minute: 30,
                repeats: true,
            },
        });

        // Lunch reminder - 1:00 PM
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '☀️ Lunchtime!',
                body: 'Time to refuel! Check out your healthy lunch options.',
                data: { type: 'lunch' },
                sound: true,
            },
            trigger: {
                hour: 13,
                minute: 0,
                repeats: true,
            },
        });

        // Dinner reminder - 7:30 PM
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🌙 Dinner Time',
                body: 'End your day with a nutritious dinner. See your meal suggestions!',
                data: { type: 'dinner' },
                sound: true,
            },
            trigger: {
                hour: 19,
                minute: 30,
                repeats: true,
            },
        });

        // Water reminder - Every 2 hours (9 AM to 9 PM)
        const waterHours = [9, 11, 13, 15, 17, 19, 21];
        for (const hour of waterHours) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '💧 Hydration Time',
                    body: 'Remember to drink water! Stay hydrated throughout the day.',
                    data: { type: 'water' },
                    sound: false,
                },
                trigger: {
                    hour,
                    minute: 0,
                    repeats: true,
                },
            });
        }

        console.log('Daily meal reminders scheduled successfully');
    } catch (error) {
        console.error('Error scheduling meal reminders:', error);
        throw error;
    }
}

/**
 * Generate and schedule daily motivational tips using AI
 */
export async function scheduleDailyMotivationalTip(userGoal?: string): Promise<void> {
    try {
        // Generate AI motivational tip
        const prompt = `
You are a motivational health coach. Generate a short, inspiring motivational message (1-2 sentences max) 
for someone whose fitness goal is: ${userGoal || 'staying healthy'}.

Make it encouraging, specific to their goal, and culturally appropriate for Bangladesh.
Do NOT use any special characters, emojis, or line breaks - just plain text.
`;

        const motivationalMessage = await GenerateRecipeAi(prompt);

        // Schedule motivational notification for 7:00 AM daily
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '✨ Daily Motivation',
                body: motivationalMessage || 'You are doing great! Keep pushing towards your goals!',
                data: { type: 'motivation' },
                sound: true,
            },
            trigger: {
                hour: 7,
                minute: 0,
                repeats: true,
            },
        });

        console.log('Daily motivational tip scheduled');
    } catch (error) {
        console.error('Error scheduling motivational tip:', error);
        // Fallback to default message if AI fails
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '✨ Daily Motivation',
                body: 'Every healthy choice you make today brings you closer to your goals!',
                data: { type: 'motivation' },
                sound: true,
            },
            trigger: {
                hour: 7,
                minute: 0,
                repeats: true,
            },
        });
    }
}

/**
 * Schedule a custom one-time reminder
 */
export async function scheduleCustomReminder(
    title: string,
    body: string,
    triggerDate: Date
): Promise<string> {
    try {
        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger: triggerDate,
        });

        return identifier;
    } catch (error) {
        console.error('Error scheduling custom reminder:', error);
        throw error;
    }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllReminders(): Promise<void> {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('All reminders cancelled');
    } catch (error) {
        console.error('Error cancelling reminders:', error);
        throw error;
    }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledReminders(): Promise<Notifications.NotificationRequest[]> {
    try {
        return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
        console.error('Error getting scheduled reminders:', error);
        return [];
    }
}

/**
 * Send immediate notification
 */
export async function sendImmediateNotification(
    title: string,
    body: string,
    data?: Record<string, any>
): Promise<string> {
    try {
        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: null, // Immediate
        });

        return identifier;
    } catch (error) {
        console.error('Error sending immediate notification:', error);
        throw error;
    }
}

/**
 * Initialize all notifications (call this on app start after user login)
 */
export async function initializeNotifications(userGoal?: string): Promise<boolean> {
    try {
        // Request permissions
        const { granted } = await requestNotificationPermissions();

        if (!granted) {
            console.log('Notification permissions not granted');
            return false;
        }

        // Schedule all reminders
        await scheduleDailyMealReminders();
        await scheduleDailyMotivationalTip(userGoal);

        console.log('Notifications initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing notifications:', error);
        return false;
    }
}

export default {
    requestNotificationPermissions,
    scheduleDailyMealReminders,
    scheduleDailyMotivationalTip,
    scheduleCustomReminder,
    cancelAllReminders,
    getScheduledReminders,
    sendImmediateNotification,
    initializeNotifications,
};
