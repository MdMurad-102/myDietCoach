// Bangladesh Daily Meal Plan Generator
// Smart random selection with calorie balancing and repetition avoidance
// NOW USES EXPANDED bangladeshiFoods.json DATABASE

import { FoodItem, getFoodsByMealType } from './foodDatabase';

// Convert FoodItem to BangladeshMeal format for compatibility
interface BangladeshMeal {
    id: string;
    name: string;           // Bangla name
    nameEn: string;        // English name
    category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    ingredients: string[];
    description: string;
    prepTime: string;
    servings: number;
    isVegetarian: boolean;
    isVegan: boolean;
    tags: string[];
    portionSize?: string;
    healthTips?: string;
}

// Convert FoodItem from JSON to BangladeshMeal
function convertFoodItemToMeal(food: FoodItem, index: number, category: 'breakfast' | 'lunch' | 'dinner' | 'snack'): BangladeshMeal {
    const prefix = category === 'breakfast' ? 'bf' : category === 'lunch' ? 'ln' : category === 'dinner' ? 'dn' : 'sn';

    // Check if vegetarian by checking for meat/fish/egg keywords
    const nonVegKeywords = ['chicken', 'beef', 'fish', 'egg', 'meat', 'mutton', 'prawn', 'shrimp', 'hilsa'];
    const nameAndDesc = (food.name + ' ' + food.description).toLowerCase();
    const isVegetarian = !nonVegKeywords.some(keyword => nameAndDesc.includes(keyword));

    // Check if vegan (no dairy, eggs, or meat)
    const nonVeganKeywords = [...nonVegKeywords, 'milk', 'yogurt', 'cheese', 'paneer', 'ghee', 'butter'];
    const isVegan = !nonVeganKeywords.some(keyword => nameAndDesc.includes(keyword));

    return {
        id: `${prefix}${String(index + 1).padStart(3, '0')}`,
        name: food.banglaName,
        nameEn: food.name,
        category: category,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        ingredients: [food.description], // Use description as ingredient summary
        description: food.description,
        prepTime: '20-30 minutes', // Default prep time
        servings: 1,
        isVegetarian: isVegetarian,
        isVegan: isVegan,
        tags: ['from-database', food.fiber >= 5 ? 'high-fiber' : '', food.protein >= 20 ? 'high-protein' : ''].filter(Boolean),
        portionSize: food.portionSize,
        healthTips: food.healthTips,
    };
}

