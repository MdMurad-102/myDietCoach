// Unified MealContext - PostgreSQL Version
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";
import {
  getUserMealPlans,
  getUserRecipes,
  saveCustomRecipe
} from "../service/api";
import { UserContext } from "./UserContext";

// Only import database on native platforms
let getTodayMealPlanFromDb: any, updateMealInPlan: any, scheduleMealInDb: any, updateWaterIntakeInDb: any;
if (Platform.OS !== 'web') {
  const recipes = require("../database/recipes");
  getTodayMealPlanFromDb = recipes.getTodayMealPlan;
  updateMealInPlan = recipes.updateMealInPlan;
  scheduleMealInDb = recipes.scheduleMeal;
  updateWaterIntakeInDb = recipes.updateWaterIntakeInDb;
}

export interface MealItem {
  id: string;
  recipeName: string;
  name?: string; // Add name property
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  ingredients?: string[];
  instructions?: string[];
  cookingTime?: string;
  servings?: number;
  consumed?: boolean;
  mealType?: string;
  scheduledDate?: string;
  date?: string; // Add date property
  nutritionTips?: string;
  prepTime?: string;
  difficulty?: string;
}

export interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  water: number;
}

export interface DailyMealPlan {
  id: string;
  date: string;
  meals: MealItem[];
  waterGlasses: number;
  tasks: DailyTask[];
  goals: DailyGoals;
  totalCalories: number;
  totalProtein: number;
  consumedCalories: number;
  consumedProtein: number;
}

export interface MealContextType {
  currentDayPlan: DailyMealPlan | null;
  selectedDate: string;
  dailyMealPlans: Record<string, DailyMealPlan>;
  generatedMeals: MealItem[];
  savedMeals: MealItem[];
  isLoading: boolean;
  error: string | null;
  getMealPlanForDate: (date: string) => DailyMealPlan | null;
  getTodayMealPlan: () => DailyMealPlan | null;
  refreshMealData: () => void;
  addMealToToday: (meal: Partial<MealItem>) => Promise<void>;
  scheduleMeal: (
    meal: MealItem,
    date: string,
    mealType: string
  ) => Promise<void>;
  saveMeal: (meal: MealItem) => Promise<void>;
  addGeneratedMeal: (meal: MealItem) => void;
  updateMealPlan: (date: string, plan: Partial<DailyMealPlan>) => void;
  markMealConsumed: (mealId: string, consumed: boolean) => void;
  updateWaterIntake: (glasses: number) => void;
  toggleDailyTask: (taskId: string) => void;
  updateCurrentProgress: (calories: number, protein: number) => void;
  addCustomMeal: (meal: Partial<MealItem>) => Promise<void>;
}

const MealContext = createContext<MealContextType | null>(null);

export const useMealContext = () => {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error("useMealContext must be used within a MealProvider");
  }
  return context;
};

interface MealProviderProps {
  children: ReactNode;
}

