import Prom from "@/context/Prom";
import { UserContext } from "@/context/UserContext";
import { api } from "@/convex/_generated/api";
import { GenerateRecipeAi } from "@/service/AiModel";
import { useMutation } from "convex/react";
import React, { useContext, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Loading from "./Loading";

type Recipe = {
  RecipeName: string;
  ingredients: string[];
  Description: string;
};

type IndividualRecipeOptionProps = {
  recipeList: Recipe[];
};

const IndividualRecipeOption: React.FC<IndividualRecipeOptionProps> = ({
  recipeList,
}) => {
  const CreateRecipe = useMutation(api.allRecipe.CreateRecipe);

  if (!recipeList || recipeList.length === 0) {
    return null;
  }

  const [loading, setLoading] = useState(false);
  const context = useContext(UserContext);

  if (!context)
    throw new Error("UserContext must be used within a UserProvider");
  const { user } = context;

  const onRecipeOptionPress = async (recipe: Recipe) => {
    setLoading(true);
    console.log("Selected Recipe:", recipe);

    const PROMPT = `RecipeName: ${recipe?.RecipeName}
Description: ${recipe?.Description}
${Prom.GENERATE_COMPLITE_RECIPE}`;

    try {
      const result = await GenerateRecipeAi(PROMPT);
      console.log("AI Result:", result);

      // Clean and parse the response
      let cleanedString = (result ?? "")
        .toString()
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      // Find JSON object
      const firstBrace = cleanedString.indexOf("{");
      const lastBrace = cleanedString.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonString = cleanedString.substring(firstBrace, lastBrace + 1);
        const parsedRecipe = JSON.parse(jsonString);

        console.log("Parsed Recipe:", parsedRecipe);

        // Save recipe to database
        if (!user?._id) {
          throw new Error("User ID is missing. Cannot create recipe.");
        }

        console.log("User ID:", user._id);
        const savedRecipe = await CreateRecipe({
          jsonData: parsedRecipe,
          imageUrl: "placeholder-image-url",
          recipeName: recipe?.RecipeName,
          uid: user._id,
        });

        Alert.alert(
          "Recipe Created!",
          `${recipe.RecipeName} has been saved to your recipes!`,
          [{ text: "OK" }]
        );
      } else {
        throw new Error("No valid JSON found in AI response");
      }
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      Alert.alert("Error", "AI response format invalid. Try again.");
    }

    setLoading(false);
  };

  return (
    <View style={{ marginTop: 20 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#333",
          marginBottom: 10,
        }}
      >
        Select Recipe
      </Text>
      <View>
        {recipeList.map((item, index) => (
          <TouchableOpacity
            onPress={() => onRecipeOptionPress(item)}
            key={index}
            style={{
              marginBottom: 12,
              borderWidth: 0.2,
              borderColor: "#ddd",
              borderRadius: 8,
              padding: 10,
              backgroundColor: "#f9f9f9",
            }}
          >
            <Text style={{ fontSize: 16, color: "#555", fontWeight: "bold" }}>
              RecipeName: {item.RecipeName}
            </Text>
            <Text style={{ fontSize: 14, color: "#999" }}>
              Description: {item.Description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Loading loading={loading} />
    </View>
  );
};

export default IndividualRecipeOption;
