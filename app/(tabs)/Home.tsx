import { useTheme } from "@/context/ThemeContext";
import { useMealContext } from "@/context/UnifiedMealContext";
import { UserContext } from "@/context/UserContext";
import { isUserProfileComplete } from "@/utils/userHelpers";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useContext } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DailyTasks from "../components/DailyTasks";
import HomeHeader from "../components/HomeHader";
import MealPreview from "../components/MealPreview";
import NextMealCountdown from "../components/NextMealCountdown";
import ProgressCircle from "../components/ProgressCircle";
import QuickActions from "../components/QuickActions";
import SimpleWaterTracker from "../components/SimpleWaterTracker";

export default function Home() {
  const context = useContext(UserContext);
  const { user } = context!;
  const { colors } = useTheme();
  const { getTodayMealPlan, refreshMealData, markMealConsumed } = useMealContext();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (user && isUserProfileComplete(user)) {
        refreshMealData();
      } else if (user) {
        router.replace("/NewUser/Index");
      }
    }, [user, refreshMealData, router])
  );

  const todayMealPlan = getTodayMealPlan();

  const calculateProgress = () => {
    if (!todayMealPlan) {
      return {
        caloriesProgress: 0,
        proteinProgress: 0,
        waterProgress: 0,
      };
    }

    const caloriesProgress =
      (todayMealPlan.consumedCalories / (todayMealPlan.goals.calories || 2000)) *
      100;
    const proteinProgress =
      (todayMealPlan.consumedProtein / (todayMealPlan.goals.protein || 150)) *
      100;
    const waterProgress =
      (todayMealPlan.waterGlasses / (todayMealPlan.goals.water || 8)) * 100;

    return {
      caloriesProgress,
      proteinProgress,
      waterProgress,
    };
  };

  const { caloriesProgress, proteinProgress, waterProgress } =
    calculateProgress();

  // Handle meal consumed toggle
  const handleMealToggle = (mealId: string, currentConsumedState: boolean) => {
    markMealConsumed(mealId, !currentConsumedState);
  };

  if (!user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading user data...</Text>
      </View>
    );
  }

  const hasActualMeals =
    todayMealPlan && todayMealPlan.meals && todayMealPlan.meals.length > 0;

  // Use the actual meal objects instead of mapping to simplified objects
  const todaysMeals = hasActualMeals ? todayMealPlan.meals : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <HomeHeader />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          <NextMealCountdown />

          <QuickActions />

          {/* Today's Progress Summary */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics-outline" size={24} color="#667eea" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Today's Snapshot</Text>
            </View>

            <View style={styles.progressGrid}>
              <TouchableOpacity
                style={styles.progressItem}
                onPress={() => router.push("/(tabs)/Meals")}
              >
                <ProgressCircle
                  progress={caloriesProgress}
                  color={["#FF6B35", "#FF8E53"]}
                  title="Calories"
                  subtitle={`${todayMealPlan?.consumedCalories || 0}/${todayMealPlan?.goals.calories || 2000
                    }`}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.progressItem}
                onPress={() => router.push("/(tabs)/Meals")}
              >
                <ProgressCircle
                  progress={proteinProgress}
                  color={["#4CAF50", "#8BC34A"]}
                  title="Protein"
                  subtitle={`${todayMealPlan?.consumedProtein || 0}g/${todayMealPlan?.goals.protein || 150
                    }g`}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.progressItem}
                onPress={() => router.push("/(tabs)/Profile")}
              >
                <ProgressCircle
                  progress={waterProgress}
                  color={["#2196F3", "#4DABF5"]}
                  title="Water"
                  subtitle={`${todayMealPlan?.waterGlasses || 0} / ${todayMealPlan?.goals.water || 8
                    } glasses`}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Meal Plan Preview */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="restaurant-outline" size={24} color="#FF9800" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Today's Meals</Text>
              {hasActualMeals && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => router.push("/(tabs)/Meals")}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              )}
            </View>

            {hasActualMeals ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mealPreviewContainer}
              >
                {todaysMeals.map((meal, index) => (
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
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="fast-food-outline" size={40} color="#ccc" />
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No meals planned yet.</Text>
                <TouchableOpacity
                  style={styles.planMealsButton}
                  onPress={() => router.push("/(tabs)/Meals")}
                >
                  <Text style={styles.planMealsButtonText}>Plan Your Meals</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <DailyTasks />

          <SimpleWaterTracker />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#667eea",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 15,
    marginTop: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  progressGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  progressItem: {
    alignItems: "center",
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
  },
  viewAllText: {
    color: "#667eea",
    fontWeight: "600",
  },
  mealPreviewContainer: {
    paddingRight: 20,
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    marginTop: 10,
  },
  planMealsButton: {
    marginTop: 15,
    backgroundColor: "#667eea",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  planMealsButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
