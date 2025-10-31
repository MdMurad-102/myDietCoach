import { MealItem, useMealContext } from "@/context/UnifiedMealContext";
import { UserContext } from "@/context/UserContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import AddMealModal from "../components/AddMealModal";
import MealCard from "../components/MealCard";

const { width: screenWidth } = Dimensions.get("window");

type MealGenerationType = "ai" | "local" | "custom";
type MealViewType = "daily" | "all";

export default function Meals() {
  const context = useContext(UserContext);
  const mealContext = useMealContext();
  const router = useRouter();

  // Helper function to get local date string (YYYY-MM-DD) without timezone issues
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const [showMealDetailModal, setShowMealDetailModal] = useState(false);
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    getLocalDateString(new Date())
  );
  const [viewType, setViewType] = useState<MealViewType>("daily");
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);

  if (!context) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { user } = context;
  const {
    dailyMealPlans,
    generatedMeals,
    scheduleMeal,
    saveMeal,
    addMealToToday,
    refreshMealData,
    getMealPlanForDate,
  } = mealContext;

  useEffect(() => {
    refreshMealData();
  }, []);

  // Auto-select first date with meals when switching to daily view
  useEffect(() => {
    if (viewType === 'daily' && Object.keys(dailyMealPlans).length > 0) {
      // Check if current selected date has meals
      const currentHasMeals = dailyMealPlans[selectedDate]?.meals?.length > 0;

      if (!currentHasMeals) {
        // Find most recent date with meals
        const datesWithMeals = Object.keys(dailyMealPlans)
          .filter(date => dailyMealPlans[date]?.meals?.length > 0)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        if (datesWithMeals.length > 0) {
          console.log('🔄 Auto-selecting date with meals:', datesWithMeals[0]);
          setSelectedDate(datesWithMeals[0]);
        }
      }
    }
  }, [viewType, dailyMealPlans]);

  const onRefresh = () => {
    setRefreshing(true);
    refreshMealData();
    setTimeout(() => setRefreshing(false), 1000);
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
      `${meal.recipeName} has been scheduled for ${date} (${mealType})`
    );
    setShowDateSelector(false);
  };

  const handleAddMeal = async (mealData: any) => {
    try {
      const newMeal: MealItem = {
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
        carbs: mealData.carbs,
        fat: mealData.fat,
      };
      await addMealToToday(newMeal);
      refreshMealData();
      setShowAddMealModal(false);
      Alert.alert("Success", "Meal added successfully!");
    } catch (error) {
      console.error("Error adding meal:", error);
      Alert.alert("Error", "Failed to add meal. Please try again.");
    }
  };

  const handleGenerateMeal = (type: MealGenerationType) => {
    setShowGenerationModal(false);

    if (type === "ai") {
      router.push("/recipeGenerator");
    } else if (type === "local") {
      router.push("/dailyMealPlan");
    } else {
      setShowAddMealModal(true);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return "Today";

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.getTime() === tomorrow.getTime()) return "Tomorrow";

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getTime() === yesterday.getTime()) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getNext14Days = () => {
    return Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - 3 + i); // Show 3 days before and 10 days after
      return getLocalDateString(date);
    });
  };

  const getMealsByType = (meals: MealItem[]) => {
    const breakfast = meals.filter((m) => m.mealType === "breakfast");
    const lunch = meals.filter((m) => m.mealType === "lunch");
    const dinner = meals.filter((m) => m.mealType === "dinner");
    const snacks = meals.filter((m) => m.mealType === "snack" || m.mealType === "snacks");
    const others = meals.filter(
      (m) => !["breakfast", "lunch", "dinner", "snack", "snacks"].includes(m.mealType || "")
    );

    return { breakfast, lunch, dinner, snacks, others };
  };

  const calculateDailyTotals = (meals: MealItem[]) => {
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const renderMealSection = (title: string, meals: MealItem[], icon: string) => {
    if (meals.length === 0) return null;

    return (
      <View style={styles.mealSection}>
        <View style={styles.mealSectionHeader}>
          <Ionicons name={icon as any} size={24} color="#667eea" />
          <Text style={styles.mealSectionTitle}>{title}</Text>
          <Text style={styles.mealCount}>({meals.length})</Text>
        </View>
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onPress={() => viewMealDetails(meal)}
            onSchedule={() => {
              setSelectedMeal(meal);
              setShowDateSelector(true);
            }}
            onSave={() => saveMeal(meal)}
            isSaved={false}
          />
        ))}
      </View>
    );
  };

  const renderDailyView = () => {
    const plan = getMealPlanForDate(selectedDate);
    const meals = plan?.meals || [];
    console.log('🍽️ Daily View - Selected Date:', selectedDate);
    console.log('🍽️ Daily View - Plan:', plan);
    console.log('🍽️ Daily View - Meals count:', meals.length);
    console.log('🍽️ Daily View - All dates in dailyMealPlans:', Object.keys(dailyMealPlans));

    const { breakfast, lunch, dinner, snacks, others } = getMealsByType(meals);
    const totals = calculateDailyTotals(meals);
    const goals = plan?.goals || {
      calories: user?.calories || 2000,
      protein: user?.proteins || 150,
    };

    return (
      <View>
        {/* Date Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateSelector}
          contentContainerStyle={styles.dateSelectorContent}
        >
          {getNext14Days().map((date) => {
            const isSelected = selectedDate === date;
            const isToday = date === getLocalDateString(new Date());
            const hasMeals = dailyMealPlans[date]?.meals?.length > 0;

            return (
              <TouchableOpacity
                key={date}
                style={[
                  styles.dateItem,
                  isSelected && styles.selectedDateItem,
                  isToday && styles.todayDateItem,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text
                  style={[
                    styles.dateDay,
                    isSelected && styles.selectedDateText,
                  ]}
                >
                  {new Date(date).getDate()}
                </Text>
                <Text
                  style={[
                    styles.dateMonth,
                    isSelected && styles.selectedDateText,
                  ]}
                >
                  {new Date(date).toLocaleDateString("en-US", { month: "short" })}
                </Text>
                {hasMeals && (
                  <View style={[styles.mealIndicator, isSelected && styles.selectedMealIndicator]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Daily Summary */}
        {meals.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Daily Summary - {formatDate(selectedDate)}</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{totals.calories}</Text>
                <Text style={styles.summaryLabel}>Calories</Text>
                <Text style={styles.summaryGoal}>of {goals.calories}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{totals.protein.toFixed(1)}g</Text>
                <Text style={styles.summaryLabel}>Protein</Text>
                <Text style={styles.summaryGoal}>of {goals.protein}g</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{totals.carbs.toFixed(1)}g</Text>
                <Text style={styles.summaryLabel}>Carbs</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{totals.fat.toFixed(1)}g</Text>
                <Text style={styles.summaryLabel}>Fat</Text>
              </View>
            </View>
          </View>
        )}

        {/* Meals by Type */}
        {meals.length > 0 ? (
          <View>
            {renderMealSection("Breakfast", breakfast, "sunny")}
            {renderMealSection("Lunch", lunch, "restaurant")}
            {renderMealSection("Dinner", dinner, "moon")}
            {renderMealSection("Snacks", snacks, "fast-food")}
            {renderMealSection("Other", others, "nutrition")}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={80} color="#e0e0e0" />
            <Text style={styles.emptyStateTitle}>No meals for {formatDate(selectedDate)}</Text>
            <Text style={styles.emptyStateText}>
              Add meals to start tracking your daily nutrition
            </Text>
            <TouchableOpacity
              style={styles.addMealButton}
              onPress={() => setShowGenerationModal(true)}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.addMealButtonGradient}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addMealButtonText}>Add Meal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderAllMealsView = () => {
    // Group meals by date from dailyMealPlans
    const mealsByDate: Record<string, MealItem[]> = {};

    Object.entries(dailyMealPlans).forEach(([date, plan]) => {
      if (plan.meals && plan.meals.length > 0) {
        mealsByDate[date] = plan.meals;
      }
    });

    // Sort dates in descending order (newest first)
    const sortedDates = Object.keys(mealsByDate).sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    );

    const totalMealsCount = Object.values(mealsByDate).reduce(
      (sum, meals) => sum + meals.length,
      0
    ) + generatedMeals.length;

    return (
      <View>
        <View style={styles.allMealsHeader}>
          <Text style={styles.allMealsTitle}>All Saved Meals</Text>
          <Text style={styles.allMealsCount}>
            {sortedDates.length} days • {totalMealsCount} meals
          </Text>
        </View>

        {/* Generated meals (not yet saved to a date) */}
        {generatedMeals.length > 0 && (
          <View style={styles.dateGroupContainer}>
            <View style={styles.dateGroupHeader}>
              <View style={styles.dateHeaderLeft}>
                <Ionicons name="bulb-outline" size={20} color="#667eea" />
                <Text style={styles.dateGroupTitle}>AI Generated (Not Saved)</Text>
              </View>
              <Text style={styles.mealCount}>{generatedMeals.length}</Text>
            </View>
            {generatedMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onPress={() => viewMealDetails(meal)}
                onSchedule={() => {
                  setSelectedMeal(meal);
                  setShowDateSelector(true);
                }}
                onSave={() => saveMeal(meal)}
                isSaved={false}
              />
            ))}
          </View>
        )}

        {/* Meals grouped by date */}
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => {
            const meals = mealsByDate[date];
            const { breakfast, lunch, dinner, snacks } = getMealsByType(meals);
            const totals = calculateDailyTotals(meals);

            return (
              <View key={date} style={styles.dateGroupContainer}>
                <TouchableOpacity
                  style={styles.dateGroupHeader}
                  onPress={() => {
                    setSelectedDate(date);
                    setViewType('daily');
                  }}
                >
                  <View style={styles.dateHeaderLeft}>
                    <Ionicons name="calendar" size={20} color="#667eea" />
                    <Text style={styles.dateGroupTitle}>{formatDate(date)}</Text>
                    <Text style={styles.dateGroupSubtitle}>
                      {new Date(date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                  <View style={styles.dateHeaderRight}>
                    <Text style={styles.dateTotalCalories}>{totals.calories} cal</Text>
                    <Text style={styles.dateTotalProtein}>{totals.protein.toFixed(0)}g protein</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.dateGroupMeals}>
                  {breakfast.length > 0 && renderCompactMealRow("Breakfast", breakfast[0], "sunny")}
                  {lunch.length > 0 && renderCompactMealRow("Lunch", lunch[0], "restaurant")}
                  {dinner.length > 0 && renderCompactMealRow("Dinner", dinner[0], "moon")}
                  {snacks.length > 0 && renderCompactMealRow("Snacks", snacks[0], "fast-food")}
                </View>
              </View>
            );
          })
        ) : (
          generatedMeals.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={80} color="#e0e0e0" />
              <Text style={styles.emptyStateTitle}>No meals yet</Text>
              <Text style={styles.emptyStateText}>
                Start by generating or adding your first meal
              </Text>
            </View>
          )
        )}
      </View>
    );
  };

  const renderCompactMealRow = (title: string, meal: MealItem, icon: string) => {
    return (
      <TouchableOpacity
        style={styles.compactMealRow}
        onPress={() => viewMealDetails(meal)}
      >
        <View style={styles.compactMealLeft}>
          <Ionicons name={icon as any} size={18} color="#667eea" />
          <View style={styles.compactMealInfo}>
            <Text style={styles.compactMealType}>{title}</Text>
            <Text style={styles.compactMealName} numberOfLines={1}>
              {meal.recipeName || meal.name}
            </Text>
          </View>
        </View>
        <View style={styles.compactMealRight}>
          <Text style={styles.compactMealCalories}>{meal.calories} cal</Text>
          <Text style={styles.compactMealProtein}>{meal.protein}g</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGenerationModal = () => (
    <Modal
      visible={showGenerationModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowGenerationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.generationModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Meal</Text>
            <TouchableOpacity onPress={() => setShowGenerationModal(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>Choose how you want to add your meal</Text>

          <TouchableOpacity
            style={styles.generationOption}
            onPress={() => handleGenerateMeal("ai")}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.generationOptionGradient}
            >
              <View style={styles.generationOptionIcon}>
                <Ionicons name="sparkles" size={32} color="#fff" />
              </View>
              <View style={styles.generationOptionContent}>
                <Text style={styles.generationOptionTitle}>AI Generated</Text>
                <Text style={styles.generationOptionDescription}>
                  Create personalized recipes with AI based on your preferences
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.generationOption}
            onPress={() => handleGenerateMeal("local")}
          >
            <LinearGradient
              colors={["#4CAF50", "#45B7D1"]}
              style={styles.generationOptionGradient}
            >
              <View style={styles.generationOptionIcon}>
                <MaterialCommunityIcons name="food-variant" size={32} color="#fff" />
              </View>
              <View style={styles.generationOptionContent}>
                <Text style={styles.generationOptionTitle}>Daily Meal Plan</Text>
                <Text style={styles.generationOptionDescription}>
                  Generate complete meal plan from curated local recipes
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.generationOption}
            onPress={() => handleGenerateMeal("custom")}
          >
            <LinearGradient
              colors={["#FF6B6B", "#FF8E53"]}
              style={styles.generationOptionGradient}
            >
              <View style={styles.generationOptionIcon}>
                <Ionicons name="create" size={32} color="#fff" />
              </View>
              <View style={styles.generationOptionContent}>
                <Text style={styles.generationOptionTitle}>Custom Entry</Text>
                <Text style={styles.generationOptionDescription}>
                  Manually add your own meal with custom nutrition info
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Your Meals</Text>
            <Text style={styles.headerSubtitle}>Plan, track, and discover</Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowGenerationModal(true)}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* View Type Selector */}
        <View style={styles.viewTypeSelector}>
          <TouchableOpacity
            style={[
              styles.viewTypeButton,
              viewType === "daily" && styles.viewTypeButtonActive,
            ]}
            onPress={() => setViewType("daily")}
          >
            <Ionicons
              name="calendar"
              size={20}
              color={viewType === "daily" ? "#667eea" : "#fff"}
            />
            <Text
              style={[
                styles.viewTypeText,
                viewType === "daily" && styles.viewTypeTextActive,
              ]}
            >
              Daily View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewTypeButton,
              viewType === "all" && styles.viewTypeButtonActive,
            ]}
            onPress={() => setViewType("all")}
          >
            <Ionicons
              name="list"
              size={20}
              color={viewType === "all" ? "#667eea" : "#fff"}
            />
            <Text
              style={[
                styles.viewTypeText,
                viewType === "all" && styles.viewTypeTextActive,
              ]}
            >
              All Meals
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {viewType === "daily" ? renderDailyView() : renderAllMealsView()}
      </ScrollView>

      {/* Modals */}
      {renderGenerationModal()}

      <AddMealModal
        visible={showAddMealModal}
        onClose={() => {
          setShowAddMealModal(false);
          refreshMealData();
        }}
        selectedDate={selectedDate}
      />

      {/* Meal Detail Modal */}
      <Modal
        visible={showMealDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMealDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.mealDetailModal}>
            {selectedMeal && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedMeal.recipeName}</Text>
                  <TouchableOpacity onPress={() => setShowMealDetailModal(false)}>
                    <Ionicons name="close" size={28} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.mealDetailContent}>
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{selectedMeal.calories}</Text>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{selectedMeal.protein}g</Text>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                    </View>
                    {selectedMeal.carbs && (
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{selectedMeal.carbs}g</Text>
                        <Text style={styles.nutritionLabel}>Carbs</Text>
                      </View>
                    )}
                    {selectedMeal.fat && (
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{selectedMeal.fat}g</Text>
                        <Text style={styles.nutritionLabel}>Fat</Text>
                      </View>
                    )}
                  </View>

                  {selectedMeal.ingredients && selectedMeal.ingredients.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Ingredients</Text>
                      {selectedMeal.ingredients.map((ingredient, index) => (
                        <Text key={index} style={styles.detailSectionText}>
                          • {ingredient}
                        </Text>
                      ))}
                    </View>
                  )}

                  {selectedMeal.instructions && selectedMeal.instructions.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Instructions</Text>
                      {selectedMeal.instructions.map((instruction, index) => (
                        <Text key={index} style={styles.detailSectionText}>
                          {index + 1}. {instruction}
                        </Text>
                      ))}
                    </View>
                  )}
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={() => {
                      saveMeal(selectedMeal);
                      Alert.alert("Saved!", "Meal added to your favorites");
                    }}
                  >
                    <Ionicons name="heart" size={24} color="#667eea" />
                    <Text style={styles.modalActionText}>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={() => {
                      setShowMealDetailModal(false);
                      setSelectedMeal(selectedMeal);
                      setShowDateSelector(true);
                    }}
                  >
                    <Ionicons name="calendar" size={24} color="#667eea" />
                    <Text style={styles.modalActionText}>Schedule</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowGenerationModal(true)}
      >
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={30} color="#fff" />
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
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewTypeSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 4,
  },
  viewTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  viewTypeButtonActive: {
    backgroundColor: "#fff",
  },
  viewTypeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  viewTypeTextActive: {
    color: "#667eea",
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  dateSelector: {
    marginBottom: 16,
  },
  dateSelectorContent: {
    paddingHorizontal: 16,
  },
  dateItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: "#fff",
    minWidth: 70,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedDateItem: {
    backgroundColor: "#667eea",
  },
  todayDateItem: {
    borderWidth: 2,
    borderColor: "#667eea",
  },
  dateDay: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  dateMonth: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  selectedDateText: {
    color: "#fff",
  },
  mealIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#667eea",
    marginTop: 4,
  },
  selectedMealIndicator: {
    backgroundColor: "#fff",
  },
  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#667eea",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  summaryGoal: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
  mealSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  mealSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  mealSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  mealCount: {
    fontSize: 14,
    color: "#999",
    marginLeft: 8,
  },
  allMealsHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  allMealsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  allMealsCount: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  addMealButton: {
    marginTop: 20,
  },
  addMealButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  addMealButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  generationModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  generationOption: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  generationOptionGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  generationOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  generationOptionContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  generationOptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  generationOptionDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
  },
  mealDetailModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  mealDetailContent: {
    maxHeight: "70%",
    paddingHorizontal: 20,
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  nutritionItem: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#667eea",
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  detailSectionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  modalActionButton: {
    alignItems: "center",
    padding: 12,
  },
  modalActionText: {
    fontSize: 14,
    color: "#667eea",
    marginTop: 4,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  dateGroupContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9ff",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  dateHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dateHeaderRight: {
    alignItems: "flex-end",
  },
  dateGroupTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginLeft: 8,
  },
  dateGroupSubtitle: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
  dateTotalCalories: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
  },
  dateTotalProtein: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  dateGroupMeals: {
    padding: 8,
  },
  compactMealRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  compactMealLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  compactMealInfo: {
    marginLeft: 12,
    flex: 1,
  },
  compactMealType: {
    fontSize: 11,
    color: "#999",
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  compactMealName: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    marginTop: 2,
  },
  compactMealRight: {
    alignItems: "flex-end",
  },
  compactMealCalories: {
    fontSize: 14,
    fontWeight: "600",
    color: "#667eea",
  },
  compactMealProtein: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});
