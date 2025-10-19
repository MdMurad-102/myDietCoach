import { useMealContext } from "@/context/UnifiedMealContext";
import { UserContext } from "@/context/UserContext";
import { isUserProfileComplete } from "@/utils/userHelpers";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { useContext, useEffect, useState, useCallback } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QuickActions from "../components/QuickActions";
import SimpleWaterTracker from "../components/SimpleWaterTracker";

// Only import database on native platforms
let getWaterTracking: any, trackWater: any;
if (Platform.OS !== 'web') {
  const tracking = require("../../database/tracking");
  getWaterTracking = tracking.getWaterTracking;
  trackWater = tracking.trackWater;
}

const { width: screenWidth } = Dimensions.get("window");

// Type definitions
interface ProgressCircleProps {
  progress: number;
  size?: number;
  color?: string;
}

interface TaskItemProps {
  task: { id: string; text: string };
  isCompleted: boolean;
  onToggle: (taskId: string) => void;
}

interface MealPreviewProps {
  meal: { time: string; name: string; calories: number };
  onMarkEaten: () => void;
  onReplace: () => void;
}

// Simple Progress Circle Component
const ProgressCircle: React.FC<ProgressCircleProps> = ({
  progress,
  size = 60,
  color = "#4CAF50",
}) => {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#F0F0F0",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: size - 8,
          height: size - 8,
          borderRadius: (size - 8) / 2,
          backgroundColor: color,
          opacity: normalizedProgress / 100,
        }}
      />
      <Text
        style={{
          fontSize: 10,
          fontWeight: "bold",
          color: "#333",
          zIndex: 1,
        }}
      >
        {Math.round(normalizedProgress)}%
      </Text>
    </View>
  );
};

