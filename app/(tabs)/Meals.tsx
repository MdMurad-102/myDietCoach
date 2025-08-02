import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import MealPlanViewer from "../components/MealPlanViewer";
import CustomRecipeManager from "../components/CustomRecipeManager";
import RecipeScheduler from "../components/RecipeScheduler";

export default function Meals() {
  const [showCustomRecipeManager, setShowCustomRecipeManager] = useState(false);
  const [showRecipeScheduler, setShowRecipeScheduler] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍽️ My Meal Plans</Text>
        <Text style={styles.headerSubtitle}>
          View your personalized daily meal plans
        </Text>
      </View>

      {/* Quick Actions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickActions}
      >
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowCustomRecipeManager(true)}
        >
          <Ionicons name="add-circle" size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Create Recipe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowRecipeScheduler(true)}
        >
          <Ionicons name="calendar" size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Schedule Recipes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="restaurant" size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Meal History</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.content}>
        <MealPlanViewer />
      </View>

      {/* Custom Recipe Manager Modal */}
      <CustomRecipeManager
        visible={showCustomRecipeManager}
        onClose={() => setShowCustomRecipeManager(false)}
      />

      {/* Recipe Scheduler Modal */}
      <RecipeScheduler
        visible={showRecipeScheduler}
        onClose={() => setShowRecipeScheduler(false)}
        onScheduleRecipe={(recipe, date) => {
          // Refresh meal plan data when recipe is scheduled
          console.log("Recipe scheduled:", recipe, "for date:", date);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  content: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  quickActions: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  actionButtonText: {
    color: "#007AFF",
    fontWeight: "600",
    marginLeft: 5,
    fontSize: 14,
  },
});
