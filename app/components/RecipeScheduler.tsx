import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "@/context/UserContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface RecipeSchedulerProps {
  visible: boolean;
  onClose: () => void;
  onScheduleRecipe?: (recipe: any, date: string) => void;
}

export default function RecipeScheduler({
  visible,
  onClose,
  onScheduleRecipe,
}: RecipeSchedulerProps) {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("UserContext must be used within a UserProvider");
  const { user } = context;

  const [activeTab, setActiveTab] = useState<"ai" | "custom">("ai");
  const [selectedDate, setSelectedDate] = useState("");

  // Fetch AI recipes
  const aiRecipes = useQuery(
    api.allRecipe.GetRecipeByUser,
    user ? { uid: user._id } : "skip"
  );

  // Fetch custom recipes
  const customRecipes = useQuery(
    api.allRecipe.GetCustomRecipes,
    user ? { userId: user._id } : "skip"
  );

  const scheduleRecipe = useMutation(api.allRecipe.ScheduleMeal);

  const handleScheduleRecipe = async (recipe: any) => {
    if (!selectedDate) {
      Alert.alert("Error", "Please select a date first");
      return;
    }

    if (!user) return;

    try {
      if (activeTab === "ai") {
        // Schedule AI recipe
        await scheduleRecipe({
          userId: user._id,
          recipeId: recipe._id,
          scheduledDate: selectedDate,
          mealType: recipe.jsonData?.mealType || "Lunch",
          totalCalories: recipe.jsonData?.calories || 0,
          totalProtein: recipe.jsonData?.protein || 0,
        });
      } else {
        // Schedule custom recipe
        await scheduleRecipe({
          userId: user._id,
          customRecipeId: recipe._id,
          scheduledDate: selectedDate,
          mealType: recipe.mealType,
          totalCalories: recipe.calories,
          totalProtein: recipe.protein,
        });
      }

      Alert.alert("Success", `Recipe scheduled for ${selectedDate}`);
      onScheduleRecipe?.(recipe, selectedDate);
    } catch (error) {
      console.error("Error scheduling recipe:", error);
      Alert.alert("Error", "Failed to schedule recipe");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const renderAIRecipe = (recipe: any) => (
    <View key={recipe._id} style={styles.recipeCard}>
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeName}>
          {recipe.recipeName || "AI Recipe"}
        </Text>
        <View style={styles.recipeStats}>
          <Text style={styles.statText}>
            {recipe.jsonData?.calories || 0} cal
          </Text>
          <Text style={styles.statText}>
            {recipe.jsonData?.protein || 0}g protein
          </Text>
        </View>
      </View>

      {recipe.jsonData?.ingredients && (
        <View style={styles.ingredientsPreview}>
          <Text style={styles.sectionLabel}>Ingredients:</Text>
          <Text style={styles.ingredientsText} numberOfLines={2}>
            {recipe.jsonData.ingredients.slice(0, 3).join(", ")}
            {recipe.jsonData.ingredients.length > 3 ? "..." : ""}
          </Text>
        </View>
      )}

      <View style={styles.recipeActions}>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => handleScheduleRecipe(recipe)}
        >
          <Ionicons name="calendar" size={16} color="#007AFF" />
          <Text style={styles.scheduleButtonText}>Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCustomRecipe = (recipe: any) => (
    <View key={recipe._id} style={styles.recipeCard}>
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeName}>{recipe.recipeName}</Text>
        <View style={styles.customRecipeBadge}>
          <Text style={styles.customRecipeText}>Custom</Text>
        </View>
      </View>

      <View style={styles.recipeInfo}>
        <Text style={styles.mealType}>{recipe.mealType}</Text>
        <View style={styles.recipeStats}>
          <Text style={styles.statText}>{recipe.calories} cal</Text>
          <Text style={styles.statText}>{recipe.protein}g protein</Text>
          <Text style={styles.statText}>{recipe.servings} servings</Text>
        </View>
      </View>

      {recipe.favoriteDate && (
        <View style={styles.favoriteDateContainer}>
          <Ionicons name="heart" size={14} color="#FF3B30" />
          <Text style={styles.favoriteDateText}>
            Favorite for: {formatDate(recipe.favoriteDate)}
          </Text>
        </View>
      )}

      <View style={styles.ingredientsPreview}>
        <Text style={styles.sectionLabel}>Ingredients:</Text>
        <Text style={styles.ingredientsText} numberOfLines={2}>
          {recipe.ingredients.slice(0, 3).join(", ")}
          {recipe.ingredients.length > 3 ? "..." : ""}
        </Text>
      </View>

      {recipe.tags && recipe.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {recipe.tags.slice(0, 3).map((tag: string, index: number) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.recipeActions}>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => handleScheduleRecipe(recipe)}
        >
          <Ionicons name="calendar" size={16} color="#007AFF" />
          <Text style={styles.scheduleButtonText}>Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split("T")[0];
      dates.push({
        value: dateString,
        label:
          i === 0 ? "Today" : i === 1 ? "Tomorrow" : formatDate(dateString),
      });
    }

    return dates;
  };

  const dateOptions = generateDateOptions();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Schedule Recipes</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Date Selector */}
        <View style={styles.dateSelector}>
          <Text style={styles.dateSelectorTitle}>Select date to schedule:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateOptions}
          >
            {dateOptions.map((date) => (
              <TouchableOpacity
                key={date.value}
                style={[
                  styles.dateOption,
                  selectedDate === date.value && styles.dateOptionSelected,
                ]}
                onPress={() => setSelectedDate(date.value)}
              >
                <Text
                  style={[
                    styles.dateOptionText,
                    selectedDate === date.value &&
                      styles.dateOptionTextSelected,
                  ]}
                >
                  {date.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "ai" && styles.activeTab]}
            onPress={() => setActiveTab("ai")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "ai" && styles.activeTabText,
              ]}
            >
              AI Recipes ({aiRecipes?.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "custom" && styles.activeTab]}
            onPress={() => setActiveTab("custom")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "custom" && styles.activeTabText,
              ]}
            >
              Custom Recipes ({customRecipes?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recipe List */}
        <ScrollView
          style={styles.recipeList}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "ai" ? (
            aiRecipes && aiRecipes.length > 0 ? (
              aiRecipes.map(renderAIRecipe)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="restaurant" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>
                  No AI recipes saved yet
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Generate some recipes to get started!
                </Text>
              </View>
            )
          ) : customRecipes && customRecipes.length > 0 ? (
            customRecipes.map(renderCustomRecipe)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="add-circle" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No custom recipes yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Create your first custom recipe!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 34, // Same as close button for centering
  },
  dateSelector: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  dateSelectorTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  dateOptions: {
    flexDirection: "row",
  },
  dateOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
  },
  dateOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  dateOptionText: {
    fontSize: 14,
    color: "#666",
  },
  dateOptionTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  tabSelector: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#007AFF",
    borderRadius: 7,
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },
  recipeList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  recipeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  customRecipeBadge: {
    backgroundColor: "#34C759",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  customRecipeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  recipeInfo: {
    marginBottom: 10,
  },
  mealType: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
    marginBottom: 5,
  },
  recipeStats: {
    flexDirection: "row",
    gap: 15,
  },
  statText: {
    fontSize: 12,
    color: "#666",
  },
  favoriteDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 5,
  },
  favoriteDateText: {
    fontSize: 12,
    color: "#FF3B30",
    fontWeight: "500",
  },
  ingredientsPreview: {
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginBottom: 3,
  },
  ingredientsText: {
    fontSize: 14,
    color: "#333",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: "#666",
  },
  recipeActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  scheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f0f7ff",
    borderRadius: 8,
    gap: 5,
  },
  scheduleButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
});
