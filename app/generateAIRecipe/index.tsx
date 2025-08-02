import Prom from "@/context/Prom";
import { GenerateRecipeAi } from "@/service/AiModel";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import Button from "../components/Button";
import IndividualRecipeOption from "../components/IndividualRecipeOption";
import DailyMealPlanGenerator from "../components/RecipeOption";

type Recipe = {
  RecipeName: string;
  ingredients: string[];
  Description: string;
};

const GenerateAIRecipe = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe[]>([]);

  const GenerateRecipeOption = async () => {
    setLoading(true);
    try {
      const PROMPT = input + Prom.GENERATE_RECIPE;
      const result = await GenerateRecipeAi(PROMPT);

      console.log("Raw AI result:", result);

      let cleanedString = (result ?? "")
        .toString()
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      console.log("Cleaned AI result:", cleanedString);

      let parsedRecipe;
      try {
        parsedRecipe = JSON.parse(cleanedString);
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        alert("AI response format invalid. Try rephrasing input.");
        setLoading(false);
        return;
      }

      const recipesArray = Array.isArray(parsedRecipe)
        ? parsedRecipe
        : parsedRecipe.recipes || [parsedRecipe];

      // ✅ Mapping correctly to match RecipeOption props
      const mappedRecipes: Recipe[] = recipesArray.map((item: any) => ({
        RecipeName: item.RecipeName ?? "",
        ingredients: item.Ingredients ?? [],
        Description: item.Description ?? "",
      }));

      setRecipe(mappedRecipes);
    } catch (error) {
      console.error("Error generating recipe:", error);
      alert("Failed to generate recipe. Please try again.");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Daily Meal Plan Generator</Text>
      <Text style={styles.subHeader}>
        Generate complete daily meal plans with detailed recipes, or create
        custom individual recipes.
      </Text>

      {/* Daily Meal Plan Generator - Main Feature */}
      <DailyMealPlanGenerator />

      {/* Divider */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 20,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: "#ddd",
          }}
        />
        <Text
          style={{
            marginHorizontal: 15,
            color: "#666",
            fontWeight: "500",
          }}
        >
          OR
        </Text>
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: "#ddd",
          }}
        />
      </View>

      {/* Individual Recipe Generator */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: "#333",
          marginBottom: 10,
        }}
      >
        🧑‍🍳 Custom Recipe Generator
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your ingredient or recipe name (e.g., 'chicken and rice' or 'vegetarian pasta')"
        placeholderTextColor="#999"
        multiline
        numberOfLines={4}
        value={input}
        onChangeText={setInput}
      />
      <View style={{ marginTop: 15 }}>
        <Button
          Data={"Generate Recipe"}
          color="black"
          onPress={GenerateRecipeOption}
          loading={loading}
        />
      </View>

      {recipe?.length > 0 && <IndividualRecipeOption recipeList={recipe} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "ios" ? 40 : undefined,
    padding: 20,
    backgroundColor: "#f9f9f9",
    width: "100%",
    height: "100%",
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#333",
  },
  subHeader: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  input: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 15,
    fontSize: 18,
    backgroundColor: "#fff",
    textAlignVertical: "top",
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default GenerateAIRecipe;
