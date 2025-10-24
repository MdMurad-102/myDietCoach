# Date-Based Meal Planning & Bangla Language Support

## Overview
Your app now supports **generating meals for future dates** and **displaying Bangla language** names. Users can plan ahead for Oct 25, 26, or any date up to 7 days in advance, and the Home page correctly shows only **today's meals**.

---

## ✨ New Features

### 1. **Date Selector for Meal Planning**
Users can now select which date to generate meals for:
- **Today** (Oct 24)
- **Tomorrow** (Oct 25)  
- **Day after tomorrow** (Oct 26)
- Up to **7 days ahead**

#### How It Works
```typescript
// Date selector shows 7 days starting from today
const getDateOptions = () => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const label = i === 0 ? 'Today' : 
                 i === 1 ? 'Tomorrow' : 
                 date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dates.push({ date: dateStr, label });
  }
  return dates;
};
```

#### UI Location
**Daily Meal Plan Page** → Top section below header
- Horizontal scrollable date buttons
- Selected date highlighted in purple
- Shows "Today", "Tomorrow", or date label

---

### 2. **Save Meals to Selected Date**
Meals are now saved to the **user-selected date**, not always today.

#### Before (Old Behavior)
```typescript
// ❌ Always saved to today
const today = new Date().toISOString().split('T')[0];
await scheduleMeal(meal, today, type);
```

#### After (New Behavior)
```typescript
// ✅ Saves to selected date
await saveFullDailyPlan(selectedDate, mealsToSave);

// Success message shows the date
Alert.alert(
  '✅ Meal Plan Saved!',
  `Your complete daily meal plan has been saved for ${dateLabel}.`
);
```

#### Example Scenarios

**Scenario 1: Generate for Tomorrow**
```
1. User opens Daily Meal Plan page
2. Taps "Tomorrow" (Oct 25)
3. Generates meals with target calories 2000
4. Taps "Save Plan"
→ Meals saved to Oct 25, 2025
→ Alert shows: "...saved for Tomorrow"
```

**Scenario 2: Generate for Specific Future Date**
```
1. User selects "Oct 26" 
2. Generates high-protein meals
3. Saves plan
→ Meals saved to Oct 26, 2025
→ Alert shows: "...saved for Oct 26"
```

**Scenario 3: Planning Entire Week**
```
Monday: Generate meals for Today → Save
Tuesday planning: Select "Oct 26" → Generate → Save
Wednesday planning: Select "Oct 27" → Generate → Save
→ Each day has separate meal plan
```

---

### 3. **Home Page Shows Only Today's Meals**
The Home page is **already configured** to display only meals for the current date.

#### Implementation
```typescript
// context/UnifiedMealContext.tsx
const getTodayMealPlan = (): DailyMealPlan | null => {
  return getMealPlanForDate(todayString); // todayString = "2025-10-24"
};

// app/(tabs)/Home.tsx
const todayMealPlan = getTodayMealPlan();
// ✅ Only shows meals scheduled for Oct 24
// ❌ Does NOT show meals for Oct 25 or Oct 26
```

#### Verification
- **Oct 24 (Today)**: Home page shows meals saved for Oct 24
- **Oct 25 (Tomorrow)**: NOT shown on Home page (only on Meals page)
- **Oct 26**: NOT shown on Home page (only on Meals page)

#### Where to See Future Meals
Future meals are visible in:
1. **Meals Page → Daily View**: Select date to see those meals
2. **Meals Page → All Meals View**: Shows all meals grouped by date

---

### 4. **Bangla Language Support**
Meal names now display in both **English** and **Bangla**.

#### Data Structure
```typescript
export interface MealItem {
  recipeName: string;  // English name (e.g., "Paratha with Egg")
  name?: string;       // English name alternative
  nameBn?: string;     // Bangla name (e.g., "পরোটা ও ডিম")
  // ... other fields
}
```

#### Display in UI

**1. Daily Meal Plan Page**
```tsx
<Text style={styles.mealName}>{meal.nameEn}</Text>
<Text style={styles.mealNameBangla}>{meal.name}</Text> {/* Bangla */}
```

**2. Meal Card Component**
```tsx
<Text style={styles.name}>{meal.recipeName || meal.name}</Text>
{meal.nameBn && (
  <Text style={styles.nameBangla}>{meal.nameBn}</Text>
)}
<Text style={styles.type}>{meal.mealType}</Text>
```

#### Example Display

**Breakfast Card:**
```
🌅 Paratha with Egg
   পরোটা ও ডিম
   Breakfast
   
   🔥 400 kcal  💪 18g protein  ⏱️ 20 minutes
```

**Lunch Card:**
```
🌞 Biryani (Chicken/Mutton)
   বিরিয়ানি (মুরগি/মাটন)
   Lunch
   
   🔥 750 kcal  💪 38g protein  ⏱️ 120 minutes
```

