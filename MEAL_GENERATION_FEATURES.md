# Meal Generation and Saving Features

## Overview
Your app now supports **3 different meal generation and saving options** with proper date-wise meal management.

---

## 🍽️ Three Meal Generation Types

### 1. **Full Daily Meal Plan** (All 4 Meals)
Generate and save a complete day's meals in one operation.

**Includes:**
- ✅ Breakfast
- ✅ Lunch
- ✅ Dinner
- ✅ Snacks

**How it works:**
```typescript
// Context function
await saveFullDailyPlan(date, {
  breakfast: { recipeName: "Paratha with Egg", calories: 400, protein: 18, ... },
  lunch: { recipeName: "Biryani", calories: 750, protein: 38, ... },
  dinner: { recipeName: "Haleem", calories: 600, protein: 32, ... },
  snacks: { recipeName: "Boiled Eggs", calories: 140, protein: 12, ... }
});
```

**Backend Endpoint:**
```
POST /api/meals/daily-plan
Body: {
  userId: 1,
  date: "2025-10-24",
  meals: {
    breakfast: {...},
    lunch: {...},
    dinner: {...},
    snacks: {...}
  }
}
```

---

### 2. **Single Meal Generation** (One Meal Type)
Generate only ONE specific meal (breakfast OR lunch OR dinner OR snacks).

**Example: Generate only breakfast**
```typescript
const breakfastMeal = {
  id: "bf001",
  recipeName: "Oatmeal with Fruits",
  calories: 350,
  protein: 12,
  mealType: "breakfast"
};
```

**How to save:**
User taps "Save" → The app adds ONLY breakfast to that date without affecting other meals.

---

### 3. **Individual Meal Save** (Add to Existing Day)
Add or update a single meal type for a date that may already have other meals.

**Scenario:**
- User already has breakfast, lunch, and dinner saved for Oct 24
- User generates a new snack
- User taps "Save Snack"
- Result: Snack is added to Oct 24, existing meals remain unchanged

**How it works:**
```typescript
// Add individual meal
await scheduleMeal(meal, "2025-10-24", "snacks");

// Or add to today
await addMealToToday({
  recipeName: "Greek Yogurt",
  calories: 150,
  protein: 15,
  mealType: "snacks"
});
```

**Backend Endpoint:**
```
POST /api/meals/add
Body: {
  userId: 1,
  date: "2025-10-24",
  mealType: "snacks",
  meal: {
    id: "sn001",
    recipeName: "Greek Yogurt",
    calories: 150,
    protein: 15
  }
}
```

**Smart Merging:**
- Backend retrieves existing meals for that date
- Adds the new meal to the specific meal type
- Updates total calories and protein
- Preserves all other meals

---

## 📅 Date-Wise Meal Display

### Meals Page Views

#### **Daily View** (Selected Date)
Shows all meals for a specific date with:
- Date selector (14-day range: 3 days before, today, 10 days after)
- Daily nutrition summary (calories, protein, carbs, fat)
- Meals organized by type:
  - 🌅 Breakfast
  - 🍴 Lunch
  - 🌙 Dinner
  - 🍪 Snacks

#### **All Meals View** (All Saved Meals)
Shows meals grouped by date with:
- **AI Generated (Not Saved)** section at top
  - Shows temporarily generated meals not yet saved to a date
  - Can save or schedule these meals

- **Date Groups** (newest first)
  - Each date shows:
    - Date label (Today, Yesterday, Oct 22, etc.)
    - Total calories and protein for that day
    - Compact view of each meal type
  - Tap date header to jump to Daily View for that date
  - Tap meal card to see full details

---

## 🔄 Data Flow

### Saving a Full Daily Plan
```
1. User generates AI meal plan (all 4 meals)
2. User taps "Save Plan"
3. App calls: saveFullDailyPlan(date, meals)
   ↓
4. Backend: POST /api/meals/daily-plan
   - Checks if plan exists for date
   - If exists: UPDATE meal_plan_data
   - If not: INSERT new record
   ↓
5. Database: scheduled_meals table
   {
     user_id: 1,
     scheduled_date: "2025-10-24",
     meal_type: "daily_plan",
     meal_plan_data: { breakfast, lunch, dinner, snacks },
     total_calories: 2240,
     total_protein: 100
   }
   ↓
6. App refreshes and displays meals date-wise
```

