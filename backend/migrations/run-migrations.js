// Database Migration Script
// Run this to set up your PostgreSQL database

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
    console.log('🚀 Starting database migration...\n');

    try {
        // Read the schema file
        const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute the schema
        await pool.query(schema);

        console.log('✅ Database schema created successfully!');
        console.log('\n📊 Tables created:');
        console.log('   - users');
        console.log('   - recipes');
        console.log('   - custom_recipes');
        console.log('   - meal_plans');
        console.log('   - scheduled_meals');
        console.log('   - water_tracking');
        console.log('   - progress_tracking');
        console.log('   - weight_goals');
        console.log('   - daily_nutrition');
        console.log('   - daily_meal_plans');
        console.log('   - daily_tasks');

        // Insert a test user (optional)
        const testEmail = 'test@mydietcoach.com';
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [testEmail]);

        if (existingUser.rows.length === 0) {
            await pool.query(
                'INSERT INTO users (email, name, daily_water_goal) VALUES ($1, $2, $3)',
                [testEmail, 'Test User', 8]
            );
            console.log('\n✅ Test user created: test@mydietcoach.com');
        }

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run migrations
runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