#### Bangla Support in Database
The `bangladeshMealDatabase.ts` contains authentic Bangla names:

```typescript
{
  id: 'bf001',
  name: 'পরোটা ও ডিম',           // Bangla name
  nameEn: 'Paratha with Egg',    // English name
  category: 'breakfast',
  calories: 400,
  protein: 18,
  // ...
}
```

**Meals with Bangla Names:**
- পরোটা ও ডিম (Paratha with Egg)
- খিচুড়ি (Khichuri)
- রুটি ও সবজি (Roti with Sabji)
- পুরি ও আলু ভাজি (Puri with Aloo Bhaji)
- ডাল পুরি (Daal Puri)
- বিরিয়ানি (Biryani)
- পোলাও (Polao/Pilaf)
- ভাত ও গরুর মাংস (Bhaat with Beef Curry)
- And 30+ more authentic dishes

---

## 🔄 Complete Workflow

### Planning for Future Date

```
Step 1: Open Daily Meal Plan
↓
Step 2: Select Date
- Scroll horizontally through date buttons
- Tap "Tomorrow" or "Oct 26"
- Selected date highlighted
↓
Step 3: Set Preferences
- Target Calories: 1500/2000/2500
- Vegetarian Only: ☐
- High Protein: ☑
- Quick Meals: ☐
↓
Step 4: Generate Plan
- Tap "Generate Meal Plan"
- Wait 0.8 seconds
- See 4 meals generated:
  * Breakfast (25% calories)
  * Lunch (35% calories)
  * Dinner (30% calories)
  * Snacks (10% calories)
↓
Step 5: Review Meals
- English + Bangla names shown
- Nutrition breakdown visible
- Tags displayed (traditional, popular, etc.)
- Can regenerate individual meals
↓
Step 6: Save Plan
- Tap "Save Plan" button
- Alert: "Meal Plan Saved for Tomorrow"
- Meals stored with selected date
↓
Step 7: View Saved Meals
- Home page: Shows ONLY today's meals
- Meals page → Daily View: Select date to see meals
- Meals page → All Meals: Shows all dates grouped
```

---

## 📅 Date-Based Data Storage

### Database Structure
```sql
scheduled_meals table:
- user_id: 1
- scheduled_date: "2025-10-25"  ← Specific date
- meal_plan_data: {
    breakfast: {
      id: "bf001",
      recipeName: "Paratha with Egg",
      nameBn: "পরোটা ও ডিম",
      calories: 400,
      protein: 18,
      ...
    },
    lunch: {...},
    dinner: {...},
    snacks: {...}
  }
```

### Querying by Date

**Get Today's Meals:**
```typescript
const today = "2025-10-24";
const todayPlan = await getMealsForDate(userId, today);
// Returns only meals for Oct 24
```

**Get Tomorrow's Meals:**
```typescript
const tomorrow = "2025-10-25";
const tomorrowPlan = await getMealsForDate(userId, tomorrow);
// Returns only meals for Oct 25
```

**Get Date Range:**
```typescript
const plans = await getMealsForRange(
  userId, 
  "2025-10-24", 
  "2025-10-31"
);
// Returns all meals between Oct 24-31
```

---

## 🌍 Language Display Logic

### Priority Order
1. **English**: `meal.recipeName` or `meal.nameEn`
2. **Bangla**: `meal.nameBn` (from `meal.name` in database)

### Conditional Display
```typescript
// Show English name
<Text>{meal.recipeName || meal.name}</Text>

// Show Bangla only if available
{meal.nameBn && (
  <Text style={banglaStyle}>{meal.nameBn}</Text>
)}
```

### Styling Differences
```typescript
const styles = StyleSheet.create({
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  nameBangla: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontStyle: 'italic',  // Distinguished from English
  },
});
```

---

## 🔍 Testing Scenarios

### Test 1: Generate for Today
1. Open Daily Meal Plan
2. "Today" is selected by default
3. Generate meal plan
4. Save
5. ✅ Check Home page → Meals appear
6. ✅ Check Meals page → Today's date shows meals

### Test 2: Generate for Tomorrow
1. Open Daily Meal Plan
2. Tap "Tomorrow" button
3. Generate meal plan
4. Save
5. ✅ Alert says "saved for Tomorrow"
6. ✅ Home page → NO meals for tomorrow shown
7. ✅ Meals page → Select tomorrow → Meals appear

### Test 3: Generate for Oct 26
1. Open Daily Meal Plan
2. Scroll and tap "Oct 26"
3. Generate meal plan
4. Save
5. ✅ Alert says "saved for Oct 26"
6. ✅ Home page → Only today's meals (Oct 24)
7. ✅ Meals page → All Meals → Oct 26 group appears

