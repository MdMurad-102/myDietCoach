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
import MealCard from "../components/MealCard";
import Button from "../components/Button";

const { width: screenWidth } = Dimensions.get("window");

export default function Meals() {
  const context = useContext(UserContext);
  const mealContext = useMealContext();
  const router = useRouter();

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const [showMealDetailModal, setShowMealDetailModal] = useState(false);
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [activeTab, setActiveTab] = useState<
    "daily" | "generated" | "saved"
  >("daily");
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
    addMealToToday,
    refreshMealData,
    getMealPlanForDate,
  } = mealContext;

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
    } catch (error) {
      console.error("Error adding meal:", error);
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getNext7Days = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return date.toISOString().split("T")[0];
    });
  };

  const renderDailyPlan = () => {
    const plan = getMealPlanForDate(selectedDate);
    return (
      <View>
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
                selectedDate === date && styles.selectedDateItem,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dateText,
                  selectedDate === date && styles.selectedDateText,
                ]}
              >
                {formatDate(date)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {plan && plan.meals.length > 0 ? (
          plan.meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onPress={() => viewMealDetails(meal)}
              onSchedule={() => {
                setSelectedMeal(meal);
                setShowDateSelector(true);
              }}
              onSave={() => saveMeal(meal)}
              isSaved={savedMeals.some((sm) => sm.id === meal.id)}
            />
          ))
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.emptySectionText}>
              No meals for {formatDate(selectedDate)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderGeneratedMeals = () => (
    <View>
      {generatedMeals.length > 0 ? (
        generatedMeals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onPress={() => viewMealDetails(meal)}
            onSchedule={() => {
              setSelectedMeal(meal);
              setShowDateSelector(true);
            }}
            onSave={() => saveMeal(meal)}
            isSaved={savedMeals.some((sm) => sm.id === meal.id)}
          />
        ))
      ) : (
        <View style={styles.emptySection}>
          <Ionicons name="sparkles-outline" size={48} color="#ccc" />
          <Text style={styles.emptySectionText}>No generated meals yet</Text>
        </View>
      )}
    </View>
  );

  const renderSavedMeals = () => (
    <View>
      {savedMeals.length > 0 ? (
        savedMeals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onPress={() => viewMealDetails(meal)}
            onSchedule={() => {
              setSelectedMeal(meal);
              setShowDateSelector(true);
            }}
            onSave={() => saveMeal(meal)}
            isSaved={true}
          />
        ))
      ) : (
        <View style={styles.emptySection}>
          <Ionicons name="heart-outline" size={48} color="#ccc" />
          <Text style={styles.emptySectionText}>No saved recipes yet</Text>
        </View>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "daily":
        return renderDailyPlan();
      case "generated":
        return renderGeneratedMeals();
      case "saved":
        return renderSavedMeals();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <Text style={styles.headerTitle}>Your Meals</Text>
        <Text style={styles.headerSubtitle}>Plan, track, and discover</Text>
      </LinearGradient>

      <View style={styles.tabContainer}>
        {/*
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "daily" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("daily")}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={activeTab === "daily" ? "#fff" : "#667eea"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "daily" && styles.activeTabText,
            ]}
          >
            Daily
          </Text>
        </TouchableOpacity>
        */}
        {/*
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "generated" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("generated")}
        >
          <Ionicons
            name="sparkles-outline"
            size={20}
            color={activeTab === "generated" ? "#fff" : "#667eea"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "generated" && styles.activeTabText,
            ]}
          >
            Generated
          </Text>
        </TouchableOpacity>
        */}
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "saved" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("saved")}
        >
          <Ionicons
            name="heart-outline"
            size={20}
            color={activeTab === "saved" ? "#fff" : "#667eea"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "saved" && styles.activeTabText,
            ]}
          >
            Saved
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderTabContent()}
      </ScrollView>

      <AddMealModal
        visible={showAddMealModal}
        onClose={() => setShowAddMealModal(false)}
        onAddMeal={handleAddMeal}
        selectedDate={selectedDate}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddMealModal(true)}
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
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 8,
    marginTop: -15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: "#667eea",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#667eea",
    marginLeft: 8,
  },
  activeTabText: {
    color: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptySection: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  emptySectionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  dateSelector: {
    marginBottom: 16,
  },
  dateItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#fff",
    marginRight: 10,
  },
  selectedDateItem: {
    backgroundColor: "#667eea",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  selectedDateText: {
    color: "#fff",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
