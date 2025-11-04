import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MealPreviewProps {
    meal: {
        time: string;
        name: string;
        calories: number;
        protein?: number;
        consumed?: boolean;
        id?: string;
    };
    onMarkEaten: () => void;
    onReplace: () => void;
}

const MealPreview: React.FC<MealPreviewProps> = ({ meal, onMarkEaten, onReplace }) => {
    const isConsumed = meal.consumed || false;
    const { colors, isDarkMode } = useTheme();

    return (
        <LinearGradient
            colors={isConsumed
                ? ['#e8f5e9', '#c8e6c9']
                : isDarkMode
                    ? [colors.card, colors.surface]
                    : ['#f8f9fa', '#e9f0f7']
            }
            style={[styles.card, isConsumed && styles.consumedCard]}
        >
            {isConsumed && (
                <View style={styles.consumedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.consumedText}>Eaten</Text>
                </View>
            )}
            <View style={styles.header}>
                <Ionicons
                    name="restaurant-outline"
                    size={20}
                    color={isConsumed ? "#2E7D32" : "#34A853"}
                />
                <Text style={[styles.time, { color: colors.text }, isConsumed && styles.consumedTime]}>
                    {meal.time}
                </Text>
            </View>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{meal.name}</Text>
            <View style={styles.nutritionRow}>
                <Text style={[styles.calories, { color: colors.textSecondary }]}>{meal.calories} kcal</Text>
                {meal.protein && (
                    <Text style={[styles.protein, { color: colors.textSecondary }]}>{meal.protein}g protein</Text>
                )}
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.toggleButton, isConsumed && styles.toggleButtonActive]}
                    onPress={onMarkEaten}
                >
                    <Ionicons
                        name={isConsumed ? "checkmark-circle" : "checkmark-circle-outline"}
                        size={24}
                        color={isConsumed ? "#fff" : "#4CAF50"}
                    />
                    <Text style={[styles.toggleText, isConsumed && styles.toggleTextActive]}>
                        {isConsumed ? "Consumed" : "Mark Eaten"}
                    </Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        width: 180,
        justifyContent: 'space-between',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    consumedCard: {
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    consumedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        elevation: 2,
    },
    consumedText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4CAF50',
        marginLeft: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    time: {
        fontSize: 13,
        fontWeight: '600',
        color: '#34A853',
        marginLeft: 6,
        textTransform: 'capitalize',
    },
    consumedTime: {
        color: '#2E7D32',
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
        minHeight: 38,
    },
    nutritionRow: {
        marginBottom: 12,
    },
    calories: {
        fontSize: 13,
        color: '#555',
        marginBottom: 4,
    },
    protein: {
        fontSize: 12,
        color: '#777',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#4CAF50',
        gap: 6,
    },
    toggleButtonActive: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    toggleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4CAF50',
    },
    toggleTextActive: {
        color: '#fff',
    },
});

export default MealPreview;

