# MyDietCoach Backend API Documentation

## Overview
This document describes all available backend API endpoints for the MyDietCoach mobile application. All endpoints communicate with a PostgreSQL database.

**Backend URL:** `http://192.168.1.110:3000/api`

---

## Database Tables

The backend uses the following PostgreSQL tables:
- `users` - User profiles and settings
- `recipes` - AI-generated and saved recipes
- `custom_recipes` - User-created custom recipes
- `meal_plans` - Meal plan templates
- `scheduled_meals` - Daily scheduled meals with 4 meal types
- `water_tracking` - Daily water intake tracking
- `progress_tracking` - Weight and body measurements tracking
- `daily_nutrition` - Daily nutrition totals (calories, protein, carbs, fat, etc.)
- `daily_tasks` - User daily tasks and completion status
- `weight_goals` - Weight loss/gain goals
- `daily_meal_plans` - Complete daily meal plans with consumption tracking

---

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

**Response:**
```json
{
  "status": "ok",
  "message": "MyDietCoach API is running"
}
```

---

## User Management

### Register User
```
POST /api/users/register
```
**Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

### Login User
```
POST /api/users/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get User by Email
```
GET /api/users/:email
```

### Update User Profile
```
PUT /api/users/:userId
```
**Body:**
```json
{
  "weight": "75",
  "height": "175",
  "gender": "male",
  "goal": "weight_loss",
  "age": "30",
  "calories": 2000,
  "proteins": 150,
  "country": "USA",
  "city": "New York",
  "dietType": "balanced"
}
```

---

## Water Tracking

### Track Water Intake
```
POST /api/water/track
```
**Body:**
```json
{
  "userId": 1,
  "date": "2025-01-26",
  "glasses": 8
}
```

### Get Today's Water Intake
```
GET /api/water/today/:userId
```

### Reset Water Tracking
```
POST /api/water/reset
```
**Body:**
```json
{
  "userId": 1,
  "date": "2025-01-26"
}
```

---

## Custom Recipes

### Save Custom Recipe
```
POST /api/recipes/custom
```
**Body:**
```json
{
  "userId": 1,
  "recipeName": "Protein Shake",
  "ingredients": ["Protein powder", "Banana", "Milk"],
  "instructions": ["Blend all ingredients", "Serve cold"],
  "calories": 300,
  "protein": 30,
  "cookingTime": "5 min",
  "servings": 1,
  "mealType": "snacks"
}
```

### Get User's Custom Recipes
```
GET /api/recipes/custom/:userId
```

### Delete Recipe
```
DELETE /api/recipes/:recipeId
```

---

## Meal Management (Scheduled Meals)

### Create/Update Daily Meal Plan
```
POST /api/meals/daily-plan
```
**Body:**
```json
{
  "userId": 1,
  "date": "2025-01-26",
  "meals": {
    "breakfast": {
      "id": "breakfast-1",
      "recipeName": "Oatmeal with Berries",
      "calories": 350,
      "protein": 12,
      "consumed": false
    },
    "lunch": {
      "id": "lunch-1",
      "recipeName": "Grilled Chicken Salad",
      "calories": 450,
      "protein": 35,
      "consumed": false
    },
    "dinner": {
      "id": "dinner-1",
      "recipeName": "Salmon with Vegetables",
      "calories": 550,
      "protein": 40,
      "consumed": false
    },
    "snacks": {
      "id": "snacks-1",
      "recipeName": "Greek Yogurt",
      "calories": 150,
      "protein": 15,
      "consumed": false
    }
  }
}
```

### Add Single Meal
```
POST /api/meals/add
```
**Body:**
```json
{
  "userId": 1,
  "date": "2025-01-26",
  "mealType": "breakfast",
  "meal": {
    "id": "breakfast-1",
    "recipeName": "Scrambled Eggs",
    "calories": 200,
    "protein": 18
  }
}
```

### Get Meals for Date
```
GET /api/meals/date/:userId/:date
```
**Example:** `GET /api/meals/date/1/2025-01-26`

### Get Meals for Date Range
```
GET /api/meals/range/:userId?startDate=2025-01-20&endDate=2025-01-26
```

### Mark Meal as Consumed
```
POST /api/meals/consume
```
**Body:**
```json
{
  "userId": 1,
  "date": "2025-01-26",
  "mealType": "breakfast"
}
```

### Delete Meal
```
DELETE /api/meals/:userId/:date/:mealType
```
**Example:** `DELETE /api/meals/1/2025-01-26/breakfast`

---

## Daily Nutrition Tracking

### Track Daily Nutrition
```
POST /api/nutrition/track
```
**Body:**
```json
{
  "userId": 1,
  "date": "2025-01-26",
  "calories": 500,
  "protein": 30,
  "carbs": 60,
  "fat": 15,
  "fiber": 5,
  "sugar": 10,
  "sodium": 500
}
```
**Note:** Values are cumulative (adds to existing totals for the day)

### Get Daily Nutrition
```
GET /api/nutrition/:userId/:date
```
**Example:** `GET /api/nutrition/1/2025-01-26`

### Get Nutrition for Date Range
```
GET /api/nutrition/range/:userId?startDate=2025-01-20&endDate=2025-01-26
```

---

## Daily Tasks

### Create/Update Daily Task
```
POST /api/tasks/update
```
**Body:**
```json
{
  "userId": 1,
  "date": "2025-01-26",
  "taskId": "water",
  "completed": false,
  "currentValue": 5
}
```

### Get Daily Tasks
```
GET /api/tasks/:userId/:date
```
**Example:** `GET /api/tasks/1/2025-01-26`

### Toggle Task Completion
```
PUT /api/tasks/toggle
```
**Body:**
```json
{
  "userId": 1,
  "date": "2025-01-26",
  "taskId": "water"
}
```

---

## Weight Goals

### Create Weight Goal
```
POST /api/goals/weight
```
**Body:**
```json
{
  "userId": 1,
  "currentWeight": 80,
  "targetWeight": 70,
  "startWeight": 85,
  "goalDate": "2025-06-01",
  "weeklyGoal": 0.5
}
```

### Get Active Weight Goal
```
GET /api/goals/weight/:userId
```
**Example:** `GET /api/goals/weight/1`

### Update Weight Goal Progress
```
PUT /api/goals/weight/:goalId
```
**Body:**
```json
{
  "currentWeight": 78
}
```

---

## Daily Meal Plans (v2 - separate from scheduled meals)

### Create/Update Daily Meal Plan
```
POST /api/daily-meal-plan
```
**Body:**
```json
{
  "userId": 1,
  "date": "2025-01-26",
  "planName": "High Protein Day",
  "autoGenerated": true,
  "mealPlanData": {
    "breakfast": {
      "recipeName": "Eggs & Toast",
      "calories": 400,
      "protein": 25
    },
    "lunch": {
      "recipeName": "Chicken Bowl",
      "calories": 600,
      "protein": 45
    },
    "dinner": {
      "recipeName": "Steak & Veggies",
      "calories": 700,
      "protein": 50
    },
    "snacks": {
      "recipeName": "Protein Bar",
      "calories": 200,
      "protein": 20
    }
  }
}
```

### Get Daily Meal Plan
```
GET /api/daily-meal-plan/:userId/:date
```
**Example:** `GET /api/daily-meal-plan/1/2025-01-26`

### Mark Meal as Consumed
```
PUT /api/daily-meal-plan/consume
```
**Body:**
```json
{
  "userId": 1,
  "date": "2025-01-26",
  "mealType": "breakfast",
  "consumed": true
}
```

---

## Progress Tracking

### Add Progress Entry
```
POST /api/progress
```
**Body:**
```json
{
  "userId": 1,
  "weight": 78.5,
  "bodyFat": 18.5,
  "muscleMass": 35.2,
  "notes": "Feeling great!"
}
```

### Get Progress Entries
```
GET /api/progress/:userId?startDate=2025-01-01&endDate=2025-01-31
```

---

## Mobile App Integration

### API Service (`service/api.ts`)

All endpoints are accessible through typed functions in the mobile app:

**Examples:**
```typescript
import { 
  trackDailyNutrition, 
  getDailyTasks,
  createWeightGoal,
  saveDailyMealPlan,
  getMealsForDate
} from '@/service/api';