// Load meals dynamically from bangladeshiFoods.json
function loadMealsFromJSON() {
    const breakfastFoods = getFoodsByMealType('breakfast');
    const lunchFoods = getFoodsByMealType('lunch');
    const dinnerFoods = getFoodsByMealType('dinner');
    const snackFoods = getFoodsByMealType('snack');

    return {
        breakfastMeals: breakfastFoods.map((food, idx) => convertFoodItemToMeal(food, idx, 'breakfast')),
        lunchMeals: lunchFoods.map((food, idx) => convertFoodItemToMeal(food, idx, 'lunch')),
        dinnerMeals: dinnerFoods.map((food, idx) => convertFoodItemToMeal(food, idx, 'dinner')),
        snackMeals: snackFoods.map((food, idx) => convertFoodItemToMeal(food, idx, 'snack')),
    };
}

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
 * NOW USES EXPANDED bangladeshiFoods.json (88 items)
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

    // Load meals dynamically from expanded bangladeshiFoods.json
    const { breakfastMeals, lunchMeals, dinnerMeals, snackMeals } = loadMealsFromJSON();

    console.log('🍽️ Loaded meals from bangladeshiFoods.json:');
    console.log(`  Breakfast: ${breakfastMeals.length} options`);
    console.log(`  Lunch: ${lunchMeals.length} options`);
    console.log(`  Dinner: ${dinnerMeals.length} options`);
    console.log(`  Snacks: ${snackMeals.length} options`);
    console.log(`  Total: ${breakfastMeals.length + lunchMeals.length + dinnerMeals.length + snackMeals.length} meals available`);

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
            // FIXED: Select randomly from close matches
            const randomIndex = Math.floor(Math.random() * closeMatches.length);
            console.log(`  Selected ${closeMatches[randomIndex].nameEn} from ${closeMatches.length} close matches (target: ${targetCal} cal)`);
            return closeMatches[randomIndex];
        }

        // IMPROVED: If no close matches, find ALL meals with minimum difference and pick randomly
        let minDiff = Math.abs(filteredMeals[0].calories - targetCal);

        // First pass: find minimum difference
        for (const meal of filteredMeals) {
            const diff = Math.abs(meal.calories - targetCal);
            if (diff < minDiff) {
                minDiff = diff;
            }
        }

        // Second pass: collect all meals with that minimum difference
        const closestMeals = filteredMeals.filter(
            meal => Math.abs(meal.calories - targetCal) === minDiff
        );

        // Randomly select from closest meals
        const randomIndex = Math.floor(Math.random() * closestMeals.length);
        console.log(`  Selected ${closestMeals[randomIndex].nameEn} from ${closestMeals.length} closest meals (diff: ${minDiff} cal)`);
        return closestMeals[randomIndex];
    };

    // Select meals for each category with tighter tolerance for accuracy
    console.log('🎲 Selecting meals randomly...');
    const breakfast = selectMeal(breakfastMeals, calorieTargets.breakfast, 100); // Tighter tolerance = more accuracy
    const lunch = selectMeal(lunchMeals, calorieTargets.lunch, 100);
    const dinner = selectMeal(dinnerMeals, calorieTargets.dinner, 100);
    const snack = selectMeal(snackMeals, calorieTargets.snack, 75);

    console.log('\n✅ Generated Meal Plan:');
    console.log(`  Breakfast: ${breakfast.nameEn} (${breakfast.calories} cal, target: ${calorieTargets.breakfast} cal)`);
    console.log(`  Lunch: ${lunch.nameEn} (${lunch.calories} cal, target: ${calorieTargets.lunch} cal)`);
    console.log(`  Dinner: ${dinner.nameEn} (${dinner.calories} cal, target: ${calorieTargets.dinner} cal)`);
    console.log(`  Snack: ${snack.nameEn} (${snack.calories} cal, target: ${calorieTargets.snack} cal)`);

    // Calculate totals
    const totalCalories = breakfast.calories + lunch.calories + dinner.calories + snack.calories;
    const totalProtein = breakfast.protein + lunch.protein + dinner.protein + snack.protein;
    const totalCarbs = breakfast.carbs + lunch.carbs + dinner.carbs + snack.carbs;
    const totalFat = breakfast.fat + lunch.fat + dinner.fat + snack.fat;

    const calorieDifference = totalCalories - targetCalories;
    const percentageDiff = ((calorieDifference / targetCalories) * 100).toFixed(1);

    console.log(`\n📊 Total: ${totalCalories} cal (Target: ${targetCalories} cal)`);
    console.log(`   Difference: ${calorieDifference > 0 ? '+' : ''}${calorieDifference} cal (${percentageDiff}%)`);
    console.log(`   Protein: ${totalProtein}g, Carbs: ${totalCarbs}g, Fat: ${totalFat}g`);

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

    // Load meals dynamically from expanded bangladeshiFoods.json
    const { breakfastMeals, lunchMeals, dinnerMeals, snackMeals } = loadMealsFromJSON();

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

    // Select new meal with improved randomization
    const selectMeal = (
        meals: BangladeshMeal[],
        targetCal: number,
        tolerance: number = 200 // Wider tolerance for more variety
    ): BangladeshMeal => {
        const filteredMeals = filterMeals(meals);

        if (filteredMeals.length === 0) {
            console.log('⚠️ No meals after filtering, using random from all meals');
            return meals[Math.floor(Math.random() * meals.length)];
        }

        // Find meals within calorie tolerance
        const closeMatches = filteredMeals.filter(
            meal => Math.abs(meal.calories - targetCal) <= tolerance
        );

        if (closeMatches.length > 0) {
            const selected = closeMatches[Math.floor(Math.random() * closeMatches.length)];
            console.log(`🔄 Regenerated: ${selected.nameEn} from ${closeMatches.length} options`);
            return selected;
        }

        // If no close matches, find all meals with minimum difference
        let minDiff = Math.abs(filteredMeals[0].calories - targetCal);
        for (const meal of filteredMeals) {
            const diff = Math.abs(meal.calories - targetCal);
            if (diff < minDiff) {
                minDiff = diff;
            }
        }

        const closestMeals = filteredMeals.filter(
            meal => Math.abs(meal.calories - targetCal) === minDiff
        );

        const selected = closestMeals[Math.floor(Math.random() * closestMeals.length)];
        console.log(`🔄 Regenerated: ${selected.nameEn} from ${closestMeals.length} closest options`);
        return selected;
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
