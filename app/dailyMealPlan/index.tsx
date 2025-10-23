// Daily Meal Plan Generator Screen
// Generate, customize, and save complete Bangladesh daily meal plans

import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { generateDailyMealPlan, regenerateMeal, DailyMealPlan, MealPlanOptions } from '../../utils/mealPlanGenerator';
import { useMealContext } from '../../context/UnifiedMealContext';
import { UserContext } from '../../context/UserContext';

export default function DailyMealPlanGenerator() {
    const [mealPlan, setMealPlan] = useState<DailyMealPlan | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [options, setOptions] = useState<MealPlanOptions>({
        targetCalories: 2000,
        vegetarianOnly: false,
        veganOnly: false,
        highProtein: false,
        quickMeals: false,
    });

    const { scheduleMeal, refreshMealData } = useMealContext();
    const userContext = useContext(UserContext);
    const user = userContext?.user;

    // Generate initial meal plan
    const handleGeneratePlan = () => {
        setLoading(true);
        setTimeout(() => {
            const newPlan = generateDailyMealPlan(options);
            setMealPlan(newPlan);
            setLoading(false);
        }, 800);
    };

    // Regenerate all meals
    const handleRegenerateAll = () => {
        setLoading(true);
        setTimeout(() => {
            const newPlan = generateDailyMealPlan(options);
            setMealPlan(newPlan);
            setLoading(false);
        }, 800);
    };

    // Regenerate specific meal
    const handleRegenerateMeal = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
        if (!mealPlan) return;

        setLoading(true);
        setTimeout(() => {
            const updatedPlan = regenerateMeal(mealPlan, mealType, options);
            setMealPlan(updatedPlan);
            setLoading(false);
        }, 500);
    };

    // Save complete daily meal plan
    const handleSavePlan = async () => {
        if (!mealPlan || !user?.id) {
            Alert.alert('Error', 'Please generate a meal plan first');
            return;
        }

        setSaving(true);

        try {
            const today = new Date().toISOString().split('T')[0];

            // Save each meal with its type
            const meals = [
                { meal: mealPlan.breakfast, type: 'breakfast' },
                { meal: mealPlan.lunch, type: 'lunch' },
                { meal: mealPlan.dinner, type: 'dinner' },
                { meal: mealPlan.snack, type: 'snack' },
            ];

            // Save all meals
            for (const { meal, type } of meals) {
                await scheduleMeal(
                    {
                        id: meal.id,
                        recipeName: meal.nameEn,
                        calories: meal.calories,
                        protein: meal.protein,
                        carbs: meal.carbs,
                        fat: meal.fat,
                        ingredients: meal.ingredients,
                        prepTime: meal.prepTime,
                        servings: meal.servings,
                    },
                    today,
                    type as 'breakfast' | 'lunch' | 'dinner' | 'snack'
                );
            }

            // Refresh meal data
            await refreshMealData();

            setSaving(false);

            // Show success message
            Alert.alert(
                '✅ Meal Plan Saved!',
                'Your complete daily meal plan has been saved successfully.',
                [
                    {
                        text: 'View on Home',
                        onPress: () => router.push('/(tabs)/Home'),
                    },
                    {
                        text: 'OK',
                        style: 'cancel',
                    },
                ]
            );
        } catch (error) {
            setSaving(false);
            Alert.alert('Error', 'Failed to save meal plan. Please try again.');
            console.error('Save meal plan error:', error);
        }
    };

    // Get meal icon
    const getMealIcon = (mealType: string): keyof typeof Ionicons.glyphMap => {
        switch (mealType) {
            case 'breakfast':
                return 'sunny';
            case 'lunch':
                return 'restaurant';
            case 'dinner':
                return 'moon';
            case 'snack':
                return 'cafe';
            default:
                return 'fast-food';
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Daily Meal Plan</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Options Section */}
            <View style={styles.optionsSection}>
                <Text style={styles.sectionTitle}>Meal Preferences</Text>

                {/* Target Calories */}
                <View style={styles.optionRow}>
                    <Text style={styles.optionLabel}>Target Calories:</Text>
                    <View style={styles.calorieButtons}>
                        {[1500, 2000, 2500].map((cal) => (
                            <TouchableOpacity
                                key={cal}
                                style={[
                                    styles.calorieButton,
                                    options.targetCalories === cal && styles.calorieButtonActive,
                                ]}
                                onPress={() => setOptions({ ...options, targetCalories: cal })}
                            >
                                <Text
                                    style={[
                                        styles.calorieButtonText,
                                        options.targetCalories === cal && styles.calorieButtonTextActive,
                                    ]}
                                >
                                    {cal}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Dietary Preferences */}
                <View style={styles.optionRow}>
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setOptions({ ...options, vegetarianOnly: !options.vegetarianOnly })}
                    >
                        <Ionicons
                            name={options.vegetarianOnly ? 'checkbox' : 'square-outline'}
                            size={24}
                            color="#4CAF50"
                        />
                        <Text style={styles.checkboxLabel}>Vegetarian Only</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.optionRow}>
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setOptions({ ...options, highProtein: !options.highProtein })}
                    >
                        <Ionicons
                            name={options.highProtein ? 'checkbox' : 'square-outline'}
                            size={24}
                            color="#FF9800"
                        />
                        <Text style={styles.checkboxLabel}>High Protein</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.optionRow}>
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setOptions({ ...options, quickMeals: !options.quickMeals })}
                    >
                        <Ionicons
                            name={options.quickMeals ? 'checkbox' : 'square-outline'}
                            size={24}
                            color="#2196F3"
                        />
                        <Text style={styles.checkboxLabel}>Quick Meals (≤30 min)</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Generate Button */}
            {!mealPlan && (
                <TouchableOpacity
                    style={styles.generateButton}
                    onPress={handleGeneratePlan}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="sparkles" size={24} color="#fff" />
                            <Text style={styles.generateButtonText}>Generate Meal Plan</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}

            {/* Meal Plan Display */}
            {mealPlan && (
                <View style={styles.mealPlanSection}>
                    {/* Summary Card */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Today's Nutrition</Text>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>{mealPlan.totalCalories}</Text>
                                <Text style={styles.summaryLabel}>Calories</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>{mealPlan.totalProtein}g</Text>
                                <Text style={styles.summaryLabel}>Protein</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>{mealPlan.totalCarbs}g</Text>
                                <Text style={styles.summaryLabel}>Carbs</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>{mealPlan.totalFat}g</Text>
                                <Text style={styles.summaryLabel}>Fat</Text>
                            </View>
                        </View>
                    </View>

                    {/* Meal Cards */}
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => {
                        const meal = mealPlan[mealType];
                        return (
                            <View key={mealType} style={styles.mealCard}>
                                {/* Meal Header */}
                                <View style={styles.mealHeader}>
                                    <View style={styles.mealTitleRow}>
                                        <Ionicons name={getMealIcon(mealType)} size={24} color="#4CAF50" />
                                        <Text style={styles.mealType}>
                                            {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleRegenerateMeal(mealType)}
                                        disabled={loading}
                                    >
                                        <Ionicons name="refresh" size={20} color="#2196F3" />
                                    </TouchableOpacity>
                                </View>

                                {/* Meal Details */}
                                <Text style={styles.mealName}>{meal.nameEn}</Text>
                                <Text style={styles.mealNameBangla}>{meal.name}</Text>

                                <View style={styles.mealNutrition}>
                                    <View style={styles.nutritionItem}>
                                        <Text style={styles.nutritionValue}>{meal.calories}</Text>
                                        <Text style={styles.nutritionLabel}>cal</Text>
                                    </View>
                                    <View style={styles.nutritionItem}>
                                        <Text style={styles.nutritionValue}>{meal.protein}g</Text>
                                        <Text style={styles.nutritionLabel}>protein</Text>
                                    </View>
                                    <View style={styles.nutritionItem}>
                                        <Text style={styles.nutritionValue}>{meal.carbs}g</Text>
                                        <Text style={styles.nutritionLabel}>carbs</Text>
                                    </View>
                                    <View style={styles.nutritionItem}>
                                        <Text style={styles.nutritionValue}>{meal.fat}g</Text>
                                        <Text style={styles.nutritionLabel}>fat</Text>
                                    </View>
                                </View>

                                <Text style={styles.mealDescription}>{meal.description}</Text>

                                {/* Tags */}
                                <View style={styles.tagsContainer}>
                                    {meal.tags.slice(0, 3).map((tag) => (
                                        <View key={tag} style={styles.tag}>
                                            <Text style={styles.tagText}>{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        );
                    })}

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.regenerateAllButton}
                            onPress={handleRegenerateAll}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#2196F3" />
                            ) : (
                                <>
                                    <Ionicons name="refresh-circle" size={20} color="#2196F3" />
                                    <Text style={styles.regenerateAllText}>Regenerate All</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSavePlan}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                    <Text style={styles.saveButtonText}>Save Plan</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    placeholder: {
        width: 40,
    },
    optionsSection: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    optionRow: {
        marginBottom: 16,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
    },
    calorieButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    calorieButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        alignItems: 'center',
    },
    calorieButtonActive: {
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    calorieButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#757575',
    },
    calorieButtonTextActive: {
        color: '#4CAF50',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkboxLabel: {
        fontSize: 16,
        color: '#555',
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: '#4CAF50',
        marginHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    generateButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    mealPlanSection: {
        padding: 16,
    },
    summaryCard: {
        backgroundColor: '#4CAF50',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
        textAlign: 'center',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.9,
        marginTop: 4,
    },
    mealCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    mealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    mealTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    mealType: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4CAF50',
        textTransform: 'uppercase',
    },
    mealName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    mealNameBangla: {
        fontSize: 16,
        color: '#757575',
        marginBottom: 12,
    },
    mealNutrition: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    nutritionItem: {
        alignItems: 'center',
    },
    nutritionValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    nutritionLabel: {
        fontSize: 12,
        color: '#757575',
        marginTop: 2,
    },
    mealDescription: {
        fontSize: 14,
        color: '#555',
        marginBottom: 12,
        lineHeight: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    regenerateAllButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#fff',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#2196F3',
    },
    regenerateAllText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    saveButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#4CAF50',
        paddingVertical: 14,
        borderRadius: 12,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});
