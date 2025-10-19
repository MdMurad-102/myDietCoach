// Web-safe recipes stub - PostgreSQL cannot run in browser

export interface Recipe {
    id: number;
    json_data: any;
    user_id: number;
    image_url?: string;
    recipe_name: string;
    is_custom?: boolean;
    favorite_date?: string;
    tags?: string[];
    created_at?: Date;
    updated_at?: Date;
}

export interface MealPlan {
    id: number;
    user_id: number;
    plan_name: string;
    date_created: Date;
    meal_plan_data?: any;
}

export interface ScheduledMeal {
    id: number;
    user_id: number;
    recipe_id?: number;
    custom_recipe_id?: number;
    scheduled_date: string;
    meal_type: string;
    meal_plan_data?: any;
    total_calories: number;
    total_protein: number;
    calories_consumed: number;
    protein_consumed: number;
    meals_consumed?: any;
    created_at?: Date;
}

// Stub functions that throw errors on web
const notAvailableOnWeb = () => {
    throw new Error('Database operations are not available on web. This app requires native mobile platform.');
};

export const getUserRecipes = notAvailableOnWeb;
export const getRecipeById = notAvailableOnWeb;
export const saveRecipe = notAvailableOnWeb;
export const updateRecipe = notAvailableOnWeb;
export const deleteRecipe = notAvailableOnWeb;
export const saveCustomRecipe = notAvailableOnWeb;
export const getCustomRecipes = notAvailableOnWeb;
export const createMealPlan = notAvailableOnWeb;
export const getUserMealPlans = notAvailableOnWeb;
export const getMealPlanById = notAvailableOnWeb;
export const updateMealPlan = notAvailableOnWeb;
export const deleteMealPlan = notAvailableOnWeb;
export const updateMealInPlan = notAvailableOnWeb;
export const scheduleMeal = notAvailableOnWeb;
export const getTodayMealPlan = notAvailableOnWeb;
export const toggleMealConsumed = notAvailableOnWeb;
export const getScheduledMeals = notAvailableOnWeb;
export const updateMealConsumption = notAvailableOnWeb;
export const addFavoriteRecipe = notAvailableOnWeb;
export const removeFavoriteRecipe = notAvailableOnWeb;
export const getFavoriteRecipes = notAvailableOnWeb;
