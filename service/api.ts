// API Service for MyDietCoach Mobile App
// This file communicates with the backend server via HTTP requests

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Backend API URL - update this with your server URL
// Using localhost for Expo tunnel or your computer's IP for same network
const API_URL = __DEV__
    ? 'http://localhost:3000/api'  // Development (uses Expo tunnel)
    : 'https://your-backend-url.com/api'; // Production (deployed server)

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface User {
    id: number;
    email: string;
    name: string;
    picture?: string;
    subscription_id?: string;
    credit?: number;
    weight?: string;
    height?: string;
    gender?: string;
    goal?: string;
    age?: string;
    calories?: number;
    proteins?: number;
    country?: string;
    city?: string;
    diet_type?: string;
    waterGoal?: number;
    daily_water_goal?: number;
    createdAt?: Date;
    created_at?: Date;
    updated_at?: Date;
}

export interface WaterTracking {
    id: number;
    userId: number;
    user_id?: number;
    date: string;
    amount: number;
    water_consumed?: number;
    goal: number;
}

export interface ProgressTracking {
    id: number;
    userId: number;
    user_id?: number;
    date: string;
    weight?: number;
    bodyFat?: number;
    body_fat?: number;
    muscleMass?: number;
    muscle_mass?: number;
    notes?: string;
}

export interface Recipe {
    id: number;
    userId: number;
    user_id?: number;
    name: string;
    recipe_name?: string;
    description?: string;
    ingredients: string[];
    instructions: string[];
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    isFavorite?: boolean;
    createdAt?: Date;
    created_at?: Date;
}

export interface CustomRecipe {
    id: number;
    userId: number;
    user_id?: number;
    recipeName: string;
    recipe_name?: string;
    description?: string;
    ingredients: string[];
    cookingInstructions?: string;
    cooking_instructions?: string;
    isFavorite?: boolean;
    createdAt?: Date;
    created_at?: Date;
}

// ============================================
// USER API FUNCTIONS
// ============================================

/**
 * Register a new user
 */
export async function registerUser(email: string, name: string, password: string): Promise<User> {
    try {
        const response = await api.post('/users/register', { email, name, password });

        if (response.data.success) {
            // Store user in AsyncStorage for offline access
            await AsyncStorage.setItem('current_user', JSON.stringify(response.data.user));
            return response.data.user;
        }

        throw new Error('Registration failed');
    } catch (error: any) {
        console.error('Error registering user:', error);
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error('Failed to register user');
    }
}

/**
 * Authenticate user with email/password
 */
export async function authenticateUser(email: string, password: string): Promise<User> {
    try {
        const response = await api.post('/users/login', { email, password });

        if (response.data.success) {
            // Store user in AsyncStorage for offline access
            await AsyncStorage.setItem('current_user', JSON.stringify(response.data.user));
            return response.data.user;
        }

        throw new Error('Login failed');
    } catch (error: any) {
        console.error('Error logging in:', error);
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error('Invalid credentials');
    }
}

/**
 * Get user by email
 */