### Test 4: Bangla Display
1. Generate any meal plan
2. ✅ English name shown first (large, bold)
3. ✅ Bangla name shown below (smaller, italic, gray)
4. ✅ Meal type shown at bottom
5. Open meal details
6. ✅ Both languages visible

### Test 5: Multiple Days
1. Generate meals for Today → Save
2. Generate meals for Tomorrow → Save  
3. Generate meals for Oct 26 → Save
4. ✅ Home page → Only today's meals
5. ✅ Meals page → All Meals → Shows 3 date groups
6. ✅ Each date has 4 meals (breakfast, lunch, dinner, snacks)

---

## 📱 UI Changes

### Daily Meal Plan Page

**Added:**
- Date selector section at top
- 7 date buttons (horizontal scroll)
- Active date highlighted in purple
- Date labels: "Today", "Tomorrow", or "Oct 26"

**Updated:**
- Save function uses selected date
- Success alert shows date saved to
- Bangla names displayed in meal cards

### Meal Card Component

**Added:**
- `nameBangla` text field
- Conditional rendering for Bangla
- Italic gray styling for distinction

### Home Page

**No Changes Needed:**
- Already uses `getTodayMealPlan()`
- Automatically filters to current date
- Future meals not displayed

---

## 🗄️ Code Changes Summary

### Files Modified

1. **`app/dailyMealPlan/index.tsx`**
   - Added `selectedDate` state
   - Added `getDateOptions()` function
   - Added date selector UI
   - Updated `handleSavePlan()` to use `selectedDate`
   - Now saves with `saveFullDailyPlan(selectedDate, meals)`
   - Includes Bangla names in saved data

2. **`context/UnifiedMealContext.tsx`**
   - Added `nameBn?: string` to `MealItem` interface
   - Already had `getTodayMealPlan()` filtering correctly
   - Supports `saveFullDailyPlan()` function

3. **`app/components/MealCard.tsx`**
   - Added Bangla name display
   - Added `nameBangla` style
   - Conditional rendering for Bangla text

4. **`utils/bangladeshMealDatabase.ts`**
   - Already contains Bangla names (`name` field)
   - English names in `nameEn` field
   - 30+ authentic Bangladesh dishes

---

## ✅ Success Criteria

All features now working:

✅ **Date Selection** - Users can select any date up to 7 days ahead  
✅ **Date-Specific Saving** - Meals saved to selected date, not always today  
✅ **Home Page Filtering** - Only today's meals shown on Home  
✅ **Future Meal Access** - Tomorrow/future meals viewable in Meals page  
✅ **Bangla Display** - Both English and Bangla names shown  
✅ **Multi-Day Planning** - Users can plan meals for entire week  
✅ **Proper Data Storage** - Each date has separate meal plan in database  

---

## 🎯 User Benefits

1. **Plan Ahead** - Generate meals for tomorrow or next week
2. **Stay Organized** - Home page shows only today's focus
3. **Cultural Connection** - See meals in native Bangla language
4. **Flexibility** - Change future plans without affecting today
5. **Meal Prep** - Plan grocery shopping for multiple days

---

## 🚀 Next Steps (Optional Enhancements)

1. **Copy Meals** - Copy today's plan to tomorrow
2. **Meal Templates** - Save favorite plans as templates
3. **Weekly View** - Calendar view showing all 7 days
4. **Grocery List** - Auto-generate shopping list from week's meals
5. **Notifications** - Remind to plan tomorrow's meals
6. **Meal Swap** - Swap lunch from one day to another

---

## 📝 Example Usage

**Monday Morning (Oct 24):**
```
User: "I want to plan meals for tomorrow"
1. Opens Daily Meal Plan
2. Taps "Tomorrow" (Oct 25)
3. Sets High Protein preference
4. Generates plan
5. Saves
→ Tomorrow's meals ready ✅
→ Today's Home page unaffected ✅
```

**Monday Evening:**
```
User: "What's for lunch tomorrow?"
1. Opens Meals page
2. Taps Daily View
3. Selects "Tomorrow"
→ Sees: Biryani (বিরিয়ানি), 750 cal, 38g protein
```

**Tuesday Morning (Oct 25):**
```
User: Opens app Home page
→ Automatically shows Oct 25 meals (today's meals)
→ Yesterday's meals (Oct 24) no longer on Home
→ Can still view Oct 24 in Meals page history
```

---

## 🎉 Summary

Your app now supports:
1. ✅ **Generate meals for future dates** (up to 7 days ahead)
2. ✅ **Save to specific dates** (Oct 24, Oct 25, Oct 26, etc.)
3. ✅ **Home page shows only today** (automatic filtering)
4. ✅ **Bangla language display** (authentic Bangladesh meal names)
5. ✅ **Multi-day planning** (plan entire week in advance)

**Ready to test!** Generate some meals for tomorrow and see them appear on the correct date! 🚀🇧🇩
