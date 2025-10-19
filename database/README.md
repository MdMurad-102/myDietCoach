# Database Module - PostgreSQL Implementation

## 📁 Structure

```
database/
├── db.ts                           # PostgreSQL connection and utilities
├── users.ts                        # User management operations
├── recipes.ts                      # Recipe and meal plan operations
├── tracking.ts                     # Progress and tracking operations
├── index.ts                        # Central exports
├── schema.sql                      # Database schema
└── EXAMPLE_UserContext_Migration.tsx  # Migration example
```

## 🚀 Quick Start

### 1. Set Up Database
```bash
# Run the automated setup script
chmod +x setup-postgres.sh
./setup-postgres.sh
```

### 2. Configure Environment
Update `.env.local`:
```bash
EXPO_PUBLIC_DATABASE_URL=postgresql://localhost:5432/mydietcoach
```

### 3. Install Dependencies
```bash
npm install
```

## 📚 API Reference

### Core Database Functions

#### Connection (`db.ts`)
```typescript
import { query, transaction, pool } from './database';

// Execute a query
const result = await query('SELECT * FROM users WHERE email = $1', [email]);

// Execute a transaction
await transaction(async (client) => {
  await client.query('INSERT INTO ...');
  await client.query('UPDATE ...');
});
```

### User Operations (`users.ts`)

```typescript
import { 
  createOrGetUser, 
  getUserByEmail, 
  getUserById,
  updateUserProfile,
  updateWaterGoal,
  updateUserCredits,
  deductUserCredits 
} from './database';

// Create or get user
const user = await createOrGetUser('user@example.com', 'John Doe');

// Get user by email
const user = await getUserByEmail('user@example.com');

// Get user by ID
const user = await getUserById(1);

// Update user profile
const updatedUser = await updateUserProfile(userId, {
  weight: '75',
  height: '180',
  calories: 2000,
  proteins: 150,
  goal: 'weight_loss'
});

// Update water goal
await updateWaterGoal(userId, 10); // 10 glasses per day

// Add credits
await updateUserCredits(userId, 5);

// Deduct credits
const success = await deductUserCredits(userId, 1);
```

### Recipe Operations (`recipes.ts`)

```typescript
import {
  createRecipe,
  getUserRecipes,
  getFavoriteRecipes,
  toggleRecipeFavorite,
  createMealPlan,
  getUserMealPlans,
  getActiveMealPlan,
  updateMealInPlan,
  scheduleMeal,
  getTodayMealPlan,
  toggleMealConsumed,
  saveCustomRecipe,
  getUserCustomRecipes,
  toggleCustomRecipeFavorite,
  deleteCustomRecipe
} from './database';

// Create a recipe
const recipe = await createRecipe(
  userId,
  'Protein Shake',
  { ingredients: [...], instructions: [...] },
  'https://example.com/image.jpg'
);

// Get user's recipes
const recipes = await getUserRecipes(userId);

// Get favorite recipes
const favorites = await getFavoriteRecipes(userId);

// Toggle favorite
await toggleRecipeFavorite(recipeId);

// Create meal plan
const mealPlan = await createMealPlan(
  userId,
  'Week 1 Plan',
  { breakfast: {...}, lunch: {...}, dinner: {...} },
  2000, // total calories
  150   // total protein
);

// Get active meal plan
const activePlan = await getActiveMealPlan(userId);

// Schedule a meal
const scheduledMeal = await scheduleMeal(
  userId,
  '2025-10-20', // date
  'breakfast',
  500,  // calories
  30,   // protein
  recipeId
);

// Get today's meal plan
const today = await getTodayMealPlan(userId, '2025-10-20');

// Mark meal as consumed
await toggleMealConsumed(scheduledMealId, 'breakfast', 500, 30);

// Save custom recipe
const customRecipe = await saveCustomRecipe(
  userId,
  'My Custom Salad',
  ['lettuce', 'tomato', 'chicken'],
  ['Mix all ingredients'],
  350, // calories
  25,  // protein
  '15 minutes',
  2,   // servings
  'lunch'
);

// Get custom recipes
const customRecipes = await getUserCustomRecipes(userId);
```

### Tracking Operations (`tracking.ts`)

```typescript
import {
  trackWater,
  getWaterTracking,
  resetWaterTracking,
  addProgressEntry,
  getProgressEntries,
  getProgressEntryByDate,
  updateDailyNutrition,
  getDailyNutrition,
  updateTaskStatus,
  getDailyTasks,
  getTaskById
} from './database';

// Track water intake
await trackWater(userId, '2025-10-20', 250); // 250ml

// Get water tracking
const waterData = await getWaterTracking(userId, '2025-10-20');

// Add progress entry
await addProgressEntry(userId, '2025-10-20', {
  weight: 75.5,
  body_fat: 18.2,
  bmi: 23.1,
  measurements: {
    waist: 82,
    chest: 95,
    hips: 98
  },
  notes: 'Feeling good!'
});

// Get progress history
const progress = await getProgressEntries(userId, 30); // Last 30 entries

// Update daily nutrition
await updateDailyNutrition(userId, '2025-10-20', {
  calories: 500,
  protein: 30,
  carbs: 50,
  fat: 15
});

// Get daily nutrition
const nutrition = await getDailyNutrition(userId, '2025-10-20');

// Update task status
await updateTaskStatus(userId, '2025-10-20', 'drink-water', true, 8);

// Get daily tasks
const tasks = await getDailyTasks(userId, '2025-10-20');
```

