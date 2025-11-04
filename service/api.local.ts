// Mock API service for React Native
// TODO: Replace with actual HTTP calls to your backend API server

import AsyncStorage from '@react-native-async-storage/async-storage';

// Type definitions matching UserContext
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
    waterGoal?: number; // Internal field
    daily_water_goal?: number; // External field for compatibility
    createdAt?: Date;
    created_at?: Date;
    updated_at?: Date;
}

export interface WaterTracking {
    id: number;
    userId: number;
    date: string;
    amount: number;
    goal: number;
}

export interface ProgressTracking {
    id: number;
    userId: number;
    date: string;
    weight?: number;
    bodyFat?: number;
    muscleMass?: number;
    notes?: string;
}

export interface Recipe {
    id: number;
    userId: number;
    name: string;
    description?: string;
    ingredients: string[];
    instructions: string[];
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    isFavorite?: boolean;
    createdAt?: Date;
}

export interface CustomRecipe {
    id: number;
    userId: number;
    recipeName: string;
    description?: string;
    ingredients: string[];
    cookingInstructions?: string;
    isFavorite?: boolean;
    createdAt?: Date;
}

export interface MealPlan {
    id: number;
    userId: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    meals: any[];
}

export interface ScheduledMeal {
    id: number;
    planId: number;
    date: string;
    mealType: string;
    recipeId?: number;
    customRecipeId?: number;
    isConsumed: boolean;
}

// Mock AsyncStorage-based storage for React Native
const STORAGE_KEY = 'mydietcoach_data';

async function getStorage() {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        console.log('AsyncStorage data retrieved');
        return data ? JSON.parse(data) : { users: [], waterTracking: [], recipes: [], customRecipes: [], progressTracking: [], mealPlans: [], scheduledMeals: [] };
    } catch (error) {
        console.error('Error accessing AsyncStorage:', error);
        return { users: [], waterTracking: [], recipes: [], customRecipes: [], progressTracking: [], mealPlans: [], scheduledMeals: [] };
    }
}

async function saveStorage(data: any) {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('Data saved to AsyncStorage successfully');
    } catch (error) {
        console.error('Error saving to AsyncStorage:', error);
    }
}

/**
 * Create or get user by email
 */
export async function createUser(email: string, name: string): Promise<User> {
    console.log('createUser called with:', { email, name });

    const storage = await getStorage();
    if (!storage) {
        console.warn('Storage not available - backend API needed');
        return {
            id: 1,
            email,
            name,
            waterGoal: 8,
        };
    }

    let user = storage.users.find((u: User) => u.email === email);
    if (!user) {
        user = {
            id: storage.users.length + 1,
            email,
            name,
            waterGoal: 8, // default 8 glasses
            createdAt: new Date(),
        };
        storage.users.push(user);
        await saveStorage(storage);
        console.log('User created successfully:', user);
    } else {
        console.log('User already exists:', user);
    }
    return user;
}

/**
 * Register user with password (mock)
 */
export async function registerUser(email: string, name: string, password: string): Promise<User> {
    console.log('registerUser called with:', { email, name });
    const storage = await getStorage();
    if (!storage) {
        console.warn('Storage not available - backend API needed');
        return { id: 1, email, name, waterGoal: 8 } as User;
    }

    let user = storage.users.find((u: any) => u.email === email);
    if (user) {
        throw new Error('User already exists');
    }

    const newUser = {
        id: storage.users.length + 1,
        email,
        name,
        password, // stored in AsyncStorage in mock only
        waterGoal: 8,
        createdAt: new Date(),
    };
    storage.users.push(newUser);
    await saveStorage(storage);
    console.log('User registered:', newUser);
    return newUser as User;
}

/**
 * Authenticate user with email/password (mock)
 */
export async function authenticateUser(email: string, password: string): Promise<User> {
    console.log('authenticateUser called with:', email);
    const storage = await getStorage();
    if (!storage) {
        throw new Error('Storage not available');
    }

    const user = storage.users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
        throw new Error('Invalid credentials');
    }
    // Do not return password in user object
    const { password: _p, ...publicUser } = user;
    return publicUser as User;
}

// Debug helper: dump users from AsyncStorage
export async function dumpUsers() {
    const storage = await getStorage();
    return storage ? storage.users : [];
}

/**
 * Get user by email
 */
export async function getUser(email: string): Promise<User | null> {
    console.log('getUser called with:', email);

    const storage = await getStorage();
    if (!storage) {
        console.warn('Storage not available - backend API needed');
        return null;
    }

    const user = storage.users.find((u: User) => u.email === email);
    console.log('getUser result:', user);
    return user || null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: number, data: any): Promise<User> {
    const storage = await getStorage();
    if (!storage) {
        console.warn('Storage not available - backend API needed');
        return { id: userId, email: '', name: '', ...data };
    }

    const userIndex = storage.users.findIndex((u: User) => u.id === userId);
    if (userIndex >= 0) {
        storage.users[userIndex] = { ...storage.users[userIndex], ...data };
        await saveStorage(storage);
        return storage.users[userIndex];
    }
    throw new Error('User not found');
}

/**
 * Update water goal
 */
export async function updateWaterGoal(userId: number, goal: number): Promise<void> {
    const storage = await getStorage();
    if (!storage) {
        console.warn('Storage not available - backend API needed');
        return;
    }

    const userIndex = storage.users.findIndex((u: User) => u.id === userId);
    if (userIndex >= 0) {
        storage.users[userIndex].waterGoal = goal;
        await saveStorage(storage);
    }
}

