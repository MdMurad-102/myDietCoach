import { UserContext } from "@/context/UserContext";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import React, { useContext, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type IngredientData =
  | {
      emoji?: string;
      name: string;
      quantity?: string;
      notes?: string;
    }
  | string;

type MealData = {
  mealType: string;
  recipeName: string;
  calories: number;
  protein: number;
  ingredients: IngredientData[];
  instructions: string[];
  cookingTime: string;
  servings: number;
  nutritionTips?: string;
  prepTime?: string;
  difficulty?: string;
};

const TodayProgress: React.FC = () => {
  const context = useContext(UserContext);
  const [selectedMeal, setSelectedMeal] = useState<MealData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const toggleMealConsumed = useMutation(api.allRecipe.ToggleMealConsumed);

  if (!context)
    throw new Error("UserContext must be used within a UserProvider");
  const { user } = context;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Get today's scheduled meal plan
  const todaysMealPlan = useQuery(
    api.allRecipe.GetMealPlanForDate,
    user?._id
      ? {
          userId: user._id,
          date: today,
        }
      : "skip"
  );

  // Get active meal plan as fallback
  const activeMealPlan = useQuery(
    api.allRecipe.GetActiveMealPlan,
    user?._id ? { userId: user._id } : "skip"
  );

  const planToUse = todaysMealPlan || activeMealPlan;

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>
          Please log in to view today's progress
        </Text>
      </View>
    );
  }

  // Show loading while data is being fetched
  if (todaysMealPlan === undefined && activeMealPlan === undefined) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>Loading your meal plan...</Text>
      </View>
    );
  }

  if (!planToUse?.mealPlanData?.meals) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>
          No meal plan for today. Generate a meal plan to get started! 🍽️
        </Text>
      </View>
    );
  }

  const handleMealToggle = async (meal: MealData, consumed: boolean) => {
    if (!todaysMealPlan?._id) {
      Alert.alert(
        "Schedule Required",
        "Please schedule this meal plan for today first.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      console.log("Toggling meal:", {
        mealType: meal.mealType,
        consumed,
        scheduledMealId: todaysMealPlan._id,
      });

      await toggleMealConsumed({
        scheduledMealId: todaysMealPlan._id,
        mealType: meal.mealType,
        calories: meal.calories,
        protein: meal.protein,
        consumed,
      });

      console.log("Meal toggle successful");
    } catch (error) {
      console.error("Error toggling meal:", error);
      Alert.alert("Error", "Failed to update meal status. Please try again.");
    }
  };

  const openMealDetails = (meal: MealData) => {
    setSelectedMeal(meal);
    setModalVisible(true);
  };

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isConsumed = (mealType: string) => {
    return todaysMealPlan?.mealsConsumed?.includes(mealType) || false;
  };

  const getTotalProgress = () => {
    const consumedCalories = todaysMealPlan?.caloriesConsumed || 0;
    const consumedProtein = todaysMealPlan?.proteinConsumed || 0;
    const totalCalories = planToUse?.totalCalories || 1; // Prevent division by zero
    const totalProtein = planToUse?.totalProtein || 1; // Prevent division by zero

    return {
      calorieProgress: Math.min((consumedCalories / totalCalories) * 100, 100),
      proteinProgress: Math.min((consumedProtein / totalProtein) * 100, 100),
      consumedCalories,
      consumedProtein,
      totalCalories,
      totalProtein,
    };
  };

  const progress = getTotalProgress();

  const renderProgressBar = (progress: number, color: string) => (
    <View style={styles.progressBarContainer}>
      <View
        style={[
          styles.progressBar,
          { backgroundColor: color, width: `${Math.min(progress, 100)}%` },
        ]}
      />
    </View>
  );

  const renderMealCard = (meal: MealData, emoji: string) => {
    const consumed = isConsumed(meal.mealType);

    return (
      <View
        key={meal.mealType}
        style={[styles.mealCard, consumed && styles.consumedMealCard]}
      >
        <View style={styles.mealCardHeader}>
          <TouchableOpacity
            style={[styles.checkbox, consumed && styles.checkedBox]}
            onPress={() => {
              console.log(
                `Checkbox clicked for ${meal.mealType}, current state: ${consumed}`
              );
              handleMealToggle(meal, !consumed);
            }}
          >
            {consumed && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <View style={styles.mealInfo}>
            <Text style={styles.mealEmoji}>{emoji}</Text>
            <View style={styles.mealDetails}>
              <Text style={styles.mealType}>{meal.mealType}</Text>
              <Text
                style={[styles.recipeName, consumed && styles.consumedText]}
                numberOfLines={1}
              >
                {meal.recipeName}
              </Text>
              <Text style={styles.mealStats}>
                {meal.calories} cal • {meal.protein}g protein
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => openMealDetails(meal)}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Progress</Text>
      <Text style={styles.date}>{formatDate()}</Text>

      {/* Progress Overview */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>Daily Goals</Text>

        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>🔥 Calories</Text>
            <Text style={styles.progressText}>
              {progress.consumedCalories} / {progress.totalCalories}
            </Text>
          </View>
          {renderProgressBar(progress.calorieProgress, "#ff5722")}
        </View>

        <View style={styles.progressItem}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>💪 Protein</Text>
            <Text style={styles.progressText}>
              {progress.consumedProtein}g / {progress.totalProtein}g
            </Text>
          </View>
          {renderProgressBar(progress.proteinProgress, "#4CAF50")}
        </View>
      </View>

      {/* Today's Meals */}
      <View style={styles.mealsSection}>
        <Text style={styles.mealsTitle}>Today's Meals</Text>

        {planToUse.mealPlanData.meals.map((meal: MealData) => {
          const emoji =
            meal.mealType === "Breakfast"
              ? "🌅"
              : meal.mealType === "Lunch"
                ? "☀️"
                : meal.mealType === "Dinner"
                  ? "🌙"
                  : "🍎";
          return renderMealCard(meal, emoji);
        })}
      </View>

      {/* Meal Details Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedMeal?.recipeName || "Meal Details"}
            </Text>
          </View>

          {selectedMeal && (
            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.mealHeader}>
                <Text style={styles.mealTypeTitle}>
                  {selectedMeal.mealType}
                </Text>
                <Text style={styles.recipeTitle}>
                  {selectedMeal.recipeName}
                </Text>

                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {selectedMeal.calories}
                    </Text>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {selectedMeal.protein}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {selectedMeal.cookingTime}
                    </Text>
                    <Text style={styles.nutritionLabel}>Cook Time</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {selectedMeal.servings}
                    </Text>
                    <Text style={styles.nutritionLabel}>Servings</Text>
                  </View>
                </View>
              </View>

              {/* Ingredients */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🛒 Ingredients</Text>
                {selectedMeal.ingredients?.map((ingredient, idx) => (
                  <Text key={idx} style={styles.ingredientItem}>
                    •{" "}
                    {typeof ingredient === "string"
                      ? ingredient
                      : `${ingredient.emoji || ""} ${ingredient.quantity || ""} ${ingredient.name || ingredient}${ingredient.notes ? ` (${ingredient.notes})` : ""}`}
                  </Text>
                ))}
              </View>

              {/* Instructions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👨‍🍳 Cooking Instructions</Text>
                {selectedMeal.instructions?.map((instruction, idx) => (
                  <View key={idx} style={styles.instructionStep}>
                    <Text style={styles.stepNumber}>{idx + 1}</Text>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>

              {/* Nutrition Tips */}
              {selectedMeal.nutritionTips && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>💡 Nutrition Tips</Text>
                  <Text style={styles.tipsText}>
                    {selectedMeal.nutritionTips}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
    lineHeight: 24,
  },
  progressSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  progressItem: {
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  mealsSection: {
    flex: 1,
  },
  mealsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  mealCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consumedMealCard: {
    backgroundColor: "#f0f8f0",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  mealCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  mealInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  mealEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  mealDetails: {
    flex: 1,
  },
  mealType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 4,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  consumedText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  mealStats: {
    fontSize: 12,
    color: "#666",
  },
  viewButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingTop: 50,
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginRight: 50,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  mealHeader: {
    marginBottom: 25,
  },
  mealTypeTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 5,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  nutritionGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
  },
  nutritionItem: {
    alignItems: "center",
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  ingredientItem: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
    paddingLeft: 10,
  },
  instructionStep: {
    flexDirection: "row",
    marginBottom: 15,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
    marginRight: 15,
    minWidth: 25,
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    flex: 1,
  },
  tipsText: {
    fontSize: 14,
    color: "#4CAF50",
    fontStyle: "italic",
    lineHeight: 20,
  },
});

export default TodayProgress;
