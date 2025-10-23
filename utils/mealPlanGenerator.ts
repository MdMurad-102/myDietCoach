// Bangladesh Daily Meal Plan Generator
// Smart random selection with calorie balancing and repetition avoidance

import {
    BangladeshMeal,
    breakfastMeals,
    lunchMeals,
    dinnerMeals,
    snackMeals,
} from './bangladeshMealDatabase';

export interface DailyMealPlan {
    breakfast: BangladeshMeal;
    lunch: BangladeshMeal;
    dinner: BangladeshMeal;
    snack: BangladeshMeal;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    date: string; // ISO format YYYY-MM-DD
}

export interface MealPlanOptions {
    targetCalories?: number;       // Target total calories (default: 2000)
    vegetarianOnly?: boolean;      // Only vegetarian meals
    veganOnly?: boolean;           // Only vegan meals
    avoidMealIds?: string[];       // Meal IDs to avoid (recent meals)
    highProtein?: boolean;         // Prefer high protein options
    quickMeals?: boolean;          // Prefer meals with shorter prep time
}

/**
 * Generate a complete daily meal plan with smart random selection
 */
export const generateDailyMealPlan = (options: MealPlanOptions = {}): DailyMealPlan => {
    const {
        targetCalories = 2000,
        vegetarianOnly = false,
        veganOnly = false,
        avoidMealIds = [],
        highProtein = false,
        quickMeals = false,
    } = options;

    // Calculate calorie targets for each meal
    // Breakfast: 25%, Lunch: 35%, Dinner: 30%, Snack: 10%
    const calorieTargets = {
        breakfast: targetCalories * 0.25,  // 500 cal
        lunch: targetCalories * 0.35,      // 700 cal
        dinner: targetCalories * 0.30,     // 600 cal
        snack: targetCalories * 0.10,      // 200 cal
    };

    // Filter meals based on dietary preferences
    const filterMeals = (meals: BangladeshMeal[]): BangladeshMeal[] => {
        let filtered = meals;

        // Avoid recently consumed meals
        if (avoidMealIds.length > 0) {
            filtered = filtered.filter(meal => !avoidMealIds.includes(meal.id));
        }

        // Vegetarian filter
        if (vegetarianOnly) {
            filtered = filtered.filter(meal => meal.isVegetarian);
        }

        // Vegan filter (more restrictive than vegetarian)
        if (veganOnly) {
            filtered = filtered.filter(meal => meal.isVegan);
        }

        // High protein preference
        if (highProtein && filtered.length > 0) {
            const avgProtein = filtered.reduce((sum, m) => sum + m.protein, 0) / filtered.length;
            filtered = filtered.filter(meal => meal.protein >= avgProtein);
        }

        // Quick meals preference
        if (quickMeals && filtered.length > 0) {
            filtered = filtered.filter(meal => {
                const prepMinutes = parseInt(meal.prepTime.split(' ')[0]);
                return prepMinutes <= 30;
            });
        }

        return filtered;
    };

    // Smart random selection based on calorie target
    const selectMeal = (
        meals: BangladeshMeal[],
        targetCal: number,
        tolerance: number = 150
    ): BangladeshMeal => {
        const filteredMeals = filterMeals(meals);

        if (filteredMeals.length === 0) {
            // Fallback: if filters are too restrictive, use original meals
            return meals[Math.floor(Math.random() * meals.length)];
        }

        // Find meals within calorie tolerance
        const closeMatches = filteredMeals.filter(
            meal => Math.abs(meal.calories - targetCal) <= tolerance
        );

        if (closeMatches.length > 0) {
            // Select randomly from close matches
            return closeMatches[Math.floor(Math.random() * closeMatches.length)];
        }

        // If no close matches, select the closest one
        let closest = filteredMeals[0];
        let minDiff = Math.abs(filteredMeals[0].calories - targetCal);

        for (const meal of filteredMeals) {
            const diff = Math.abs(meal.calories - targetCal);
            if (diff < minDiff) {
                minDiff = diff;
                closest = meal;
            }
        }

        return closest;
    };

    // Select meals for each category
    const breakfast = selectMeal(breakfastMeals, calorieTargets.breakfast);
    const lunch = selectMeal(lunchMeals, calorieTargets.lunch);
    const dinner = selectMeal(dinnerMeals, calorieTargets.dinner);
    const snack = selectMeal(snackMeals, calorieTargets.snack);

    // Calculate totals
    const totalCalories = breakfast.calories + lunch.calories + dinner.calories + snack.calories;
    const totalProtein = breakfast.protein + lunch.protein + dinner.protein + snack.protein;
    const totalCarbs = breakfast.carbs + lunch.carbs + dinner.carbs + snack.carbs;
    const totalFat = breakfast.fat + lunch.fat + dinner.fat + snack.fat;

    // Get today's date in ISO format
    const today = new Date();
    const date = today.toISOString().split('T')[0]; // YYYY-MM-DD

    return {
        breakfast,
        lunch,
        dinner,
        snack,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        date,
    };
};

/**
 * Regenerate a specific meal in the plan
 */