### Saving a Single Meal
```
1. User generates single breakfast
2. User taps "Save to Oct 24"
3. App calls: scheduleMeal(meal, "2025-10-24", "breakfast")
   OR addMealToToday(meal) for today
   ↓
4. Backend: POST /api/meals/add
   - Gets existing plan for Oct 24
   - Extracts current meal_plan_data: { lunch, dinner, snacks }
   - Adds breakfast: { breakfast, lunch, dinner, snacks }
   - Recalculates total_calories and total_protein
   ↓
5. Database: UPDATE scheduled_meals
   Sets meal_plan_data with new breakfast included
   ↓
6. App shows breakfast on Oct 24 along with other meals
```

---

## 🗄️ Database Structure

### scheduled_meals Table
```sql
CREATE TABLE scheduled_meals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  scheduled_date DATE NOT NULL,
  meal_type VARCHAR(50) DEFAULT 'daily_plan',
  meal_plan_data JSONB NOT NULL,
  total_calories DECIMAL(10,2) DEFAULT 0,
  total_protein DECIMAL(10,2) DEFAULT 0,
  meals_consumed TEXT[],
  calories_consumed DECIMAL(10,2) DEFAULT 0,
  protein_consumed DECIMAL(10,2) DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  date_created TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);
```

### meal_plan_data JSONB Structure
```json
{
  "breakfast": {
    "id": "bf001",
    "recipeName": "Paratha with Egg",
    "calories": 400,
    "protein": 18,
    "carbs": 45,
    "fat": 15,
    "prepTime": "20 minutes",
    "servings": 1,
    "ingredients": ["Flour", "Eggs", "Oil"],
    "consumed": false
  },
  "lunch": { ... },
  "dinner": { ... },
  "snacks": { ... },  // or "snack" (both supported)
  "waterGlasses": 3,
  "tasks": [
    { "id": "task-1", "text": "Walk 10,000 steps", "completed": false }
  ]
}
```

---

## 🛠️ Context Functions

### Available in UnifiedMealContext

```typescript
// 1. Save complete daily plan (all 4 meals)
saveFullDailyPlan(
  date: string,
  meals: {
    breakfast?: MealItem,
    lunch?: MealItem,
    dinner?: MealItem,
    snacks?: MealItem
  }
): Promise<void>

// 2. Add individual meal to specific date
scheduleMeal(
  meal: MealItem,
  date: string,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks'
): Promise<void>

// 3. Add meal to today
addMealToToday(
  meal: Partial<MealItem>
): Promise<void>

// 4. Get meal plan for specific date
getMealPlanForDate(date: string): DailyMealPlan | null

// 5. Get today's meal plan
getTodayMealPlan(): DailyMealPlan | null

// 6. Refresh all meal data
refreshMealData(): void
```

---

## 🐛 Bug Fixes Applied

### Issue 1: "Failed to load data" Error
**Problem:** Backend was returning `snack` but context expected `snacks`

**Solution:** Updated context to handle both:
```typescript
['breakfast', 'lunch', 'dinner', 'snacks', 'snack'].forEach((mealType) => {
  const meal = mealPlanData[mealType];
  if (meal && !allMeals.some(m => m.id === meal.id)) {
    const normalizedMealType = mealType === 'snack' ? 'snacks' : mealType;
    // Use normalizedMealType for consistency
  }
});
```

### Issue 2: Date Format Mismatch
**Problem:** Backend returns `scheduled_date` as ISO timestamp, context needs YYYY-MM-DD

**Solution:** Proper date parsing:
```typescript
const planDate = plan.scheduled_date || plan.created_at
  ? new Date(plan.scheduled_date || plan.created_at).toISOString().split("T")[0]
  : todayString;
```

### Issue 3: Backend Response Structure
**Problem:** `getMealsForDate` returns `{ meals: {...} }` not `{ meal_plan_data: {...} }`

