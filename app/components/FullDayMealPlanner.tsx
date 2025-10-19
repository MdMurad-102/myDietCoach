import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '@/context/UserContext';
import { generateDailyMealPlan, FoodItem, calculateNutritionTotals } from '@/utils/foodDatabase';
import { GenerateRecipeAi } from '@/service/AiModel';

const { width } = Dimensions.get('window');

interface MealPlan {
    breakfast: FoodItem;
    lunch: FoodItem;
    dinner: FoodItem;
    snack: FoodItem;
}

export default function FullDayMealPlanner() {
    const context = useContext(UserContext);
    const { user } = context || {};

    const [loading, setLoading] = useState(false);
    const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
    const [aiTips, setAiTips] = useState('');
    const [showAITips, setShowAITips] = useState(false);

    const calculateDailyCalories = () => {
        if (!user?.weight || !user?.height || !user?.age) {
            return 2000; // Default
        }

        // Using Mifflin-St Jeor Equation
        const weight = parseFloat(user.weight);
        const height = parseFloat(user.height);
        const age = parseFloat(user.age);
        const gender = user.gender || 'male';

        let bmr;
        if (gender.toLowerCase() === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        // Activity factor (moderate activity)
        const tdee = bmr * 1.55;

        // Adjust based on goal
        const goal = user.goal?.toLowerCase();
        if (goal?.includes('lose') || goal?.includes('weight loss')) {
            return Math.round(tdee - 500); // 500 calorie deficit
        } else if (goal?.includes('gain') || goal?.includes('muscle')) {
            return Math.round(tdee + 300); // 300 calorie surplus
        }

        return Math.round(tdee);
    };

    const generatePlan = async () => {
        if (!user) {
            Alert.alert('Error', 'Please complete your profile first');
            return;
        }

        setLoading(true);
        try {
            const dailyCalories = calculateDailyCalories();
            const planSuggestions = generateDailyMealPlan(dailyCalories, user.diet_type);

            // Select the first (best matching) option from each meal
            const selectedPlan: MealPlan = {
                breakfast: planSuggestions.breakfast[0],
                lunch: planSuggestions.lunch[0],
                dinner: planSuggestions.dinner[0],
                snack: planSuggestions.snacks[0],
            };

            setMealPlan(selectedPlan);

            // Get AI tips for this meal plan
            await getAITips(selectedPlan, dailyCalories);
        } catch (error) {
            console.error('Error generating meal plan:', error);
            Alert.alert('Error', 'Failed to generate meal plan. Please try again.');
        }
        setLoading(false);
    };

    const getAITips = async (plan: MealPlan, targetCalories: number) => {
        try {
            const meals = [plan.breakfast, plan.lunch, plan.dinner, plan.snack];
            const totals = calculateNutritionTotals(meals);

            const prompt = `
You are a nutrition expert. A user has this meal plan:

Breakfast: ${plan.breakfast.name} (${plan.breakfast.calories} cal, ${plan.breakfast.protein}g protein)
Lunch: ${plan.lunch.name} (${plan.lunch.calories} cal, ${plan.lunch.protein}g protein)
Dinner: ${plan.dinner.name} (${plan.dinner.calories} cal, ${plan.dinner.protein}g protein)
Snack: ${plan.snack.name} (${plan.snack.calories} cal, ${plan.snack.protein}g protein)

Total: ${totals.calories} calories, ${totals.protein}g protein
Target: ${targetCalories} calories

User Profile:
- Goal: ${user?.goal || 'Not specified'}
- Diet Type: ${user?.diet_type || 'No preference'}
- Age: ${user?.age}
- Weight: ${user?.weight}kg

Provide:
1. Overall assessment of this meal plan
2. 3 specific tips to optimize this plan
3. Timing recommendations (when to eat each meal)
4. Hydration reminder
5. One motivational sentence

Keep it friendly and practical!
`;

            const tips = await GenerateRecipeAi(prompt);
            setAiTips(tips || 'Unable to generate tips at this time.');
        } catch (error) {
            console.error('Error getting AI tips:', error);
            setAiTips('Unable to generate AI tips. Your meal plan is still valid!');
        }
    };

    const regenerateMeal = async (mealType: keyof MealPlan) => {
        if (!mealPlan) return;

        setLoading(true);
        try {
            const dailyCalories = calculateDailyCalories();
            const planSuggestions = generateDailyMealPlan(dailyCalories, user?.diet_type);

            // Get alternative option (2nd choice)
            let newMeal: FoodItem;
            switch (mealType) {
                case 'breakfast':
                    newMeal = planSuggestions.breakfast[1] || planSuggestions.breakfast[0];
                    break;
                case 'lunch':
                    newMeal = planSuggestions.lunch[1] || planSuggestions.lunch[0];
                    break;
                case 'dinner':
                    newMeal = planSuggestions.dinner[1] || planSuggestions.dinner[0];
                    break;
                case 'snack':
                    newMeal = planSuggestions.snacks[1] || planSuggestions.snacks[0];
                    break;
            }

            setMealPlan({
                ...mealPlan,
                [mealType]: newMeal,
            });
        } catch (error) {
            console.error('Error regenerating meal:', error);
        }
        setLoading(false);
    };

    const renderMealCard = (
        title: string,
        meal: FoodItem,
        icon: string,
        gradient: string[],
        mealType: keyof MealPlan
    ) => (
        <View style={styles.mealCard}>
            <LinearGradient colors={gradient} style={styles.mealHeader}>
                <View style={styles.mealTitleContainer}>
                    <Ionicons name={icon as any} size={24} color="#fff" />
                    <Text style={styles.mealTitle}>{title}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => regenerateMeal(mealType)}
                    style={styles.refreshButton}
                >
                    <Ionicons name="refresh" size={20} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            <View style={styles.mealContent}>
                <Text style={styles.foodName}>{meal.name}</Text>
                <Text style={styles.foodNameBangla}>{meal.banglaName}</Text>
                <Text style={styles.description}>{meal.description}</Text>

                <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{meal.calories}</Text>
                        <Text style={styles.nutritionLabel}>Calories</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{meal.protein}g</Text>
                        <Text style={styles.nutritionLabel}>Protein</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{meal.carbs}g</Text>
                        <Text style={styles.nutritionLabel}>Carbs</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{meal.fat}g</Text>
                        <Text style={styles.nutritionLabel}>Fat</Text>
                    </View>
                </View>

                <View style={styles.portionContainer}>
                    <Ionicons name="restaurant" size={16} color="#667eea" />
                    <Text style={styles.portionText}>{meal.portionSize}</Text>
                </View>

                <View style={styles.tipContainer}>
                    <Ionicons name="bulb" size={16} color="#f39c12" />
                    <Text style={styles.tipText}>{meal.healthTips}</Text>
                </View>
            </View>
        </View>
    );

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Please complete your profile first</Text>
            </View>
        );
    }

    const dailyCalories = calculateDailyCalories();

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
                <Text style={styles.headerTitle}>Full Day Meal Planner</Text>
                <Text style={styles.headerSubtitle}>
                    Personalized Bangladeshi meal plan • {dailyCalories} cal/day
                </Text>
            </LinearGradient>

            {/* User Info */}
            <View style={styles.userInfoCard}>
                <View style={styles.userInfoRow}>
                    <View style={styles.userInfoItem}>
                        <Text style={styles.userInfoLabel}>Goal</Text>
                        <Text style={styles.userInfoValue}>{user.goal || 'General Health'}</Text>
                    </View>
                    <View style={styles.userInfoItem}>
                        <Text style={styles.userInfoLabel}>Diet Type</Text>
                        <Text style={styles.userInfoValue}>{user.diet_type || 'No Preference'}</Text>
                    </View>
                </View>
            </View>

            {/* Generate Button */}
            {!mealPlan && (
                <View style={styles.generateContainer}>
                    <TouchableOpacity
                        style={styles.generateButton}
                        onPress={generatePlan}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.generateGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="restaurant" size={24} color="#fff" />
                                    <Text style={styles.generateButtonText}>Generate My Meal Plan</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}

            {/* Meal Plan */}
            {mealPlan && (
                <>
                    {/* Daily Summary */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Today's Nutrition Summary</Text>
                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>
                                    {calculateNutritionTotals([
                                        mealPlan.breakfast,
                                        mealPlan.lunch,
                                        mealPlan.dinner,
                                        mealPlan.snack,
                                    ]).calories}
                                </Text>
                                <Text style={styles.summaryLabel}>Total Calories</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>
                                    {calculateNutritionTotals([
                                        mealPlan.breakfast,
                                        mealPlan.lunch,
                                        mealPlan.dinner,
                                        mealPlan.snack,
                                    ]).protein}g
                                </Text>
                                <Text style={styles.summaryLabel}>Protein</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryValue}>4</Text>
                                <Text style={styles.summaryLabel}>Meals</Text>
                            </View>
                        </View>
                    </View>

                    {/* Meals */}
                    {renderMealCard(
                        'Breakfast',
                        mealPlan.breakfast,
                        'sunny',
                        ['#FFD166', '#F77F00'],
                        'breakfast'
                    )}

                    {renderMealCard(
                        'Lunch',
                        mealPlan.lunch,
                        'partly-sunny',
                        ['#06D6A0', '#118AB2'],
                        'lunch'
                    )}

                    {renderMealCard(
                        'Dinner',
                        mealPlan.dinner,
                        'moon',
                        ['#7209B7', '#560BAD'],
                        'dinner'
                    )}

                    {renderMealCard(
                        'Snack',
                        mealPlan.snack,
                        'ice-cream',
                        ['#F72585', '#B5179E'],
                        'snack'
                    )}

                    {/* AI Tips Button */}
                    <TouchableOpacity
                        style={styles.aiTipsButton}
                        onPress={() => setShowAITips(!showAITips)}
                    >
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.aiTipsGradient}
                        >
                            <Ionicons name="bulb" size={20} color="#fff" />
                            <Text style={styles.aiTipsButtonText}>
                                {showAITips ? 'Hide' : 'Show'} AI Nutritionist Tips
                            </Text>
                            <Ionicons
                                name={showAITips ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#fff"
                            />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* AI Tips */}
                    {showAITips && aiTips && (
                        <View style={styles.aiTipsCard}>
                            <Text style={styles.aiTipsText}>{aiTips}</Text>
                        </View>
                    )}

                    {/* Actions */}
                    <TouchableOpacity
                        style={styles.regenerateButton}
                        onPress={generatePlan}
                        disabled={loading}
                    >
                        <Ionicons name="refresh" size={20} color="#667eea" />
                        <Text style={styles.regenerateButtonText}>Generate New Plan</Text>
                    </TouchableOpacity>
                </>
            )}

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
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
    },
    userInfoCard: {
        backgroundColor: '#fff',
        margin: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    userInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    userInfoItem: {
        alignItems: 'center',
    },
    userInfoLabel: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 4,
    },
    userInfoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
    },
    generateContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    generateButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    generateGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    summaryCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 15,
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#667eea',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#757575',
    },
    mealCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    mealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    mealTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    mealTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
    refreshButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    mealContent: {
        padding: 16,
    },
    foodName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 4,
    },
    foodNameBangla: {
        fontSize: 16,
        color: '#667eea',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 16,
    },
    nutritionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    nutritionItem: {
        alignItems: 'center',
    },
    nutritionValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212121',
    },
    nutritionLabel: {
        fontSize: 12,
        color: '#757575',
        marginTop: 2,
    },
    portionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f4ff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        gap: 8,
    },
    portionText: {
        flex: 1,
        fontSize: 14,
        color: '#424242',
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff9e6',
        padding: 12,
        borderRadius: 10,
        gap: 8,
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: '#424242',
        fontStyle: 'italic',
    },
    aiTipsButton: {
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
    },
    aiTipsGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 10,
    },
    aiTipsButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    aiTipsCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
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
    aiTipsText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#424242',
    },
    regenerateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#667eea',
        gap: 8,
    },
    regenerateButtonText: {
        color: '#667eea',
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        marginTop: 50,
    },
});
