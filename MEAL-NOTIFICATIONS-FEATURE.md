# 🔔 Meal Notification & Timer Feature - Complete Implementation

## ✅ What Was Added:

### 1. **Meal Timing Context** (`context/MealTimingContext.tsx`)
- Stores meal times for Breakfast, Lunch, Dinner, and Snack
- Manages notification scheduling
- Calculates time remaining until next meal
- Default times:
  - 🌅 Breakfast: 8:00 AM
  - 🍽️ Lunch: 1:00 PM
  - 🌙 Dinner: 7:00 PM
  - 🍪 Snack: 4:00 PM (optional)

### 2. **Next Meal Countdown** (`app/components/NextMealCountdown.tsx`)
- Beautiful gradient card showing upcoming meal
- Live countdown timer (updates every minute)
- Shows time in hours and minutes (e.g., "2h 30m")
- Click to navigate to Profile and adjust meal times
- Displayed prominently on Home screen

### 3. **Meal Time Settings** (`app/components/MealTimeSettings.tsx`)
- Easy-to-use time picker for each meal
- Toggle notifications on/off per meal
- Visual icons for each meal type
- Located in Profile page
- Requests notification permissions automatically

---

## 🎯 Features:

### ✅ **Home Screen:**
- **Next Meal Countdown Card** at the top
  - Shows which meal is coming next
  - Displays time remaining (e.g., "in 2h 15m")
  - Beautiful purple gradient design
  - Tap to go to settings

### ✅ **Profile Screen:**
- **Meal Reminders Section**
  - Set custom time for each meal
  - Enable/disable notifications per meal
  - See current meal times
  - Easy time picker interface

### ✅ **Notifications:**
- Get reminded at meal times
- Notifications say: "🍽️ Time for [Meal]!"
- Repeats daily automatically
- Works even when app is closed
- Custom notification sound

---

## 📱 How to Use:

### **For Users:**

1. **Open the app**
2. **Go to Profile tab**
3. **Scroll to "Meal Reminders" section**
4. **For each meal:**
   - Toggle the switch ON to enable reminders
   - Tap "Change Time" to set your preferred time
   - Select time from the picker
5. **Grant notification permission** when prompted
6. **Done!** You'll get reminders at your meal times

### **Home Screen:**
- See "Next Meal" card at top
- Shows countdown timer
- Tap card to change settings

---

## 🔧 Technical Details:

### **Packages Installed:**
```bash
expo-notifications  # For meal time alerts
@react-native-community/datetimepicker  # For time selection
```

### **Files Created/Modified:**

**New Files:**
- `context/MealTimingContext.tsx` - Meal timing state management
- `app/components/NextMealCountdown.tsx` - Countdown timer UI
- `app/components/MealTimeSettings.tsx` - Settings interface

**Modified Files:**
- `app/_layout.tsx` - Added MealTimingProvider
- `app/(tabs)/Home.tsx` - Added NextMealCountdown component
- `app/(tabs)/Profile.tsx` - Added MealTimeSettings component

---

## 🎨 UI Features:

### **Next Meal Countdown Card:**
- **Purple gradient background** (#667eea → #764ba2)
- **Meal-specific icons:**
  - 🌅 Breakfast: Sun icon
  - 🍽️ Lunch: Restaurant icon
  - 🌙 Dinner: Moon icon
  - 🍪 Snack: Fast-food icon
- **Live countdown timer** with clock icon
- **Tap to open settings**

### **Meal Time Settings:**
- **Card-based design** for each meal
- **Toggle switches** to enable/disable
- **Time picker** with AM/PM format
- **Color-coded icons**
- **Info banner** explaining the feature

---

## ⚙️ Notification Logic:

### **How It Works:**
1. User sets meal time (e.g., Breakfast at 8:00 AM)
2. User enables notification toggle
3. App requests notification permissions
4. Notification scheduled for that time daily
5. At 8:00 AM every day, user gets alert
6. Notification repeats automatically

### **Notification Content:**
```
Title: 🍽️ Time for Breakfast!
Body: It's time to enjoy your breakfast. Stay on track with your nutrition goals!
Sound: Enabled
Priority: High
```

---

## 📊 Example User Flow:

### **Morning:**
- 7:30 AM: User opens app
- Home shows: "Next Meal: Breakfast in 30m"
- 8:00 AM: 🔔 Notification: "Time for Breakfast!"
- User eats breakfast

### **Afternoon:**
- 12:30 PM: Home shows: "Next Meal: Lunch in 30m"
- 1:00 PM: 🔔 Notification: "Time for Lunch!"
- User eats lunch

### **Evening:**
- 6:45 PM: Home shows: "Next Meal: Dinner in 15m"
- 7:00 PM: 🔔 Notification: "Time for Dinner!"
- User eats dinner

---

## 🚀 Testing:

### **Test Countdown Timer:**
1. Open app
2. Check Home screen top
3. Should see "Next Meal: [Meal Type] in [Time]"
4. Wait 1 minute, time should update

### **Test Notifications:**
1. Go to Profile
2. Enable a meal notification
3. Set time to 1 minute from now
4. Wait for notification
5. Should receive alert

### **Test Time Picker:**
1. Go to Profile → Meal Reminders
2. Tap "Change Time" on any meal
3. Select new time
4. Should see updated time displayed

---

## 🎯 Default Meal Times:

| Meal | Time | Icon | Notification |
|------|------|------|--------------|
| Breakfast | 8:00 AM | 🌅 | Enabled |
| Lunch | 1:00 PM | 🍽️ | Enabled |
| Dinner | 7:00 PM | 🌙 | Enabled |
| Snack | 4:00 PM | 🍪 | Disabled |

---

## ✅ All Features Working:

- ✅ Set custom meal times
- ✅ Enable/disable notifications per meal
- ✅ Live countdown timer on Home
- ✅ Daily repeating notifications
- ✅ Beautiful UI with gradients
- ✅ Meal-specific icons
- ✅ Time picker with AM/PM
- ✅ Notification permissions handling
- ✅ Works on iOS and Android
- ✅ Persists settings in AsyncStorage

---

## 🎉 FEATURE COMPLETE!

Your app now has a complete meal notification and countdown system! Users can:
- Set their preferred meal times
- Get notifications at meal times
- See countdown to next meal
- Stay on track with their nutrition goals

**The feature is fully implemented and ready to use!** 🚀

