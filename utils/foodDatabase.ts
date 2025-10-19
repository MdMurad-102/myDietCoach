import bangladeshiFoods from '@/data/bangladeshiFoods.json';

export interface FoodItem {
    name: string;
    banglaName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    description: string;
    portionSize: string;
    healthTips: string;
    category: string;
}

export interface FoodDatabase {
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
    snacks: FoodItem[];
    traditional_dishes: FoodItem[];
    beverages: FoodItem[];
}

const foodDB = bangladeshiFoods as FoodDatabase;

/**
 * Get all foods by category
 */
export function getFoodsByCategory(category: keyof FoodDatabase): FoodItem[] {
    return foodDB[category] || [];
}

/**
 * Get all foods by meal type (breakfast, lunch, dinner, snack)
 */
export function getFoodsByMealType(mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): FoodItem[] {
    if (mealType === 'snack') {
        return foodDB.snacks;
    }
    return foodDB[mealType] || [];
}

/**
 * Search foods by name (English or Bangla)
 */
export function searchFoods(query: string): FoodItem[] {
    const lowerQuery = query.toLowerCase();
    const allFoods = getAllFoods();

    return allFoods.filter(food =>
        food.name.toLowerCase().includes(lowerQuery) ||
        food.banglaName.includes(query) ||
        food.description.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Get all foods from database
 */
export function getAllFoods(): FoodItem[] {
    return [
        ...foodDB.breakfast,
        ...foodDB.lunch,
        ...foodDB.dinner,
        ...foodDB.snacks,
        ...foodDB.traditional_dishes,
        ...foodDB.beverages,
    ];
}

/**
 * Get foods within calorie range
 */
export function getFoodsByCalorieRange(min: number, max: number): FoodItem[] {
    const allFoods = getAllFoods();
    return allFoods.filter(food => food.calories >= min && food.calories <= max);
}

/**
 * Get high protein foods (>15g protein)
 */
export function getHighProteinFoods(): FoodItem[] {
    const allFoods = getAllFoods();
    return allFoods.filter(food => food.protein >= 15);
}

/**
 * Get low calorie foods (<200 calories)
 */
export function getLowCalorieFoods(): FoodItem[] {
    const allFoods = getAllFoods();
    return allFoods.filter(food => food.calories < 200);
}

/**
 * Generate meal suggestions based on calorie target
 */
export function generateMealSuggestions(
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    calorieTarget: number,
    dietType?: string
): FoodItem[] {
    let foods = getFoodsByMealType(mealType);

    // Filter by diet type if specified
    if (dietType?.toLowerCase() === 'vegetarian') {
        foods = foods.filter(food =>
            !food.name.toLowerCase().includes('chicken') &&
            !food.name.toLowerCase().includes('beef') &&
            !food.name.toLowerCase().includes('fish') &&
            !food.name.toLowerCase().includes('egg') &&
            !food.name.toLowerCase().includes('meat')
        );
    }

    // Sort by how close to calorie target
    foods.sort((a, b) => {
        const diffA = Math.abs(a.calories - calorieTarget);
        const diffB = Math.abs(b.calories - calorieTarget);
        return diffA - diffB;
    });

    return foods.slice(0, 5); // Return top 5 suggestions
}

/**
 * Create a balanced meal plan for a day
 */
export function generateDailyMealPlan(
    totalCalories: number,
    dietType?: string
): {
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
    snacks: FoodItem[];
    totalCalories: number;
    totalProtein: number;
} {
    // Distribute calories: 25% breakfast, 35% lunch, 30% dinner, 10% snacks
    const breakfastCal = totalCalories * 0.25;
    const lunchCal = totalCalories * 0.35;
    const dinnerCal = totalCalories * 0.30;
    const snackCal = totalCalories * 0.10;

    const breakfast = generateMealSuggestions('breakfast', breakfastCal, dietType);
    const lunch = generateMealSuggestions('lunch', lunchCal, dietType);
    const dinner = generateMealSuggestions('dinner', dinnerCal, dietType);
    const snacks = generateMealSuggestions('snack', snackCal, dietType);

    // Calculate totals (using first suggestion from each)
    const selectedMeals = [
        breakfast[0],
        lunch[0],
        dinner[0],
        snacks[0],
    ].filter(Boolean);

    const actualTotal = selectedMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const actualProtein = selectedMeals.reduce((sum, meal) => sum + meal.protein, 0);

    return {
        breakfast,
        lunch,
        dinner,
        snacks,
        totalCalories: actualTotal,
        totalProtein: actualProtein,
    };
}

/**
 * Get food item by exact name
 */
export function getFoodByName(name: string): FoodItem | undefined {
    const allFoods = getAllFoods();
    return allFoods.find(food =>
        food.name.toLowerCase() === name.toLowerCase() ||
        food.banglaName === name
    );
}

/**
 * Calculate nutrition totals for multiple foods
 */
export function calculateNutritionTotals(foods: FoodItem[]): {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
} {
    return foods.reduce((totals, food) => ({
        calories: totals.calories + food.calories,
        protein: totals.protein + food.protein,
        carbs: totals.carbs + food.carbs,
        fat: totals.fat + food.fat,
        fiber: totals.fiber + food.fiber,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
}

/**
 * Get random food from category
 */
export function getRandomFood(category: keyof FoodDatabase): FoodItem | undefined {
    const foods = getFoodsByCategory(category);
    if (foods.length === 0) return undefined;
    return foods[Math.floor(Math.random() * foods.length)];
}

export default foodDB;
