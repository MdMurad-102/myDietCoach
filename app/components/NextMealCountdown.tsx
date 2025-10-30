// Next Meal Countdown Component - Shows time remaining until next meal
import { useMealTiming } from '@/context/MealTimingContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NextMealCountdown: React.FC = () => {
    const { getNextMeal } = useMealTiming();
    const router = useRouter();
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [nextMeal, setNextMeal] = useState<string>('');

    useEffect(() => {
        const updateCountdown = () => {
            const nextMealInfo = getNextMeal();
            if (nextMealInfo) {
                setNextMeal(nextMealInfo.mealType);
                const hours = Math.floor(nextMealInfo.timeRemaining / 60);
                const minutes = nextMealInfo.timeRemaining % 60;

                if (hours > 0) {
                    setTimeRemaining(`${hours}h ${minutes}m`);
                } else {
                    setTimeRemaining(`${minutes}m`);
                }
            } else {
                setNextMeal('No meals');
                setTimeRemaining('Set meal times');
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    const getMealIcon = (meal: string): keyof typeof Ionicons.glyphMap => {
        const mealLower = meal.toLowerCase();
        if (mealLower.includes('breakfast')) return 'sunny';
        if (mealLower.includes('lunch')) return 'restaurant';
        if (mealLower.includes('dinner')) return 'moon';
        if (mealLower.includes('snack')) return 'fast-food';
        return 'time';
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => router.push('/(tabs)/Profile')}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name={getMealIcon(nextMeal)} size={32} color="#fff" />
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.label}>Next Meal</Text>
                    <Text style={styles.mealName}>{nextMeal}</Text>
                    <View style={styles.timeContainer}>
                        <Ionicons name="time-outline" size={16} color="#fff" />
                        <Text style={styles.timeText}>in {timeRemaining}</Text>
                    </View>
                </View>

                <View style={styles.arrowContainer}>
                    <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 15,
        marginVertical: 10,
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    contentContainer: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    mealName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 6,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 14,
        color: '#fff',
        marginLeft: 6,
        fontWeight: '600',
    },
    arrowContainer: {
        marginLeft: 10,
    },
});

export default NextMealCountdown;
