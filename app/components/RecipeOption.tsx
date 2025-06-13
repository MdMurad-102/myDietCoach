import Prom from "@/context/Prom";
import { GenerateRecipeAi } from "@/service/AiModel";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Loading from "./Loading";
import axios from "axios";

type Recipe = {
  RecipeName: string;
  ingredients: string[];
  Description: string;
};

type RecipeOptionProps = {
  recipeList: Recipe[];
};

const RecipeOption: React.FC<RecipeOptionProps> = ({ recipeList }) => {

  if (!recipeList || recipeList.length === 0) {
    return (
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
          No recipes available.
        </Text>
      </View>
    );
  }
  const [loading , setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const onRecipeOptionPress = async (recipe: Recipe) => {
    setLoading(true);
    console.log("Selected Recipe:", recipe);
    const PROMT ="RecipeName:"+recipe?.RecipeName +"Description:"+recipe?.Description +Prom.GENERATE_COMPLITE_RECIPE;
    try {
      //console.log("Prompt for AI:", PROMT);
      const result = await GenerateRecipeAi(PROMT);
      console.log("AI Result:", result);
      let cleanedString = (result ?? "")
        .toString()
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      console.log("Cleaned AI result:", cleanedString);
      let parsedRecipe;
      parsedRecipe = JSON.parse(cleanedString);
      console.log("Parsed Recipe:", parsedRecipe);
      console.log("this is image promt", parsedRecipe?.imagePrompt);
      //Generate recipe image 
    //   const prompt = parsedRecipe?.imagePrompt || "Generate an image of a delicious dish";
    //   const response = await axios.post(
    //     "http://192.168.1.109:5000/generate-image",
    //     { prompt }
    //   );
    //   const data = response.data as { image: string };
    //   setImageUrl(data.image);
    //   console.log("Generated Image URL:", data.image);
      //save all the data to the database
      //show the recipe details screen
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      alert("AI response format invalid. Try rephrasing input.");
      return;
    }
   
    setLoading(false);
  }
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
              RecipeName:{item.RecipeName}
            </Text>
            <Text style={{ fontSize: 14, color: "#999" }}>
              Description: {item.Description}
            </Text>
            {/* <Text style={{ fontSize: 14, color: "#777", fontWeight: "bold" }}>
              Ingredients: {item.ingredients.join(", ")}
            </Text> */}
          </TouchableOpacity>
        ))}
      </View>
      <Loading loading={loading} />
    </View>
  );
};

export default RecipeOption;
