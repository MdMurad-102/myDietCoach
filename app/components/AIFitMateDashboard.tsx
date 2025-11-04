import { UserContext } from '@/context/UserContext';
import { generateRecipeFromText } from '@/service/AiModel';
import { initializeNotifications, requestNotificationPermissions } from '@/service/dailyReminders';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

interface DailyTip {
    tip: string;
    category: string;
    icon: string;
}

export default function AIFitMateDashboard() {
    const context = useContext(UserContext);
    const router = useRouter();
    const { user } = context || {};

    const [dailyTip, setDailyTip] = useState<DailyTip | null>(null);
    const [loading, setLoading] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        loadDailyTip();
        checkNotificationStatus();
    }, []);

    const checkNotificationStatus = async () => {
        try {
            const { granted } = await requestNotificationPermissions();
            setNotificationsEnabled(granted);
        } catch (error) {
            console.error('Error checking notification status:', error);
        }
    };

    const enableNotifications = async () => {
        try {
            const success = await initializeNotifications(user?.goal);
            if (success) {
                setNotificationsEnabled(true);
                Alert.alert(
                    'Success!',
                    'Daily reminders enabled. You will receive meal reminders and motivational tips!'
                );
            } else {
                Alert.alert(
                    'Permission Required',
                    'Please enable notifications in your device settings to receive reminders.'
                );
            }
        } catch (error) {
            console.error('Error enabling notifications:', error);
            Alert.alert('Error', 'Failed to enable notifications. Please try again.');
        }
    };

    const loadDailyTip = async () => {
        setLoading(true);
        try {
            const prompt = `
Generate a short, actionable health tip (1-2 sentences) for someone in Bangladesh.
The tip should be practical, culturally appropriate, and related to one of these categories:
- Nutrition
- Hydration
- Exercise
- Sleep
- Mental Health

Format your response as JSON:
{
  "tip": "the health tip here",
  "category": "category name",
  "icon": "one of: nutrition, water, fitness, moon, heart"
}
`;

            const response = await generateRecipeFromText(prompt);

            try {
                const cleanedResponse = response
                    ?.toString()
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .trim();

                const tipData = JSON.parse(cleanedResponse || '{}');
                setDailyTip(tipData);
            } catch (parseError) {
                // Fallback tip if parsing fails
                setDailyTip({
                    tip: 'Start your day with a glass of water to boost metabolism and hydration!',
                    category: 'Hydration',
                    icon: 'water',
                });
            }
        } catch (error) {
            console.error('Error loading daily tip:', error);
            setDailyTip({
                tip: 'Every healthy choice you make today brings you closer to your goals!',
                category: 'Motivation',
                icon: 'heart',
            });
        }
        setLoading(false);
    };

    const calculateBMI = (): number | null => {
        if (!user?.height || !user?.weight) return null;
        const heightM = parseFloat(user.height) / 100;
        const weightKg = parseFloat(user.weight);
        if (isNaN(heightM) || isNaN(weightKg) || heightM <= 0 || weightKg <= 0) return null;
        return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
    };

    const getBMIStatus = (): { category: string; color: string } => {
        const bmi = calculateBMI();
        if (!bmi) return { category: 'Unknown', color: '#999' };

        if (bmi < 18.5) return { category: 'Underweight', color: '#3498db' };
        if (bmi < 25) return { category: 'Normal', color: '#2ecc71' };
        if (bmi < 30) return { category: 'Overweight', color: '#f39c12' };
        return { category: 'Obese', color: '#e74c3c' };
    };

    const quickAccessCards = [
        {
            title: 'Full Day\nMeal Plan',
            icon: 'calendar',
            gradient: ['#FFD166', '#F77F00'] as const,
            route: '/recipeGenerator' as any,
            description: 'Get complete daily meal suggestions',
        },
        {
            title: 'AI Chat\nNutritionist',
            icon: 'chatbubbles',
            gradient: ['#06D6A0', '#118AB2'] as const,
            route: '/AIChat',
            description: 'Ask any diet or food questions',
        },
        {
            title: 'BMI Calculator\n& Coach',
            icon: 'calculator',
            gradient: ['#7209B7', '#560BAD'] as const,
            route: '/BMI',
            description: 'Check your BMI with AI advice',
        },
        {
            title: 'Progress\nTracking',
            icon: 'trending-up',
            gradient: ['#F72585', '#B5179E'] as const,
            route: '/Progress',
            description: 'Track your fitness journey',
        },
    ];

    if (!user) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loginPrompt}>
                    <Ionicons name="fitness" size={80} color="#fff" />
                    <Text style={styles.loginTitle}>AI FitMate</Text>
                    <Text style={styles.loginSubtitle}>
                        Your personal AI-powered diet and fitness coach
                    </Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.push('/Sign/SignIn')}
                    >
                        <Text style={styles.loginButtonText}>Get Started</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        );
    }

    const bmi = calculateBMI();
    const bmiStatus = getBMIStatus();

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Hello, {user.name}! 👋</Text>
                        <Text style={styles.headerSubtitle}>Your AI FitMate Dashboard</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={notificationsEnabled ? undefined : enableNotifications}
                    >
                        <Ionicons
                            name={notificationsEnabled ? 'notifications' : 'notifications-off'}
                            size={24}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Daily Tip Card */}
            {dailyTip && (
                <View style={styles.dailyTipCard}>
                    <View style={styles.tipHeader}>
                        <View style={styles.tipIconContainer}>
                            <Ionicons name={dailyTip.icon as any} size={24} color="#667eea" />
                        </View>
                        <View style={styles.tipHeaderText}>
                            <Text style={styles.tipTitle}>Daily {dailyTip.category} Tip</Text>
                            <Text style={styles.tipDate}>{new Date().toLocaleDateString()}</Text>
                        </View>
                        <TouchableOpacity onPress={loadDailyTip} disabled={loading}>
                            <Ionicons name="refresh" size={22} color="#667eea" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.tipText}>{dailyTip.tip}</Text>
                </View>
            )}

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Goal</Text>
                    <Text style={styles.statValue} numberOfLines={1}>
                        {user.goal || 'Not Set'}
                    </Text>
                    <Ionicons name="flag" size={20} color="#667eea" />
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>BMI Status</Text>
                    <Text style={[styles.statValue, { color: bmiStatus.color }]} numberOfLines={1}>
                        {bmi ? bmi : 'N/A'}
                    </Text>
                    <Text style={[styles.bmiCategory, { color: bmiStatus.color }]}>
                        {bmiStatus.category}
                    </Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Water Goal</Text>
                    <Text style={styles.statValue} numberOfLines={1}>
                        {user.daily_water_goal || 8}
                    </Text>
                    <Text style={styles.statUnit}>glasses/day</Text>
                </View>
            </View>

            {/* Quick Access */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Access</Text>
                <Ionicons name="apps" size={20} color="#667eea" />
            </View>

            <View style={styles.cardsGrid}>
                {quickAccessCards.map((card, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.quickCard}
                        onPress={() => router.push(card.route as any)}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={card.gradient}
                            style={styles.quickCardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name={card.icon as any} size={32} color="#fff" />
                            <Text style={styles.quickCardTitle}>{card.title}</Text>
                            <Text style={styles.quickCardDescription}>{card.description}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Features List */}
            <View style={styles.featuresContainer}>
                <Text style={styles.sectionTitle}>AI-Powered Features</Text>

                <TouchableOpacity
                    style={styles.featureItem}
                    onPress={() => router.push('/recipeGenerator' as any)}
                >
                    <View style={[styles.featureIcon, { backgroundColor: '#fff0e6' }]}>
                        <Ionicons name="restaurant" size={24} color="#f77f00" />
                    </View>
                    <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>Smart Meal Suggestion Bot</Text>
                        <Text style={styles.featureDescription}>
                            Get Bangladeshi food-based daily meal plans
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.featureItem}
                    onPress={() => router.push('/AIChat')}
                >
                    <View style={[styles.featureIcon, { backgroundColor: '#e6f7f7' }]}>
                        <Ionicons name="chatbubbles" size={24} color="#118ab2" />
                    </View>
                    <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>AI Chat Nutritionist</Text>
                        <Text style={styles.featureDescription}>
                            Ask "Is this food okay for me?" and get instant analysis
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.featureItem}
                    onPress={() => router.push('/BMI')}
                >
                    <View style={[styles.featureIcon, { backgroundColor: '#f3e6ff' }]}>
                        <Ionicons name="calculator" size={24} color="#7209b7" />
                    </View>
                    <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>BMI Calculator & AI Coach</Text>
                        <Text style={styles.featureDescription}>
                            Calculate BMI with personalized diet recommendations
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.featureItem}
                    onPress={notificationsEnabled ? undefined : enableNotifications}
                >
                    <View style={[styles.featureIcon, { backgroundColor: '#ffe6f0' }]}>
                        <Ionicons
                            name={notificationsEnabled ? 'notifications' : 'notifications-off'}
                            size={24}
                            color="#f72585"
                        />
                    </View>
                    <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>Daily Reminders & Motivation</Text>
                        <Text style={styles.featureDescription}>
                            {notificationsEnabled
                                ? 'Meal reminders and daily tips enabled'
                                : 'Tap to enable meal reminders and daily tips'}
                        </Text>
                    </View>
                    <Ionicons
                        name={notificationsEnabled ? 'checkmark-circle' : 'chevron-forward'}
                        size={20}
                        color={notificationsEnabled ? '#2ecc71' : '#999'}
                    />
                </TouchableOpacity>
            </View>

            {/* App Info */}
            <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                    🇧🇩 Built for Bangladeshi diet and culture
                </Text>
                <Text style={styles.infoText}>
                    🤖 Powered by AI for personalized recommendations
                </Text>
                <Text style={styles.infoText}>
                    💪 Your complete fitness companion
                </Text>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: {
        padding: 8,
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 6,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
    },
    notificationButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dailyTipCard: {
        backgroundColor: '#fff',
        margin: 20,
        marginBottom: 15,
        borderRadius: 16,
        padding: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#667eea',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    tipIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tipHeaderText: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
    },
    tipDate: {
        fontSize: 12,
        color: '#757575',
        marginTop: 2,
    },
    tipText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#424242',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statLabel: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 4,
    },
    bmiCategory: {
        fontSize: 11,
        fontWeight: '600',
    },
    statUnit: {
        fontSize: 10,
        color: '#999',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#212121',
    },
    cardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 15,
        marginBottom: 30,
    },
    quickCard: {
        width: cardWidth,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    quickCardGradient: {
        padding: 20,
        minHeight: 160,
    },
    quickCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginTop: 12,
        marginBottom: 8,
    },
    quickCardDescription: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 16,
    },
    featuresContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 13,
        color: '#757575',
        lineHeight: 18,
    },
    infoCard: {
        backgroundColor: '#f0f4ff',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 20,
        gap: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#667eea',
        lineHeight: 20,
    },
    loginPrompt: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loginTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 20,
        marginBottom: 10,
    },
    loginSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    loginButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 24,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#667eea',
    },
});