export const MealProvider: React.FC<MealProviderProps> = ({ children }) => {
  const userContext = useContext(UserContext);
  const user = userContext?.user;

  const [dailyMealPlans, setDailyMealPlans] = useState<
    Record<string, DailyMealPlan>
  >({});
  const [generatedMeals, setGeneratedMeals] = useState<MealItem[]>([]);
  const [savedMeals, setSavedMeals] = useState<MealItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayString = new Date().toISOString().split("T")[0];

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);

    try {
      // Load recipes
      if (Platform.OS !== 'web') {
        const recipes = await getUserRecipes(user.id);
        setSavedMeals(
          recipes.map((recipe: any) => ({
            id: recipe.id.toString(),
            recipeName: recipe.recipe_name,
            calories: recipe.json_data?.calories || 0,
            protein: recipe.json_data?.protein || 0,
            ingredients: recipe.json_data?.ingredients || [],
            instructions: recipe.json_data?.instructions || [],
            cookingTime: recipe.json_data?.cookingTime || "30 min",
            servings: recipe.json_data?.servings || 1,
          }))
        );
      } else {
        setSavedMeals([]);
      }

      // Load meal plans
      if (Platform.OS !== 'web') {
        const plans = await getUserMealPlans(user.id);
        const plansMap: Record<string, DailyMealPlan> = {};

        plans.forEach((plan: any) => {
          const planDate = plan.created_at ? new Date(plan.created_at).toISOString().split("T")[0] : todayString;
          plansMap[planDate] = {
            id: plan.id.toString(),
            date: planDate,
            meals: plan.meal_plan_data?.meals || [],
            waterGlasses: 0,
            tasks: [],
            goals: {
              calories: user?.calories || 2000,
              protein: user?.proteins || 150,
              water: user?.daily_water_goal || 8,
            },
            totalCalories: plan.total_calories || 0,
            totalProtein: plan.total_protein || 0,
            consumedCalories: 0,
            consumedProtein: 0,
          };
        });
        setDailyMealPlans(plansMap);
      } else {
        setDailyMealPlans({});
      }

      // Load today's meal plan from local DB
      if (Platform.OS !== 'web' && getTodayMealPlanFromDb) {
        const todayPlan = await getTodayMealPlanFromDb(user.id, todayString);
        if (todayPlan) {
          const plan: DailyMealPlan = {
            id: todayPlan.id.toString(),
            date: todayPlan.scheduled_date,
            meals: todayPlan.meal_plan_data?.meals || [],
            waterGlasses: todayPlan.meal_plan_data?.waterGlasses || 0,
            tasks: [],
            goals: {
              calories: user?.calories || 2000,
              protein: user?.proteins || 150,
              water: user?.daily_water_goal || 8,
            },
            totalCalories: todayPlan.total_calories || 0,
            totalProtein: todayPlan.total_protein || 0,
            consumedCalories: todayPlan.calories_consumed || 0,
            consumedProtein: todayPlan.protein_consumed || 0,
          };

          setDailyMealPlans(prev => ({
            ...prev,
            [todayString]: plan
          }));
        }
      }
    } catch (e) {
      console.error('Failed to load data:', e);
      setError('Failed to load meal data.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, todayString, user?.calories, user?.proteins, user?.daily_water_goal]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getMealPlanForDate = (date: string): DailyMealPlan | null => {
    return dailyMealPlans[date] || null;
  };

  const getTodayMealPlan = (): DailyMealPlan | null => {
    return getMealPlanForDate(todayString);
  };

  const addMealToToday = async (meal: Partial<MealItem>): Promise<void> => {
    if (!user?.id || Platform.OS === 'web' || !scheduleMealInDb || !getTodayMealPlanFromDb || !updateMealInPlan) {
      throw new Error("User not logged in or DB not available");
    }

    try {
      setIsLoading(true);
      setError(null);

      const mealData = {
        recipeName: meal.recipeName || "Custom Meal",
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        ...meal
      };

      let todayPlan = await getTodayMealPlanFromDb(user.id, todayString);

      if (!todayPlan) {
        await scheduleMealInDb(
          user.id,
          todayString,
          mealData.mealType,
          mealData.calories,
          mealData.protein,
          undefined,
          undefined,
          { meals: [mealData] }
        );
      } else {
        const currentMeals = todayPlan.meal_plan_data?.meals || [];
        const updatedMealPlanData = {
          ...todayPlan.meal_plan_data,
          meals: [...currentMeals, mealData]
        };
        await updateMealInPlan(todayPlan.id, updatedMealPlanData);
      }

      await loadData();
      console.log("✅ Meal added to today successfully:", mealData.recipeName);
    } catch (error) {
      console.error("❌ Error adding meal to today:", error);
      setError("Failed to add meal");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleMeal = async (
    meal: MealItem,
    date: string,
    mealType: string
  ): Promise<void> => {
    if (!user?.id || Platform.OS === 'web' || !scheduleMealInDb) return;

    try {
      setIsLoading(true);
      await scheduleMealInDb(
        user.id,
        date,
        mealType,
        meal.calories,
        meal.protein,
        undefined,
        undefined,
        { meals: [meal] }
      );
      await loadData();
      console.log("✅ Meal scheduled successfully");
    } catch (error) {
      console.error("❌ Error scheduling meal:", error);
      setError("Failed to schedule meal");
    } finally {
      setIsLoading(false);
    }
  };

  const saveMeal = async (meal: MealItem): Promise<void> => {
    if (!user?.id || Platform.OS === 'web') return;

    try {
      setIsLoading(true);
      await saveCustomRecipe(
        user.id,
        meal.recipeName,
        meal.ingredients || [],
        meal.instructions || [],
        meal.calories,
        meal.protein,
        meal.cookingTime || "30 min",
        meal.servings || 1,
        meal.mealType || "snacks"
      );
      await loadData();
      console.log("✅ Meal saved successfully");
    } catch (error) {
      console.error("❌ Error saving meal:", error);
      setError("Failed to save meal");
    } finally {
      setIsLoading(false);
    }
  };

  const addGeneratedMeal = (meal: MealItem) => {
    setGeneratedMeals(prev => [meal, ...prev]);
  };

  const addCustomMeal = async (meal: Partial<MealItem>) => {
    if (!user?.id || !meal.date) return;

    const newMeal: MealItem = {
      id: `custom-${Date.now()}`,
      recipeName: meal.name || "Custom Meal",
      name: meal.name || "Custom Meal",
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      consumed: true,
      ...meal,
    };

    if (Platform.OS !== 'web' && scheduleMealInDb) {
      await scheduleMealInDb(
        user.id,
        meal.date,
        meal.mealType || 'snack',
        newMeal.calories,
        newMeal.protein,
        undefined,
        undefined,
        { meals: [newMeal] }
      );
      await loadData(); // Refresh data
    }
  };

  const updateMealPlan = (date: string, plan: Partial<DailyMealPlan>) => {
    setDailyMealPlans((prev) => ({
      ...prev,
      [date]: { ...prev[date], ...plan } as DailyMealPlan,
    }));
  };

  const markMealConsumed = (mealId: string, consumed: boolean) => {
    setDailyMealPlans((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((date) => {
        updated[date] = {
          ...updated[date],
          meals: updated[date].meals.map((meal) =>
            meal.id === mealId ? { ...meal, consumed } : meal
          ),
        };
      });
      return updated;
    });
  };

  const updateWaterIntake = async (glasses: number) => {
    if (!user?.id || Platform.OS === 'web' || !updateWaterIntakeInDb) return;

    const today = getTodayMealPlan();
    if (today) {
      try {
        setIsLoading(true);
        await updateWaterIntakeInDb(user.id, todayString, glasses);
        // Optimistically update the UI
        updateMealPlan(todayString, { waterGlasses: glasses });
        // Refresh data from the source to ensure consistency
        await loadData();
      } catch (error) {
        console.error("❌ Error updating water intake in DB:", error);
        setError("Failed to update water intake.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleDailyTask = (taskId: string) => {
    const today = getTodayMealPlan();
    if (today) {
      const updatedTasks = today.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      updateMealPlan(todayString, { tasks: updatedTasks });
    }
  };

  const updateCurrentProgress = (calories: number, protein: number) => {
    const today = getTodayMealPlan();
    if (today) {
      updateMealPlan(todayString, {
        consumedCalories: calories,
        consumedProtein: protein,
      });
    }
  };

  const contextValue: MealContextType = {
    currentDayPlan: getTodayMealPlan(),
    selectedDate,
    dailyMealPlans,
    generatedMeals,
    savedMeals,
    isLoading,
    error,
    getMealPlanForDate,
    getTodayMealPlan,

    refreshMealData: loadData,
    addMealToToday,
    scheduleMeal,
    saveMeal,
    addGeneratedMeal,
    updateMealPlan,
    markMealConsumed,
    updateWaterIntake,
    toggleDailyTask,
    updateCurrentProgress,
    addCustomMeal,
  };

  return (
    <MealContext.Provider value={contextValue}>{children}</MealContext.Provider>
  );
};