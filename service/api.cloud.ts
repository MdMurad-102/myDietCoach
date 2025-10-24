// API Service for MyDietCoach Mobile App
// This file communicates with the backend server via HTTP requests

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Backend API URL - update this with your server URL
// Using your computer's IP address so mobile app can connect
const API_URL = __DEV__
    ? 'http://192.168.1.110:3000/api'  // Development (your computer IP)
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
// STUB FUNCTIONS (Not yet implemented)
// ============================================

export async function getUserRecipes(userId: number): Promise<Recipe[]> {
    console.warn('getUserRecipes: Not yet implemented on backend');
    return [];
}

export async function createRecipe(userId: number, recipe: any): Promise<Recipe> {
    console.warn('createRecipe: Not yet implemented on backend');
    return { id: 1, userId, ...recipe };
}

export async function getUserMealPlans(userId: number): Promise<any[]> {
    console.warn('getUserMealPlans: Not yet implemented on backend');
    return [];
}

export async function createMealPlan(userId: number, plan: any): Promise<any> {
    console.warn('createMealPlan: Not yet implemented on backend');
    return { id: 1, userId, ...plan };
}

export async function getTodayMealPlan(userId: number): Promise<any[]> {
    console.warn('getTodayMealPlan: Not yet implemented on backend');
    return [];
}

export async function updateMealInPlan(mealId: number, data: any): Promise<void> {
    console.warn('updateMealInPlan: Not yet implemented on backend');
}

export async function scheduleMeal(userId: number, mealData: any): Promise<any> {
    console.warn('scheduleMeal: Not yet implemented on backend');
    return { id: 1, userId, ...mealData };
}

export async function dumpUsers() {
    console.warn('dumpUsers: Not available with backend API');
    return [];
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
