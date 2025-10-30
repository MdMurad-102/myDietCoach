// Unified MealContext - PostgreSQL Version
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  addMealToDate,
  getMealsForDate,
  getUserMealPlans,
  saveCustomRecipe,
  saveDailyMealPlan
} from "../service/api";
import { UserContext } from "./UserContext";

export interface MealItem {
  id: string;
  recipeName: string;
  name?: string; // English name (or general name)
  nameBn?: string; // Bangla name
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
  date?: string; // Date the meal is scheduled for
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
  saveFullDailyPlan: (
    date: string,
    meals: {
      breakfast?: MealItem;
      lunch?: MealItem;
      dinner?: MealItem;
      snacks?: MealItem;
    }
  ) => Promise<void>;
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

  // Helper function to get local date string (YYYY-MM-DD) without timezone issues
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [dailyMealPlans, setDailyMealPlans] = useState<
    Record<string, DailyMealPlan>
  >({});
  const [generatedMeals, setGeneratedMeals] = useState<MealItem[]>([]);
  const [savedMeals, setSavedMeals] = useState<MealItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    getLocalDateString(new Date())
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayString = getLocalDateString(new Date());

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);

    try {
      // No more custom recipes - using scheduled_meals only
      console.log('ℹ️ Using scheduled_meals as single source for all meals');
      setSavedMeals([]);

      // Load meal plans from scheduled_meals table
      console.log('🔄 Loading meal plans for user:', user.id);
      const plans = await getUserMealPlans(user.id);
      console.log('✅ Loaded meal plans:', plans.length);
      const plansMap: Record<string, DailyMealPlan> = {};

      plans.forEach((plan: any) => {
        // scheduled_date comes from database as YYYY-MM-DD string, use it directly
        const planDate = plan.scheduled_date || todayString;
        console.log('📅 Processing plan for date:', planDate, '(scheduled_date:', plan.scheduled_date, ')');

        const mealPlanData = plan.meal_plan_data || {};
        const allMeals: MealItem[] = [];

        // Combine all meal types into one meals array
        // Handle both 'snack' and 'snacks' for backwards compatibility
        ['breakfast', 'lunch', 'dinner', 'snacks', 'snack'].forEach((mealType) => {
          const meal = mealPlanData[mealType];
          if (meal && !allMeals.some(m => m.id === meal.id)) {  // Avoid duplicates
            const normalizedMealType = mealType === 'snack' ? 'snacks' : mealType;
            allMeals.push({
              ...meal,
              id: meal.id || `${normalizedMealType}-${Date.now()}`,
              recipeName: meal.recipeName || meal.name || 'Unnamed Meal',
              name: meal.recipeName || meal.name,
              mealType: normalizedMealType,
              consumed: meal.consumed || false,
              calories: meal.calories || 0,
              protein: meal.protein || 0,
              carbs: meal.carbs,
              fat: meal.fat,
            });
          }
        });

        plansMap[planDate] = {
          id: plan.id?.toString() || planDate,
          date: planDate,
          meals: allMeals,
          waterGlasses: mealPlanData.waterGlasses || 0,
          tasks: mealPlanData.tasks || [],
          goals: {
            calories: user?.calories || 2000,
            protein: user?.proteins || 150,
            water: user?.daily_water_goal || 8,
          },
          totalCalories: plan.total_calories || 0,
          totalProtein: plan.total_protein || 0,
          consumedCalories: plan.calories_consumed || 0,
          consumedProtein: plan.protein_consumed || 0,
        };
      });

      console.log('📊 Loaded plans map:', Object.keys(plansMap).length, 'dates');
      console.log('📋 Plan dates:', Object.keys(plansMap).join(', '));
      setDailyMealPlans(plansMap);

      // Load today's meal plan specifically
      try {
        const todayData = await getMealsForDate(user.id, todayString);
        console.log('📅 Today\'s meal data:', todayData);

        if (todayData && todayData.meals) {
          const mealPlanData = todayData.meals;
          const allMeals: MealItem[] = [];

          // Handle both 'snack' and 'snacks' for backwards compatibility
          ['breakfast', 'lunch', 'dinner', 'snacks', 'snack'].forEach((mealType) => {
            const meal = mealPlanData[mealType];
            if (meal && !allMeals.some(m => m.id === meal.id)) {  // Avoid duplicates
              const normalizedMealType = mealType === 'snack' ? 'snacks' : mealType;
              allMeals.push({
                ...meal,
                id: meal.id || `${normalizedMealType}-${Date.now()}`,
                recipeName: meal.recipeName || meal.name || 'Unnamed Meal',
                name: meal.recipeName || meal.name,
                mealType: normalizedMealType,
                consumed: meal.consumed || false,
                calories: meal.calories || 0,
                protein: meal.protein || 0,
                carbs: meal.carbs,
                fat: meal.fat,
              });
            }
          });

          const todayPlan: DailyMealPlan = {
            id: todayData.id?.toString() || todayString,
            date: todayString,
            meals: allMeals,
            waterGlasses: mealPlanData.waterGlasses || 0,
            tasks: mealPlanData.tasks || [],
            goals: {
              calories: user?.calories || 2000,
              protein: user?.proteins || 150,
              water: user?.daily_water_goal || 8,
            },
            totalCalories: todayData.totalCalories || 0,
            totalProtein: todayData.totalProtein || 0,
            consumedCalories: todayData.caloriesConsumed || 0,
            consumedProtein: todayData.proteinConsumed || 0,
          };

          setDailyMealPlans(prev => ({
            ...prev,
            [todayString]: todayPlan
          }));
        }
      } catch (todayError) {
        console.log('ℹ️ No meals for today yet:', todayError);
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
    if (!user?.id) {
      throw new Error("User not logged in");
    }

    try {
      setIsLoading(true);
      setError(null);

      const mealType = (meal.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks') || 'snacks';
      const mealData = {
        id: `${mealType}-${Date.now()}`,
        recipeName: meal.recipeName || meal.name || "Custom Meal",
        name: meal.name || meal.recipeName || "Custom Meal",
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        carbs: meal.carbs,
        fat: meal.fat,
        ingredients: meal.ingredients,
        instructions: meal.instructions,
        cookingTime: meal.cookingTime,
        servings: meal.servings,
        consumed: false,
        mealType,
      };

      await addMealToDate(user.id, todayString, mealType, mealData);
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
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const mealTypeFormatted = mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks';
      await addMealToDate(user.id, date, mealTypeFormatted, meal);
      await loadData();
      console.log("✅ Meal scheduled successfully");
    } catch (error) {
      console.error("❌ Error scheduling meal:", error);
      setError("Failed to schedule meal");
    } finally {
      setIsLoading(false);
    }
  };

  const saveFullDailyPlan = async (
    date: string,
    meals: {
      breakfast?: MealItem;
      lunch?: MealItem;
      dinner?: MealItem;
      snacks?: MealItem;
    }
  ): Promise<void> => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log("💾 Saving full daily meal plan for:", date);
      await saveDailyMealPlan(user.id, date, meals);
      await loadData();
      console.log("✅ Full daily plan saved successfully");
    } catch (error) {
      console.error("❌ Error saving full daily plan:", error);
      setError("Failed to save daily meal plan");
      throw error;
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

    const mealType = (meal.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks') || 'snacks';
    await addMealToDate(user.id, meal.date, mealType, newMeal);
    await loadData(); // Refresh data
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
        const plan = updated[date];

        // Update the meal's consumed state
        const updatedMeals = plan.meals.map((meal) =>
          meal.id === mealId ? { ...meal, consumed } : meal
        );

        // Recalculate consumed calories and protein based on consumed meals
        const consumedCalories = updatedMeals
          .filter(meal => meal.consumed)
          .reduce((sum, meal) => sum + (meal.calories || 0), 0);

        const consumedProtein = updatedMeals
          .filter(meal => meal.consumed)
          .reduce((sum, meal) => sum + (meal.protein || 0), 0);

        updated[date] = {
          ...plan,
          meals: updatedMeals,
          consumedCalories,
          consumedProtein,
        };
      });
      return updated;
    });
  };

  const updateWaterIntake = async (glasses: number) => {
    if (!user?.id) return;

    const today = getTodayMealPlan();
    if (today) {
      try {
        setIsLoading(true);

        // Get current meal plan data from API
        const todayData = await getMealsForDate(user.id, todayString);
        console.log('💧 Current data from API:', JSON.stringify(todayData, null, 2));

        // Get existing meals (breakfast, lunch, dinner, snacks)
        const existingMeals = todayData?.meals || {};
        console.log('🍽️ Existing meals:', JSON.stringify(existingMeals, null, 2));

        // Update water intake while preserving existing meals
        const updatedMealPlanData = {
          ...existingMeals,
          waterGlasses: glasses
        };
        console.log('💾 Data to save:', JSON.stringify(updatedMealPlanData, null, 2));

        // Save the updated plan with preserved meals
        await saveDailyMealPlan(user.id, todayString, updatedMealPlanData);

        // Optimistically update the UI
        updateMealPlan(todayString, { waterGlasses: glasses });

        // Refresh data from the source to ensure consistency
        await loadData();
      } catch (error) {
        console.error("❌ Error updating water intake:", error);
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
    saveFullDailyPlan,
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