import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "@/context/UserContext";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface CustomRecipeManagerProps {
  visible: boolean;
  onClose: () => void;
  selectedDate?: string; // Optional pre-selected date
}

export default function CustomRecipeManager({
  visible,
  onClose,
  selectedDate,
}: CustomRecipeManagerProps) {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("UserContext must be used within a UserProvider");
  const { user } = context;

  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [instructions, setInstructions] = useState([""]);
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [servings, setServings] = useState("");
  const [mealType, setMealType] = useState("Breakfast");
  const [favoriteDate, setFavoriteDate] = useState(selectedDate || "");
  const [tags, setTags] = useState("");

  const saveCustomRecipe = useMutation(api.allRecipe.SaveCustomRecipe);

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (
      !user ||
      !recipeName.trim() ||
      ingredients.some((ing) => !ing.trim()) ||
      instructions.some((inst) => !inst.trim())
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      await saveCustomRecipe({
        userId: user._id,
        recipeName: recipeName.trim(),
        ingredients: ingredients.filter((ing) => ing.trim()),
        instructions: instructions.filter((inst) => inst.trim()),
        calories: parseInt(calories) || 0,
        protein: parseInt(protein) || 0,
        cookingTime: cookingTime.trim(),
        servings: parseInt(servings) || 1,
        mealType,
        favoriteDate: favoriteDate || undefined,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      });

      Alert.alert("Success", "Custom recipe saved successfully!");
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error saving custom recipe:", error);
      Alert.alert("Error", "Failed to save custom recipe");
    }
  };

  const resetForm = () => {
    setRecipeName("");
    setIngredients([""]);
    setInstructions([""]);
    setCalories("");
    setProtein("");
    setCookingTime("");
    setServings("");
    setMealType("Breakfast");
    setFavoriteDate(selectedDate || "");
    setTags("");
  };

  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Custom Recipe</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Recipe Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recipe Name *</Text>
            <TextInput
              style={styles.input}
              value={recipeName}
              onChangeText={setRecipeName}
              placeholder="Enter recipe name"
              placeholderTextColor="#999"
            />
          </View>

          {/* Meal Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meal Type</Text>
            <View style={styles.mealTypeContainer}>
              {mealTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.mealTypeButton,
                    mealType === type && styles.mealTypeButtonActive,
                  ]}
                  onPress={() => setMealType(type)}
                >
                  <Text
                    style={[
                      styles.mealTypeText,
                      mealType === type && styles.mealTypeTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Nutrition Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition Info</Text>
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionItem}>
                <Text style={styles.inputLabel}>Calories</Text>
                <TextInput
                  style={styles.smallInput}
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.smallInput}
                  value={protein}
                  onChangeText={setProtein}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.inputLabel}>Servings</Text>
                <TextInput
                  style={styles.smallInput}
                  value={servings}
                  onChangeText={setServings}
                  placeholder="1"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          {/* Cooking Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cooking Time</Text>
            <TextInput
              style={styles.input}
              value={cookingTime}
              onChangeText={setCookingTime}
              placeholder="e.g., 30 minutes"
              placeholderTextColor="#999"
            />
          </View>

          {/* Favorite Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorite Date (Optional)</Text>
            <TextInput
              style={styles.input}
              value={favoriteDate}
              onChangeText={setFavoriteDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingredients *</Text>
              <TouchableOpacity
                onPress={addIngredient}
                style={styles.addButton}
              >
                <Ionicons name="add" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.listItem}>
                <TextInput
                  style={styles.listInput}
                  value={ingredient}
                  onChangeText={(value) => updateIngredient(index, value)}
                  placeholder={`Ingredient ${index + 1}`}
                  placeholderTextColor="#999"
                />
                {ingredients.length > 1 && (
                  <TouchableOpacity onPress={() => removeIngredient(index)}>
                    <Ionicons name="remove-circle" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Instructions *</Text>
              <TouchableOpacity
                onPress={addInstruction}
                style={styles.addButton}
              >
                <Ionicons name="add" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
            {instructions.map((instruction, index) => (
              <View key={index} style={styles.listItem}>
                <TextInput
                  style={styles.listInput}
                  value={instruction}
                  onChangeText={(value) => updateInstruction(index, value)}
                  placeholder={`Step ${index + 1}`}
                  placeholderTextColor="#999"
                  multiline
                />
                {instructions.length > 1 && (
                  <TouchableOpacity onPress={() => removeInstruction(index)}>
                    <Ionicons name="remove-circle" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags (Optional)</Text>
            <TextInput
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder="healthy, quick, vegan (comma separated)"
              placeholderTextColor="#999"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  saveButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  smallInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  mealTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  mealTypeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  mealTypeButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  mealTypeText: {
    color: "#666",
    fontSize: 14,
  },
  mealTypeTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  nutritionItem: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  addButton: {
    padding: 5,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  listInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
});
