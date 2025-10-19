import { query } from './db';

export interface WaterTracking {
    id: number;
    user_id: number;
    date: string;
    water_consumed: number;
    glasses: Array<{ time: string; amount: number }>;
    last_updated: Date;
}

export interface ProgressTracking {
    id: number;
    user_id: number;
    date: string;
    weight?: number;
    body_fat?: number;
    muscle_mass?: number;
    bmi?: number;
    measurements?: {
        waist?: number;
        chest?: number;
        hips?: number;
        arms?: number;
        thighs?: number;
    };
    notes?: string;
    created_at: Date;
}

export interface DailyNutrition {
    id: number;
    user_id: number;
    date: string;
    calories_consumed: number;
    protein_consumed: number;
    carbs_consumed: number;
    fat_consumed: number;
    fiber_consumed: number;
    sugar_consumed: number;
    sodium_consumed: number;
    meals_logged: number;
    last_updated: Date;
}

export interface DailyTask {
    id: number;
    user_id: number;
    date: string;
    task_id: string;
    completed: boolean;
    current_value: number;
    created_at: Date;
    last_updated: Date;
}

/**
 * Track water intake
 */
export async function trackWater(
    userId: number,
    date: string,
    amount: number
): Promise<WaterTracking> {
    try {
        const glass = { time: new Date().toISOString(), amount };

        const result = await query(
            `INSERT INTO water_tracking (user_id, date, water_consumed, glasses, last_updated)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, date)
       DO UPDATE SET 
         water_consumed = water_tracking.water_consumed + $3,
         glasses = water_tracking.glasses || $4::jsonb,
         last_updated = CURRENT_TIMESTAMP
       RETURNING *`,
            [userId, date, amount, JSON.stringify([glass])]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in trackWater:', error);
        throw error;
    }
}

/**
 * Get water tracking for a date
 */
export async function getWaterTracking(userId: number, date: string): Promise<WaterTracking | null> {
    try {
        const result = await query(
            'SELECT * FROM water_tracking WHERE user_id = $1 AND date = $2',
            [userId, date]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error in getWaterTracking:', error);
        throw error;
    }
}

/**
 * Reset water tracking for a date
 */
export async function resetWaterTracking(userId: number, date: string): Promise<void> {
    try {
        await query(
            `UPDATE water_tracking 
       SET water_consumed = 0, glasses = '[]'::jsonb, last_updated = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND date = $2`,
            [userId, date]
        );
    } catch (error) {
        console.error('Error in resetWaterTracking:', error);
        throw error;
    }
}

/**
 * Add progress entry
 */
export async function addProgressEntry(
    userId: number,
    date: string,
    data: {
        weight?: number;
        body_fat?: number;
        muscle_mass?: number;
        bmi?: number;
        measurements?: any;
        notes?: string;
    }
): Promise<ProgressTracking> {
    try {
        const result = await query(
            `INSERT INTO progress_tracking 
       (user_id, date, weight, body_fat, muscle_mass, bmi, measurements, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, date)
       DO UPDATE SET
         weight = COALESCE($3, progress_tracking.weight),
         body_fat = COALESCE($4, progress_tracking.body_fat),
         muscle_mass = COALESCE($5, progress_tracking.muscle_mass),
         bmi = COALESCE($6, progress_tracking.bmi),
         measurements = COALESCE($7, progress_tracking.measurements),
         notes = COALESCE($8, progress_tracking.notes)
       RETURNING *`,
            [
                userId,
                date,
                data.weight,
                data.body_fat,
                data.muscle_mass,
                data.bmi,
                data.measurements ? JSON.stringify(data.measurements) : null,
                data.notes,
            ]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in addProgressEntry:', error);
        throw error;
    }
}

/**
 * Get progress entries for a user
 */
export async function getProgressEntries(
    userId: number,
    limit: number = 30
): Promise<ProgressTracking[]> {
    try {
        const result = await query(
            `SELECT * FROM progress_tracking 
       WHERE user_id = $1 
       ORDER BY date DESC 
       LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    } catch (error) {
        console.error('Error in getProgressEntries:', error);
        throw error;
    }
}

/**
 * Get progress entry for a specific date
 */
export async function getProgressEntryByDate(
    userId: number,
    date: string
): Promise<ProgressTracking | null> {
    try {
        const result = await query(
            'SELECT * FROM progress_tracking WHERE user_id = $1 AND date = $2',
            [userId, date]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error in getProgressEntryByDate:', error);
        throw error;
    }
}

/**
 * Update daily nutrition
 */
export async function updateDailyNutrition(
    userId: number,
    date: string,
    nutrition: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
        fiber?: number;
        sugar?: number;
        sodium?: number;
    }
): Promise<DailyNutrition> {
    try {
        const result = await query(
            `INSERT INTO daily_nutrition 
       (user_id, date, calories_consumed, protein_consumed, carbs_consumed, fat_consumed, fiber_consumed, sugar_consumed, sodium_consumed, meals_logged, last_updated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, date)
       DO UPDATE SET
         calories_consumed = daily_nutrition.calories_consumed + COALESCE($3, 0),
         protein_consumed = daily_nutrition.protein_consumed + COALESCE($4, 0),
         carbs_consumed = daily_nutrition.carbs_consumed + COALESCE($5, 0),
         fat_consumed = daily_nutrition.fat_consumed + COALESCE($6, 0),
         fiber_consumed = daily_nutrition.fiber_consumed + COALESCE($7, 0),
         sugar_consumed = daily_nutrition.sugar_consumed + COALESCE($8, 0),
         sodium_consumed = daily_nutrition.sodium_consumed + COALESCE($9, 0),
         meals_logged = daily_nutrition.meals_logged + 1,
         last_updated = CURRENT_TIMESTAMP
       RETURNING *`,
            [
                userId,
                date,
                nutrition.calories || 0,
                nutrition.protein || 0,
                nutrition.carbs || 0,
                nutrition.fat || 0,
                nutrition.fiber || 0,
                nutrition.sugar || 0,
                nutrition.sodium || 0,
            ]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in updateDailyNutrition:', error);
        throw error;
    }
}

/**
 * Get daily nutrition
 */
export async function getDailyNutrition(userId: number, date: string): Promise<DailyNutrition | null> {
    try {
        const result = await query(
            'SELECT * FROM daily_nutrition WHERE user_id = $1 AND date = $2',
            [userId, date]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error in getDailyNutrition:', error);
        throw error;
    }
}

/**
 * Update task status
 */
export async function updateTaskStatus(
    userId: number,
    date: string,
    taskId: string,
    completed: boolean,
    currentValue: number = 0
): Promise<DailyTask> {
    try {
        const result = await query(
            `INSERT INTO daily_tasks 
       (user_id, date, task_id, completed, current_value, last_updated)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, date, task_id)
       DO UPDATE SET
         completed = $4,
         current_value = $5,
         last_updated = CURRENT_TIMESTAMP
       RETURNING *`,
            [userId, date, taskId, completed, currentValue]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in updateTaskStatus:', error);
        throw error;
    }
}

/**
 * Get daily tasks
 */
export async function getDailyTasks(userId: number, date: string): Promise<DailyTask[]> {
    try {
        const result = await query(
            'SELECT * FROM daily_tasks WHERE user_id = $1 AND date = $2',
            [userId, date]
        );
        return result.rows;
    } catch (error) {
        console.error('Error in getDailyTasks:', error);
        throw error;
    }
}

/**
 * Get task by ID
 */
export async function getTaskById(
    userId: number,
    date: string,
    taskId: string
): Promise<DailyTask | null> {
    try {
        const result = await query(
            'SELECT * FROM daily_tasks WHERE user_id = $1 AND date = $2 AND task_id = $3',
            [userId, date, taskId]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error in getTaskById:', error);
        throw error;
    }
}
