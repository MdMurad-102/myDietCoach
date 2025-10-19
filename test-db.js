// Test PostgreSQL Database Connection
// Run with: node test-db.js

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Connection string - you can modify this
const connectionString = process.env.EXPO_PUBLIC_DATABASE_URL || 'postgresql://localhost:5432/mydietcoach';

console.log('🔌 Attempting to connect to:', connectionString.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({
    connectionString: connectionString,
    // For local development, you might not need SSL
    ssl: false
});

async function testConnection() {
    console.log('\n📊 Testing Database Connection...\n');

    try {
        // Test basic connection
        const timeResult = await pool.query('SELECT NOW() as current_time');
        console.log('✅ Connection successful!');
        console.log('⏰ Server time:', timeResult.rows[0].current_time);

        // Check PostgreSQL version
        const versionResult = await pool.query('SELECT version()');
        console.log('🔧 PostgreSQL version:', versionResult.rows[0].version.split(',')[0]);

        // List all tables
        const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);

        console.log('\n📋 Tables in database:', tablesResult.rows.length);
        if (tablesResult.rows.length > 0) {
            tablesResult.rows.forEach((row, index) => {
                console.log(`   ${index + 1}. ${row.tablename}`);
            });

            // Expected tables
            const expectedTables = [
                'users', 'recipes', 'meal_plans', 'custom_recipes',
                'scheduled_meals', 'water_tracking', 'progress_tracking',
                'daily_nutrition', 'weight_goals', 'daily_meal_plans', 'daily_tasks'
            ];

            const foundTables = tablesResult.rows.map(r => r.tablename);
            const missingTables = expectedTables.filter(t => !foundTables.includes(t));

            if (missingTables.length === 0) {
                console.log('\n✅ All expected tables are present!');
            } else {
                console.log('\n⚠️  Missing tables:', missingTables.join(', '));
                console.log('   Run the schema.sql file to create them.');
            }

            // Test a simple query on users table
            try {
                const countResult = await pool.query('SELECT COUNT(*) as count FROM users');
                console.log('\n👥 Users in database:', countResult.rows[0].count);
            } catch (err) {
                console.log('\n⚠️  Could not query users table:', err.message);
            }

        } else {
            console.log('\n⚠️  No tables found! You need to run the schema.sql file.');
            console.log('   Run: psql mydietcoach < database/schema.sql');
        }

        console.log('\n✨ Database is ready to use!\n');

    } catch (error) {
        console.error('\n❌ Connection failed!');
        console.error('Error:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Make sure PostgreSQL is running');
        console.error('2. Verify the database "mydietcoach" exists');
        console.error('3. Check your connection string in .env.local');
        console.error('4. Verify your username/password are correct\n');
    } finally {
        await pool.end();
    }
}

testConnection();
