import { Slot } from "expo-router";
import { useState } from "react";
import { MealTimingProvider } from "../context/MealTimingContext";
import { ThemeProvider } from "../context/ThemeContext";
import { MealProvider } from "../context/UnifiedMealContext";
import { UserContext, UserType } from "../context/UserContext";

export default function RootLayout() {
  const [user, setUser] = useState<UserType>(null);

  return (
    <ThemeProvider>
      <UserContext.Provider value={{ user, setUser }}>
        <MealTimingProvider>
          <MealProvider>
            {/* ✅ Slot will automatically render your nested routes */}
            <Slot />
          </MealProvider>
        </MealTimingProvider>
      </UserContext.Provider>
    </ThemeProvider>
  );
}

