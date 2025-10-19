// Unified MealContext - PostgreSQL Version
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Platform } from "react-native";
import { UserContext } from "./UserContext";
import {
  getUserRecipes,
  getUserMealPlans,
  createMealPlan,
  saveCustomRecipe,
} from "../service/api";

// Only import database on native platforms
let getTodayMealPlan: any, updateMealInPlan: any, scheduleMeal: any;
if (Platform.OS !== 'web') {
  const recipes = require("../database/recipes");
  getTodayMealPlan = recipes.getTodayMealPlan;
  updateMealInPlan = recipes.updateMealInPlan;
  scheduleMeal = recipes.scheduleMeal;
}

export interface MealItem {
  id: string;
  recipeName: string;
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
  // Current state
  currentDayPlan: DailyMealPlan | null;
  selectedDate: string;

  // Meal data
  dailyMealPlans: Record<string, DailyMealPlan>;
  generatedMeals: MealItem[];
  savedMeals: MealItem[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Core functions
  getMealPlanForDate: (date: string) => DailyMealPlan | null;
  getTodayMealPlan: () => DailyMealPlan | null;
  refreshMealData: () => void;

  // Meal management
  addMealToToday: (meal: Partial<MealItem>) => Promise<void>;
  scheduleMeal: (
    meal: MealItem,
    date: string,
    mealType: string
  ) => Promise<void>;
  saveMeal: (meal: MealItem) => Promise<void>;
  addGeneratedMeal: (meal: MealItem) => void;
  updateMealPlan: (date: string, plan: Partial<DailyMealPlan>) => void;

  // Tracking functions
  markMealConsumed: (mealId: string, consumed: boolean) => void;
  updateWaterIntake: (glasses: number) => void;
  toggleDailyTask: (taskId: string) => void;
  updateCurrentProgress: (calories: number, protein: number) => void;
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

  // State
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
  const [currentDayPlan, setCurrentDayPlan] = useState<DailyMealPlan | null>(
    null
  );

  const todayString = new Date().toISOString().split("T")[0];

  // Load user recipes
  useEffect(() => {
    async function loadRecipes() {
      if (!user?.id) return;

      // Skip API calls on web - use empty data
      if (Platform.OS === 'web') {
        setSavedMeals([]);
        return;
      }

      try {
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
      } catch (error) {
        console.error('Error loading recipes:', error);
        setSavedMeals([]);
      }
    }

    loadRecipes();
  }, [user?.id]);

  // Load meal plans
  useEffect(() => {
    async function loadMealPlans() {
      if (!user?.id) return;

      // Skip API calls on web - use empty data
      if (Platform.OS === 'web') {
        setDailyMealPlans({});
        return;
      }

      try {
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
      } catch (error) {
        console.error('Error loading meal plans:', error);
        setDailyMealPlans({});
      }
    }

    loadMealPlans();
  }, [user?.id, todayString]);

  // Load today's meal plan
  useEffect(() => {
    async function loadTodayPlan() {
      if (!user?.id) return;

      // Skip database call on web
      if (Platform.OS === 'web' || !getTodayMealPlan) {
        return;
      }

      try {
        const todayPlan = await getTodayMealPlan(user.id, todayString);
        if (todayPlan) {
          const plan: DailyMealPlan = {
            id: todayPlan.id.toString(),
            date: todayPlan.scheduled_date,
            meals: todayPlan.meal_plan_data?.meals || [],
            waterGlasses: 0,
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
          setCurrentDayPlan(plan);
        }
      } catch (error) {
        console.error('Error loading today plan:', error);
      }
    }

    loadTodayPlan();
  }, [user?.id, todayString]);

  // Core functions
  const getMealPlanForDate = (date: string): DailyMealPlan | null => {
    return dailyMealPlans[date] || null;
  };

  const getTodayMealPlanFunc = (): DailyMealPlan | null => {
    return getMealPlanForDate(todayString);
  };

  const refreshMealData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Reload recipes
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

      // Reload meal plans
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

      // Also reload today's scheduled meal plan specifically
      if (Platform.OS !== 'web' && getTodayMealPlan) {
        const todayPlan = await getTodayMealPlan(user.id, todayString);
        if (todayPlan) {
          const plan: DailyMealPlan = {
            id: todayPlan.id.toString(),
            date: todayPlan.scheduled_date,
            meals: todayPlan.meal_plan_data?.meals || [],
            waterGlasses: 0,
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
          setCurrentDayPlan(plan);
        }
      }
    } catch (error) {
      console.error('Error refreshing meal data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, todayString]);

  const addMealToToday = async (meal: Partial<MealItem>): Promise<void> => {
    if (!user?.id) {
      throw new Error("User not logged in");
    }

    try {
      setIsLoading(true);
      setError(null);

      const mealData = {
        recipeName: meal.recipeName || "Custom Meal",
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        ingredients: meal.ingredients || [],
        instructions: meal.instructions || [],
        cookingTime: meal.cookingTime || "15 min",
        servings: meal.servings || 1,
        mealType: meal.mealType || "snacks",
      };

      // Get current plan or create new one
      let todayPlan = await getTodayMealPlan(user.id, todayString);

      if (!todayPlan) {
        // Create new meal plan for today
        await scheduleMeal(
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
        // Update existing plan
        const currentMeals = todayPlan.meal_plan_data?.meals || [];
        const updatedMealPlanData = {
          ...todayPlan.meal_plan_data,
          meals: [...currentMeals, mealData]
        };

        await updateMealInPlan(todayPlan.id, updatedMealPlanData);
      }

      // Refresh data
      await refreshMealData();

      console.log("✅ Meal added to today successfully:", mealData.recipeName);
    } catch (error) {
      console.error("❌ Error adding meal to today:", error);
      setError("Failed to add meal");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleMealFunc = async (
    meal: MealItem,
    date: string,
    mealType: string
  ): Promise<void> => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      await scheduleMeal(
        user.id,
        date,
        mealType,
        meal.calories,
        meal.protein,
        undefined,
        undefined,
        { meals: [meal] }
      );

      await refreshMealData();
      console.log("✅ Meal scheduled successfully");
    } catch (error) {
      console.error("❌ Error scheduling meal:", error);
      setError("Failed to schedule meal");
    } finally {
      setIsLoading(false);
    }
  };

  const saveMeal = async (meal: MealItem): Promise<void> => {
    if (!user?.id) return;

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

      await refreshMealData();
      console.log("✅ Meal saved successfully");
    } catch (error) {
      console.error("❌ Error saving meal:", error);
      setError("Failed to save meal");
    } finally {
      setIsLoading(false);
    }
  };

  const addGeneratedMeal = (meal: MealItem) => {
    setGeneratedMeals((prev) => [...prev, meal]);
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

  const updateWaterIntake = (glasses: number) => {
    const today = getTodayMealPlanFunc();
    if (today) {
      updateMealPlan(todayString, { waterGlasses: glasses });
    }
  };

  const toggleDailyTask = (taskId: string) => {
    const today = getTodayMealPlanFunc();
    if (today) {
      const updatedTasks = today.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      updateMealPlan(todayString, { tasks: updatedTasks });
    }
  };

  const updateCurrentProgress = (calories: number, protein: number) => {
    const today = getTodayMealPlanFunc();
    if (today) {
      updateMealPlan(todayString, {
        consumedCalories: calories,
        consumedProtein: protein,
      });
    }
  };

  const contextValue: MealContextType = {
    currentDayPlan,
    selectedDate,
    dailyMealPlans,
    generatedMeals,
    savedMeals,
    isLoading,
    error,
    getMealPlanForDate,
    getTodayMealPlan: getTodayMealPlanFunc,
    refreshMealData,
    addMealToToday,
    scheduleMeal: scheduleMealFunc,
    saveMeal,
    addGeneratedMeal,
    updateMealPlan,
    markMealConsumed,
    updateWaterIntake,
    toggleDailyTask,
    updateCurrentProgress,
  };

  return (
    <MealContext.Provider value={contextValue}>{children}</MealContext.Provider>
  );
};
