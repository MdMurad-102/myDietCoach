# Meal Generation System Update

## 🎉 What Changed

The daily meal plan generator has been updated to use our **expanded Bangladeshi food database** with **88 healthy food items** (previously used a hardcoded database with only ~25 items).

## 📊 Expanded Database Summary

| Category | Previous | New | Improvement |
|----------|----------|-----|-------------|
| **Breakfast** | 6 | 12 | +100% |
| **Lunch** | 7 | 15 | +114% |
| **Dinner** | 6 | 15 | +150% |
| **Snacks** | 8 | 18 | +125% |
| **Traditional Dishes** | 4 | 12 | +200% |
| **Beverages** | 4 | 16 | +300% |
| **TOTAL** | **35** | **88** | **+151%** |

## 🔧 Technical Changes

### Files Modified:

1. **`data/bangladeshiFoods.json`** ✅
   - Expanded all categories with healthy, nutritious Bangladeshi food options
   - Added accurate nutrition data (calories, protein, carbs, fat, fiber)
   - Included health tips and portion sizes
   - Focus on high protein (15-38g), high fiber (5-10g), balanced macros

2. **`utils/mealPlanGenerator.ts`** ✅
   - Changed from hardcoded `bangladeshMealDatabase.ts` to dynamic JSON loading
   - Added `loadMealsFromJSON()` function to read from `bangladeshiFoods.json`
   - Added `convertFoodItemToMeal()` to transform JSON data to meal format
   - Automatic vegetarian/vegan detection based on ingredients
   - Added console logging to show how many meals are loaded

### Key Features:

✅ **Random Meal Selection**: Each meal plan is randomly generated from 88 options
✅ **Smart Calorie Balancing**: Distributes calories (25% breakfast, 35% lunch, 30% dinner, 10% snacks)
✅ **Dietary Preferences**: Supports vegetarian-only, vegan-only filters
✅ **Repetition Avoidance**: Won't suggest recently consumed meals
✅ **High Protein Option**: Can prefer meals with higher protein content
✅ **Proper Randomization**: Uses `Math.random()` to select from filtered options

## 🍽️ Meal Generation Logic

```typescript
// 1. Load meals from JSON (88 items total)
const { breakfastMeals, lunchMeals, dinnerMeals, snackMeals } = loadMealsFromJSON();

// 2. Calculate calorie targets
const calorieTargets = {
    breakfast: targetCalories * 0.25,  // 25% = 500 cal for 2000 cal/day
    lunch: targetCalories * 0.35,      // 35% = 700 cal
    dinner: targetCalories * 0.30,     // 30% = 600 cal
    snack: targetCalories * 0.10,      // 10% = 200 cal
};

// 3. Filter based on preferences
- Avoid recently consumed meals (IDs in avoidMealIds)
- Filter vegetarian if requested
- Filter vegan if requested
- Prefer high protein if requested

// 4. Smart selection
- Find meals within ±150 calorie tolerance of target
- Randomly select from matching meals
- If no match, select closest calorie meal

// 5. Return complete meal plan
- breakfast, lunch, dinner, snack
- totalCalories, totalProtein, totalCarbs, totalFat
- date
```

## 📱 How to Test

### Option 1: Generate New Meal Plan (Recommended)

1. Open the app
2. Navigate to **"Daily Meal Plan"** or **"Create Meal Plan"** screen
3. Tap **"Generate Meal Plan"** button
4. **Observe**: You should now see meals from the expanded database (88 options)
5. **Check variety**: Regenerate multiple times - you should get different meals each time
6. **Verify**: Check console logs for message: `🍽️ Loaded meals from bangladeshiFoods.json:`

### Option 2: View Console Logs

When meal plan is generated, console should show:
```
🍽️ Loaded meals from bangladeshiFoods.json:
  Breakfast: 12 options
  Lunch: 15 options
  Dinner: 15 options
  Snacks: 18 options
  Total: 60 meals available (breakfast+lunch+dinner+snacks)
```