**Solution:** Updated context to use correct property:
```typescript
if (todayData && todayData.meals) {
  const mealPlanData = todayData.meals;
  // Process meals...
}
```

---

## ✅ Testing Checklist

- [x] **Generate full daily plan** → Save → View on Meals page
- [x] **Generate single breakfast** → Save to today → Check breakfast appears
- [x] **Add dinner to existing day** → Verify other meals unchanged
- [x] **View All Meals** → Check date grouping works
- [x] **Switch between Daily/All views** → Verify both work
- [x] **Backend server running** → Port 3000 active
- [x] **Data loading** → No "Failed to load data" errors
- [x] **Date-wise display** → Meals grouped correctly by date

---

## 📊 Current Data in Database

### User: Khan (ID: 1)

**October 22, 2025:**
- Breakfast: Paratha with Egg (400 cal, 18g protein)
- Lunch: Biryani (750 cal, 38g protein)
- Dinner: Haleem (600 cal, 32g protein)
- Snacks: Boiled Eggs (140 cal, 12g protein)
- **Total:** 1,890 cal, 100g protein

**January 25, 2025:**
- Breakfast: Oatmeal (350 cal, 12g protein)
- Lunch: Chicken Salad (450 cal, 35g protein)
- Dinner: Salmon (550 cal, 40g protein)
- Snacks: Yogurt (150 cal, 15g protein)
- **Total:** 1,500 cal, 102g protein

---

## 🚀 Usage Examples

### Example 1: Generate and Save Daily Plan
```typescript
// In your AI generation component
const generatedPlan = await generateAIDailyPlan(userPreferences);

// Save to today
await saveFullDailyPlan(todayDate, {
  breakfast: generatedPlan.breakfast,
  lunch: generatedPlan.lunch,
  dinner: generatedPlan.dinner,
  snacks: generatedPlan.snacks
});
```

### Example 2: Generate Single Breakfast
```typescript
// Generate only breakfast
const breakfast = await generateAIBreakfast(calorieGoal);

// Save to specific date
await scheduleMeal(breakfast, "2025-10-25", "breakfast");
```

### Example 3: Add Snack to Existing Day
```typescript
// User already has meals for today
// User adds a snack
const snack = {
  recipeName: "Protein Bar",
  calories: 200,
  protein: 20,
  mealType: "snacks"
};

// This merges with existing meals
await addMealToToday(snack);
```

---

## 🎯 Key Features

✅ **Three Generation Modes:** Full plan, single meal, or individual additions  
✅ **Smart Merging:** Adding meals doesn't overwrite existing ones  
✅ **Date-Wise Organization:** All meals properly grouped by date  
✅ **Backward Compatibility:** Handles both "snack" and "snacks"  
✅ **Real-Time Updates:** Context refreshes after each save  
✅ **Proper Error Handling:** Clear console logs for debugging  
✅ **Nutrition Tracking:** Auto-calculates total calories and protein  

---

## 🔧 Troubleshooting

### "Failed to load data" Error
1. Check backend server is running: `lsof -i :3000`
2. Restart if needed: `node /path/to/backend/server.js &`
3. Check console logs in app for specific error
4. Verify database connection in backend

### Meals Not Showing
1. Check if data exists: `curl "http://localhost:3000/api/meals/range/1?startDate=2025-01-01&endDate=2025-12-31"`
2. Verify user ID is correct
3. Check console logs for date parsing issues
4. Ensure backend is returning correct structure

### Duplicate Meals
1. Check meal IDs are unique
2. Verify deduplication logic in context
3. Clear and regenerate if needed

---

## 📝 Summary

Your meal system now supports:
1. ✅ Saving complete daily meal plans (4 meals at once)
2. ✅ Generating and saving individual meals (breakfast, lunch, dinner, OR snacks)
3. ✅ Adding meals to existing days without overwriting
4. ✅ Date-wise meal organization and display
5. ✅ Proper data persistence in PostgreSQL
6. ✅ Real-time UI updates

All issues have been fixed and the app is ready to use! 🎉