export async function getUser(email: string): Promise<User | null> {
    try {
        const response = await api.get(`/users/${email}`);

        if (response.data.success) {
            return response.data.user;
        }

        return null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

/**
 * Create or get user by email (for OAuth login)
 */
export async function createUser(email: string, name: string): Promise<User> {
    try {
        // Try to get existing user
        const existingUser = await getUser(email);
        if (existingUser) {
            return existingUser;
        }

        // Create new user with default password (for OAuth users)
        return await registerUser(email, name, 'oauth_user');
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: number, data: any): Promise<User> {
    try {
        const response = await api.put(`/users/${userId}`, data);

        if (response.data.success) {
            // Update cached user
            await AsyncStorage.setItem('current_user', JSON.stringify(response.data.user));
            return response.data.user;
        }

        throw new Error('Update failed');
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Failed to update profile');
    }
}

/**
 * Update water goal
 */
export async function updateWaterGoal(userId: number, goal: number): Promise<void> {
    try {
        await api.put(`/users/${userId}`, { daily_water_goal: goal });
    } catch (error) {
        console.error('Error updating water goal:', error);
        throw error;
    }
}

// ============================================
// WATER TRACKING API FUNCTIONS
// ============================================

/**
 * Track water intake
 */
export async function trackWater(userId: number, amount: number, goal: number): Promise<WaterTracking> {
    try {
        const response = await api.post('/water/track', { userId, amount, goal });

        if (response.data.success) {
            return {
                id: response.data.tracking.id,
                userId: response.data.tracking.user_id,
                date: response.data.tracking.date,
                amount: response.data.tracking.water_consumed,
                goal: goal
            };
        }

        throw new Error('Failed to track water');
    } catch (error) {
        console.error('Error tracking water:', error);
        throw error;
    }
}

/**
 * Get water tracking for today
 */
export async function getWaterTracking(userId: number): Promise<WaterTracking | null> {
    try {
        const response = await api.get(`/water/today/${userId}`);

        if (response.data.success && response.data.tracking) {
            return {
                id: response.data.tracking.id,
                userId: response.data.tracking.user_id,
                date: response.data.tracking.date,
                amount: response.data.tracking.water_consumed,
                goal: 8 // Default goal
            };
        }

        return null;
    } catch (error) {
        console.error('Error getting water tracking:', error);
        return null;
    }
}

/**
 * Reset water tracking for today
 */
export async function resetWaterTracking(userId: number): Promise<void> {
    try {
        await api.post('/water/reset', { userId });
    } catch (error) {
        console.error('Error resetting water tracking:', error);
        throw error;
    }
}

// ============================================
// CUSTOM RECIPES API FUNCTIONS
// ============================================

/**
 * Save custom recipe
 */
export async function saveCustomRecipe(
    userId: number,
    recipeName: string,
    ingredients: string[],
    instructions: string[],
    calories?: number,
    protein?: number,
    cookingTime?: string,
    servings?: number,
    mealType?: string
): Promise<CustomRecipe> {
    try {
        const response = await api.post('/recipes/custom', {
            userId,
            recipeName,
            ingredients,
            instructions,
            calories,
            protein
        });

        if (response.data.success) {
            return {
                id: response.data.recipe.id,
                userId: response.data.recipe.user_id,
                recipeName: response.data.recipe.recipe_name,
                ingredients,
                cookingInstructions: instructions.join('\n'),
                createdAt: new Date(response.data.recipe.created_at)
            };
        }

        throw new Error('Failed to save recipe');
    } catch (error) {
        console.error('Error saving recipe:', error);
        throw error;
    }
}

/**
 * Get user's custom recipes
 */
export async function getUserCustomRecipes(userId: number): Promise<CustomRecipe[]> {
    try {
        const response = await api.get(`/recipes/custom/${userId}`);

        if (response.data.success) {
            return response.data.recipes.map((recipe: any) => ({
                id: recipe.id,
                userId: recipe.user_id,
                recipeName: recipe.recipe_name,
                ingredients: recipe.json_data?.ingredients || [],
                description: recipe.json_data?.instructions?.join('\n'),
                createdAt: new Date(recipe.created_at)
            }));
        }

        return [];
    } catch (error) {
        console.error('Error getting recipes:', error);
        return [];
    }
}

/**
 * Delete custom recipe
 */
export async function deleteCustomRecipe(recipeId: number): Promise<void> {
    try {
        await api.delete(`/recipes/${recipeId}`);
    } catch (error) {
        console.error('Error deleting recipe:', error);
        throw error;
    }
}

/**
 * Toggle custom recipe favorite
 */
export async function toggleCustomRecipeFavorite(recipeId: number): Promise<void> {
    console.warn('toggleCustomRecipeFavorite: Not yet implemented on backend');
    // TODO: Implement on backend
}

// ============================================
// PROGRESS TRACKING API FUNCTIONS
// ============================================

/**
 * Add progress entry
 */
export async function addProgressEntry(userId: number, data: any): Promise<ProgressTracking> {
    try {
        const response = await api.post('/progress', {
            userId,
            weight: data.weight,
            bodyFat: data.bodyFat,
            muscleMass: data.muscleMass,
            notes: data.notes
        });

        if (response.data.success) {
            return {
                id: response.data.progress.id,
                userId: response.data.progress.user_id,
                date: response.data.progress.date,
                weight: response.data.progress.weight,
                bodyFat: response.data.progress.body_fat,
                muscleMass: response.data.progress.muscle_mass,
                notes: response.data.progress.notes
            };
        }

        throw new Error('Failed to add progress');
    } catch (error) {
        console.error('Error adding progress:', error);
        throw error;
    }
}

/**
 * Get progress entries
 */
export async function getProgressEntries(
    userId: number,
    startDate?: string,
    endDate?: string
): Promise<ProgressTracking[]> {
    try {
        let url = `/progress/${userId}`;
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await api.get(url);

        if (response.data.success) {
            return response.data.progress.map((p: any) => ({
                id: p.id,
                userId: p.user_id,
                date: p.date,
                weight: p.weight,
                bodyFat: p.body_fat,
                muscleMass: p.muscle_mass,
                notes: p.notes
            }));
        }

        return [];
    } catch (error) {
        console.error('Error getting progress:', error);
        return [];
    }
}

// ============================================
// MEAL MANAGEMENT FUNCTIONS
// ============================================

/**
 * Save a complete daily meal plan (breakfast, lunch, dinner, snacks)
 */
export async function saveDailyMealPlan(userId: number, date: string, meals: {
    breakfast?: any,
    lunch?: any,
    dinner?: any,
    snacks?: any
}): Promise<any> {
    try {
        const response = await api.post('/meals/daily-plan', {
            userId,
            date,
            meals
        });
        return (response.data as any).plan;
    } catch (error) {
        console.error('Error saving daily meal plan:', error);
        throw new Error('Failed to save daily meal plan');
    }
}

/**
 * Update water intake for a specific date
 * This is an independent operation that only updates water, not meals
 */
export async function updateWaterIntakeAPI(userId: number, date: string, waterGlasses: number): Promise<any> {
    try {
        const response = await api.patch('/meals/water-intake', {
            userId,
            date,
            waterGlasses
        });
        return response.data;
    } catch (error) {
        console.error('Error updating water intake:', error);
        throw new Error('Failed to update water intake');
    }
}

/**
 * Update meal consumed state (mark meal as eaten or not eaten)
 * This persists the consumed state to the database
 */
export async function updateMealConsumedAPI(userId: number, date: string, mealId: string, consumed: boolean): Promise<any> {
    try {
        const response = await api.patch('/meals/consumed', {
            userId,
            date,
            mealId,
            consumed
        });
        return response.data;
    } catch (error: any) {
        // If meal not found (404), return a flag instead of throwing
        if (error.response?.status === 404) {
            console.log(`ℹ️ Meal ${mealId} not found in database for ${date}`);
            return { success: false, notFound: true };
        }
        console.error('Error updating meal consumed state:', error);
        throw new Error('Failed to update meal consumed state');
    }
}

/**
 * Add a single meal to a specific meal type
 */
export async function addMealToDate(userId: number, date: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', meal: any): Promise<any> {
    try {
        const response = await api.post('/meals/add', {
            userId,
            date,
            mealType,
            meal
        });
        return (response.data as any).plan;
    } catch (error) {
        console.error('Error adding meal:', error);
        throw new Error('Failed to add meal');
    }
}

/**
 * Get meals for a specific date
 */
export async function getMealsForDate(userId: number, date: string): Promise<any> {
    try {
        const response = await api.get(`/meals/date/${userId}/${date}`);
        return response.data as any;
    } catch (error) {
        console.error('Error getting meals for date:', error);
        throw new Error('Failed to get meals');
    }
}

/**
 * Get meals for a date range
 */
export async function getMealsForRange(userId: number, startDate: string, endDate: string): Promise<any[]> {
    try {
        const response = await api.get(`/meals/range/${userId}`, {
            params: { startDate, endDate }
        });
        return (response.data as any).plans;
    } catch (error) {
        console.error('Error getting meal range:', error);
        throw new Error('Failed to get meal range');
    }
}

/**
 * Mark a meal as consumed
 */
export async function markMealConsumed(userId: number, date: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks'): Promise<any> {
    try {
        const response = await api.post('/meals/consume', {
            userId,
            date,
            mealType
        });
        return (response.data as any).plan;
    } catch (error) {
        console.error('Error marking meal consumed:', error);
        throw new Error('Failed to mark meal consumed');
    }
}

/**
 * Delete a meal from a specific meal type
 */
export async function deleteMealFromDate(userId: number, date: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks'): Promise<any> {
    try {
        const response = await api.delete(`/meals/${userId}/${date}/${mealType}`);
        return (response.data as any).plan;
    } catch (error) {
        console.error('Error deleting meal:', error);
        throw new Error('Failed to delete meal');
    }
}

// ============================================
// LEGACY/STUB FUNCTIONS (For backward compatibility)
// ============================================

export async function getUserRecipes(userId: number): Promise<Recipe[]> {
    try {
        const response = await api.get(`/recipes/custom/${userId}`);
        return (response.data as any).recipes || [];
    } catch (error) {
        console.error('Error getting user recipes:', error);
        return [];
    }
}

export async function createRecipe(userId: number, recipe: any): Promise<Recipe> {
    console.warn('createRecipe: Not yet implemented on backend');
    return { id: 1, userId, ...recipe };
}

export async function getUserMealPlans(userId: number): Promise<any[]> {
    const today = new Date();
    const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Include next 14 days
    return await getMealsForRange(userId, startDate, endDate);
}

export async function createMealPlan(userId: number, plan: any): Promise<any> {
    const date = plan.date || new Date().toISOString().split('T')[0];
    return await saveDailyMealPlan(userId, date, plan.meals);
}

export async function getTodayMealPlan(userId: number): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    return await getMealsForDate(userId, today);
}

export async function updateMealInPlan(mealId: number, data: any): Promise<void> {
    console.warn('updateMealInPlan: Use addMealToDate instead');
}

export async function scheduleMeal(userId: number, mealData: any): Promise<any> {
    const date = mealData.date || new Date().toISOString().split('T')[0];
    const mealType = mealData.mealType || 'snacks';
    return await addMealToDate(userId, date, mealType, mealData);
}

export async function dumpUsers() {
    console.warn('dumpUsers: Not available with backend API');
    return [];
}

// ============================================
// DAILY NUTRITION FUNCTIONS
// ============================================

/**
 * Track daily nutrition
 */
export async function trackDailyNutrition(
    userId: number,
    date: string,
    calories: number,
    protein: number,
    carbs?: number,
    fat?: number,
    fiber?: number,
    sugar?: number,
    sodium?: number
): Promise<any> {
    try {
        const response = await api.post('/nutrition/track', {
            userId,
            date,
            calories,
            protein,
            carbs,
            fat,
            fiber,
            sugar,
            sodium
        });
        return (response.data as any).nutrition;
    } catch (error) {
        console.error('Error tracking nutrition:', error);
        throw new Error('Failed to track nutrition');
    }
}

/**
 * Get daily nutrition for a specific date
 */
export async function getDailyNutrition(userId: number, date: string): Promise<any> {
    try {
        const response = await api.get(`/nutrition/${userId}/${date}`);
        return (response.data as any).nutrition;
    } catch (error) {
        console.error('Error getting nutrition:', error);
        throw new Error('Failed to get nutrition');
    }
}

/**
 * Get nutrition for date range
 */
export async function getNutritionRange(
    userId: number,
    startDate: string,
    endDate: string
): Promise<any[]> {
    try {
        const response = await api.get(`/nutrition/range/${userId}`, {
            params: { startDate, endDate }
        });
        return (response.data as any).nutrition;
    } catch (error) {
        console.error('Error getting nutrition range:', error);
        throw new Error('Failed to get nutrition range');
    }
}

// ============================================
// DAILY TASKS FUNCTIONS
// ============================================

/**
 * Update or create a daily task
 */
export async function updateDailyTask(
    userId: number,
    date: string,
    taskId: string,
    completed: boolean,
    currentValue?: number
): Promise<any> {
    try {
        const response = await api.post('/tasks/update', {
            userId,
            date,
            taskId,
            completed,
            currentValue
        });
        return (response.data as any).task;
    } catch (error) {
        console.error('Error updating task:', error);
        throw new Error('Failed to update task');
    }
}

/**
 * Get daily tasks for a specific date
 */
export async function getDailyTasks(userId: number, date: string): Promise<any[]> {
    try {
        const response = await api.get(`/tasks/${userId}/${date}`);
        return (response.data as any).tasks;
    } catch (error) {
        console.error('Error getting tasks:', error);
        throw new Error('Failed to get tasks');
    }
}

/**
 * Toggle task completion
 */
export async function toggleTaskCompletion(
    userId: number,
    date: string,
    taskId: string
): Promise<any> {
    try {
        const response = await api.put('/tasks/toggle', {
            userId,
            date,
            taskId
        });
        return (response.data as any).task;
    } catch (error) {
        console.error('Error toggling task:', error);
        throw new Error('Failed to toggle task');
    }
}

// ============================================
// WEIGHT GOALS FUNCTIONS
// ============================================

/**
 * Create weight goal
 */
export async function createWeightGoal(
    userId: number,
    currentWeight: number,
    targetWeight: number,
    startWeight: number,
    goalDate: string,
    weeklyGoal: number
): Promise<any> {
    try {
        const response = await api.post('/goals/weight', {
            userId,
            currentWeight,
            targetWeight,
            startWeight,
            goalDate,
            weeklyGoal
        });
        return (response.data as any).goal;
    } catch (error) {
        console.error('Error creating weight goal:', error);
        throw new Error('Failed to create weight goal');
    }
}

/**
 * Get active weight goal
 */
export async function getActiveWeightGoal(userId: number): Promise<any> {
    try {
        const response = await api.get(`/goals/weight/${userId}`);
        return (response.data as any).goal;
    } catch (error) {
        console.error('Error getting weight goal:', error);
        throw new Error('Failed to get weight goal');
    }
}

/**
 * Update weight goal progress
 */
export async function updateWeightGoalProgress(
    goalId: number,
    currentWeight: number
): Promise<any> {
    try {
        const response = await api.put(`/goals/weight/${goalId}`, {
            currentWeight
        });
        return (response.data as any).goal;
    } catch (error) {
        console.error('Error updating weight goal:', error);
        throw new Error('Failed to update weight goal');
    }
}

// ============================================
// DAILY MEAL PLANS FUNCTIONS
// ============================================

/**
 * Create or update daily meal plan
 */
export async function saveDailyMealPlanV2(
    userId: number,
    date: string,
    mealPlanData: any,
    planName: string,
    autoGenerated: boolean = false
): Promise<any> {
    try {
        const response = await api.post('/daily-meal-plan', {
            userId,
            date,
            mealPlanData,
            planName,
            autoGenerated
        });
        return (response.data as any).plan;
    } catch (error) {
        console.error('Error saving daily meal plan:', error);
        throw new Error('Failed to save daily meal plan');
    }
}

/**
 * Get daily meal plan
 */
export async function getDailyMealPlanV2(userId: number, date: string): Promise<any> {
    try {
        const response = await api.get(`/daily-meal-plan/${userId}/${date}`);
        return (response.data as any).plan;
    } catch (error) {
        console.error('Error getting daily meal plan:', error);
        throw new Error('Failed to get daily meal plan');
    }
}

/**
 * Mark meal as consumed in daily plan
 */
export async function markMealConsumedInDailyPlan(
    userId: number,
    date: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks',
    consumed: boolean
): Promise<any> {
    try {
        const response = await api.put('/daily-meal-plan/consume', {
            userId,
            date,
            mealType,
            consumed
        });
        return (response.data as any).plan;
    } catch (error) {
        console.error('Error marking meal consumed:', error);
        throw new Error('Failed to mark meal consumed');
    }
}

// ============================================
// WEIGHT TRACKING API
// ============================================

export interface WeightLog {
    id: number;
    user_id: number;
    weight: number;
    bmi: number | null;
    log_date: string;
    notes?: string;
    created_at: string;
}

/**
 * Log weight progress
 */
export async function logWeight(
    userId: number,
    weight: number,
    date: string,
    notes?: string
): Promise<WeightLog> {
    try {
        const response = await api.post('/progress/weight', {
            userId,
            weight,
            date,
            notes
        });
        return (response.data as any).log;
    } catch (error) {
        console.error('Error logging weight:', error);
        throw new Error('Failed to log weight');
    }
}

/**
 * Get weight history
 */
export async function getWeightHistory(
    userId: number,
    startDate?: string,
    endDate?: string
): Promise<WeightLog[]> {
    try {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await api.get(`/progress/weight/${userId}`, { params });
        return (response.data as any).logs || [];
    } catch (error) {
        console.error('Error fetching weight history:', error);
        throw new Error('Failed to fetch weight history');
    }
}

/**
 * Get latest weight log
 */
export async function getLatestWeight(userId: number): Promise<WeightLog | null> {
    try {
        const response = await api.get(`/progress/weight/${userId}/latest`);
        return (response.data as any).log || null;
    } catch (error) {
        console.error('Error fetching latest weight:', error);
        throw new Error('Failed to fetch latest weight');
    }
}

// ============================================
// OFFLINE SUPPORT (Optional)
// ============================================

/**
 * Get cached user from AsyncStorage
 */
export async function getCachedUser(): Promise<User | null> {
    try {
        const userJson = await AsyncStorage.getItem('current_user');
        return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
        console.error('Error getting cached user:', error);
        return null;
    }
}

/**
 * Clear cached user
 */
export async function clearCachedUser(): Promise<void> {
    try {
        await AsyncStorage.removeItem('current_user');
    } catch (error) {
        console.error('Error clearing cached user:', error);
    }
}
