import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Button from './Button';

interface MealPreviewProps {
    meal: {
        time: string;
        name: string;
        calories: number;
    };
    onMarkEaten: () => void;
    onReplace: () => void;
}

const MealPreview: React.FC<MealPreviewProps> = ({ meal, onMarkEaten, onReplace }) => {
    return (
        <LinearGradient
            colors={['#f8f9fa', '#e9f0f7']}
            style={styles.card}
        >
            <View style={styles.header}>
                <Ionicons name="restaurant-outline" size={20} color="#34A853" />
                <Text style={styles.time}>{meal.time}</Text>
            </View>
            <Text style={styles.name} numberOfLines={2}>{meal.name}</Text>
            <Text style={styles.calories}>{meal.calories} kcal</Text>
            <View style={styles.actions}>
                <Button
                    variant="icon"
                    onPress={onMarkEaten}
                >
                    <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
                </Button>
                <Button
                    variant="icon"
                    onPress={onReplace}
                >
                    <Ionicons name="sync-circle-outline" size={24} color="#FF9800" />
                </Button>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        width: 160,
        justifyContent: 'space-between',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
    name: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
        minHeight: 38,
    },
    calories: {
        fontSize: 13,
        color: '#555',
        marginBottom: 12,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 8,
    },
});

export default MealPreview;
