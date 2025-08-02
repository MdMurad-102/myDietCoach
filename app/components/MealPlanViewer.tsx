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
};

type MealPlanData = {
  planName: string;
  location: string;
  dietType: string;
  totalCalories: number;
  totalProtein: number;
  meals: MealData[];
  nutritionTips?: string;
};

const MealPlanViewer: React.FC = () => {
  const context = useContext(UserContext);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const scheduleMealPlan = useMutation(api.allRecipe.ScheduleMealPlan);

  if (!context)
    throw new Error("UserContext must be used within a UserProvider");
  const { user } = context;

  const mealPlans = useQuery(
    api.allRecipe.GetUserMealPlans,
    user?._id ? { userId: user._id } : "skip"
  );

  const activeMealPlan = useQuery(
    api.allRecipe.GetActiveMealPlan,
    user?._id ? { userId: user._id } : "skip"
  );

  // Get today's meal plan
  const todaysMealPlan = useQuery(
    api.allRecipe.GetMealPlanForDate,
    user?._id
      ? {
          userId: user._id,
          date: new Date().toISOString().split("T")[0],
        }
      : "skip"
  );

  // Helper function to format dates
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to check if a date is today
  const isToday = (date: string | Date) => {
    const today = new Date();
    const compareDate = new Date(date);
    return today.toDateString() === compareDate.toDateString();
  };

  // Get today's meal for specific meal type
  const getTodaysMeal = (mealType: string) => {
    // Use today's scheduled meal plan if available, otherwise use active plan
    const planToUse = todaysMealPlan || activeMealPlan;
    if (!planToUse?.mealPlanData?.meals) return null;
    return planToUse.mealPlanData.meals.find(
      (meal: MealData) => meal.mealType === mealType
    );
  };

  // Handle scheduling a meal plan for a specific date
  const handleScheduleMealPlan = async (planId: string) => {
    try {
      const dateString = new Date().toISOString().split("T")[0];
      await scheduleMealPlan({
        mealPlanId: planId as any,
        scheduledDate: dateString,
      });

      Alert.alert(
        "✅ Meal Plan Scheduled!",
        `Your meal plan has been scheduled for today (${formatDate(new Date())}).`,
        [{ text: "Great!" }]
      );
    } catch (error) {
      console.error("Error scheduling meal plan:", error);
      Alert.alert("Error", "Failed to schedule meal plan. Please try again.");
    }
  };

  // Render compact meal card for today's view
  const renderTodayMealCard = (mealType: string, emoji: string) => {
    const meal = getTodaysMeal(mealType);
    if (!meal) return null;

    return (
      <TouchableOpacity
        key={mealType}
        style={styles.todayMealCard}
        onPress={() => openMealPlanDetails(activeMealPlan)}
      >
        <Text style={styles.mealEmoji}>{emoji}</Text>
        <View style={styles.todayMealInfo}>
          <Text style={styles.todayMealType}>{mealType}</Text>
          <Text style={styles.todayRecipeName} numberOfLines={1}>
            {meal.recipeName}
          </Text>
          <Text style={styles.todayMealStats}>
            {meal.calories} cal • {meal.protein}g protein
          </Text>
        </View>
        <Text style={styles.viewDetails}>View</Text>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>Please log in to view meal plans</Text>
      </View>
    );
  }

  const openMealPlanDetails = (plan: any) => {
    setSelectedPlan(plan);
    setModalVisible(true);
  };

  const renderMealCard = (meal: MealData, index: number) => (
    <View key={index} style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealType}>{meal.mealType}</Text>
        <Text style={styles.calories}>{meal.calories} cal</Text>
      </View>
      <Text style={styles.recipeName}>{meal.recipeName}</Text>
      <Text style={styles.mealInfo}>
        🍽️ Servings: {meal.servings} | ⏱️ {meal.cookingTime} | 💪 {meal.protein}
        g protein
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛒 Ingredients:</Text>
        {meal.ingredients?.map((ingredient, idx) => (
          <Text key={idx} style={styles.listItem}>
            •{" "}
            {typeof ingredient === "string"
              ? ingredient
              : `${ingredient.emoji || ""} ${ingredient.quantity || ""} ${ingredient.name || ingredient}${ingredient.notes ? ` (${ingredient.notes})` : ""}`}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👨‍🍳 Instructions:</Text>
        {meal.instructions?.map((instruction, idx) => (
          <Text key={idx} style={styles.instructionItem}>
            {idx + 1}. {instruction}
          </Text>
        ))}
      </View>

      {meal.nutritionTips && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Nutrition Tips:</Text>
          <Text style={styles.tipsText}>{meal.nutritionTips}</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <Text style={styles.title}>🍽️ Your Meal Plans</Text>

      {/* Today's Menu */}
      {(todaysMealPlan || activeMealPlan) && (
        <View style={styles.todaysMenuSection}>
          <Text style={styles.todaysMenuTitle}>
            {todaysMealPlan
              ? "🌅 Today's Scheduled Menu"
              : "🌅 Today's Menu (Active Plan)"}
          </Text>
          <Text style={styles.todaysDate}>{formatDate(new Date())}</Text>

          {renderTodayMealCard("Breakfast", "🌅")}
          {renderTodayMealCard("Lunch", "☀️")}
          {renderTodayMealCard("Dinner", "🌙")}
          {renderTodayMealCard("Snacks", "🍎")}

          {!todaysMealPlan && activeMealPlan && (
            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={() => handleScheduleMealPlan(activeMealPlan._id)}
            >
              <Text style={styles.scheduleButtonText}>
                📅 Schedule This Plan for Today
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Active Meal Plan */}
      {activeMealPlan && (
        <View style={styles.activePlanContainer}>
          <Text style={styles.activePlanTitle}>🎯 Current Active Plan</Text>
          <TouchableOpacity
            style={styles.activePlanCard}
            onPress={() => openMealPlanDetails(activeMealPlan)}
          >
            <Text style={styles.planName}>{activeMealPlan.planName}</Text>
            <Text style={styles.planStats}>
              📊 {activeMealPlan.totalCalories} cal |{" "}
              {activeMealPlan.totalProtein}g protein
            </Text>
            <Text style={styles.planDate}>
              Created: {formatDate(activeMealPlan.dateCreated)}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent Meal Plans - Show only 3 most recent */}
      {mealPlans && mealPlans.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>📋 Recent Meal Plans</Text>
          {mealPlans.slice(0, 3).map((plan, index) => (
            <TouchableOpacity
              key={plan._id}
              style={[styles.planCard, plan.isActive && styles.activePlan]}
              onPress={() => openMealPlanDetails(plan)}
            >
              <View style={styles.planCardHeader}>
                <Text style={styles.planName}>{plan.planName}</Text>
                {plan.isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                  </View>
                )}
              </View>
              <Text style={styles.planStats}>
                📊 {plan.totalCalories} cal | {plan.totalProtein}g protein
              </Text>
              <Text style={styles.planDate}>
                Created: {formatDate(plan.dateCreated)}
              </Text>

              {/* Add schedule button for non-active plans */}
              {!plan.isActive && (
                <TouchableOpacity
                  style={styles.smallScheduleButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleScheduleMealPlan(plan._id);
                  }}
                >
                  <Text style={styles.smallScheduleButtonText}>
                    📅 Schedule for Today
                  </Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
          {mealPlans.length > 3 && (
            <Text style={styles.moreText}>
              + {mealPlans.length - 3} more meal plans. Tap any plan to view
              details.
            </Text>
          )}
        </>
      )}

      {(!mealPlans || mealPlans.length === 0) && !activeMealPlan && (
        <View style={styles.noPlansContainer}>
          <Text style={styles.noPlansText}>
            No meal plans yet. Generate your first daily meal plan above! 🚀
          </Text>
        </View>
      )}

      {/* Modal for Meal Plan Details */}
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
              {selectedPlan?.planName || "Meal Plan Details"}
            </Text>
          </View>

          {selectedPlan && (
            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.planSummary}>
                <Text style={styles.summaryTitle}>📊 Plan Summary</Text>
                <Text style={styles.summaryText}>
                  📍 Location:{" "}
                  {selectedPlan.mealPlanData?.location || "Not specified"}
                </Text>
                <Text style={styles.summaryText}>
                  🥗 Diet Type:{" "}
                  {selectedPlan.mealPlanData?.dietType || "Not specified"}
                </Text>
                <Text style={styles.summaryText}>
                  � Total Calories: {selectedPlan.totalCalories} kcal
                </Text>
                <Text style={styles.summaryText}>
                  💪 Total Protein: {selectedPlan.totalProtein}g
                </Text>
                <Text style={styles.summaryText}>
                  📅 Created: {formatDate(selectedPlan.dateCreated)}
                </Text>
              </View>

              {selectedPlan.mealPlanData?.nutritionTips && (
                <View style={styles.planTips}>
                  <Text style={styles.sectionTitle}>
                    💡 Plan Nutrition Tips:
                  </Text>
                  <Text style={styles.tipsText}>
                    {selectedPlan.mealPlanData.nutritionTips}
                  </Text>
                </View>
              )}

              <Text style={styles.mealsTitle}>🍽️ Meals</Text>
              {selectedPlan.mealPlanData?.meals?.map(
                (meal: MealData, index: number) => renderMealCard(meal, index)
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40, // Extra padding at bottom
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  activePlanContainer: {
    marginBottom: 20,
  },
  activePlanTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: 10,
  },
  activePlanCard: {
    backgroundColor: "#e8f5e8",
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  plansList: {
    flex: 1,
  },
  noPlansContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  noPlansText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
  planCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activePlan: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  planCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  activeBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  planStats: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  planDate: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
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
  planSummary: {
    backgroundColor: "#f0f8ff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  planTips: {
    backgroundColor: "#fff3e0",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  mealsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  mealCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mealType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  calories: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff5722",
  },
  recipeName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  mealInfo: {
    fontSize: 12,
    color: "#666",
    marginBottom: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  listItem: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
    paddingLeft: 10,
  },
  instructionItem: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
    lineHeight: 18,
  },
  tipsText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    fontStyle: "italic",
  },
  moreText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
  todayMealCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mealEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  todayMealInfo: {
    flex: 1,
  },
  todayMealType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 2,
  },
  todayRecipeName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  todayMealStats: {
    fontSize: 12,
    color: "#666",
  },
  viewDetails: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600",
  },
  todaysMenuSection: {
    marginBottom: 20,
  },
  todaysMenuTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  todaysDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  scheduleButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  scheduleButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  smallScheduleButton: {
    backgroundColor: "#f0f8ff",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  smallScheduleButtonText: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default MealPlanViewer;
