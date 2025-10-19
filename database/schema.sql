-- PostgreSQL Schema for Diet Coach App
-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS daily_tasks CASCADE;
DROP TABLE IF EXISTS daily_meal_plans CASCADE;
DROP TABLE IF EXISTS weight_goals CASCADE;
DROP TABLE IF EXISTS daily_nutrition CASCADE;
DROP TABLE IF EXISTS progress_tracking CASCADE;
DROP TABLE IF EXISTS water_tracking CASCADE;
DROP TABLE IF EXISTS scheduled_meals CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS custom_recipes CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    picture VARCHAR(500),
    subscription_id VARCHAR(255),
    credit INTEGER DEFAULT 10,
    height VARCHAR(50),
    weight VARCHAR(50),
    gender VARCHAR(50),
    goal VARCHAR(255),
    age VARCHAR(50),
    calories INTEGER,
    proteins INTEGER,
    country VARCHAR(100),
    city VARCHAR(100),
    diet_type VARCHAR(100),
    daily_water_goal INTEGER DEFAULT 8,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes table
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    json_data JSONB NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url VARCHAR(500),
    recipe_name VARCHAR(255) NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    favorite_date DATE,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meal Plans table
CREATE TABLE meal_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    date_created TIMESTAMP NOT NULL,
    date_scheduled TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    meal_plan_data JSONB NOT NULL,
    total_calories DECIMAL(10,2) NOT NULL,
    total_protein DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    plan_type VARCHAR(50) DEFAULT 'daily',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom Recipes table
CREATE TABLE custom_recipes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_name VARCHAR(255) NOT NULL,
    ingredients TEXT[] NOT NULL,
    instructions TEXT[] NOT NULL,
    calories DECIMAL(10,2) NOT NULL,
    protein DECIMAL(10,2) NOT NULL,
    cooking_time VARCHAR(50),
    servings INTEGER NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    favorite_date DATE,
    tags TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled Meals table
CREATE TABLE scheduled_meals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_plan_id INTEGER REFERENCES meal_plans(id) ON DELETE SET NULL,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE SET NULL,
    custom_recipe_id INTEGER REFERENCES custom_recipes(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    meal_plan_data JSONB,
    total_calories DECIMAL(10,2) NOT NULL,
    total_protein DECIMAL(10,2) NOT NULL,
    meals_consumed TEXT[] DEFAULT '{}',
    calories_consumed DECIMAL(10,2) DEFAULT 0,
    protein_consumed DECIMAL(10,2) DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Water Tracking table
CREATE TABLE water_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    water_consumed INTEGER DEFAULT 0,
    glasses JSONB DEFAULT '[]',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Progress Tracking table
CREATE TABLE progress_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight DECIMAL(10,2),
    body_fat DECIMAL(10,2),
    muscle_mass DECIMAL(10,2),
    bmi DECIMAL(10,2),
    measurements JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Daily Nutrition table
CREATE TABLE daily_nutrition (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    calories_consumed DECIMAL(10,2) DEFAULT 0,
    protein_consumed DECIMAL(10,2) DEFAULT 0,
    carbs_consumed DECIMAL(10,2) DEFAULT 0,
    fat_consumed DECIMAL(10,2) DEFAULT 0,
    fiber_consumed DECIMAL(10,2) DEFAULT 0,
    sugar_consumed DECIMAL(10,2) DEFAULT 0,
    sodium_consumed DECIMAL(10,2) DEFAULT 0,
    meals_logged INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Weight Goals table
CREATE TABLE weight_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_weight DECIMAL(10,2) NOT NULL,
    target_weight DECIMAL(10,2) NOT NULL,
    start_weight DECIMAL(10,2) NOT NULL,
    goal_date DATE NOT NULL,
    weekly_goal DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Meal Plans table
CREATE TABLE daily_meal_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    meal_plan_data JSONB NOT NULL,
    total_calories DECIMAL(10,2) NOT NULL,
    total_protein DECIMAL(10,2) NOT NULL,
    auto_generated BOOLEAN DEFAULT FALSE,
    plan_name VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    breakfast_consumed BOOLEAN DEFAULT FALSE,
    lunch_consumed BOOLEAN DEFAULT FALSE,
    dinner_consumed BOOLEAN DEFAULT FALSE,
    snacks_consumed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Daily Tasks table
CREATE TABLE daily_tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    task_id VARCHAR(100) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    current_value DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date, task_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_is_active ON meal_plans(user_id, is_active);
CREATE INDEX idx_custom_recipes_user_id ON custom_recipes(user_id);
CREATE INDEX idx_scheduled_meals_user_id ON scheduled_meals(user_id);
CREATE INDEX idx_scheduled_meals_date ON scheduled_meals(user_id, scheduled_date);
CREATE INDEX idx_water_tracking_user_date ON water_tracking(user_id, date);
CREATE INDEX idx_progress_tracking_user_date ON progress_tracking(user_id, date);
CREATE INDEX idx_daily_nutrition_user_date ON daily_nutrition(user_id, date);
CREATE INDEX idx_daily_meal_plans_user_date ON daily_meal_plans(user_id, date);
CREATE INDEX idx_daily_tasks_user_date ON daily_tasks(user_id, date);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_recipes_updated_at BEFORE UPDATE ON custom_recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weight_goals_updated_at BEFORE UPDATE ON weight_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_meal_plans_updated_at BEFORE UPDATE ON daily_meal_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
