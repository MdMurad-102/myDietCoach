import Prom from "@/context/Prom";
import { UserContext } from "@/context/UserContext";
import { api } from "@/convex/_generated/api";
import { GenerateRecipeAi } from "@/service/AiModel";
import { useMutation } from "convex/react";
import React, { useContext, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Loading from "./Loading";

const DailyMealPlanGenerator: React.FC = () => {
  const CreateMealPlan = useMutation(api.allRecipe.CreateMealPlan);
  const [loading, setLoading] = useState(false);
  const context = useContext(UserContext);

  if (!context)
    throw new Error("UserContext must be used within a UserProvider");
  const { user } = context;

  const generateDailyMealPlan = async () => {
    if (!user) {
      Alert.alert("Error", "Please log in to generate a meal plan");
      return;
    }

    // Check if user has completed their profile
    if (
      !user.calories ||
      !user.proteins ||
      !user.city ||
      !user.country ||
      !user.dietType ||
      !user.goal
    ) {
      Alert.alert(
        "Profile Incomplete",
        "Please complete your profile first (calories, protein, location, diet type, and goal) to generate a personalized meal plan.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);

    try {
      // Create prompt with user's profile data
      const userProfile = {
        calories: user.calories || 2000,
        proteins: user.proteins || 150,
        city: user.city || "Unknown City",
        country: user.country || "Unknown Country",
        dietType: user.dietType || "non-vegetarian",
        goal: user.goal || "maintenance",
      };

      const PROMPT = Prom.GENERATE_DAILY_MEAL_PLAN.replace(
        "[calories]",
        userProfile.calories.toString()
      )
        .replace("[proteins]", userProfile.proteins.toString())
        .replace("[city]", userProfile.city)
        .replace("[country]", userProfile.country)
        .replace("[dietType]", userProfile.dietType)
        .replace("[goal]", userProfile.goal);

      console.log("Generating daily meal plan with prompt:", PROMPT);

      const result = await GenerateRecipeAi(PROMPT);
      console.log("AI Meal Plan Result:", result);

      // Clean and parse the response
      let cleanedResult = (result ?? "")
        .toString()
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      // Find JSON object
      const firstBrace = cleanedResult.indexOf("{");
      const lastBrace = cleanedResult.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonString = cleanedResult.substring(firstBrace, lastBrace + 1);
        const parsedMealPlan = JSON.parse(jsonString);

        console.log("Parsed Meal Plan:", parsedMealPlan);

        // Validate meal plan structure (updated for new format)
        if (!parsedMealPlan.meals || !Array.isArray(parsedMealPlan.meals)) {
          throw new Error("Invalid meal plan structure - missing meals array");
        }

        // Validate that we have all 4 meal types
        const mealTypes = parsedMealPlan.meals.map(
          (meal: any) => meal.mealType
        );
        const requiredMeals = ["Breakfast", "Lunch", "Dinner", "Snacks"];
        const missingMeals = requiredMeals.filter(
          (meal) => !mealTypes.includes(meal)
        );

        if (missingMeals.length > 0) {
          console.warn("Missing meal types:", missingMeals);
          // Continue anyway but log the warning
        }

        // Save meal plan to database
        const planName =
          parsedMealPlan.planName ||
          `Daily Plan - ${new Date().toLocaleDateString()}`;

        await CreateMealPlan({
          userId: user._id,
          planName: planName,
          mealPlanData: parsedMealPlan,
          totalCalories: parsedMealPlan.totalCalories || userProfile.calories,
          totalProtein: parsedMealPlan.totalProtein || userProfile.proteins,
        });

        // Create detailed success message
        const mealSummary = parsedMealPlan.meals
          .map(
            (meal: any) =>
              `${meal.mealType}: ${meal.recipeName} (${meal.calories} cal)`
          )
          .join("\n");

        Alert.alert(
          "🍽️ Daily Meal Plan Created!",
          `Your personalized meal plan is ready!\n\n📊 SUMMARY:\nTotal Calories: ${parsedMealPlan.totalCalories} kcal\nTotal Protein: ${parsedMealPlan.totalProtein}g\nLocation: ${parsedMealPlan.location}\nDiet: ${parsedMealPlan.dietType}\n\n🍴 MEALS:\n${mealSummary}\n\nEach recipe includes detailed ingredients, cooking instructions, and nutrition tips!`,
          [{ text: "Great!" }]
        );
      } else {
        throw new Error("No valid JSON found in AI response");
      }
    } catch (error) {
      console.error("Error generating meal plan:", error);
      Alert.alert("Error", "Failed to generate meal plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={{ marginTop: 20 }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: "#333",
          marginBottom: 5,
          textAlign: "center",
        }}
      >
        🍽️ Daily Meal Plan Generator
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: "#666",
          marginBottom: 20,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        Generate a complete day of personalized recipes for breakfast, lunch,
        dinner, and snacks
      </Text>

      {user && (
        <>
          {/* Profile completeness check */}
          {(!user.calories ||
            !user.proteins ||
            !user.city ||
            !user.country ||
            !user.dietType ||
            !user.goal) && (
            <View
              style={{
                backgroundColor: "#fff3cd",
                borderColor: "#ffc107",
                borderWidth: 1,
                padding: 15,
                borderRadius: 10,
                marginBottom: 15,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#856404",
                  marginBottom: 8,
                }}
              >
                ⚠️ Profile Incomplete
              </Text>
              <Text style={{ fontSize: 14, color: "#856404", lineHeight: 18 }}>
                To generate a personalized meal plan, please complete your
                profile with:
                {!user.calories && "\n• Daily calorie target"}
                {!user.proteins && "\n• Daily protein target"}
                {!user.city && "\n• City"}
                {!user.country && "\n• Country"}
                {!user.dietType && "\n• Diet type (vegetarian/non-vegetarian)"}
                {!user.goal && "\n• Fitness goal"}
              </Text>
            </View>
          )}

          <View
            style={{
              backgroundColor: "#f0f8ff",
              padding: 15,
              borderRadius: 10,
              marginBottom: 15,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#333",
                marginBottom: 8,
              }}
            >
              Your Profile:
            </Text>
            <Text style={{ fontSize: 14, color: "#666" }}>
              📍 Location: {user.city || "Not set"}, {user.country || "Not set"}
            </Text>
            <Text style={{ fontSize: 14, color: "#666" }}>
              🥗 Diet: {user.dietType || "Not set"}
            </Text>
            <Text style={{ fontSize: 14, color: "#666" }}>
              🎯 Goal: {user.goal || "Not set"}
            </Text>
            <Text style={{ fontSize: 14, color: "#666" }}>
              🔥 Target Calories: {user.calories || "Not set"}
            </Text>
            <Text style={{ fontSize: 14, color: "#666" }}>
              💪 Target Protein: {user.proteins || "Not set"}g
            </Text>
          </View>
        </>
      )}

      <TouchableOpacity
        onPress={generateDailyMealPlan}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#ccc" : "#4CAF50",
          padding: 15,
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: "white",
            fontWeight: "600",
          }}
        >
          {loading
            ? "Generating Your Meal Plan..."
            : "🍽️ Generate Daily Meal Plan"}
        </Text>
      </TouchableOpacity>

      <View
        style={{
          backgroundColor: "#e8f5e8",
          padding: 15,
          borderRadius: 10,
          marginBottom: 15,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: "#2e7d32",
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          ✨ Get a complete daily meal plan with detailed recipes for:
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#2e7d32",
            textAlign: "center",
            fontWeight: "600",
            marginTop: 5,
          }}
        >
          🌅 Breakfast • 🍽️ Lunch • 🌙 Dinner • 🍎 Snacks
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: "#388e3c",
            textAlign: "center",
            marginTop: 8,
            fontStyle: "italic",
          }}
        >
          Each recipe includes ingredients, step-by-step instructions, cooking
          times, and nutrition tips based on your location and preferences!
        </Text>
      </View>

      <Loading loading={loading} />
    </View>
  );
};

export default DailyMealPlanGenerator;
