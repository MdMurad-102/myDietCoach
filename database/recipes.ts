import { query, transaction } from './db';

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
    date_scheduled: Date;
    status: string;
    meal_plan_data: any;
    total_calories: number;
    total_protein: number;
    is_active: boolean;
    plan_type?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface ScheduledMeal {
    id: number;
    user_id: number;
    meal_plan_id?: number;
    recipe_id?: number;
    custom_recipe_id?: number;
    scheduled_date: string;
    meal_type: string;
    meal_plan_data?: any;
    total_calories: number;
    total_protein: number;
    meals_consumed: string[];
    calories_consumed: number;
    protein_consumed: number;
    is_completed?: boolean;
    date_created?: Date;
    last_updated?: Date;
}

export interface CustomRecipe {
    id: number;
    user_id: number;
    recipe_name: string;
    ingredients: string[];
    instructions: string[];
    calories: number;
    protein: number;
    cooking_time: string;
    servings: number;
    meal_type: string;
    favorite_date?: string;
    tags?: string[];
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

/**
 * Create a new recipe
 */
export async function createRecipe(
    userId: number,
    recipeName: string,
    jsonData: any,
    imageUrl?: string
): Promise<Recipe> {
    try {
        const result = await query(
            `INSERT INTO recipes (user_id, recipe_name, json_data, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [userId, recipeName, JSON.stringify(jsonData), imageUrl]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in createRecipe:', error);
        throw error;
    }
}

/**
 * Get user recipes
 */
export async function getUserRecipes(userId: number): Promise<Recipe[]> {
    try {
        const result = await query(
            `SELECT * FROM recipes 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error in getUserRecipes:', error);
        throw error;
    }
}

/**
 * Get today's meal plan for a user
 */
export async function getTodayMealPlan(userId: number, scheduledDate: string): Promise<ScheduledMeal | null> {
    try {
        const result = await query(
            `SELECT * FROM scheduled_meals 
       WHERE user_id = $1 AND scheduled_date = $2
       LIMIT 1`,
            [userId, scheduledDate]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error in getTodayMealPlan:', error);
        throw error;
    }
}

/**
 * Update water intake for a specific day's meal plan
 */
export async function updateWaterIntakeInDb(userId: number, scheduledDate: string, waterGlasses: number): Promise<ScheduledMeal | null> {
    try {
        // First, check if a plan for this day exists
        const existingPlan = await getTodayMealPlan(userId, scheduledDate);

        if (existingPlan) {
            // If it exists, update it
            const result = await query(
                `UPDATE scheduled_meals
                 SET meal_plan_data = jsonb_set(meal_plan_data, '{waterGlasses}', $1::jsonb)
                 WHERE id = $2
                 RETURNING *`,
                [JSON.stringify(waterGlasses), existingPlan.id]
            );
            return result.rows[0];
        } else {
            // If it doesn't exist, create a new entry
            const result = await query(
                `INSERT INTO scheduled_meals (user_id, scheduled_date, meal_type, total_calories, total_protein, meals_consumed, calories_consumed, protein_consumed, meal_plan_data)
                 VALUES ($1, $2, 'water_update', 0, 0, '[]', 0, 0, jsonb_build_object('waterGlasses', $3))
                 RETURNING *`,
                [userId, scheduledDate, waterGlasses]
            );
            return result.rows[0];
        }
    } catch (error) {
        console.error('Error in updateWaterIntakeInDb:', error);
        throw error;
    }
}

/**
 * Schedule a meal for a specific date
 */
export async function scheduleMeal(
    userId: number,
    scheduledDate: string,
    mealType: string,
    totalCalories: number,
    totalProtein: number,
    recipeId?: number,
    customRecipeId?: number,
    mealPlanData?: any
): Promise<ScheduledMeal> {
    try {
        const result = await query(
            `INSERT INTO scheduled_meals (user_id, scheduled_date, meal_type, total_calories, total_protein, recipe_id, custom_recipe_id, meal_plan_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [userId, scheduledDate, mealType, totalCalories, totalProtein, recipeId, customRecipeId, JSON.stringify(mealPlanData)]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in scheduleMeal:', error);
        throw error;
    }
}

/**
 * Update an existing meal plan
 */
export async function updateMealInPlan(planId: number, mealPlanData: any): Promise<ScheduledMeal> {
    try {
        const result = await query(
            `UPDATE scheduled_meals
       SET meal_plan_data = $1
       WHERE id = $2
       RETURNING *`,
            [JSON.stringify(mealPlanData), planId]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in updateMealInPlan:', error);
        throw error;
    }
}

/**
 * Get a meal plan by its ID
 */
export async function getMealPlanById(planId: number): Promise<MealPlan | null> {
    try {
        const result = await query(
            `SELECT * FROM meal_plans 
       WHERE id = $1`,
            [planId]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error in getMealPlanById:', error);
        throw error;
    }
}