### Option 3: Test Filters

1. Generate meal plan with **Vegetarian Only** option
2. **Verify**: No chicken, fish, beef, eggs in meal names
3. Generate meal plan with **High Protein** option
4. **Verify**: Meals have 20g+ protein

## 🎯 Expected Behavior

### Before (Old System):
- ❌ Only 25 food items total
- ❌ Limited variety (same meals repeat often)
- ❌ Hardcoded in TypeScript file
- ❌ Difficult to update or expand

### After (New System):
- ✅ 88 food items total (151% increase)
- ✅ High variety (60 meals for daily plans, 12 traditional, 16 beverages)
- ✅ Dynamic JSON loading
- ✅ Easy to update (just edit JSON file)
- ✅ Proper randomization (rarely see same meal twice in a week)
- ✅ Healthier options (high protein, high fiber, balanced macros)
- ✅ Culturally authentic (Bangladeshi cuisine)

## 🔍 Verification Checklist

Run through these checks:

- [ ] Generate meal plan - should complete without errors
- [ ] Breakfast shows one of 12 options (Paratha, Khichuri, Oats, etc.)
- [ ] Lunch shows one of 15 options (Dal Bhaat, Grilled Chicken, Fish Curry, etc.)
- [ ] Dinner shows one of 15 options (Grilled Fish, Soup, Tofu, etc.)
- [ ] Snack shows one of 18 options (Fruits, Nuts, Yogurt, Eggs, etc.)
- [ ] Total calories close to target (±200 cal)
- [ ] Regenerate button creates NEW meals (not same ones)
- [ ] Vegetarian filter works (no meat/fish/eggs when enabled)
- [ ] Meals display Bangla names correctly (পরোটা, ভাত, ইলিশ, etc.)
- [ ] Nutrition data accurate (calories, protein, carbs, fat)

## 🐛 Potential Issues & Solutions

### Issue: Meal plan always shows same meals
**Cause**: Random number generator not working
**Solution**: Check console for meal count - should show 12, 15, 15, 18

### Issue: Meals not loading
**Cause**: JSON file format error or import issue
**Solution**: Run `node -e "console.log(require('./data/bangladeshiFoods.json'))"` to verify JSON is valid

### Issue: Vegetarian filter shows non-veg meals
**Cause**: Keywords not detected properly
**Solution**: Check `convertFoodItemToMeal()` function - update `nonVegKeywords` array

### Issue: TypeScript compilation errors
**Cause**: Import path issues
**Solution**: Ensure `foodDatabase.ts` exists and exports `getFoodsByMealType()`

## 🚀 Future Enhancements

Possible improvements:
1. **User Preferences**: Save liked/disliked meals
2. **Nutrition Goals**: Auto-adjust portions for weight loss/gain
3. **Shopping List**: Generate grocery list from meal plan
4. **Meal History**: Track which meals user consumed over time
5. **Recipe Instructions**: Add cooking steps for each meal
6. **AI Suggestions**: Use AI to recommend meals based on user goals
7. **Seasonal Foods**: Highlight seasonal/fresh ingredients
8. **Cost Estimation**: Add price estimates for each meal

## 📝 Notes

- Original `bangladeshMealDatabase.ts` file still exists but is no longer used
- Can be removed in future cleanup
- All new meal generation uses `bangladeshiFoods.json`
- Database can be expanded further by editing JSON file
- No backend changes required - all logic is frontend

## ✅ Summary

The meal generation system now:
- Uses **88 food items** instead of 25 (+151%)
- Provides **much better variety** and less repetition
- Includes **healthier options** with accurate nutrition data
- Maintains **Bangladeshi authenticity**
- Supports **dietary preferences** (vegetarian, vegan, high protein)
- Uses **smart randomization** for diverse meal plans

**Result**: Users will get varied, balanced, culturally-appropriate meal plans with proper randomization! 🎉
