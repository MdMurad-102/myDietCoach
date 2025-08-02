import { UserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import HomeHader from "../components/HomeHader";
import GenerateRecipe from "../components/GenerateRecipe";
import TodayProgress from "../components/TodayProgress";
import MealsPaln from "../components/MealsPaln";
import WaterTracker from "../components/WaterTracker";
import QuickActions from "../components/QuickActions";

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
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <HomeHader />
      <TodayProgress />
      <WaterTracker />
      <QuickActions />
      <GenerateRecipe />
      <MealsPaln />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40, // Extra padding at bottom for better scroll experience
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
});