/**
 * Track water intake
 */
export async function trackWater(userId: number, amount: number, goal: number): Promise<WaterTracking> {
    const storage = await getStorage();
    const date = new Date().toISOString().split('T')[0];

    if (!storage) {
        console.warn('Storage not available - backend API needed');
        return { id: 1, userId, date, amount, goal };
    }

    let tracking = storage.waterTracking.find((t: WaterTracking) => t.userId === userId && t.date === date);
    if (tracking) {
        tracking.amount += amount;
    } else {
        tracking = {
            id: storage.waterTracking.length + 1,
            userId,
            date,
            amount,
            goal,
        };
        storage.waterTracking.push(tracking);
    }
    await saveStorage(storage);
    return tracking;
}

/**
 * Get water tracking for today
 */
export async function getWaterTracking(userId: number): Promise<WaterTracking | null> {
    const storage = await getStorage();
    const date = new Date().toISOString().split('T')[0];

    if (!storage) {
        console.warn('Storage not available - backend API needed');
        return null;
    }

    const tracking = storage.waterTracking.find((t: WaterTracking) => t.userId === userId && t.date === date);
    return tracking || null;
}

/**
 * Reset water tracking for today
 */
export async function resetWaterTracking(userId: number): Promise<void> {
    const storage = await getStorage();
    const date = new Date().toISOString().split('T')[0];

    if (!storage) {
        console.warn('Storage not available - backend API needed');
        return;
    }

    const index = storage.waterTracking.findIndex((t: WaterTracking) => t.userId === userId && t.date === date);
    if (index >= 0) {
        storage.waterTracking[index].amount = 0;
        await saveStorage(storage);
    }
}

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
    const storage = await getStorage();

    if (!storage) {
        console.warn('Storage not available - backend API needed');
        return {
            id: 1,
            userId,
            recipeName,
            ingredients,
            description: instructions.join('\n'),
            createdAt: new Date()
        };
    }

    const newRecipe = {
        id: storage.customRecipes.length + 1,
        userId,
        recipeName,
        ingredients,
        description: instructions.join('\n'),
        cookingInstructions: instructions.join('\n'),
        isFavorite: false,
        createdAt: new Date(),
    };
    storage.customRecipes.push(newRecipe);
    await saveStorage(storage);
    return newRecipe;
}

/**
 * Get user's custom recipes
 */
export async function getUserCustomRecipes(userId: number): Promise<CustomRecipe[]> {
    const storage = await getStorage();

    if (!storage) {
        console.warn('Storage not available - backend API needed');
        return [];
    }

    return storage.customRecipes.filter((r: CustomRecipe) => r.userId === userId) || [];
}

/**
 * Toggle custom recipe favorite
 */
export async function toggleCustomRecipeFavorite(recipeId: number): Promise<void> {
    const storage = await getStorage();

    if (!storage) {
        console.warn('Storage not available - backend API needed');
        return;
    }

    const index = storage.customRecipes.findIndex((r: CustomRecipe) => r.id === recipeId);
    if (index >= 0) {
        storage.customRecipes[index].isFavorite = !storage.customRecipes[index].isFavorite;
        await saveStorage(storage);
    }
}

/**
 * Delete custom recipe
 */
export async function deleteCustomRecipe(recipeId: number): Promise<void> {
    const storage = await getStorage();

    if (!storage) {
        console.warn('Storage not available - backend API needed');
        return;
    }

    const index = storage.customRecipes.findIndex((r: CustomRecipe) => r.id === recipeId);
    if (index >= 0) {
        storage.customRecipes.splice(index, 1);
        await saveStorage(storage);
    }
}

// Stub functions for features not yet implemented
export async function addProgressEntry(userId: number, data: any): Promise<ProgressTracking> {
    console.warn('addProgressEntry: Backend API needed');
    return { id: 1, userId, date: new Date().toISOString().split('T')[0], ...data };
}

export async function getProgressEntries(userId: number, startDate?: string, endDate?: string): Promise<ProgressTracking[]> {
    console.warn('getProgressEntries: Backend API needed');
    return [];
}

export async function getUserRecipes(userId: number): Promise<Recipe[]> {
    console.warn('getUserRecipes: Backend API needed');
    return [];
}

export async function createRecipe(userId: number, recipe: any): Promise<Recipe> {
    console.warn('createRecipe: Backend API needed');
    return { id: 1, userId, ...recipe };
}

export async function getUserMealPlans(userId: number): Promise<MealPlan[]> {
    console.warn('getUserMealPlans: Backend API needed');
    return [];
}

export async function createMealPlan(userId: number, plan: any): Promise<MealPlan> {
    console.warn('createMealPlan: Backend API needed');
    return { id: 1, userId, ...plan };
}

export async function getTodayMealPlan(userId: number): Promise<ScheduledMeal[]> {
    console.warn('getTodayMealPlan: Backend API needed');
    return [];
}

export async function updateMealInPlan(mealId: number, data: any): Promise<void> {
    console.warn('updateMealInPlan: Backend API needed');
}

export async function scheduleMeal(userId: number, mealData: any): Promise<ScheduledMeal> {
    console.warn('scheduleMeal: Backend API needed');
    return { id: 1, planId: 1, date: new Date().toISOString().split('T')[0], mealType: 'breakfast', isConsumed: false, ...mealData };
}
