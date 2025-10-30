# Dynamic Chart Update Feature - Implementation Guide ✅

## Feature Overview

Implemented a toggle button system on the Home page that allows users to mark meals as "consumed". When a meal is marked as eaten, the calories and protein progress charts dynamically update in real-time.

## What's Been Changed

### 1. **MealPreview Component** (`app/components/MealPreview.tsx`)

**Enhanced UI with Toggle Button:**
- Added `consumed`, `protein`, and `id` properties to meal interface
- Visual feedback: Cards turn green with a border when meal is consumed
- "Eaten" badge appears on consumed meals
- Toggle button changes from "Mark Eaten" to "Consumed" with icon change
- Shows both calories and protein information

**Visual States:**
```
Not Consumed:
- White/blue gradient background
- Green outline button "Mark Eaten"
- Checkmark-circle-outline icon

Consumed:
- Green gradient background (#e8f5e9 → #c8e6c9)
- Green border (2px solid #4CAF50)
- Green filled button with white text "Consumed"
- Checkmark-circle icon (filled)
- "Eaten" badge in top-right corner
```

**New Props:**
```typescript
meal: {
    time: string;        // Meal type (breakfast, lunch, dinner, snacks)
    name: string;        // Meal name
    calories: number;    // Calories
    protein?: number;    // Protein grams
    consumed?: boolean;  // Consumed state
    id?: string;        // Meal ID for tracking
}
```

### 2. **Home Page** (`app/(tabs)/Home.tsx`)

**Dynamic Data Handling:**
- Imported `markMealConsumed` function from context
- Created `handleMealToggle` function to toggle consumed state
- Pass full meal objects instead of simplified data
- Connected toggle button to actual state management

**Changes Made:**
```typescript
// Added markMealConsumed to imports
const { getTodayMealPlan, refreshMealData, markMealConsumed } = useMealContext();

// New toggle handler
const handleMealToggle = (mealId: string, currentConsumedState: boolean) => {
    markMealConsumed(mealId, !currentConsumedState);
};

// Updated meal data passing
<MealPreview
    key={meal.id || index}
    meal={{
        time: meal.mealType || "Meal",
        name: meal.recipeName || meal.name || "Unnamed Meal",
        calories: meal.calories,
        protein: meal.protein,
        consumed: meal.consumed,
        id: meal.id,
    }}
    onMarkEaten={() => handleMealToggle(meal.id, meal.consumed || false)}
    onReplace={() => { }}
/>
```

### 3. **UnifiedMealContext** (`context/UnifiedMealContext.tsx`)

**Smart Calorie/Protein Calculation:**
The `markMealConsumed` function now automatically recalculates consumed totals:

```typescript
const markMealConsumed = (mealId: string, consumed: boolean) => {
    setDailyMealPlans((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((date) => {
            const plan = updated[date];
            
            // Update the meal's consumed state
            const updatedMeals = plan.meals.map((meal) =>
                meal.id === mealId ? { ...meal, consumed } : meal
            );
            
            // 🔥 Recalculate consumed calories from all consumed meals
            const consumedCalories = updatedMeals
                .filter(meal => meal.consumed)
                .reduce((sum, meal) => sum + (meal.calories || 0), 0);
            
            // 🔥 Recalculate consumed protein from all consumed meals
            const consumedProtein = updatedMeals
                .filter(meal => meal.consumed)
                .reduce((sum, meal) => sum + (meal.protein || 0), 0);
            
            // Update the plan with new values
            updated[date] = {
                ...plan,
                meals: updatedMeals,
                consumedCalories,
                consumedProtein,
            };
        });
        return updated;
    });
};
```

**How It Works:**
1. User clicks toggle button on a meal
2. `markMealConsumed(mealId, newConsumedState)` is called
3. Function finds the meal and updates its `consumed` property
4. **Automatically filters all consumed meals** and sums their calories/protein
5. Updates `consumedCalories` and `consumedProtein` in the daily plan
6. React re-renders the progress charts with new values

## User Experience Flow

### Before Consuming Meals:
```
Home Page
├── Progress Charts
│   ├── Calories: 0 / 2000 (0%)
│   └── Protein: 0g / 150g (0%)
└── Today's Meals
    ├── Breakfast: Luchi with Alur Dom (480 kcal, 10g protein) [Mark Eaten]
    ├── Lunch: Chickpea Quinoa Salad (400 kcal, 25g protein) [Mark Eaten]
    ├── Dinner: Fried Rice (580 kcal, 20g protein) [Mark Eaten]
    └── Snacks: Banana (100 kcal, 1g protein) [Mark Eaten]
```

### After Clicking "Mark Eaten" on Breakfast:
```
Home Page
├── Progress Charts
│   ├── Calories: 480 / 2000 (24%) ✨ UPDATED
│   └── Protein: 10g / 150g (6.7%) ✨ UPDATED
└── Today's Meals
    ├── ✅ Breakfast: Luchi with Alur Dom (480 kcal, 10g) [Consumed] 🟢
    ├── Lunch: Chickpea Quinoa Salad (400 kcal, 25g) [Mark Eaten]
    ├── Dinner: Fried Rice (580 kcal, 20g) [Mark Eaten]
    └── Snacks: Banana (100 kcal, 1g) [Mark Eaten]
```

### After Marking Breakfast + Lunch + Snacks:
```
Home Page
├── Progress Charts
│   ├── Calories: 980 / 2000 (49%) ✨ UPDATED
│   └── Protein: 36g / 150g (24%) ✨ UPDATED
└── Today's Meals
    ├── ✅ Breakfast: Luchi (480 kcal, 10g) [Consumed] 🟢
    ├── ✅ Lunch: Chickpea Salad (400 kcal, 25g) [Consumed] 🟢
    ├── Dinner: Fried Rice (580 kcal, 20g) [Mark Eaten]
    └── ✅ Snacks: Banana (100 kcal, 1g) [Consumed] 🟢
```

