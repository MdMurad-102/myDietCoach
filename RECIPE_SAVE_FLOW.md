# Recipe Generation & Save Flow

## Overview
The recipe generation system now saves recipes **date-wise** with meal type information. The Home page displays **only today's recipes** that have been saved.

## How It Works

### 1. Recipe Generation (`app/recipeGenerator/index.tsx`)

**User Journey:**
1. **Step 1:** Select meal type (Breakfast, Lunch, Dinner, Snack)
2. **Step 2:** Choose dietary preferences and add custom requests
3. **Step 3:** AI generates recipe with full details
4. **Save:** Click "Save to Today" to add recipe to today's meal plan

**Technical Flow:**
```typescript
// When user clicks "Save to Today"
const saveRecipe = async () => {
  const todayDate = new Date().toISOString().split('T')[0]; // e.g., "2025-10-20"
  
  const mealItem = {
    recipeName: generatedRecipe.name,
    calories: generatedRecipe.calories,
    protein: generatedRecipe.protein,
    ingredients: generatedRecipe.ingredients,
    instructions: generatedRecipe.instructions,
    mealType: mealType, // breakfast, lunch, dinner, or snack
    scheduledDate: todayDate,
    // ... other fields
  };

  // Schedule meal for today
  await mealContext.scheduleMeal(mealItem, todayDate, mealType);
};
```

### 2. Data Storage (Database)

**Table:** `scheduled_meals`

**Schema:**
```sql
CREATE TABLE scheduled_meals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    scheduled_date DATE NOT NULL,        -- Date for the meal
    meal_type VARCHAR(50) NOT NULL,      -- breakfast/lunch/dinner/snack
    meal_plan_data JSONB,                -- Full meal details
    total_calories DECIMAL(10,2),
    total_protein DECIMAL(10,2),
    -- ... other fields
);
```

**Example Record:**
```json
{
  "id": 123,
  "user_id": 1,
  "scheduled_date": "2025-10-20",
  "meal_type": "breakfast",
  "meal_plan_data": {
    "meals": [{
      "id": "recipe-1729425600000",
      "recipeName": "Protein Pancakes",
      "calories": 350,
      "protein": 25,
      "ingredients": ["2 eggs", "1 banana", "1/4 cup oats"],
      "instructions": ["Mix ingredients", "Cook on griddle"],
      "mealType": "breakfast",
      "scheduledDate": "2025-10-20"
    }]
  }
}
```

### 3. Context Management (`context/UnifiedMealContext.tsx`)

**Key Functions:**

#### `scheduleMeal(meal, date, mealType)`
- Saves meal to `scheduled_meals` table with date
- Calls `refreshMealData()` to update UI

#### `getTodayMealPlan()`
- Returns meals **only for today's date**
- Filters by: `WHERE scheduled_date = TODAY`

#### `refreshMealData()`
- Reloads all meal plans
- **Specifically reloads today's scheduled meals**
- Updates `currentDayPlan` state

```typescript
// Refresh loads today's plan specifically
const todayPlan = await getTodayMealPlan(user.id, todayString);
if (todayPlan) {
  setCurrentDayPlan({
    date: todayPlan.scheduled_date,  // Today's date
    meals: todayPlan.meal_plan_data?.meals || [],
    // ... other fields
  });
}
```

### 4. Home Page Display (`app/(tabs)/Home.tsx`)

**Display Logic:**
```typescript
// Get only today's meal plan
const todayMealPlan = getTodayMealPlan();

// Check if there are actual meals
const hasActualMeals = todayMealPlan?.meals?.length > 0;

// Map to display format
const todaysMeals = todayMealPlan.meals.map(meal => ({
  time: meal.mealType,           // "breakfast", "lunch", etc.
  name: meal.recipeName,         // "Protein Pancakes"
  calories: meal.calories        // 350
}));
```

**UI States:**
- **Has Meals:** Shows scrollable meal cards for today's meals
- **No Meals:** Shows "Generate AI Recipe" button

## Complete Flow Example

### Scenario: User generates and saves a breakfast recipe

1. **User navigates to Recipe Generator**
   - From Home: Click "Generate AI Recipe"
   - From Quick Actions: Click "Generate Recipe"

2. **User selects preferences**
   - Meal Type: Breakfast
   - Dietary: Vegetarian
   - Custom Request: "High protein, under 400 calories"

3. **AI generates recipe**
   ```json
   {
     "name": "Protein Oatmeal Bowl",
     "calories": 380,
     "protein": 28,
     "ingredients": ["1 cup oats", "1 scoop protein powder", "..."],
     "instructions": ["Cook oats", "Add protein", "..."]
   }
   ```

4. **User clicks "Save to Today"**
   - Recipe saved with:
     - `scheduled_date`: "2025-10-20" (today)
     - `meal_type`: "breakfast"
     - Full recipe details in `meal_plan_data`

5. **Database Insert**
   ```sql
   INSERT INTO scheduled_meals 
   (user_id, scheduled_date, meal_type, meal_plan_data, ...)
   VALUES (1, '2025-10-20', 'breakfast', {...})
   ```

6. **Context Refresh**
   - `refreshMealData()` called automatically
   - Today's plan reloaded from database
   - `currentDayPlan` updated

7. **Home Page Updates**
   - Automatically shows new breakfast recipe
   - Displays under "Today's Meals"
   - Shows meal card with name, calories, and meal type

