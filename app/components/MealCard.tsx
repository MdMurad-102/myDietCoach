import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MealItem } from '@/context/UnifiedMealContext';
import Button from './Button';

interface MealCardProps {
    meal: MealItem;
    onPress: () => void;
    onSchedule: () => void;
    onSave: () => void;
    isSaved: boolean;
}

const getMealEmoji = (mealType?: string) => {
    switch (mealType) {
        case 'breakfast': return '🌅';
        case 'lunch': return '🌞';
        case 'dinner': return '🌙';
        case 'snacks': return '🍎';
        default: return '🍽️';
    }
};

const MealCard: React.FC<MealCardProps> = ({ meal, onPress, onSchedule, onSave, isSaved }) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.card}
            >
                <View style={styles.header}>
                    <Text style={styles.emoji}>{getMealEmoji(meal.mealType)}</Text>
                    <View style={styles.titleContainer}>
                        <Text style={styles.name} numberOfLines={2}>{meal.recipeName || meal.name}</Text>
                        {meal.nameBn && (
                            <Text style={styles.nameBangla} numberOfLines={1}>{meal.nameBn}</Text>
                        )}
                        <Text style={styles.type}>{meal.mealType || 'Meal'}</Text>
                    </View>
                    {meal.mealType && (
                        <View style={styles.aiBadge}>
                            <Ionicons name="sparkles" size={12} color="#fff" />
                        </View>
                    )}
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <Ionicons name="flame-outline" size={16} color="#FF6B35" />
                        <Text style={styles.statText}>{meal.calories} kcal</Text>
                    </View>
                    <View style={styles.stat}>
                        <Ionicons name="fitness-outline" size={16} color="#4ECDC4" />
                        <Text style={styles.statText}>{meal.protein}g protein</Text>
                    </View>
                    <View style={styles.stat}>
                        <Ionicons name="time-outline" size={16} color="#95A5A6" />
                        <Text style={styles.statText}>{meal.cookingTime || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <Button onPress={onSchedule} variant="outline" title="Schedule" icon="calendar-outline" />
                    <Button
                        onPress={onSave}
                        variant="icon"
                    >
                        <Ionicons
                            name={isSaved ? "heart" : "heart-outline"}
                            size={24}
                            color={isSaved ? '#FF6B6B' : '#667eea'}
                        />
                    </Button>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 16,
        marginVertical: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    emoji: {
        fontSize: 32,
        marginRight: 12,
        marginTop: -4,
    },
    titleContainer: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    nameBangla: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginBottom: 4,
        fontStyle: 'italic',
    },
    type: {
        fontSize: 14,
        color: '#666',
        textTransform: 'capitalize',
    },
    aiBadge: {
        backgroundColor: '#667eea',
        borderRadius: 12,
        padding: 6,
        marginLeft: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
        paddingVertical: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#555',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
});

export default MealCard;
