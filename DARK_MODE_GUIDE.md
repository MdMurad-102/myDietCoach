# Dark Mode Implementation Guide

## Overview
Dark mode has been successfully added to myDietCoach app with the following features:
- Toggle switch in Profile page under "Preferences" section
- Theme persistence using AsyncStorage (saved across app restarts)
- Comprehensive light and dark color schemes
- Easy to extend to other components

## What Was Added

### 1. Theme Context (`context/ThemeContext.tsx`)
A new context provider that manages the app's theme state:
- **Light Theme Colors**: Clean, bright colors for daytime use
- **Dark Theme Colors**: Eye-friendly dark colors for low-light environments
- **Theme Persistence**: Automatically saves and loads theme preference
- **Easy Theme Access**: Simple `useTheme()` hook for all components

#### Available Colors:
```typescript
{
  background: string;      // Main screen background
  surface: string;         // Secondary background
  card: string;           // Card backgrounds
  text: string;           // Primary text color
  textSecondary: string;  // Secondary text color
  primary: string;        // Brand primary color
  primaryLight: string;   // Light version of primary
  border: string;         // Border colors
  error: string;          // Error messages
  success: string;        // Success indicators
  warning: string;        // Warnings
  info: string;           // Info messages
  shadow: string;         // Shadow colors
}
```

### 2. Updated Profile Page (`app/(tabs)/Profile.tsx`)
Added a new "Preferences" section with dark mode toggle:
- Moon icon to indicate dark mode feature
- Native Switch component for toggling
- Responsive to theme changes
- All components updated to use theme colors

### 3. Root Layout Update (`app/_layout.tsx`)
Wrapped the entire app with ThemeProvider:
```typescript
<ThemeProvider>
  <UserContext.Provider>
    <MealTimingProvider>
      <MealProvider>
        <Slot />
      </MealProvider>
    </MealTimingProvider>
  </UserContext.Provider>
</ThemeProvider>
```

## How to Use Dark Mode in Your Components

### Basic Usage:
```typescript
import { useTheme } from '@/context/ThemeContext';

function MyComponent() {
  const { isDarkMode, colors, toggleTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello World</Text>
    </View>
  );
}
```

### With StyleSheet:
```typescript
import { useTheme } from '@/context/ThemeContext';

function MyComponent() {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Title</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

## Components That Need Theme Support

To fully implement dark mode across the app, update these components:

### High Priority (User-facing screens):
- ✅ **Profile.tsx** - Already updated
- 🔄 **Home.tsx** - Main dashboard
- 🔄 **Meals.tsx** - Meal tracking
- 🔄 **Progress.tsx** - Progress tracking
- 🔄 **ProReport.tsx** - Reports

### Medium Priority (Common components):
- 🔄 **DailyTasks.tsx** - Task list
- 🔄 **MealCard.tsx** - Meal display
- 🔄 **ProgressChart.tsx** - Charts
- 🔄 **AddMealModal.tsx** - Modals
- 🔄 **MealTimeSettings.tsx** - Settings component

### Low Priority (Special features):
- 🔄 **AIChat/index.tsx** - AI chat
- 🔄 **BMI/index.tsx** - BMI calculator
- 🔄 **recipeGenerator/index.tsx** - Recipe generator

## Update Pattern for Components

### Step 1: Import the hook
```typescript
import { useTheme } from '@/context/ThemeContext';
```

### Step 2: Get theme colors
```typescript
const { colors } = useTheme();
```

### Step 3: Apply to backgrounds
```typescript
<View style={[styles.container, { backgroundColor: colors.background }]}>
```

### Step 4: Apply to text
```typescript
<Text style={[styles.text, { color: colors.text }]}>
```

### Step 5: Apply to cards
```typescript
<View style={[styles.card, { backgroundColor: colors.card }]}>
```

## Testing Dark Mode

1. **Enable Dark Mode**:
   - Navigate to Profile tab
   - Scroll to "Preferences" section
   - Toggle "Dark Mode" switch

2. **Verify Persistence**:
   - Enable dark mode
   - Close and restart the app
   - Dark mode should remain enabled

3. **Check Colors**:
   - Background should be dark (#121212)
   - Text should be white
   - Cards should have dark gray background (#2d2d2d)

## Color Palette Reference

### Light Theme:
- Background: `#f8f9fa` (Light gray)
- Surface: `#ffffff` (White)
- Card: `#ffffff` (White)
- Text: `#333333` (Dark gray)
- Text Secondary: `#666666` (Medium gray)
- Primary: `#667eea` (Purple)

### Dark Theme:
- Background: `#121212` (Almost black)
- Surface: `#1e1e1e` (Dark gray)
- Card: `#2d2d2d` (Medium dark gray)
- Text: `#ffffff` (White)
- Text Secondary: `#b0b0b0` (Light gray)
- Primary: `#667eea` (Purple - same as light)

## Future Enhancements

1. **Auto Dark Mode**: Detect system theme and auto-switch
2. **Scheduled Dark Mode**: Auto-enable at sunset
3. **Custom Themes**: Allow users to create custom color schemes
4. **OLED Black**: True black (#000000) for OLED screens
5. **Contrast Settings**: Adjust contrast levels for accessibility

## Troubleshooting

### Dark mode not persisting:
- Check AsyncStorage permissions
- Verify ThemeProvider is wrapping the app
- Check console for storage errors

### Colors not changing:
- Verify component is using `useTheme()` hook
- Check if styles are using `colors` from theme
- Make sure component is re-rendering on theme change

### Performance issues:
- Theme context is optimized for minimal re-renders
- Only components using `useTheme()` will re-render
- No performance impact expected

## Summary

✅ **Completed**:
- Theme context with light/dark themes
- Dark mode toggle in Profile page
- Theme persistence with AsyncStorage
- Profile page fully themed

🔄 **Next Steps**:
- Update remaining components to use theme
- Test thoroughly on both iOS and Android
- Consider adding auto dark mode based on time