export const regenerateMeal = (
    currentPlan: DailyMealPlan,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    options: MealPlanOptions = {}
): DailyMealPlan => {
    const {
        targetCalories = 2000,
        vegetarianOnly = false,
        veganOnly = false,
        highProtein = false,
        quickMeals = false,
    } = options;

    // Get current meal IDs to avoid repetition
    const currentMealIds = [
        currentPlan.breakfast.id,
        currentPlan.lunch.id,
        currentPlan.dinner.id,
        currentPlan.snack.id,
    ];

    // Calculate calorie targets
    const calorieTargets = {
        breakfast: targetCalories * 0.25,
        lunch: targetCalories * 0.35,
        dinner: targetCalories * 0.30,
        snack: targetCalories * 0.10,
    };

    // Get meal pool for the specific type
    const mealPools = {
        breakfast: breakfastMeals,
        lunch: lunchMeals,
        dinner: dinnerMeals,
        snack: snackMeals,
    };

    // Filter meals
    const filterMeals = (meals: BangladeshMeal[]): BangladeshMeal[] => {
        let filtered = meals.filter(meal => !currentMealIds.includes(meal.id));

        if (vegetarianOnly) {
            filtered = filtered.filter(meal => meal.isVegetarian);
        }

        if (veganOnly) {
            filtered = filtered.filter(meal => meal.isVegan);
        }

        if (highProtein && filtered.length > 0) {
            const avgProtein = filtered.reduce((sum, m) => sum + m.protein, 0) / filtered.length;
            filtered = filtered.filter(meal => meal.protein >= avgProtein);
        }

        if (quickMeals && filtered.length > 0) {
            filtered = filtered.filter(meal => {
                const prepMinutes = parseInt(meal.prepTime.split(' ')[0]);
                return prepMinutes <= 30;
            });
        }

        return filtered;
    };

    // Select new meal
    const selectMeal = (
        meals: BangladeshMeal[],
        targetCal: number,
        tolerance: number = 150
    ): BangladeshMeal => {
        const filteredMeals = filterMeals(meals);

        if (filteredMeals.length === 0) {
            return meals[Math.floor(Math.random() * meals.length)];
        }

        const closeMatches = filteredMeals.filter(
            meal => Math.abs(meal.calories - targetCal) <= tolerance
        );

        if (closeMatches.length > 0) {
            return closeMatches[Math.floor(Math.random() * closeMatches.length)];
        }

        return filteredMeals[Math.floor(Math.random() * filteredMeals.length)];
    };

    // Generate new meal
    const newMeal = selectMeal(mealPools[mealType], calorieTargets[mealType]);

    // Create updated plan
    const updatedPlan = { ...currentPlan };
    updatedPlan[mealType] = newMeal;

    // Recalculate totals
    updatedPlan.totalCalories =
        updatedPlan.breakfast.calories +
        updatedPlan.lunch.calories +
        updatedPlan.dinner.calories +
        updatedPlan.snack.calories;

    updatedPlan.totalProtein =
        updatedPlan.breakfast.protein +
        updatedPlan.lunch.protein +
        updatedPlan.dinner.protein +
        updatedPlan.snack.protein;

    updatedPlan.totalCarbs =
        updatedPlan.breakfast.carbs +
        updatedPlan.lunch.carbs +
        updatedPlan.dinner.carbs +
        updatedPlan.snack.carbs;

    updatedPlan.totalFat =
        updatedPlan.breakfast.fat +
        updatedPlan.lunch.fat +
        updatedPlan.dinner.fat +
        updatedPlan.snack.fat;

    return updatedPlan;
};

/**
 * Get meal IDs from previous days to avoid repetition
 */
export const getRecentMealIds = (previousMeals: any[]): string[] => {
    const recentIds: string[] = [];

    // Extract meal IDs from previous meals (last 3 days)
    previousMeals.slice(-12).forEach((meal: any) => {
        if (meal.recipeId) {
            recentIds.push(meal.recipeId);
        }
    });

    return recentIds;
};

/**
 * Check if meal plan meets nutritional requirements
 */
export const validateMealPlan = (plan: DailyMealPlan, targetCalories: number = 2000): {
    valid: boolean;
    warnings: string[];
} => {
    const warnings: string[] = [];

    // Check calorie deviation (within 10%)
    const calorieDiff = Math.abs(plan.totalCalories - targetCalories);
    const calorieDeviation = (calorieDiff / targetCalories) * 100;

    if (calorieDeviation > 10) {
        warnings.push(`Calories deviate by ${calorieDeviation.toFixed(1)}% from target`);
    }

    // Check protein (should be at least 15% of calories)
    const proteinCalories = plan.totalProtein * 4; // 1g protein = 4 calories
    const proteinPercentage = (proteinCalories / plan.totalCalories) * 100;

    if (proteinPercentage < 15) {
        warnings.push(`Low protein: ${proteinPercentage.toFixed(1)}% (recommended: >15%)`);
    }

    // Check carbs (should be 45-65% of calories)
    const carbsCalories = plan.totalCarbs * 4;
    const carbsPercentage = (carbsCalories / plan.totalCalories) * 100;

    if (carbsPercentage < 45 || carbsPercentage > 65) {
        warnings.push(`Carbs outside optimal range: ${carbsPercentage.toFixed(1)}% (recommended: 45-65%)`);
    }

    return {
        valid: warnings.length === 0,
        warnings,
    };
};
