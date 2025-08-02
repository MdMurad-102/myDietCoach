import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import Button from "./Button";

const MealsPaln = () => {
  const [MealsPaln, setMealsPaln] = React.useState();
  const router = useRouter();
  return (
    <View
      style={{
        marginTop: 15,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#333",
          marginBottom: 10,
          paddingHorizontal: 10,
          backgroundColor: "#f8f8f8",
          borderRadius: 10,
          paddingVertical: 10,
          shadowColor: "#000",
        }}
      >
        🍽️ Today's Daily Meal Plan
      </Text>
      {!MealsPaln && (
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            backgroundColor: "#f8f8f8",
            borderRadius: 10,
          }}
        >
          <MaterialCommunityIcons name="calendar-plus" size={40} color="#888" />
          <Text
            style={{
              fontSize: 16,
              color: "#888",
              marginTop: 10,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            You Don't Have any meal plan for Today
          </Text>
          <Button
            Data={"Generate Daily Meal Plan"}
            color="blue"
            onPress={() => router.push("/generateAIRecipe")}
          />
        </View>
      )}
    </View>
  );
};

export default MealsPaln;
