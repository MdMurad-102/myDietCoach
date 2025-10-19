import { MealItem, useMealContext } from "@/context/UnifiedMealContext";
import { UserContext } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AddMealModal from "../components/AddMealModal";
import QuickActions from "../components/QuickActions";

const { width: screenWidth } = Dimensions.get("window");

export default function Meals() {
  const context = useContext(UserContext);
  const mealContext = useMealContext();
  const router = useRouter();

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [showMealDetailModal, setShowMealDetailModal] = useState(false);
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedDateForPlanning, setSelectedDateForPlanning] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [activeTab, setActiveTab] = useState<
    "daily" | "generated" | "saved" | "custom"
  >("daily");
  const [customRecipeName, setCustomRecipeName] = useState("");
  const [customRecipeCalories, setCustomRecipeCalories] = useState("");
  const [customRecipeProtein, setCustomRecipeProtein] = useState("");
  const [showCustomRecipeModal, setShowCustomRecipeModal] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);

  if (!context) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { user } = context;
  const {
    dailyMealPlans,
    generatedMeals,
    savedMeals,
    scheduleMeal,
    saveMeal,
    addGeneratedMeal,
    addMealToToday,
    refreshMealData,
    getMealPlanForDate,
    updateMealPlan,
  } = mealContext;

  // Get meal plan for selected date
  const selectedDayPlan = getMealPlanForDate(selectedDateForPlanning);

  const onRefresh = () => {
    setRefreshing(true);
    try {
      // Refresh meal data
      refreshMealData();
      console.log("Refreshed meal data from meals page");
    } catch (error) {
      console.error("Error refreshing meal data:", error);
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const viewMealDetails = (meal: MealItem) => {
    setSelectedMeal(meal);
    setShowMealDetailModal(true);
  };

  const scheduleMealForDate = (
    meal: MealItem,
    date: string,
    mealType: string
  ) => {
    scheduleMeal(meal, date, mealType);
    Alert.alert(
      "Meal Scheduled",
      `${meal.recipeName} has been scheduled for ${date} (${mealType})`,
      [{ text: "OK" }]
    );
    setShowDateSelector(false);
  };

  const generateDailyMealPlan = async () => {
    try {
      // Navigate to the AI Recipe generation page first to get AI-generated meals
      await router.push("/recipeGenerator" as any);

      // After returning from AI generation, create a complete daily meal plan
      const today = new Date().toISOString().split("T")[0];

      // Simulate fetching generated meals (replace with actual AI response)
      const newGeneratedMeals: MealItem[] = [
        {
          id: `gen-breakfast-${Date.now()}`,
          recipeName: "AI Protein Smoothie",
          calories: 250,
          protein: 20,
          mealType: "breakfast",
          ingredients: ["Banana", "Protein powder", "Almond milk", "Spinach"],
          instructions: [
            "Blend all ingredients until smooth",
            "Serve immediately",
          ],
          cookingTime: "5 min",
          servings: 1,
        },
        {
          id: `gen-lunch-${Date.now()}`,
          recipeName: "AI Chicken Salad",
          calories: 350,
          protein: 30,
          mealType: "lunch",
          ingredients: [
            "Grilled chicken breast",
            "Mixed greens",
            "Cherry tomatoes",
            "Olive oil",
          ],
          instructions: [
            "Mix greens and tomatoes",
            "Add sliced chicken",
            "Drizzle with olive oil",
          ],
          cookingTime: "15 min",
          servings: 1,
        },
        {
          id: `gen-dinner-${Date.now()}`,
          recipeName: "AI Salmon Bowl",
          calories: 400,
          protein: 35,
          mealType: "dinner",
          ingredients: ["Baked salmon", "Quinoa", "Broccoli", "Lemon"],
          instructions: [
            "Bake salmon for 20 minutes",
            "Steam broccoli",
            "Serve over quinoa",
          ],
          cookingTime: "25 min",
          servings: 1,
        },
        {
          id: `gen-snack-${Date.now()}`,
          recipeName: "AI Protein Bites",
          calories: 120,
          protein: 8,
          mealType: "snacks",
          ingredients: ["Greek yogurt", "Almonds", "Berries"],
          instructions: ["Mix yogurt with berries", "Top with almonds"],
          cookingTime: "2 min",
          servings: 1,
        },
      ];

      // Add each generated meal to the generated meals list AND schedule them for today
      for (const meal of newGeneratedMeals) {
        // Add to generated meals list for future reference
        addGeneratedMeal(meal);

        // Schedule the meal for today's plan
        await scheduleMeal(meal, today, meal.mealType || "breakfast");
      }

      // Refresh meal data to show the new plan
      refreshMealData();

      Alert.alert(
        "Success!",
        "Daily meal plan generated and scheduled for today!",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error generating daily meal plan:", error);
      Alert.alert("Error", "Failed to generate meal plan. Please try again.");
    }
  };

  const createCustomRecipe = () => {
    if (
      !customRecipeName.trim() ||
      !customRecipeCalories ||
      !customRecipeProtein
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const customMeal: MealItem = {
      id: `custom-${Date.now()}`,
      recipeName: customRecipeName,
      calories: parseInt(customRecipeCalories),
      protein: parseInt(customRecipeProtein),
      mealType: "breakfast", // Default, user can change when scheduling
      ingredients: ["Custom recipe - ingredients not specified"],
      instructions: ["Custom recipe - instructions not specified"],
      cookingTime: "Not specified",
      servings: 1,
      difficulty: "Easy",
    };

    addGeneratedMeal(customMeal);
    setCustomRecipeName("");
    setCustomRecipeCalories("");
    setCustomRecipeProtein("");
    setShowCustomRecipeModal(false);
    Alert.alert("Success", "Custom recipe created successfully!");
  };

  // New enhanced meal creation function
  const handleAddMeal = async (mealData: any) => {
    try {
      // Convert the enhanced meal data to MealItem format
      const customMeal: MealItem = {
        id: mealData.id || `custom-${Date.now()}`,
        recipeName: mealData.name,
        calories: mealData.calories,
        protein: mealData.protein,
        mealType: mealData.mealType,
        ingredients: mealData.ingredients,
        instructions: mealData.instructions,
        cookingTime: mealData.cookingTime,
        servings: mealData.servings,
        difficulty: mealData.difficulty,
        // Additional nutritional info
        carbs: mealData.carbs,
        fat: mealData.fat,
      };

      // Use addMealToToday for direct addition
      await addMealToToday(customMeal);
      console.log("Added meal directly to today:", customMeal.recipeName);

      // Refresh data to ensure UI updates
      refreshMealData();
    } catch (error) {
      console.error("Error adding meal:", error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "sunny-outline";
      case "lunch":
        return "partly-sunny-outline";
      case "dinner":
        return "moon-outline";
      case "snacks":
        return "cafe-outline";
      default:
        return "restaurant-outline";
    }
  };

  const getMealEmoji = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "🌅";
      case "lunch":
        return "🌞";
      case "dinner":
        return "🌙";
      case "snacks":
        return "🍎";
      default:
        return "🍽️";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateString === today.toISOString().split("T")[0]) {
      return "Today";
    } else if (dateString === tomorrow.toISOString().split("T")[0]) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const getNext7Days = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const renderMealCard = (meal: MealItem, showScheduleButton = true) => (
    <View key={meal.id} style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.mealIcon}>
          <Text style={styles.mealEmoji}>
            {getMealEmoji(meal.mealType || "breakfast")}
          </Text>
        </View>
        <View style={styles.mealInfo}>
          <Text style={styles.mealType}>
            {meal.mealType
              ? meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)
              : "Meal"}
          </Text>
          <Text style={styles.mealName}>{meal.recipeName}</Text>
          <Text style={styles.mealStats}>
            {meal.calories} kcal • {meal.protein}g protein •{" "}
            {meal.cookingTime || "N/A"}
          </Text>
          {meal.difficulty && (
            <Text style={styles.difficulty}>Difficulty: {meal.difficulty}</Text>
          )}
          {meal.consumed && (
            <View style={styles.consumedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
              <Text style={styles.consumedText}>Consumed</Text>
            </View>
          )}
        </View>
        {meal.mealType && (
          <View style={styles.generatedBadge}>
            <Ionicons name="sparkles" size={12} color="#fff" />
            <Text style={styles.generatedText}>AI</Text>
          </View>
        )}
      </View>

      <View style={styles.mealActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.viewBtn]}
          onPress={() => viewMealDetails(meal)}
        >
          <Ionicons name="eye-outline" size={16} color="#2196F3" />
          <Text style={[styles.actionBtnText, { color: "#2196F3" }]}>View</Text>
        </TouchableOpacity>

        {showScheduleButton && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.scheduleBtn]}
            onPress={() => {
              setSelectedMeal(meal);
              setShowDateSelector(true);
            }}
          >
            <Ionicons name="calendar-outline" size={16} color="#4CAF50" />
            <Text style={[styles.actionBtnText, { color: "#4CAF50" }]}>
              Schedule
            </Text>
          </TouchableOpacity>
        )}

        {!savedMeals.find((sm) => sm.id === meal.id) && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.saveBtn]}
            onPress={() => {
              saveMeal(meal);
              Alert.alert("Success", "Recipe saved to favorites!");
            }}
          >
            <Ionicons name="heart-outline" size={16} color="#FF6B6B" />
            <Text style={[styles.actionBtnText, { color: "#FF6B6B" }]}>
              Save
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderDailyPlanSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Meal Plans</Text>
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={generateDailyMealPlan}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.generateBtnText}>Generate Plan</Text>
        </TouchableOpacity>
      </View>

      {/* Date Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateSelector}
      >
        {getNext7Days().map((date) => (
          <TouchableOpacity
            key={date}
            style={[
              styles.dateItem,
              selectedDateForPlanning === date && styles.selectedDateItem,
            ]}
            onPress={() => setSelectedDateForPlanning(date)}
          >
            <Text
              style={[
                styles.dateText,
                selectedDateForPlanning === date && styles.selectedDateText,
              ]}
            >
              {formatDate(date)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selected Day Meal Plan */}
      <View style={styles.dayPlanContainer}>
        <Text style={styles.dayPlanTitle}>
          Meal Plan for {formatDate(selectedDateForPlanning)}
        </Text>
        {selectedDayPlan ? (
          <View style={styles.dailyMeals}>
            {/* Render all meals from the meals array */}
            {selectedDayPlan.meals.length > 0 ? (
              selectedDayPlan.meals.map((meal) => renderMealCard(meal, false))
            ) : (
              <View style={styles.emptyPlan}>
                <Ionicons name="restaurant-outline" size={32} color="#ccc" />
                <Text style={styles.emptyPlanText}>No meals scheduled</Text>
              </View>
            )}

            <View style={styles.dayPlanStats}>
              <View style={styles.statItem}>
                <Ionicons name="flame" size={20} color="#FF6B6B" />
                <Text style={styles.statText}>
                  {selectedDayPlan.totalCalories} kcal
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="fitness" size={20} color="#4ECDC4" />
                <Text style={styles.statText}>
                  {selectedDayPlan.totalProtein}g protein
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="water" size={20} color="#45B7D1" />
                <Text style={styles.statText}>
                  {selectedDayPlan.waterGlasses} glasses
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyPlan}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.emptyPlanText}>No meal plan for this day</Text>
            <Text style={styles.emptyPlanSubtext}>
              Schedule meals or generate a new plan
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderGeneratedMealsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Generated Meals ({generatedMeals.length})
        </Text>
      </View>
      {generatedMeals.length > 0 ? (
        generatedMeals.map((meal) => renderMealCard(meal))
      ) : (
        <View style={styles.emptySection}>
          <Ionicons name="sparkles-outline" size={48} color="#ccc" />
          <Text style={styles.emptySectionText}>No generated meals yet</Text>
          <Text style={styles.emptySectionSubtext}>
            Generate AI-powered meal suggestions
          </Text>
        </View>
      )}
    </View>
  );

  const renderSavedMealsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Saved Recipes ({savedMeals.length})
        </Text>
      </View>
      {savedMeals.length > 0 ? (
        savedMeals.map((meal) => renderMealCard(meal))
      ) : (
        <View style={styles.emptySection}>
          <Ionicons name="heart-outline" size={48} color="#ccc" />
          <Text style={styles.emptySectionText}>No saved recipes yet</Text>
          <Text style={styles.emptySectionSubtext}>
            Save your favorite recipes for easy access
          </Text>
        </View>
      )}
    </View>
  );

  const renderCustomRecipeSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Custom Recipes</Text>
        <TouchableOpacity
          style={styles.addCustomBtn}
          onPress={() => setShowAddMealModal(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color="#4CAF50" />
          <Text style={styles.addCustomBtnText}>Add Custom</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.customRecipeInfo}>
        <Ionicons name="information-circle-outline" size={20} color="#666" />
        <Text style={styles.customRecipeInfoText}>
          Create your own recipes and add them to meal plans
        </Text>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "daily":
        return renderDailyPlanSection();
      case "generated":
        return renderGeneratedMealsSection();
      case "saved":
        return renderSavedMealsSection();
      case "custom":
        return renderCustomRecipeSection();
      default:
        return renderDailyPlanSection();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <Text style={styles.headerTitle}>Meals & Recipes</Text>
        <Text style={styles.headerSubtitle}>Plan, track, and discover</Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: "daily", label: "Daily Plans", icon: "calendar-outline" },
            { key: "generated", label: "Generated", icon: "sparkles-outline" },
            { key: "saved", label: "Saved", icon: "heart-outline" },
            { key: "custom", label: "Custom", icon: "add-circle-outline" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.key ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <QuickActions />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>

      {/* Meal Detail Modal */}
      <Modal
        visible={showMealDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowMealDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recipe Details</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowMealDetailModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedMeal && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.recipeHeader}>
                  <Text style={styles.recipeName}>
                    {selectedMeal.recipeName}
                  </Text>
                  <View style={styles.recipeStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="flame" size={20} color="#FF6B6B" />
                      <Text style={styles.statText}>
                        {selectedMeal.calories} kcal
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="fitness" size={20} color="#4ECDC4" />
                      <Text style={styles.statText}>
                        {selectedMeal.protein}g protein
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="time" size={20} color="#95A5A6" />
                      <Text style={styles.statText}>
                        {selectedMeal.cookingTime}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  {selectedMeal.ingredients &&
                    selectedMeal.ingredients.map(
                      (ingredient: string, index: number) => (
                        <View key={index} style={styles.ingredientItem}>
                          <Ionicons name="ellipse" size={6} color="#4CAF50" />
                          <Text style={styles.ingredientText}>
                            {ingredient}
                          </Text>
                        </View>
                      )
                    )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Instructions</Text>
                  {selectedMeal.instructions &&
                    selectedMeal.instructions.map(
                      (instruction: string, index: number) => (
                        <View key={index} style={styles.instructionItem}>
                          <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>
                              {index + 1}
                            </Text>
                          </View>
                          <Text style={styles.instructionText}>
                            {instruction}
                          </Text>
                        </View>
                      )
                    )}
                </View>

                {selectedMeal &&
                  (selectedMeal as any).tags &&
                  (selectedMeal as any).tags.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Tags</Text>
                      <View style={styles.tagsContainer}>
                        {(selectedMeal as any).tags.map(
                          (tag: string, index: number) => (
                            <View key={index} style={styles.tag}>
                              <Text style={styles.tagText}>{tag}</Text>
                            </View>
                          )
                        )}
                      </View>
                    </View>
                  )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Date Selector Modal */}
      <Modal
        visible={showDateSelector}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDateSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Meal</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowDateSelector(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.scheduleMealName}>
                {selectedMeal?.recipeName}
              </Text>

              <Text style={styles.sectionTitle}>Select Date</Text>
              <ScrollView style={styles.dateList}>
                {getNext7Days().map((date) => (
                  <TouchableOpacity
                    key={date}
                    style={styles.dateOption}
                    onPress={() => setSelectedDate(date)}
                  >
                    <View style={styles.dateOptionContent}>
                      <Text style={styles.dateOptionText}>
                        {formatDate(date)}
                      </Text>
                      <Text style={styles.dateOptionDate}>
                        {new Date(date).toLocaleDateString()}
                      </Text>
                    </View>
                    {selectedDate === date && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#4CAF50"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.sectionTitle}>Select Meal Type</Text>
              <View style={styles.mealTypeSelector}>
                {["breakfast", "lunch", "dinner", "snacks"].map((mealType) => (
                  <TouchableOpacity
                    key={mealType}
                    style={[
                      styles.mealTypeBtn,
                      selectedMeal?.mealType === mealType &&
                      styles.selectedMealType,
                    ]}
                    onPress={() => {
                      if (selectedMeal) {
                        setSelectedMeal({
                          ...selectedMeal,
                          mealType: mealType,
                        });
                      }
                    }}
                  >
                    <Text style={styles.mealTypeEmoji}>
                      {getMealEmoji(mealType)}
                    </Text>
                    <Text
                      style={[
                        styles.mealTypeText,
                        selectedMeal?.mealType === mealType &&
                        styles.selectedMealTypeText,
                      ]}
                    >
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.scheduleConfirmBtn}
                onPress={() => {
                  if (selectedMeal) {
                    scheduleMealForDate(
                      selectedMeal,
                      selectedDate,
                      selectedMeal.mealType || "breakfast"
                    );
                  }
                }}
              >
                <Ionicons name="calendar" size={20} color="#fff" />
                <Text style={styles.scheduleConfirmBtnText}>
                  Schedule for {formatDate(selectedDate)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Recipe Modal */}
      <Modal
        visible={showCustomRecipeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCustomRecipeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Custom Recipe</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowCustomRecipeModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Recipe Name *</Text>
                <TextInput
                  style={styles.input}
                  value={customRecipeName}
                  onChangeText={setCustomRecipeName}
                  placeholder="Enter recipe name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Calories *</Text>
                  <TextInput
                    style={styles.input}
                    value={customRecipeCalories}
                    onChangeText={setCustomRecipeCalories}
                    placeholder="e.g. 300"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.inputLabel}>Protein (g) *</Text>
                  <TextInput
                    style={styles.input}
                    value={customRecipeProtein}
                    onChangeText={setCustomRecipeProtein}
                    placeholder="e.g. 25"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.createCustomBtn}
                onPress={createCustomRecipe}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.createCustomBtnText}>Create Recipe</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Enhanced Add Meal Modal */}
      <AddMealModal
        visible={showAddMealModal}
        onClose={() => setShowAddMealModal(false)}
        onAddMeal={handleAddMeal}
        selectedDate={selectedDateForPlanning}
        selectedMealType="breakfast"
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddMealModal(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#4CAF50", "#45a049"]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  tabContainer: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 5,
    backgroundColor: "#f8f9fa",
  },
  activeTab: {
    backgroundColor: "#667eea",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 8,
  },
  activeTabText: {
    color: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  section: {
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  generateBtnText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 5,
  },
  addCustomBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addCustomBtnText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 5,
    fontSize: 14,
  },
  dateSelector: {
    marginBottom: 20,
  },
  dateItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  selectedDateItem: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  selectedDateText: {
    color: "#fff",
  },
  dayPlanContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 10,
  },
  dayPlanTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  dailyMeals: {
    marginBottom: 15,
  },
  dayPlanStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  emptyPlan: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyPlanText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 10,
  },
  emptyPlanSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
  emptySection: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginVertical: 10,
  },
  emptySectionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 10,
  },
  emptySectionSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
  mealCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  mealIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  mealEmoji: {
    fontSize: 24,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  mealStats: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  difficulty: {
    fontSize: 12,
    color: "#999",
  },
  consumedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  consumedText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 4,
  },
  generatedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#667eea",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  generatedText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
    marginLeft: 4,
  },
  mealActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  viewBtn: {
    borderColor: "#2196F3",
    backgroundColor: "#E3F2FD",
  },
  scheduleBtn: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E8",
  },
  saveBtn: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFE8E8",
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 5,
  },
  customRecipeInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
  },
  customRecipeInfoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeBtn: {
    padding: 5,
  },
  modalContent: {
    padding: 20,
  },
  recipeHeader: {
    marginBottom: 20,
  },
  recipeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  recipeStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 15,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  ingredientText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  instructionText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  tag: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  scheduleMealName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  dateList: {
    maxHeight: 150,
    marginBottom: 20,
  },
  dateOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    marginBottom: 10,
  },
  dateOptionContent: {
    flex: 1,
  },
  dateOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  dateOptionDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  mealTypeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  mealTypeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#e9ecef",
    backgroundColor: "#f8f9fa",
    marginRight: 10,
    marginBottom: 10,
  },
  selectedMealType: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  mealTypeEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  selectedMealTypeText: {
    color: "#fff",
  },
  scheduleConfirmBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
  },
  scheduleConfirmBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputRow: {
    flexDirection: "row",
  },
  createCustomBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  createCustomBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
  },
});
