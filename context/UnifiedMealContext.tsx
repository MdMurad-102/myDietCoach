// Unified MealContext - PostgreSQL Version
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addMealToDate,
  getMealsForDate,
  getUserMealPlans,
  saveCustomRecipe,
  saveDailyMealPlan,
  updateMealConsumedAPI,
  updateWaterIntakeAPI
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

  // Always get fresh today's date - recalculate on every render to ensure accuracy
  const todayString = useMemo(() => getLocalDateString(new Date()), []);

  console.log('📅 Today\'s date string:', todayString);

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

      // Store current consumed states before loading new data
      const currentConsumedStates: Record<string, boolean> = {};
      Object.values(dailyMealPlans).forEach(plan => {
        plan.meals.forEach(meal => {
          if (meal.consumed) {
            currentConsumedStates[meal.id] = true;
          }
        });
      });

      plans.forEach((plan: any) => {
        // scheduled_date from database - extract YYYY-MM-DD only
        let planDate = plan.scheduled_date || todayString;

        // If scheduled_date contains timestamp, extract date part only
        if (planDate.includes('T')) {
          planDate = planDate.split('T')[0];
        }

        console.log('📅 Processing plan for date:', planDate, '(today is:', todayString, ')');

        const mealPlanData = plan.meal_plan_data || {};
        const allMeals: MealItem[] = [];

        // Combine all meal types into one meals array
        // Handle both 'snack' and 'snacks' for backwards compatibility
        ['breakfast', 'lunch', 'dinner', 'snacks', 'snack'].forEach((mealType) => {
          const meal = mealPlanData[mealType];
          if (meal && !allMeals.some(m => m.id === meal.id)) {  // Avoid duplicates
            const normalizedMealType = mealType === 'snack' ? 'snacks' : mealType;

            // Preserve local consumed state if it exists, otherwise use database value
            const consumedState = currentConsumedStates[meal.id] !== undefined
              ? currentConsumedStates[meal.id]
              : (meal.consumed || false);

            allMeals.push({
              ...meal,
              id: meal.id || `${normalizedMealType}-${Date.now()}`,
              recipeName: meal.recipeName || meal.name || 'Unnamed Meal',
              name: meal.recipeName || meal.name,
              mealType: normalizedMealType,
              consumed: consumedState,
              calories: meal.calories || 0,
              protein: meal.protein || 0,
              carbs: meal.carbs,
              fat: meal.fat,
            });
          }
        });

        // Calculate consumed calories and protein from meals with consumed: true
        const consumedCalories = allMeals
          .filter(meal => meal.consumed)
          .reduce((sum, meal) => sum + (meal.calories || 0), 0);

        const consumedProtein = allMeals
          .filter(meal => meal.consumed)
          .reduce((sum, meal) => sum + (meal.protein || 0), 0);

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
          consumedCalories: consumedCalories,
          consumedProtein: consumedProtein,
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

              // Preserve local consumed state if it exists, otherwise use database value
              const consumedState = currentConsumedStates[meal.id] !== undefined
                ? currentConsumedStates[meal.id]
                : (meal.consumed || false);

              allMeals.push({
                ...meal,
                id: meal.id || `${normalizedMealType}-${Date.now()}`,
                recipeName: meal.recipeName || meal.name || 'Unnamed Meal',
                name: meal.recipeName || meal.name,
                mealType: normalizedMealType,
                consumed: consumedState,
                calories: meal.calories || 0,
                protein: meal.protein || 0,
                carbs: meal.carbs,
                fat: meal.fat,
              });
            }
          });

          // Calculate consumed calories and protein from meals with consumed: true
          const consumedCalories = allMeals
            .filter(meal => meal.consumed)
            .reduce((sum, meal) => sum + (meal.calories || 0), 0);

          const consumedProtein = allMeals
            .filter(meal => meal.consumed)
            .reduce((sum, meal) => sum + (meal.protein || 0), 0);

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
            consumedCalories: consumedCalories,
            consumedProtein: consumedProtein,
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

      console.log("💾 Saving full daily meal plan for date:", date);
      console.log("💾 Date type:", typeof date, "- Value:", date);
      await saveDailyMealPlan(user.id, date, meals);
      await loadData();
      console.log("✅ Full daily plan saved successfully for:", date);
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

  const markMealConsumed = async (mealId: string, consumed: boolean) => {
    if (!user?.id) return;

    const freshTodayString = getLocalDateString(new Date());
    console.log('🔍 Marking meal consumed:', { mealId, consumed, todayString: freshTodayString });

    // ONLY allow marking meals from TODAY
    // Find if this meal exists in today's plan
    const todayPlan = dailyMealPlans[freshTodayString];

    if (!todayPlan) {
      console.log('⚠️ No meal plan for today found');
      return;
    }

    const mealInToday = todayPlan.meals.find(meal => meal.id === mealId);

    if (!mealInToday) {
      console.log(`⚠️ Meal ${mealId} is not in today's plan. Ignoring click.`);
      return; // Don't allow marking meals from past dates
    }

    console.log('✅ Meal found in today\'s plan, proceeding with update');

    // Optimistically update UI immediately for TODAY ONLY
    setDailyMealPlans((prev) => {
      const updated = { ...prev };

      // Only update today's plan
      if (updated[freshTodayString]) {
        const plan = updated[freshTodayString];

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

        updated[freshTodayString] = {
          ...plan,
          meals: updatedMeals,
          consumedCalories,
          consumedProtein,
        };
      }

      return updated;
    });

    // Persist to database in the background
    try {
      const result = await updateMealConsumedAPI(user.id, freshTodayString, mealId, consumed);

      // Check if meal was found in database
      if (result && result.notFound) {
        console.log(`ℹ️ Meal ${mealId} not in database, keeping UI-only state`);
        return; // Don't rollback, keep the UI state
      }

      console.log(`✅ Meal ${mealId} consumed state updated to ${consumed} in database`);
    } catch (error) {
      console.error("❌ Error persisting meal consumed state:", error);

      // Rollback on error - only update today's plan
      setDailyMealPlans((prev) => {
        const updated = { ...prev };

        if (updated[freshTodayString]) {
          const plan = updated[freshTodayString];
          const updatedMeals = plan.meals.map((meal) =>
            meal.id === mealId ? { ...meal, consumed: !consumed } : meal
          );

          const consumedCalories = updatedMeals
            .filter(meal => meal.consumed)
            .reduce((sum, meal) => sum + (meal.calories || 0), 0);

          const consumedProtein = updatedMeals
            .filter(meal => meal.consumed)
            .reduce((sum, meal) => sum + (meal.protein || 0), 0);

          updated[freshTodayString] = {
            ...plan,
            meals: updatedMeals,
            consumedCalories,
            consumedProtein,
          };
        }

        return updated;
      });

      // Only show error if it's not a "meal not found" error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('404')) {
        setError("Failed to update meal status. Please try again.");
      }
    }
  };

  const updateWaterIntake = async (glasses: number) => {
    if (!user?.id) return;

    try {
      // Optimistically update the UI immediately (no loading state)
      setDailyMealPlans((prev) => {
        const updated = { ...prev };
        if (updated[todayString]) {
          updated[todayString] = {
            ...updated[todayString],
            waterGlasses: glasses
          };
        }
        return updated;
      });

      // Use dedicated water-only endpoint (completely independent from meals)
      await updateWaterIntakeAPI(user.id, todayString, glasses);

    } catch (error) {
      console.error("❌ Error updating water intake:", error);

      // Rollback on error
      setDailyMealPlans((prev) => {
        const updated = { ...prev };
        if (updated[todayString]) {
          updated[todayString] = {
            ...updated[todayString],
            waterGlasses: (updated[todayString].waterGlasses || 0) - (glasses > (updated[todayString].waterGlasses || 0) ? 1 : -1)
          };
        }
        return updated;
      });

      setError("Failed to update water intake.");
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