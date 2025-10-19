import { query, transaction } from './db';

export interface User {
    id: number;
    name: string;
    email: string;
    picture?: string;
    subscription_id?: string;
    credit?: number;
    height?: string;
    weight?: string;
    gender?: string;
    goal?: string;
    age?: string;
    calories?: number;
    proteins?: number;
    country?: string;
    city?: string;
    diet_type?: string;
    daily_water_goal?: number;
    created_at?: Date;
    updated_at?: Date;
}

/**
 * Create a new user or return existing user
 */
export async function createOrGetUser(email: string, name: string): Promise<User> {
    try {
        // Check if user exists
        const existingUser = await query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return existingUser.rows[0];
        }

        // Create new user
        const newUser = await query(
            `INSERT INTO users (email, name, credit, daily_water_goal)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [email, name, 10, 8]
        );

        return newUser.rows[0];
    } catch (error) {
        console.error('Error in createOrGetUser:', error);
        throw error;
    }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
    try {
        const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error in getUserByEmail:', error);
        throw error;
    }
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | null> {
    try {
        const result = await query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error in getUserById:', error);
        throw error;
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: number,
    data: {
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
        daily_water_goal?: number;
    }
): Promise<User> {
    try {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });

        values.push(userId);

        const result = await query(
            `UPDATE users 
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
            values
        );

        return result.rows[0];
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        throw error;
    }
}

/**
 * Update user water goal
 */
export async function updateWaterGoal(userId: number, dailyWaterGoal: number): Promise<void> {
    try {
        await query(
            'UPDATE users SET daily_water_goal = $1 WHERE id = $2',
            [dailyWaterGoal, userId]
        );
    } catch (error) {
        console.error('Error in updateWaterGoal:', error);
        throw error;
    }
}

/**
 * Update user credits
 */
export async function updateUserCredits(userId: number, credits: number): Promise<void> {
    try {
        await query(
            'UPDATE users SET credit = credit + $1 WHERE id = $2',
            [credits, userId]
        );
    } catch (error) {
        console.error('Error in updateUserCredits:', error);
        throw error;
    }
}

/**
 * Deduct user credits
 */
export async function deductUserCredits(userId: number, amount: number): Promise<boolean> {
    try {
        const result = await query(
            `UPDATE users 
       SET credit = credit - $1 
       WHERE id = $2 AND credit >= $1
       RETURNING *`,
            [amount, userId]
        );

        return (result.rowCount ?? 0) > 0;
    } catch (error) {
        console.error('Error in deductUserCredits:', error);
        throw error;
    }
}