## 🔄 Migration from Convex

### Pattern 1: Query Migration

**Before (Convex):**
```typescript
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

const user = useQuery(api.Users.GetUser, { email: userEmail });
```

**After (PostgreSQL):**
```typescript
import { getUserByEmail } from '../database';
import { useState, useEffect } from 'react';

const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadUser() {
    const data = await getUserByEmail(userEmail);
    setUser(data);
    setLoading(false);
  }
  loadUser();
}, [userEmail]);
```

### Pattern 2: Mutation Migration

**Before (Convex):**
```typescript
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

const updateUser = useMutation(api.Users.updateTask);
await updateUser({ id: userId, weight: '75', ... });
```

**After (PostgreSQL):**
```typescript
import { updateUserProfile } from '../database';

async function handleUpdate() {
  await updateUserProfile(userId, { weight: '75', ... });
  // Refresh data if needed
}
```

### Pattern 3: Context Provider Migration

See `EXAMPLE_UserContext_Migration.tsx` for a complete example.

## 🎯 Best Practices

### 1. Error Handling
```typescript
try {
  const user = await getUserByEmail(email);
  if (!user) {
    console.log('User not found');
    return;
  }
  // Use user data
} catch (error) {
  console.error('Database error:', error);
  // Show error to user
}
```

### 2. Loading States
```typescript
const [loading, setLoading] = useState(true);

async function loadData() {
  setLoading(true);
  try {
    const data = await getUserRecipes(userId);
    setRecipes(data);
  } finally {
    setLoading(false);
  }
}
```

### 3. Transactions for Multiple Operations
```typescript
import { transaction } from './database';

await transaction(async (client) => {
  // Create meal plan
  const plan = await client.query(
    'INSERT INTO meal_plans (...) RETURNING *',
    [...]
  );
  
  // Schedule meals
  await client.query(
    'INSERT INTO scheduled_meals (...)',
    [...]
  );
  
  // Update user credits
  await client.query(
    'UPDATE users SET credit = credit - 1 WHERE id = $1',
    [userId]
  );
});
```

### 4. Parameterized Queries (Prevent SQL Injection)
```typescript
// ✅ GOOD - Parameterized query
await query('SELECT * FROM users WHERE email = $1', [email]);

// ❌ BAD - SQL injection risk
await query(`SELECT * FROM users WHERE email = '${email}'`);
```

## 🐛 Debugging

### Test Database Connection
```typescript
import { query } from './database';

async function testConnection() {
  try {
    const result = await query('SELECT NOW() as time, version()');
    console.log('Database connected:', result.rows[0]);
  } catch (error) {
    console.error('Connection failed:', error);
  }
}
```

### Check Table Structure
```bash
psql mydietcoach -c "\d users"
psql mydietcoach -c "\d recipes"
```

### View Data
```bash
psql mydietcoach -c "SELECT * FROM users LIMIT 5;"
psql mydietcoach -c "SELECT COUNT(*) FROM recipes;"
```

## 📊 Database Schema Overview

### Tables
- **users**: User accounts and profiles
- **recipes**: AI-generated recipes
- **meal_plans**: User meal plans
- **custom_recipes**: User-created recipes
- **scheduled_meals**: Daily meal schedule
- **water_tracking**: Water intake logs
- **progress_tracking**: Weight and measurements
- **daily_nutrition**: Nutrition tracking
- **weight_goals**: User weight goals
- **daily_meal_plans**: Daily meal planning
- **daily_tasks**: Task completion

### Relationships
```
users (1) ───< (many) recipes
users (1) ───< (many) meal_plans
users (1) ───< (many) custom_recipes
users (1) ───< (many) scheduled_meals
users (1) ───< (many) water_tracking
users (1) ───< (many) progress_tracking
```

## 🚀 Production Deployment

### Recommended Services

1. **Supabase** (Easiest)
   - Free tier available
   - PostgreSQL with REST API
   - Built-in authentication
   - Real-time subscriptions

2. **Heroku Postgres**
   - Easy setup
   - Automatic backups
   - Good free tier

3. **AWS RDS**
   - Highly scalable
   - Full control
   - Production-ready

4. **DigitalOcean**
   - Managed PostgreSQL
   - Good pricing
   - Easy setup

### Connection String Format
```bash
# Supabase
postgresql://user:pass@db.xxx.supabase.co:5432/postgres

# Heroku
postgres://user:pass@host.amazonaws.com:5432/dbname

# AWS RDS
postgresql://user:pass@xxx.rds.amazonaws.com:5432/dbname
```

## 📝 Notes

- All database functions use async/await
- Dates should be in 'YYYY-MM-DD' format
- All functions include error handling
- Transaction support for complex operations
- Automatic timestamp updates via triggers
- Indexes for optimal query performance

## 🆘 Support

For issues:
1. Check PostgreSQL is running
2. Verify connection string
3. Check table structure with `\d tablename`
4. Review error messages
5. Test queries directly with `psql`
