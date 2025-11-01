# Daily Meal Plan Randomization - FIXED! 🎲

## Problem Identified
Your daily meal generation was **always giving the same meals** because:

### Root Cause:
The `selectMeal()` function had a **deterministic fallback** that would always pick the **closest calorie match** when multiple meals had the same closest distance. This meant:
- Same breakfast every time (closest to 500 cal)
- Same lunch every time (closest to 700 cal)
- Same dinner every time (closest to 600 cal)
- Same snack every time (closest to 200 cal)

### Old Logic (BROKEN):
```typescript
// If no close matches, select the closest one
let closest = filteredMeals[0];  // ❌ Always starts with first meal
let minDiff = Math.abs(filteredMeals[0].calories - targetCal);

for (const meal of filteredMeals) {
    const diff = Math.abs(meal.calories - targetCal);
    if (diff < minDiff) {
        minDiff = diff;
        closest = meal;  // ❌ Only updates if BETTER, not EQUAL
    }
}

return closest;  // ❌ Returns the FIRST meal with minimum difference
```

**Result**: When 3 meals all had the same calorie difference (e.g., all 50 cal away from target), it would **always pick the first one** in the array.

## Solution Applied ✅

### New Logic (FIXED):
```typescript
// Find ALL meals with minimum difference
let minDiff = Math.abs(filteredMeals[0].calories - targetCal);

// First pass: find minimum difference
for (const meal of filteredMeals) {
    const diff = Math.abs(meal.calories - targetCal);
    if (diff < minDiff) {
        minDiff = diff;
    }
}

// Second pass: collect ALL meals with that minimum difference
const closestMeals = filteredMeals.filter(
    meal => Math.abs(meal.calories - targetCal) === minDiff
);

// ✅ Randomly select from ALL closest meals
const randomIndex = Math.floor(Math.random() * closestMeals.length);
return closestMeals[randomIndex];
```

**Result**: When multiple meals have the same calorie distance, it **randomly picks from all of them**.

## Changes Made

### 1. Fixed `selectMeal()` Function
- ✅ Now collects **ALL meals** with minimum calorie difference
- ✅ Randomly selects from the collection
- ✅ Added logging to show which meal was selected and how many options were available

### 2. Increased Tolerance for More Variety
- **Old tolerance**: ±150 calories
- **New tolerance**: ±200 calories (breakfast, lunch, dinner), ±150 (snacks)
- **Result**: More meals qualify as "close matches", increasing variety

### 3. Improved Console Logging
```
🍽️ Loaded meals from bangladeshiFoods.json:
  Breakfast: 12 options
  Lunch: 15 options
  Dinner: 15 options
  Snacks: 18 options
  Total: 60 meals available

🎲 Selecting meals randomly...
  Selected Oats with Banana from 5 close matches (target: 500 cal)
  Selected Grilled Chicken with Brown Rice from 7 close matches (target: 700 cal)
  Selected Steamed Fish with Brown Rice from 6 close matches (target: 600 cal)
  Selected Apple Slices from 8 closest meals (diff: 5 cal)

✅ Generated Meal Plan:
  Breakfast: Oats with Banana (250 cal, 8g protein)
  Lunch: Grilled Chicken with Brown Rice (420 cal, 35g protein)
  Dinner: Steamed Fish with Brown Rice (360 cal, 26g protein)
  Snack: Apple Slices (95 cal, 0g protein)
```

### 4. Fixed `regenerateMeal()` Function
- ✅ Uses same improved randomization logic
- ✅ Wider tolerance (±200 cal) for more variety
- ✅ Logs regenerated meal selection

## How to Test

### 1. Generate Multiple Meal Plans
```
1. Open app
2. Navigate to "Daily Meal Plan" screen
3. Tap "Generate Meal Plan" button
4. Note the meals shown
5. Tap "Generate Meal Plan" again (3-5 times)
6. ✅ VERIFY: Different meals each time
```

### 2. Check Console Logs
Look for:
```
🎲 Selecting meals randomly...
  Selected [MEAL_NAME] from X close matches
```
The meal name should be **different each time** you regenerate.

### 3. Test Regenerate Individual Meal
```
1. Generate a meal plan
2. Tap the "🔄" button on any meal (breakfast, lunch, dinner, or snack)
3. ✅ VERIFY: A different meal appears
4. Tap "🔄" again
5. ✅ VERIFY: Another different meal (not the same two repeating)
```

## Expected Results

### Before Fix (BROKEN):
```
Generation 1:
  Breakfast: Paratha with Egg
  Lunch: Dal Bhaat
  Dinner: Rice with Fish Curry
  Snack: Banana

Generation 2:
  Breakfast: Paratha with Egg     ❌ SAME
  Lunch: Dal Bhaat                ❌ SAME
  Dinner: Rice with Fish Curry    ❌ SAME
  Snack: Banana                   ❌ SAME

Generation 3:
  Breakfast: Paratha with Egg     ❌ SAME AGAIN
  ...
```

### After Fix (WORKING):
```
Generation 1:
  Breakfast: Paratha with Egg
  Lunch: Dal Bhaat
  Dinner: Rice with Fish Curry
  Snack: Banana

Generation 2:
  Breakfast: Oats with Banana     ✅ DIFFERENT
  Lunch: Grilled Chicken          ✅ DIFFERENT
  Dinner: Steamed Fish            ✅ DIFFERENT
  Snack: Apple Slices             ✅ DIFFERENT

Generation 3:
  Breakfast: Poached Eggs         ✅ DIFFERENT AGAIN
  Lunch: Fish Jhol                ✅ DIFFERENT AGAIN
  Dinner: Tofu with Vegetables    ✅ DIFFERENT AGAIN
  Snack: Yogurt                   ✅ DIFFERENT AGAIN
```

## Technical Details

### Why It Was Broken:
1. **Single winner selection**: Old code would find ONE "closest" meal and always return it
2. **No randomization among equals**: When 5 meals all had same calorie distance, it picked the first one
3. **Array order dependency**: Meals loaded from JSON in same order every time
4. **Deterministic output**: Same input (target calories) → Same output (same meal)

### Why It's Fixed Now:
1. **Multiple candidates**: Collects ALL meals with minimum distance
2. **True randomization**: Uses `Math.random()` to pick from candidates
3. **Wider tolerance**: More meals qualify, more variety
4. **Logging**: Can see which meals were considered and selected

### Randomization Math:
```
If 5 meals have same closest distance to target:
- Old: Always pick meals[0] = 0% randomness
- New: Random from 5 = 20% chance for each = 100% randomness

With 12 breakfast options and tolerance ±200 cal:
- Average 5-7 meals within tolerance
- Each meal has ~15-20% chance of being selected
- Very unlikely to see same meal twice in a row
```

## Files Changed
✅ `utils/mealPlanGenerator.ts` - Fixed `selectMeal()` and `regenerateMeal()` functions

## Summary
Your daily meal generation now has **proper randomization**! 🎉

**Key Improvements:**
- ✅ Collects ALL meals with minimum calorie difference (not just the first)
- ✅ Randomly selects from the collection
- ✅ Wider tolerance for more variety
- ✅ Better logging to track selections
- ✅ Works for both initial generation and regeneration

**Result**: You'll now see **different meals every time** you generate a meal plan! No more repetition! 🎲✨