// Track nutrition
await trackDailyNutrition(userId, '2025-01-26', 500, 30, 60, 15);

// Get tasks
const tasks = await getDailyTasks(userId, '2025-01-26');

// Create weight goal
await createWeightGoal(userId, 80, 70, 85, '2025-06-01', 0.5);

// Save meal plan
await saveDailyMealPlan(userId, '2025-01-26', {
  breakfast: { /* meal data */ },
  lunch: { /* meal data */ },
  dinner: { /* meal data */ },
  snacks: { /* meal data */ }
});

// Get meals
const meals = await getMealsForDate(userId, '2025-01-26');
```

---

## Environment Configuration

### Backend (`.env`)
```
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/mydietcoach
PORT=3000
NODE_ENV=development
```

### Mobile App (`service/api.ts`)
```typescript
const API_URL = __DEV__
  ? 'http://192.168.1.110:3000/api'  // Development
  : 'https://your-backend-url.com/api'; // Production
```

---

## Testing Endpoints

### Using curl:

```bash
# Test nutrition tracking
curl -X POST http://192.168.1.110:3000/api/nutrition/track \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"date":"2025-01-26","calories":500,"protein":30}'

# Test daily meal plan
curl -X POST http://192.168.1.110:3000/api/meals/daily-plan \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "date": "2025-01-26",
    "meals": {
      "breakfast": {"recipeName":"Oatmeal","calories":350,"protein":12},
      "lunch": {"recipeName":"Salad","calories":400,"protein":25}
    }
  }'

# Get meals for date
curl -X GET http://192.168.1.110:3000/api/meals/date/1/2025-01-26
```

---

## Database Schema

### Key Tables Structure

**users:**
- id, name, email, password
- weight, height, gender, age
- calories, proteins, daily_water_goal
- country, city, diet_type

**scheduled_meals:**
- id, user_id, scheduled_date, meal_type
- meal_plan_data (JSONB) - stores {breakfast, lunch, dinner, snacks}
- total_calories, total_protein
- meals_consumed, calories_consumed, protein_consumed

**daily_nutrition:**
- id, user_id, date
- calories_consumed, protein_consumed, carbs_consumed
- fat_consumed, fiber_consumed, sugar_consumed, sodium_consumed
- meals_logged

**daily_tasks:**
- id, user_id, date, task_id
- completed, current_value

**weight_goals:**
- id, user_id, current_weight, target_weight
- start_weight, goal_date, weekly_goal
- is_active

---

## Notes

1. All dates are stored in ISO format (YYYY-MM-DD)
2. The backend automatically converts dates to PostgreSQL DATE type
3. Nutrition tracking is cumulative - each POST adds to the day's totals
4. Only one weight goal can be active per user
5. Meal consumption tracking is available in both `scheduled_meals` and `daily_meal_plans` tables
6. The backend uses PostgreSQL JSONB for flexible meal plan data storage

---

## Status

✅ **All Endpoints Tested and Working**

Backend server running on: `http://192.168.1.110:3000`
Database: PostgreSQL 17 (`mydietcoach`)
Mobile App: React Native/Expo

Last Updated: October 24, 2025
