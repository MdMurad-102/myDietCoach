import { UserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { View, Text } from "react-native";
import HomeHader from "../components/HomeHader";
import GenerateRecipe from "../components/GenerateRecipe";
import TodayProgress from "../components/TodayProgress";
import MealsPaln from "../components/MealsPaln";

export default function Home() {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("UserContext must be used within a UserProvider");

  const { user } = context;
  const router = useRouter();

  useEffect(() => {
    if (user === null) return; // still loading

    if (user === undefined) {
      // No user logged in, redirect to login or landing page
      // router.replace("/login");
      return;
    }

    if (!user.height) {
      router.replace("/NewUser/Index");
    }
  }, [user]);

  if (user === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <HomeHader />
      <TodayProgress />
      <GenerateRecipe />
      <MealsPaln />
    </View>
  );
}
