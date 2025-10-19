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
 * Get favorite recipes
 */
export async function getFavoriteRecipes(userId: number): Promise<Recipe[]> {
    try {
        const result = await query(
            `SELECT * FROM recipes 
       WHERE user_id = $1 AND favorite_date IS NOT NULL
       ORDER BY favorite_date DESC`,
            [userId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error in getFavoriteRecipes:', error);
        throw error;
    }
}

/**
 * Toggle recipe favorite
 */
export async function toggleRecipeFavorite(recipeId: number): Promise<Recipe> {
    try {
        const result = await query(
            `UPDATE recipes 
       SET favorite_date = CASE 
         WHEN favorite_date IS NULL THEN CURRENT_DATE::text
         ELSE NULL
       END
       WHERE id = $1
       RETURNING *`,
            [recipeId]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in toggleRecipeFavorite:', error);
        throw error;
    }
}

/**
 * Create a meal plan
 */
export async function createMealPlan(
    userId: number,
    planName: string,
    mealPlanData: any,
    totalCalories: number,
    totalProtein: number
): Promise<MealPlan> {
    try {
        return await transaction(async (client) => {
            // Deactivate existing active plans
            await client.query(
                'UPDATE meal_plans SET is_active = false WHERE user_id = $1 AND is_active = true',
                [userId]
            );

            // Create new meal plan
            const result = await client.query(
                `INSERT INTO meal_plans 
         (user_id, plan_name, date_created, date_scheduled, status, meal_plan_data, total_calories, total_protein, is_active)
         VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'active', $3, $4, $5, true)
         RETURNING *`,
                [userId, planName, JSON.stringify(mealPlanData), totalCalories, totalProtein]
            );

            return result.rows[0];
        });
    } catch (error) {
        console.error('Error in createMealPlan:', error);
        throw error;
    }
}

/**
 * Get user meal plans
 */
export async function getUserMealPlans(userId: number): Promise<MealPlan[]> {
    try {
        const result = await query(
            `SELECT * FROM meal_plans 
       WHERE user_id = $1 
       ORDER BY date_created DESC`,
            [userId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error in getUserMealPlans:', error);
        throw error;
    }
}

/**
 * Get active meal plan
 */
export async function getActiveMealPlan(userId: number): Promise<MealPlan | null> {
    try {
        const result = await query(
            `SELECT * FROM meal_plans 
       WHERE user_id = $1 AND is_active = true
       LIMIT 1`,
            [userId]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error in getActiveMealPlan:', error);
        throw error;
    }
}

/**
 * Update meal in plan
 */
export async function updateMealInPlan(
    planId: number,
    mealPlanData: any
): Promise<MealPlan> {
    try {
        const result = await query(
            `UPDATE meal_plans 
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
 * Schedule a meal
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
            `INSERT INTO scheduled_meals 
       (user_id, scheduled_date, meal_type, recipe_id, custom_recipe_id, meal_plan_data, total_calories, total_protein, calories_consumed, protein_consumed, meals_consumed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 0, '{}')
       RETURNING *`,
            [userId, scheduledDate, mealType, recipeId, customRecipeId, mealPlanData ? JSON.stringify(mealPlanData) : null, totalCalories, totalProtein]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in scheduleMeal:', error);
        throw error;
    }
}

/**
 * Get today's meal plan
 */
export async function getTodayMealPlan(userId: number, date: string): Promise<ScheduledMeal | null> {
    try {
        const result = await query(
            `SELECT * FROM scheduled_meals 
       WHERE user_id = $1 AND scheduled_date = $2
       LIMIT 1`,
            [userId, date]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error in getTodayMealPlan:', error);
        throw error;
    }
}

/**
 * Toggle meal consumed
 */
export async function toggleMealConsumed(
    scheduledMealId: number,
    mealType: string,
    calories: number,
    protein: number
): Promise<ScheduledMeal> {
    try {
        const result = await query(
            `UPDATE scheduled_meals
       SET meals_consumed = CASE 
         WHEN $2 = ANY(meals_consumed) THEN array_remove(meals_consumed, $2)
         ELSE array_append(meals_consumed, $2)
       END,
       calories_consumed = CASE 
         WHEN $2 = ANY(meals_consumed) THEN calories_consumed - $3
         ELSE calories_consumed + $3
       END,
       protein_consumed = CASE 
         WHEN $2 = ANY(meals_consumed) THEN protein_consumed - $4
         ELSE protein_consumed + $4
       END,
       last_updated = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
            [scheduledMealId, mealType, calories, protein]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in toggleMealConsumed:', error);
        throw error;
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
    calories: number,
    protein: number,
    cookingTime: string,
    servings: number,
    mealType: string,
    tags?: string[]
): Promise<CustomRecipe> {
    try {
        const result = await query(
            `INSERT INTO custom_recipes 
       (user_id, recipe_name, ingredients, instructions, calories, protein, cooking_time, servings, meal_type, tags, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
       RETURNING *`,
            [userId, recipeName, ingredients, instructions, calories, protein, cookingTime, servings, mealType, tags || []]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in saveCustomRecipe:', error);
        throw error;
    }
}

/**
 * Get user custom recipes
 */
export async function getUserCustomRecipes(userId: number): Promise<CustomRecipe[]> {
    try {
        const result = await query(
            `SELECT * FROM custom_recipes 
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error in getUserCustomRecipes:', error);
        throw error;
    }
}

/**
 * Toggle custom recipe favorite
 */
export async function toggleCustomRecipeFavorite(recipeId: number): Promise<CustomRecipe> {
    try {
        const result = await query(
            `UPDATE custom_recipes 
       SET favorite_date = CASE 
         WHEN favorite_date IS NULL THEN CURRENT_DATE::text
         ELSE NULL
       END
       WHERE id = $1
       RETURNING *`,
            [recipeId]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in toggleCustomRecipeFavorite:', error);
        throw error;
    }
}

/**
 * Delete custom recipe (soft delete)
 */
export async function deleteCustomRecipe(recipeId: number): Promise<void> {
    try {
        await query(
            'UPDATE custom_recipes SET is_active = false WHERE id = $1',
            [recipeId]
        );
    } catch (error) {
        console.error('Error in deleteCustomRecipe:', error);
        throw error;
    }
}