### After All Meals Consumed:
```
Home Page
├── Progress Charts
│   ├── Calories: 1560 / 2000 (78%) ✨ COMPLETE
│   └── Protein: 56g / 150g (37.3%) ✨ COMPLETE
└── Today's Meals
    ├── ✅ Breakfast: Luchi (480 kcal, 10g) [Consumed] 🟢
    ├── ✅ Lunch: Chickpea Salad (400 kcal, 25g) [Consumed] 🟢
    ├── ✅ Dinner: Fried Rice (580 kcal, 20g) [Consumed] 🟢
    └── ✅ Snacks: Banana (100 kcal, 1g) [Consumed] 🟢
```

## Technical Details

### State Management Flow

```
User Action: Click "Mark Eaten" on Breakfast
        ↓
handleMealToggle("bf007", false)
        ↓
markMealConsumed("bf007", true)
        ↓
Update State:
├── Find meal with id="bf007"
├── Set consumed = true
├── Filter all meals where consumed === true
├── Sum calories: 480 (breakfast only)
├── Sum protein: 10g (breakfast only)
└── Update consumedCalories = 480, consumedProtein = 10
        ↓
React Re-render
        ↓
Progress Charts Update:
├── Calories: 480 / 2000 = 24%
└── Protein: 10g / 150g = 6.7%
```

### Progress Calculation

The Home page calculates progress percentages:

```typescript
const calculateProgress = () => {
    const caloriesProgress = 
        (todayMealPlan.consumedCalories / todayMealPlan.goals.calories) * 100;
    
    const proteinProgress = 
        (todayMealPlan.consumedProtein / todayMealPlan.goals.protein) * 100;
    
    return { caloriesProgress, proteinProgress };
};
```

**Example:**
- Goal: 2000 calories, 150g protein
- Consumed: 480 calories, 10g protein
- Progress: 24% calories, 6.7% protein

### Toggle Behavior

**Clicking when NOT consumed:**
- Changes card to green gradient
- Shows "Eaten" badge
- Button becomes green with "Consumed" text
- Adds calories/protein to total
- Progress bars increase

**Clicking when CONSUMED:**
- Changes card back to white/blue gradient
- Hides "Eaten" badge
- Button becomes outline with "Mark Eaten" text
- Removes calories/protein from total
- Progress bars decrease

## Visual Design

### Not Consumed State
```
┌─────────────────────────┐
│ 🍽️ Breakfast          │
│                         │
│ Luchi with Alur Dom     │
│ 480 kcal                │
│ 10g protein             │
│                         │
│ [✓ Mark Eaten]  ← Green outline button
└─────────────────────────┘
```

### Consumed State
```
┌─────────────────────────┐ ← Green border
│ 🍽️ Breakfast   [✓Eaten]│ ← Badge
│                         │
│ Luchi with Alur Dom     │ ← Green gradient
│ 480 kcal                │
│ 10g protein             │
│                         │
│ [✓ Consumed]    ← Filled green button
└─────────────────────────┘
```

## Benefits

✅ **Real-time Updates:** Charts update instantly when meals are marked
✅ **Visual Feedback:** Clear indication of which meals have been eaten
✅ **Accurate Tracking:** Automatic calculation prevents manual errors
✅ **Reversible:** Can toggle meals on/off if marked by mistake
✅ **User-Friendly:** One-tap interaction to track meal consumption
✅ **Progress Motivation:** See your daily progress increase with each meal

## Testing Steps

1. **Start Fresh:**
   - Open app and go to Home page
   - Verify progress charts show 0/2000 calories, 0g/150g protein
   - All meal cards should be white/blue gradient

2. **Mark First Meal:**
   - Click "Mark Eaten" on Breakfast
   - ✅ Card turns green with border
   - ✅ "Eaten" badge appears
   - ✅ Button changes to "Consumed"
   - ✅ Calorie chart updates to show breakfast calories
   - ✅ Protein chart updates to show breakfast protein

3. **Mark Multiple Meals:**
   - Click "Mark Eaten" on Lunch
   - ✅ Both meals show as consumed
   - ✅ Charts show sum of both meals
   - Click on Snacks
   - ✅ Charts show sum of all 3 consumed meals

4. **Toggle Off:**
   - Click "Consumed" button on Breakfast
   - ✅ Card returns to white/blue gradient
   - ✅ "Eaten" badge disappears
   - ✅ Button changes back to "Mark Eaten"
   - ✅ Charts decrease by breakfast amounts

5. **All Meals:**
   - Mark all meals as consumed
   - ✅ All cards are green
   - ✅ Charts show total of all meals
   - Progress bars should be significant (e.g., 78% of 2000 calories)

## Future Enhancements

**Possible additions:**
- 🔔 Notification when daily goal reached
- 📊 Daily streak tracking for consistent logging
- ⏰ Time-based reminders to log meals
- 📸 Photo attachment for consumed meals
- 💾 Sync consumed state to backend database
- 📈 Weekly/monthly consumption trends
- 🎯 Achievement badges for meeting goals

## Summary

This feature transforms the Home page from a static meal display into an interactive tracking system. Users can now:
1. See their meal plan
2. Mark meals as consumed with one tap
3. Watch their progress charts update in real-time
4. Stay motivated by seeing their daily progress grow

The implementation is fully reactive, efficient, and provides excellent user feedback through visual cues and animations.

---

**Status:** ✅ Implemented and Ready for Testing
**Files Modified:** 3 (MealPreview.tsx, Home.tsx, UnifiedMealContext.tsx)
**Lines Changed:** ~100 lines total
**Breaking Changes:** None - backward compatible

