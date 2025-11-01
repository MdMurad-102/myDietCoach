// Backend API Server for MyDietCoach
// This server handles all database operations for the mobile app

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'MyDietCoach API is running' });
});

// ============================================
// USER ROUTES
// ============================================

// Register new user
app.post('/api/users/register', async (req, res) => {
    const { email, name, password } = req.body;

    try {
        // Check if user exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user (Note: In production, hash the password!)
        const result = await pool.query(
            `INSERT INTO users (email, name, password, daily_water_goal, created_at, updated_at)
       VALUES ($1, $2, $3, 8, NOW(), NOW())
       RETURNING id, email, name, daily_water_goal, created_at`,
            [email, name, password]
        );

        res.json({
            success: true,
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login user
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT id, email, name, picture, subscription_id, credit, weight, height, gender, goal, age, calories, proteins, country, city, diet_type, daily_water_goal, created_at, updated_at FROM users WHERE email = $1 AND password = $2',
            [email, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get user by email
app.get('/api/users/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const result = await pool.query(
            'SELECT id, email, name, picture, subscription_id, credit, weight, height, gender, goal, age, calories, proteins, country, city, diet_type, daily_water_goal, created_at, updated_at FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Update user profile
app.put('/api/users/:userId', async (req, res) => {
    const { userId } = req.params;
    const updates = req.body;

    try {
        // Build dynamic update query
        const fields = Object.keys(updates);
        const values = Object.values(updates);

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');

        const result = await pool.query(
            `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
            [...values, userId]
        );

        res.json({
            success: true,
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// ============================================
// WATER TRACKING ROUTES
// ============================================

// Track water intake
app.post('/api/water/track', async (req, res) => {
    const { userId, amount, goal } = req.body;
    const date = new Date().toISOString().split('T')[0];

    try {
        // Check if tracking exists for today
        const existing = await pool.query(
            'SELECT * FROM water_tracking WHERE user_id = $1 AND date = $2',
            [userId, date]
        );

        let result;
        if (existing.rows.length > 0) {
            // Update existing tracking
            result = await pool.query(
                `UPDATE water_tracking 
         SET water_consumed = water_consumed + $1, last_updated = NOW()
         WHERE user_id = $2 AND date = $3
         RETURNING *`,
                [amount, userId, date]
            );
        } else {
            // Create new tracking
            result = await pool.query(
                `INSERT INTO water_tracking (user_id, date, water_consumed, last_updated)
         VALUES ($1, $2, $3, NOW())
         RETURNING *`,
                [userId, date, amount]
            );
        }

        res.json({
            success: true,
            tracking: result.rows[0]
        });
    } catch (error) {
        console.error('Error tracking water:', error);
        res.status(500).json({ error: 'Failed to track water' });
    }
});

// Get water tracking for today
app.get('/api/water/today/:userId', async (req, res) => {
    const { userId } = req.params;
    const date = new Date().toISOString().split('T')[0];

    try {
        const result = await pool.query(
            'SELECT * FROM water_tracking WHERE user_id = $1 AND date = $2',
            [userId, date]
        );

        res.json({
            success: true,
            tracking: result.rows[0] || null
        });
    } catch (error) {
        console.error('Error getting water tracking:', error);
        res.status(500).json({ error: 'Failed to get water tracking' });
    }
});

// Reset water tracking for today
app.post('/api/water/reset', async (req, res) => {
    const { userId } = req.body;
    const date = new Date().toISOString().split('T')[0];

    try {
        const result = await pool.query(
            `UPDATE water_tracking 
       SET water_consumed = 0, last_updated = NOW()
       WHERE user_id = $1 AND date = $2
       RETURNING *`,
            [userId, date]
        );

        res.json({
            success: true,
            tracking: result.rows[0]
        });
    } catch (error) {
        console.error('Error resetting water tracking:', error);
        res.status(500).json({ error: 'Failed to reset water tracking' });
    }
});

// ============================================
// SAVED RECIPES (from scheduled_meals)
// ============================================

// Get user's saved recipes (from all their scheduled meals)
app.get('/api/recipes/custom/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Get all unique recipes from scheduled_meals
        const result = await pool.query(
            `SELECT DISTINCT 
                meal_plan_data,
                scheduled_date,
                id
             FROM scheduled_meals 
             WHERE user_id = $1 
             ORDER BY scheduled_date DESC`,
            [userId]
        );

        // Extract all meals from meal_plan_data
        const recipes = [];
        result.rows.forEach(row => {
            const mealPlanData = row.meal_plan_data || {};
            ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
                if (mealPlanData[mealType]) {
                    const meal = mealPlanData[mealType];
                    recipes.push({
                        id: meal.id || `${mealType}-${row.id}`,
                        recipe_name: meal.recipeName || meal.name || 'Unnamed Meal',
                        json_data: {
                            calories: meal.calories || 0,
                            protein: meal.protein || 0,
                            carbs: meal.carbs,
                            fat: meal.fat,
                            ingredients: meal.ingredients || [],
                            instructions: meal.instructions || [],
                            cookingTime: meal.cookingTime,
                            servings: meal.servings
                        },
                        meal_type: mealType,
                        created_at: row.scheduled_date
                    });
                }
            });
        });

        // Remove duplicates based on recipe name and calories
        const uniqueRecipes = Array.from(
            new Map(recipes.map(r => [`${r.recipe_name}-${r.json_data.calories}`, r])).values()
        );

        res.json({
            success: true,
            recipes: uniqueRecipes
        });
    } catch (error) {
        console.error('Error getting recipes:', error);
        res.status(500).json({ error: 'Failed to get recipes' });
    }
});

// ============================================
// MEAL PLAN ROUTES
// ============================================

// Create or update daily meal plan (all 4 meals: breakfast, lunch, dinner, snacks)
app.post('/api/meals/daily-plan', async (req, res) => {
    const { userId, date, meals } = req.body;
    // meals should be an object: { breakfast: {...}, lunch: {...}, dinner: {...}, snacks: {...}, waterGlasses: number }

    console.log('📥 Backend received date:', date, 'Type:', typeof date);

    try {
        // Calculate total nutrition (excluding waterGlasses)
        let totalCalories = 0;
        let totalProtein = 0;

        Object.entries(meals).forEach(([key, meal]) => {
            // Skip non-meal properties like waterGlasses
            if (key !== 'waterGlasses' && meal && typeof meal === 'object') {
                totalCalories += meal.calories || 0;
                totalProtein += meal.protein || 0;
            }
        });

        // Check if plan exists for this date
        const existing = await pool.query(
            'SELECT * FROM scheduled_meals WHERE user_id = $1 AND scheduled_date = $2 AND meal_type = $3',
            [userId, date, 'daily_plan']
        );

        let result;
        if (existing.rows.length > 0) {
            // Update existing plan
            result = await pool.query(
                `UPDATE scheduled_meals 
                 SET meal_plan_data = $1, total_calories = $2, total_protein = $3, last_updated = NOW()
                 WHERE id = $4
                 RETURNING *`,
                [JSON.stringify(meals), totalCalories, totalProtein, existing.rows[0].id]
            );
        } else {
            // Create new plan
            result = await pool.query(
                `INSERT INTO scheduled_meals (user_id, scheduled_date, meal_type, meal_plan_data, total_calories, total_protein, date_created, last_updated)
                 VALUES ($1, $2::date, 'daily_plan', $3, $4, $5, NOW(), NOW())
                 RETURNING *`,
                [userId, date, JSON.stringify(meals), totalCalories, totalProtein]
            );
            console.log('💾 Saved to database with date:', result.rows[0].scheduled_date);
        }

        res.json({
            success: true,
            plan: result.rows[0]
        });
    } catch (error) {
        console.error('Error saving daily meal plan:', error);
        res.status(500).json({ error: 'Failed to save daily meal plan' });
    }
});

// Dedicated endpoint for water intake updates (independent from meals)
app.patch('/api/meals/water-intake', async (req, res) => {
    const { userId, date, waterGlasses } = req.body;

    try {
        // Check if plan exists for this date
        const existing = await pool.query(
            'SELECT * FROM scheduled_meals WHERE user_id = $1 AND scheduled_date = $2 AND meal_type = $3',
            [userId, date, 'daily_plan']
        );

        let result;
        if (existing.rows.length > 0) {
            // Update only water glasses in existing plan
            const currentData = existing.rows[0].meal_plan_data || {};
            const updatedData = {
                ...currentData,
                waterGlasses: waterGlasses
            };

            result = await pool.query(
                `UPDATE scheduled_meals 
                 SET meal_plan_data = $1, last_updated = NOW()
                 WHERE id = $2
                 RETURNING *`,
                [JSON.stringify(updatedData), existing.rows[0].id]
            );
        } else {
            // Create new plan with only water data
            const mealPlanData = { waterGlasses: waterGlasses };
            result = await pool.query(
                `INSERT INTO scheduled_meals (user_id, scheduled_date, meal_type, meal_plan_data, total_calories, total_protein, date_created, last_updated)
                 VALUES ($1, $2::date, 'daily_plan', $3, 0, 0, NOW(), NOW())
                 RETURNING *`,
                [userId, date, JSON.stringify(mealPlanData)]
            );
        }

        res.json({
            success: true,
            waterGlasses: waterGlasses,
            plan: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating water intake:', error);
        res.status(500).json({ error: 'Failed to update water intake' });
    }
});

// Update meal consumed state (independent endpoint for marking meals as eaten)
app.patch('/api/meals/consumed', async (req, res) => {
    const { userId, date, mealId, consumed } = req.body;

    console.log('📥 Received consumed update request:', { userId, date, mealId, consumed });

    try {
        // Get existing plan
        const existing = await pool.query(
            'SELECT * FROM scheduled_meals WHERE user_id = $1 AND scheduled_date = $2 AND meal_type = $3',
            [userId, date, 'daily_plan']
        );

        if (existing.rows.length === 0) {
            console.log('❌ No meal plan found for date:', date);
            return res.status(404).json({
                error: 'Meal plan not found for this date',
                details: 'Please add meals to this date first'
            });
        }

        const currentData = existing.rows[0].meal_plan_data || {};
        console.log('📋 Current meal plan data:', JSON.stringify(currentData, null, 2));

        let updated = false;
        let totalConsumedCalories = 0;
        let totalConsumedProtein = 0;

        // Update consumed state for the specific meal across all meal types
        ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
            if (currentData[mealType]) {
                if (Array.isArray(currentData[mealType])) {
                    // Handle array of meals
                    currentData[mealType] = currentData[mealType].map(meal => {
                        if (meal.id === mealId) {
                            console.log(`✅ Found meal ${mealId} in ${mealType} array, updating consumed to ${consumed}`);
                            updated = true;
                            return { ...meal, consumed };
                        }
                        return meal;
                    });
                } else if (currentData[mealType].id === mealId) {
                    // Handle single meal object
                    console.log(`✅ Found meal ${mealId} in ${mealType}, updating consumed to ${consumed}`);
                    currentData[mealType] = { ...currentData[mealType], consumed };
                    updated = true;
                }

                // Calculate consumed totals
                if (Array.isArray(currentData[mealType])) {
                    currentData[mealType].forEach(meal => {
                        if (meal.consumed) {
                            totalConsumedCalories += meal.calories || 0;
                            totalConsumedProtein += meal.protein || 0;
                        }
                    });
                } else if (currentData[mealType].consumed) {
                    totalConsumedCalories += currentData[mealType].calories || 0;
                    totalConsumedProtein += currentData[mealType].protein || 0;
                }
            }
        });

        if (!updated) {
            console.log('❌ Meal not found in any meal type:', mealId);
            return res.status(404).json({
                error: 'Meal not found in plan',
                details: `Meal ID ${mealId} not found in breakfast, lunch, dinner, or snacks`
            });
        }

        // Update the database
        const result = await pool.query(
            `UPDATE scheduled_meals 
             SET meal_plan_data = $1, last_updated = NOW()
             WHERE id = $2
             RETURNING *`,
            [JSON.stringify(currentData), existing.rows[0].id]
        );

        console.log('✅ Successfully updated meal consumed state');

        res.json({
            success: true,
            consumed,
            mealId,
            consumedCalories: totalConsumedCalories,
            consumedProtein: totalConsumedProtein,
            plan: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating meal consumed state:', error);
        res.status(500).json({ error: 'Failed to update meal consumed state' });
    }
});

// Add individual meal to a specific meal type (breakfast, lunch, dinner, or snacks)
app.post('/api/meals/add', async (req, res) => {
    const { userId, date, mealType, meal } = req.body;
    // mealType: 'breakfast', 'lunch', 'dinner', or 'snacks'

    try {
        // Get existing daily plan
        const existing = await pool.query(
            'SELECT * FROM scheduled_meals WHERE user_id = $1 AND scheduled_date = $2 AND meal_type = $3',
            [userId, date, 'daily_plan']
        );

        let meals = {};
        let totalCalories = 0;
        let totalProtein = 0;

        if (existing.rows.length > 0) {
            // Update existing plan
            meals = existing.rows[0].meal_plan_data || {};
            totalCalories = parseFloat(existing.rows[0].total_calories) || 0;
            totalProtein = parseFloat(existing.rows[0].total_protein) || 0;
        }

        // Add the new meal
        meals[mealType] = meal;
        totalCalories += meal.calories || 0;
        totalProtein += meal.protein || 0;

        let result;
        if (existing.rows.length > 0) {
            result = await pool.query(
                `UPDATE scheduled_meals 
                 SET meal_plan_data = $1, total_calories = $2, total_protein = $3, last_updated = NOW()
                 WHERE id = $4
                 RETURNING *`,
                [JSON.stringify(meals), totalCalories, totalProtein, existing.rows[0].id]
            );
        } else {
            result = await pool.query(
                `INSERT INTO scheduled_meals (user_id, scheduled_date, meal_type, meal_plan_data, total_calories, total_protein, date_created, last_updated)
                 VALUES ($1, $2, 'daily_plan', $3, $4, $5, NOW(), NOW())
                 RETURNING *`,
                [userId, date, JSON.stringify(meals), totalCalories, totalProtein]
            );
        }

        res.json({
            success: true,
            plan: result.rows[0]
        });
    } catch (error) {
        console.error('Error adding meal:', error);
        res.status(500).json({ error: 'Failed to add meal' });
    }
});

// Get meals for a specific date
app.get('/api/meals/date/:userId/:date', async (req, res) => {
    const { userId, date } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM scheduled_meals WHERE user_id = $1 AND scheduled_date = $2 AND meal_type = $3',
            [userId, date, 'daily_plan']
        );

        const plan = result.rows[0];
        const meals = plan ? plan.meal_plan_data : { breakfast: null, lunch: null, dinner: null, snacks: null };

        res.json({
            success: true,
            date: date,
            meals: meals,
            totalCalories: plan ? plan.total_calories : 0,
            totalProtein: plan ? plan.total_protein : 0
        });
    } catch (error) {
        console.error('Error getting meals:', error);
        res.status(500).json({ error: 'Failed to get meals' });
    }
});

// Get meals for a date range
app.get('/api/meals/range/:userId', async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    try {
        const result = await pool.query(
            `SELECT * FROM scheduled_meals 
             WHERE user_id = $1 
             AND scheduled_date BETWEEN $2 AND $3 
             AND meal_type = 'daily_plan'
             ORDER BY scheduled_date DESC`,
            [userId, startDate, endDate]
        );

        res.json({
            success: true,
            plans: result.rows
        });
    } catch (error) {
        console.error('Error getting meal range:', error);
        res.status(500).json({ error: 'Failed to get meal range' });
    }
});

// Mark meal as consumed
app.post('/api/meals/consume', async (req, res) => {
    const { userId, date, mealType } = req.body;

    try {
        const result = await pool.query(
            `UPDATE scheduled_meals 
             SET meals_consumed = array_append(meals_consumed, $1), 
                 last_updated = NOW()
             WHERE user_id = $2 AND scheduled_date = $3 AND meal_type = 'daily_plan'
             RETURNING *`,
            [mealType, userId, date]
        );

        res.json({
            success: true,
            plan: result.rows[0]
        });
    } catch (error) {
        console.error('Error marking meal consumed:', error);
        res.status(500).json({ error: 'Failed to mark meal consumed' });
    }
});

// Delete a specific meal from a meal type
app.delete('/api/meals/:userId/:date/:mealType', async (req, res) => {
    const { userId, date, mealType } = req.params;

    try {
        // Get existing plan
        const existing = await pool.query(
            'SELECT * FROM scheduled_meals WHERE user_id = $1 AND scheduled_date = $2 AND meal_type = $3',
            [userId, date, 'daily_plan']
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Meal plan not found' });
        }

        const meals = existing.rows[0].meal_plan_data || {};
        const removedMeal = meals[mealType];

        // Remove the meal
        delete meals[mealType];

        // Recalculate totals
        let totalCalories = parseFloat(existing.rows[0].total_calories) || 0;
        let totalProtein = parseFloat(existing.rows[0].total_protein) || 0;

        if (removedMeal) {
            totalCalories -= removedMeal.calories || 0;
            totalProtein -= removedMeal.protein || 0;
        }

        const result = await pool.query(
            `UPDATE scheduled_meals 
             SET meal_plan_data = $1, total_calories = $2, total_protein = $3, last_updated = NOW()
             WHERE id = $4
             RETURNING *`,
            [JSON.stringify(meals), totalCalories, totalProtein, existing.rows[0].id]
        );

        res.json({
            success: true,
            plan: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting meal:', error);
        res.status(500).json({ error: 'Failed to delete meal' });
    }
});

// ============================================
// PROGRESS TRACKING ROUTES
// ============================================

// Add progress entry
app.post('/api/progress', async (req, res) => {
    const { userId, weight, bodyFat, muscleMass, notes } = req.body;
    const date = new Date().toISOString().split('T')[0];

    try {
        const result = await pool.query(
            `INSERT INTO progress_tracking (user_id, date, weight, body_fat, muscle_mass, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
            [userId, date, weight, bodyFat, muscleMass, notes]
        );

        res.json({
            success: true,
            progress: result.rows[0]
        });
    } catch (error) {
        console.error('Error adding progress:', error);
        res.status(500).json({ error: 'Failed to add progress' });
    }
});

// Get progress entries
app.get('/api/progress/:userId', async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    try {
        let query = 'SELECT * FROM progress_tracking WHERE user_id = $1';
        const params = [userId];

        if (startDate && endDate) {
            query += ' AND date BETWEEN $2 AND $3';
            params.push(startDate, endDate);
        }

        query += ' ORDER BY date DESC';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            progress: result.rows
        });
    } catch (error) {
        console.error('Error getting progress:', error);
        res.status(500).json({ error: 'Failed to get progress' });
    }
});

// ============================================
// DAILY NUTRITION ROUTES
// ============================================

// Track daily nutrition
app.post('/api/nutrition/track', async (req, res) => {
    const { userId, date, calories, protein, carbs, fat, fiber, sugar, sodium } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO daily_nutrition 
            (user_id, date, calories_consumed, protein_consumed, carbs_consumed, fat_consumed, 
             fiber_consumed, sugar_consumed, sodium_consumed, meals_logged, last_updated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, NOW())
       ON CONFLICT (user_id, date) 
       DO UPDATE SET 
         calories_consumed = daily_nutrition.calories_consumed + EXCLUDED.calories_consumed,
         protein_consumed = daily_nutrition.protein_consumed + EXCLUDED.protein_consumed,
         carbs_consumed = daily_nutrition.carbs_consumed + EXCLUDED.carbs_consumed,
         fat_consumed = daily_nutrition.fat_consumed + EXCLUDED.fat_consumed,
         fiber_consumed = daily_nutrition.fiber_consumed + EXCLUDED.fiber_consumed,
         sugar_consumed = daily_nutrition.sugar_consumed + EXCLUDED.sugar_consumed,
         sodium_consumed = daily_nutrition.sodium_consumed + EXCLUDED.sodium_consumed,
         meals_logged = daily_nutrition.meals_logged + 1,
         last_updated = NOW()
       RETURNING *`,
            [userId, date, calories || 0, protein || 0, carbs || 0, fat || 0, fiber || 0, sugar || 0, sodium || 0]
        );

        res.json({
            success: true,
            nutrition: result.rows[0]
        });
    } catch (error) {
        console.error('Error tracking nutrition:', error);
        res.status(500).json({ error: 'Failed to track nutrition' });
    }
});

// Get daily nutrition
app.get('/api/nutrition/:userId/:date', async (req, res) => {
    const { userId, date } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM daily_nutrition WHERE user_id = $1 AND date = $2',
            [userId, date]
        );

        res.json({
            success: true,
            nutrition: result.rows[0] || {
                calories_consumed: 0,
                protein_consumed: 0,
                carbs_consumed: 0,
                fat_consumed: 0,
                fiber_consumed: 0,
                sugar_consumed: 0,
                sodium_consumed: 0,
                meals_logged: 0
            }
        });
    } catch (error) {
        console.error('Error getting nutrition:', error);
        res.status(500).json({ error: 'Failed to get nutrition' });
    }
});

// Get nutrition for date range
app.get('/api/nutrition/range/:userId', async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    try {
        const result = await pool.query(
            'SELECT * FROM daily_nutrition WHERE user_id = $1 AND date BETWEEN $2 AND $3 ORDER BY date DESC',
            [userId, startDate, endDate]
        );

        res.json({
            success: true,
            nutrition: result.rows
        });
    } catch (error) {
        console.error('Error getting nutrition range:', error);
        res.status(500).json({ error: 'Failed to get nutrition range' });
    }
});

// ============================================
// DAILY TASKS ROUTES
// ============================================

// Create or update daily task
app.post('/api/tasks/update', async (req, res) => {
    const { userId, date, taskId, completed, currentValue } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO daily_tasks (user_id, date, task_id, completed, current_value, last_updated)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id, date, task_id) 
       DO UPDATE SET 
         completed = EXCLUDED.completed,
         current_value = EXCLUDED.current_value,
         last_updated = NOW()
       RETURNING *`,
            [userId, date, taskId, completed, currentValue || 0]
        );

        res.json({
            success: true,
            task: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Get daily tasks
app.get('/api/tasks/:userId/:date', async (req, res) => {
    const { userId, date } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM daily_tasks WHERE user_id = $1 AND date = $2 ORDER BY created_at',
            [userId, date]
        );

        res.json({
            success: true,
            tasks: result.rows
        });
    } catch (error) {
        console.error('Error getting tasks:', error);
        res.status(500).json({ error: 'Failed to get tasks' });
    }
});

// Toggle task completion
app.put('/api/tasks/toggle', async (req, res) => {
    const { userId, date, taskId } = req.body;

    try {
        const result = await pool.query(
            `UPDATE daily_tasks 
       SET completed = NOT completed, last_updated = NOW()
       WHERE user_id = $1 AND date = $2 AND task_id = $3
       RETURNING *`,
            [userId, date, taskId]
        );

        res.json({
            success: true,
            task: result.rows[0]
        });
    } catch (error) {
        console.error('Error toggling task:', error);
        res.status(500).json({ error: 'Failed to toggle task' });
    }
});

// ============================================
// WEIGHT GOALS ROUTES
// ============================================

// Create weight goal
app.post('/api/goals/weight', async (req, res) => {
    const { userId, currentWeight, targetWeight, startWeight, goalDate, weeklyGoal } = req.body;

    try {
        // Deactivate existing goals
        await pool.query(
            'UPDATE weight_goals SET is_active = false WHERE user_id = $1',
            [userId]
        );

        // Create new goal
        const result = await pool.query(
            `INSERT INTO weight_goals 
            (user_id, current_weight, target_weight, start_weight, goal_date, weekly_goal, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
       RETURNING *`,
            [userId, currentWeight, targetWeight, startWeight, goalDate, weeklyGoal]
        );

        res.json({
            success: true,
            goal: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating weight goal:', error);
        res.status(500).json({ error: 'Failed to create weight goal' });
    }
});

// Get active weight goal
app.get('/api/goals/weight/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM weight_goals WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1',
            [userId]
        );

        res.json({
            success: true,
            goal: result.rows[0] || null
        });
    } catch (error) {
        console.error('Error getting weight goal:', error);
        res.status(500).json({ error: 'Failed to get weight goal' });
    }
});

// Update weight goal progress
app.put('/api/goals/weight/:goalId', async (req, res) => {
    const { goalId } = req.params;
    const { currentWeight } = req.body;

    try {
        const result = await pool.query(
            'UPDATE weight_goals SET current_weight = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [currentWeight, goalId]
        );

        res.json({
            success: true,
            goal: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating weight goal:', error);
        res.status(500).json({ error: 'Failed to update weight goal' });
    }
});

// ============================================
// DAILY MEAL PLANS ROUTES
// ============================================

// Create or update daily meal plan
app.post('/api/daily-meal-plan', async (req, res) => {
    const { userId, date, mealPlanData, planName, autoGenerated } = req.body;

    try {
        // Calculate totals
        const totalCalories = (mealPlanData.breakfast?.calories || 0) +
            (mealPlanData.lunch?.calories || 0) +
            (mealPlanData.dinner?.calories || 0) +
            (mealPlanData.snacks?.calories || 0);

        const totalProtein = (mealPlanData.breakfast?.protein || 0) +
            (mealPlanData.lunch?.protein || 0) +
            (mealPlanData.dinner?.protein || 0) +
            (mealPlanData.snacks?.protein || 0);

        const result = await pool.query(
            `INSERT INTO daily_meal_plans 
            (user_id, date, meal_plan_data, total_calories, total_protein, auto_generated, plan_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (user_id, date) 
       DO UPDATE SET 
         meal_plan_data = EXCLUDED.meal_plan_data,
         total_calories = EXCLUDED.total_calories,
         total_protein = EXCLUDED.total_protein,
         plan_name = EXCLUDED.plan_name,
         updated_at = NOW()
       RETURNING *`,
            [userId, date, JSON.stringify(mealPlanData), totalCalories, totalProtein, autoGenerated || false, planName]
        );

        res.json({
            success: true,
            plan: result.rows[0]
        });
    } catch (error) {
        console.error('Error saving daily meal plan:', error);
        res.status(500).json({ error: 'Failed to save daily meal plan' });
    }
});

// Get daily meal plan
app.get('/api/daily-meal-plan/:userId/:date', async (req, res) => {
    const { userId, date } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM daily_meal_plans WHERE user_id = $1 AND date = $2',
            [userId, date]
        );

        res.json({
            success: true,
            plan: result.rows[0] || null
        });
    } catch (error) {
        console.error('Error getting daily meal plan:', error);
        res.status(500).json({ error: 'Failed to get daily meal plan' });
    }
});

// Mark meal as consumed in daily plan
app.put('/api/daily-meal-plan/consume', async (req, res) => {
    const { userId, date, mealType, consumed } = req.body;

    try {
        const columnName = `${mealType}_consumed`;
        const query = `UPDATE daily_meal_plans 
                   SET ${columnName} = $1, updated_at = NOW() 
                   WHERE user_id = $2 AND date = $3 
                   RETURNING *`;

        const result = await pool.query(query, [consumed, userId, date]);

        res.json({
            success: true,
            plan: result.rows[0]
        });
    } catch (error) {
        console.error('Error marking meal consumed:', error);
        res.status(500).json({ error: 'Failed to mark meal consumed' });
    }
});

// ============================================
// WEIGHT TRACKING ROUTES
// ============================================

// Create weight_logs table if it doesn't exist
pool.query(`
    CREATE TABLE IF NOT EXISTS weight_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        weight DECIMAL(5,2) NOT NULL,
        bmi DECIMAL(4,2),
        log_date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, log_date)
    );
    CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON weight_logs(user_id, log_date DESC);
`).then(() => {
    console.log('✅ Weight logs table ready');
}).catch(err => {
    console.error('❌ Error creating weight_logs table:', err);
});

// Log weight progress
app.post('/api/progress/weight', async (req, res) => {
    const { userId, weight, date, notes } = req.body;

    try {
        // Get user's height to calculate BMI
        const userResult = await pool.query(
            'SELECT height FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const height = userResult.rows[0].height;
        const bmi = height ? (weight / Math.pow(height / 100, 2)).toFixed(2) : null;

        // Insert or update weight log
        const result = await pool.query(
            `INSERT INTO weight_logs (user_id, weight, bmi, log_date, notes)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id, log_date)
             DO UPDATE SET weight = $2, bmi = $3, notes = $5, created_at = NOW()
             RETURNING *`,
            [userId, weight, bmi, date, notes]
        );

        // Also update current weight in users table
        await pool.query(
            'UPDATE users SET weight = $1, updated_at = NOW() WHERE id = $2',
            [weight, userId]
        );

        res.json({
            success: true,
            log: result.rows[0]
        });
    } catch (error) {
        console.error('Error logging weight:', error);
        res.status(500).json({ error: 'Failed to log weight' });
    }
});

// Get weight history
app.get('/api/progress/weight/:userId', async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    try {
        let query = 'SELECT * FROM weight_logs WHERE user_id = $1';
        const params = [userId];

        if (startDate && endDate) {
            query += ' AND log_date BETWEEN $2 AND $3';
            params.push(startDate, endDate);
        }

        query += ' ORDER BY log_date ASC';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            logs: result.rows
        });
    } catch (error) {
        console.error('Error fetching weight history:', error);
        res.status(500).json({ error: 'Failed to fetch weight history' });
    }
});

// Get latest weight
app.get('/api/progress/weight/:userId/latest', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM weight_logs WHERE user_id = $1 ORDER BY log_date DESC LIMIT 1',
            [userId]
        );

        res.json({
            success: true,
            log: result.rows[0] || null
        });
    } catch (error) {
        console.error('Error fetching latest weight:', error);
        res.status(500).json({ error: 'Failed to fetch latest weight' });
    }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MyDietCoach API Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`📱 Mobile app should connect to: http://192.168.1.100:${PORT}/api`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    pool.end(() => {
        console.log('Database pool closed');
    });
});