## Date Filtering

### Why Date-Wise Storage?

**Benefits:**
- ✅ Shows only relevant meals for today
- ✅ Historical meal tracking (past dates)
- ✅ Future meal planning (future dates)
- ✅ Clean, organized data structure
- ✅ Easy to query and filter

### Database Queries

**Get Today's Meals:**
```sql
SELECT * FROM scheduled_meals 
WHERE user_id = $1 
  AND scheduled_date = '2025-10-20'
```

**Get This Week's Meals:**
```sql
SELECT * FROM scheduled_meals 
WHERE user_id = $1 
  AND scheduled_date >= '2025-10-20'
  AND scheduled_date <= '2025-10-26'
ORDER BY scheduled_date, meal_type
```

## User Experience Flow

```
┌─────────────────┐
│   Home Page     │  No meals today
│  "Generate AI   │ ────────┐
│    Recipe"      │         │
└─────────────────┘         │
                            ▼
┌─────────────────────────────┐
│  Recipe Generator           │
│  Step 1: Select Meal Type   │
│  [Breakfast] Lunch Dinner   │
└─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────┐
│  Recipe Generator           │
│  Step 2: Customize          │
│  Diet: Vegetarian           │
│  Request: High protein      │
└─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────┐
│  Recipe Generated!          │
│  Protein Oatmeal Bowl       │
│  380 cal | 28g protein      │
│  [Save to Today]            │
└─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────┐
│  Success!                   │
│  Added to breakfast plan    │
│  [View Home] [Generate More]│
└─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────┐
│   Home Page                 │
│   Today's Meals             │
│   🌅 Breakfast              │
│   Protein Oatmeal Bowl      │
│   380 calories              │
└─────────────────────────────┘
```

## API Reference

### Context Methods

```typescript
interface MealContextType {
  // Get today's plan (filtered by date)
  getTodayMealPlan: () => DailyMealPlan | null;
  
  // Schedule meal with date
  scheduleMeal: (
    meal: MealItem,
    date: string,        // "2025-10-20"
    mealType: string     // "breakfast"
  ) => Promise<void>;
  
  // Refresh all data (includes today's plan)
  refreshMealData: () => void;
}
```

### Database Functions

```typescript
// Get today's specific meal plan
getTodayMealPlan(userId: number, date: string): Promise<ScheduledMeal | null>

// Schedule a new meal
scheduleMeal(
  userId: number,
  date: string,           // "2025-10-20"
  mealType: string,       // "breakfast"
  calories: number,
  protein: number,
  recipeId?: number,
  customRecipeId?: number,
  mealPlanData?: any
): Promise<ScheduledMeal>
```

## Testing the Flow

### Test Steps:

1. **Open the app**
   - Navigate to Home page
   - Verify "No meals planned for today" shows

2. **Generate a recipe**
   - Click "Generate AI Recipe"
   - Select meal type: Breakfast
   - Choose dietary preference
   - Generate recipe

3. **Save the recipe**
   - Click "Save to Today"
   - Verify success message
   - Click "View Home"

4. **Verify Home page**
   - Should show the saved recipe
   - Should display correct meal type
   - Should show calorie count

5. **Generate another meal**
   - Navigate back to Recipe Generator
   - Generate Lunch recipe
   - Save to today

6. **Verify multiple meals**
   - Home should show both Breakfast and Lunch
   - Each with correct details

### Expected Results:

✅ Recipes save with today's date
✅ Home page shows only today's recipes
✅ Multiple meals per day work correctly
✅ Meal types are properly categorized
✅ Calorie and protein data displays correctly

## Troubleshooting

### Issue: Recipes not showing on Home page

**Check:**
1. Verify database connection
2. Check today's date format: "YYYY-MM-DD"
3. Ensure `refreshMealData()` is called after save
4. Check `getTodayMealPlan()` returns data

**Debug:**
```typescript
console.log('Today string:', todayString);
console.log('Today plan:', getTodayMealPlan());
console.log('Has meals:', todayMealPlan?.meals);
```

### Issue: Wrong date being saved

**Check:**
1. Date format: `new Date().toISOString().split('T')[0]`
2. Timezone settings
3. Database date column type

### Issue: Meals from previous days showing

**Check:**
1. Query filter: `WHERE scheduled_date = $1`
2. Date comparison in `getTodayMealPlan()`
3. Context state management

## Future Enhancements

### Planned Features:

1. **Weekly View**
   - See meals for entire week
   - Drag-and-drop meal scheduling
   
2. **Meal History**
   - View past meals
   - Re-use favorite recipes
   
3. **Meal Swapping**
   - Replace meal with another
   - Keep the same date and meal type
   
4. **Bulk Planning**
   - Generate full week's meals at once
   - Smart variety algorithm

5. **Nutrition Tracking**
   - Daily totals
   - Weekly averages
   - Goal progress

## Summary

The new recipe generation system provides a **seamless, date-aware meal planning experience**:

✅ **Smart Generation** - AI creates personalized recipes
✅ **Date-Wise Storage** - Each meal linked to specific date
✅ **Today's Focus** - Home page shows only today's meals
✅ **Easy Management** - Simple save and view workflow
✅ **Scalable** - Supports past/future meal planning

**Result:** Users can generate recipes and see them immediately on their Home page, with clear organization by date and meal type!