// Daily Task Item Component
const TaskItem: React.FC<TaskItemProps> = ({ task, isCompleted, onToggle }) => {
  return (
    <TouchableOpacity style={styles.taskItem} onPress={() => onToggle(task.id)}>
      <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
        {isCompleted && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
      <Text style={[styles.taskText, isCompleted && styles.taskTextCompleted]}>
        {task.text}
      </Text>
    </TouchableOpacity>
  );
};

// Meal Preview Component
const MealPreview: React.FC<MealPreviewProps> = ({
  meal,
  onMarkEaten,
  onReplace,
}) => {
  return (
    <View style={styles.mealPreviewCard}>
      <View style={styles.mealPreviewHeader}>
        <Ionicons name="restaurant" size={16} color="#2E8B57" />
        <Text style={styles.mealPreviewTime}>{meal.time}</Text>
      </View>
      <Text style={styles.mealPreviewName}>{meal.name}</Text>
      <Text style={styles.mealPreviewCalories}>{meal.calories} kcal</Text>
      <View style={styles.mealPreviewActions}>
        <TouchableOpacity style={styles.mealActionBtn} onPress={onMarkEaten}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mealActionBtn} onPress={onReplace}>
          <Ionicons name="refresh" size={16} color="#FF9800" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function Home() {
  const context = useContext(UserContext);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [waterData, setWaterData] = useState<any>(null);
  const [waterLoading, setWaterLoading] = useState(true);
  const [dailyTasks, setDailyTasks] = useState([
    { id: "1", text: "Drink 8 glasses of water", completed: false },
    { id: "2", text: "Eat 3 balanced meals", completed: false },
    { id: "3", text: "Log today's meals", completed: false },
    { id: "4", text: "Review nutrition tips", completed: false },
  ]);

  if (!context)
    throw new Error("UserContext must be used within a UserProvider");

  const { user } = context;
  const { getTodayMealPlan, refreshMealData } = useMealContext();
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  // Refresh meal data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Home screen focused - refreshing meal data');
      refreshMealData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // Load water tracking data
  useEffect(() => {
    async function loadWaterData() {
      if (!user?.id) {
        setWaterLoading(false);
        return;
      }

      // Skip database call on web platform
      if (Platform.OS === 'web') {
        setWaterData({ water_consumed: 0 }); // Mock data for web
        setWaterLoading(false);
        return;
      }

      try {
        const data = await getWaterTracking(user.id, today);
        setWaterData(data);
      } catch (error) {
        console.error('Error loading water data:', error);
      } finally {
        setWaterLoading(false);
      }
    }

    loadWaterData();
  }, [user?.id, today]);

  useEffect(() => {
    if (user === null) return;

    if (user === undefined) {
      return;
    }

    if (!isUserProfileComplete(user)) {
      console.log("Home: User profile incomplete, redirecting to NewUser");
      router.replace("/NewUser/Index");
      return; // Exit early after redirect
    }

    // Refresh meal data when component mounts
    refreshMealData();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    refreshMealData();

    // Reload water data (skip on web)
    if (user?.id && Platform.OS !== 'web') {
      try {
        const data = await getWaterTracking(user.id, today);
        setWaterData(data);
      } catch (error) {
        console.error('Error reloading water data:', error);
      }
    }

    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleTask = (taskId: string) => {
    setDailyTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getMotivationalMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! Let's start your healthy day! 🌅";
    if (hour < 17) return "Good afternoon! Keep up the great work! ☀️";
    return "Good evening! Finish strong today! 🌙";
  };

  const calculateProgress = () => {
    // Get proper water goal from user data - use daily_water_goal (snake_case)
    const userWaterGoal = user?.daily_water_goal || 2000;
    const waterProgress = waterData
      ? (waterData.water_consumed / userWaterGoal) * 100
      : 0;
    const tasksProgress =
      (dailyTasks.filter((t) => t.completed).length / dailyTasks.length) * 100;

    // TODO: Replace with real calorie and protein tracking data
    const caloriesProgress = 65; // Mock data - replace with real calculation
    const proteinProgress = 45; // Mock data - replace with real calculation

    return {
      waterProgress,
      tasksProgress,
      caloriesProgress,
      proteinProgress,
      userWaterGoal,
    };
  };

  const {
    waterProgress,
    tasksProgress,
    caloriesProgress,
    proteinProgress,
    userWaterGoal,
  } = calculateProgress();

  // Web version works with limited features (no database)
  // Database features will use mock/fallback data

  if (user === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  const todayMealPlan = getTodayMealPlan();
  const hasActualMeals =
    todayMealPlan && todayMealPlan.meals && todayMealPlan.meals.length > 0;
  const todaysMeals = hasActualMeals
    ? todayMealPlan.meals.map((meal) => ({
      time: meal.mealType || "Meal",
      name: meal.recipeName,
      calories: meal.calories,
    }))
    : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />

      {/* Header with Gradient */}
      <LinearGradient
        colors={["#2E8B57", "#3CB371"]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>
                Hello, {user.name?.split(" ")[0] || "there"}! 👋
              </Text>
              <Text style={styles.motivationText}>
                {getMotivationalMessage()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push("/(tabs)/Profile")}
            >
              <Ionicons name="person-circle" size={40} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.dateText}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Today's Progress Summary */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={24} color="#2E8B57" />
              <Text style={styles.cardTitle}>Today's Progress</Text>
            </View>

            <View style={styles.progressGrid}>
              <TouchableOpacity
                style={styles.progressItem}
                onPress={() => router.push("/(tabs)/Meals")}
              >
                <ProgressCircle progress={caloriesProgress} color="#FF6B35" />
                <Text style={styles.progressLabel}>Calories</Text>
                <Text style={styles.progressValue}>
                  {Math.round(
                    ((user.calories || 2000) * caloriesProgress) / 100
                  )}
                  /{user.calories || 2000}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.progressItem}
                onPress={() => router.push("/(tabs)/Meals")}
              >
                <ProgressCircle progress={proteinProgress} color="#4CAF50" />
                <Text style={styles.progressLabel}>Protein</Text>
                <Text style={styles.progressValue}>
                  {Math.round(((user.proteins || 150) * proteinProgress) / 100)}
                  g/{user.proteins || 150}g
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.progressItem}
                onPress={() => router.push("/(tabs)/Profile")}
              >
                <ProgressCircle progress={waterProgress} color="#2196F3" />
                <Text style={styles.progressLabel}>Water</Text>
                <Text style={styles.progressValue}>
                  {waterData?.water_consumed || 0}ml/{userWaterGoal}ml
                </Text>
              </TouchableOpacity>

              <View style={styles.progressItem}>
                <ProgressCircle progress={tasksProgress} color="#9C27B0" />
                <Text style={styles.progressLabel}>Tasks</Text>
                <Text style={styles.progressValue}>
                  {dailyTasks.filter((t) => t.completed).length}/
                  {dailyTasks.length}
                </Text>
              </View>
            </View>
          </View>

          {/* Daily Tasks */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="checkbox" size={24} color="#9C27B0" />
              <Text style={styles.cardTitle}>Today's Tasks</Text>
              <View style={styles.taskProgress}>
                <Text style={styles.taskProgressText}>
                  {dailyTasks.filter((t) => t.completed).length}/
                  {dailyTasks.length}
                </Text>
              </View>
            </View>

            {dailyTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isCompleted={task.completed}
                onToggle={toggleTask}
              />
            ))}
          </View>

          {/* Meal Plan Preview */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="restaurant" size={24} color="#FF9800" />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Today's Meals</Text>
                <Text style={styles.cardSubtitle}>
                  {hasActualMeals
                    ? "Your scheduled meals"
                    : "No meals planned yet"}
                </Text>
              </View>
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {todaysMeals.map((meal, index) => (
                  <MealPreview
                    key={index}
                    meal={meal}
                    onMarkEaten={() => console.log("Mark eaten:", meal.name)}
                    onReplace={() => console.log("Replace:", meal.name)}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyMealsContainer}>
                <Ionicons name="sparkles" size={48} color="#FF9800" />
                <Text style={styles.emptyMealsTitle}>
                  No meals planned for today
                </Text>
                <Text style={styles.emptyMealsText}>
                  Generate an AI-powered meal plan based on your profile and goals
                </Text>

                <TouchableOpacity
                  style={styles.aiGenerateButton}
                  onPress={() => router.push("/recipeGenerator" as any)}
                >
                  <LinearGradient
                    colors={["#FF6B6B", "#FF8E53"]}
                    style={styles.aiGenerateGradient}
                  >
                    <Ionicons name="sparkles" size={20} color="#FFF" />
                    <Text style={styles.aiGenerateText}>Generate AI Recipe</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.manualAddButton}
                  onPress={() => router.push("/(tabs)/Meals")}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#2E8B57" />
                  <Text style={styles.manualAddText}>Add Meal Manually</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Water Tracker */}
          <SimpleWaterTracker />

          {/* Enhanced Quick Actions */}
          <QuickActions />

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(tabs)/Meals")}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    width: "100%",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  motivationText: {
    fontSize: 14,
    color: "#E8F5E8",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: "#E8F5E8",
  },
  profileButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    marginTop: -10,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    marginTop: 2,
  },
  progressGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  progressItem: {
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
  taskProgress: {
    backgroundColor: "#9C27B0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskProgressText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  taskText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FF9800",
    borderRadius: 8,
  },
  viewAllText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  mealPreviewCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 140,
    borderLeftWidth: 4,
    borderLeftColor: "#2E8B57",
  },
  mealPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  mealPreviewTime: {
    fontSize: 12,
    color: "#2E8B57",
    fontWeight: "600",
    marginLeft: 4,
  },
  mealPreviewName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  mealPreviewCalories: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  mealPreviewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mealActionBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: "48%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  emptyMealsContainer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyMealsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  emptyMealsText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  aiGenerateButton: {
    width: "100%",
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  aiGenerateGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  aiGenerateText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  manualAddButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#F0F8F5",
    gap: 8,
  },
  manualAddText: {
    color: "#2E8B57",
    fontSize: 14,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2E8B57",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  webWarningContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  webWarningGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  webWarningTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  webWarningText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    opacity: 0.95,
  },
  webWarningSubtext: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.85,
    marginBottom: 30,
  },
  webWarningButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  webWarningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  webWarningButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
