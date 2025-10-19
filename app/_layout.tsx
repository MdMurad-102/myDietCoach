import { Slot } from "expo-router";
import { useState } from "react";
import { MealProvider } from "../context/UnifiedMealContext";
import { UserContext, UserType } from "../context/UserContext";

export default function RootLayout() {
  const [user, setUser] = useState<UserType>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <MealProvider>
        {/* ✅ Slot will automatically render your nested routes */}
        <Slot />
      </MealProvider>
    </UserContext.Provider>
  );
}
