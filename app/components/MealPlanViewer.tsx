import { UserContext } from "@/context/UserContext";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React, { useContext } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const MealPlanViewer: React.FC = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { user } = context;

  const activeMealPlan = useQuery(
    api.allRecipe.GetActiveMealPlan,
    user ? { userId: user._id } : "skip"
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Please log in to view your meal plan
        </Text>
      </View>
    );
  }

  if (!activeMealPlan) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No active meal plan found</Text>
        <Text style={styles.suggestionText}>
          Generate a daily meal plan to see your personalized recipes here!
        </Text>
      </View>
    );
  }

  const mealPlan = activeMealPlan.mealPlanData;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🍽️ {mealPlan.planName}</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📊 Daily Summary</Text>
        <Text style={styles.summaryText}>
          Total Calories: {mealPlan.totalCalories} kcal
        </Text>
        <Text style={styles.summaryText}>
          Total Protein: {mealPlan.totalProtein}g
        </Text>
        <Text style={styles.summaryText}>Location: {mealPlan.location}</Text>
        <Text style={styles.summaryText}>Diet Type: {mealPlan.dietType}</Text>
      </View>

      {mealPlan.meals?.map((meal: any, index: number) => (
        <View key={index} style={styles.mealCard}>
          <Text style={styles.mealType}>{meal.mealType}</Text>
          <Text style={styles.recipeName}>{meal.recipeName}</Text>
          <Text style={styles.description}>{meal.description}</Text>

          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionText}>🔥 {meal.calories} cal</Text>
            <Text style={styles.nutritionText}>💪 {meal.protein}g protein</Text>
            <Text style={styles.nutritionText}>⏱️ {meal.cookTime} min</Text>
            <Text style={styles.nutritionText}>📊 {meal.difficulty}</Text>
          </View>

          <Text style={styles.sectionTitle}>🛒 Ingredients:</Text>
          {meal.ingredients?.map((ingredient: any, idx: number) => (
            <Text key={idx} style={styles.ingredientText}>
              {ingredient.emoji} {ingredient.quantity} {ingredient.name}
              {ingredient.notes && ` (${ingredient.notes})`}
            </Text>
          ))}

          <Text style={styles.sectionTitle}>👨‍🍳 Instructions:</Text>
          {meal.instructions?.map((step: string, idx: number) => (
            <Text key={idx} style={styles.instructionText}>
              {idx + 1}. {step}
            </Text>
          ))}

          {meal.nutritionTips && (
            <>
              <Text style={styles.sectionTitle}>💡 Nutrition Tips:</Text>
              <Text style={styles.tipText}>{meal.nutritionTips}</Text>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#e8f5e8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: "#388e3c",
    marginBottom: 5,
  },
  mealCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealType: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 5,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    lineHeight: 18,
  },
  nutritionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  nutritionText: {
    fontSize: 12,
    color: "#555",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    lineHeight: 18,
  },
  instructionText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
    lineHeight: 20,
  },
  tipText: {
    fontSize: 14,
    color: "#4CAF50",
    fontStyle: "italic",
    lineHeight: 18,
  },
  errorText: {
    fontSize: 16,
    color: "#f44336",
    textAlign: "center",
    marginTop: 50,
  },
  noDataText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
  suggestionText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
  },
});

export default MealPlanViewer;
