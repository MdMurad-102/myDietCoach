import { useMealContext } from "@/context/UnifiedMealContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddMealModalProps {
  visible: boolean;
  onClose: () => void;
}

const AddMealModal: React.FC<AddMealModalProps> = ({ visible, onClose }) => {
  const { addMealToToday, isLoading } = useMealContext();

  const [recipeName, setRecipeName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [mealType, setMealType] = useState("snacks");

  const handleSubmit = async () => {
    if (!recipeName.trim()) {
      Alert.alert("Error", "Please enter a recipe name");
      return;
    }

    if (!calories || isNaN(Number(calories))) {
      Alert.alert("Error", "Please enter valid calories");
      return;
    }

    try {
      await addMealToToday({
        recipeName: recipeName.trim(),
        calories: Number(calories),
        protein: Number(protein) || 0,
        mealType,
        ingredients: [],
        instructions: [],
        cookingTime: "15 min",
        servings: 1,
      });

      Alert.alert("Success", "Meal added successfully!");

      // Reset form
      setRecipeName("");
      setCalories("");
      setProtein("");
      setMealType("snacks");

      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to add meal. Please try again.");
    }
  };

  const mealTypes = [
    { key: "breakfast", label: "Breakfast", icon: "sunny-outline" },
    { key: "lunch", label: "Lunch", icon: "restaurant-outline" },
    { key: "dinner", label: "Dinner", icon: "moon-outline" },
    { key: "snacks", label: "Snacks", icon: "fast-food-outline" },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Custom Meal</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Recipe Name *</Text>
            <TextInput
              style={styles.input}
              value={recipeName}
              onChangeText={setRecipeName}
              placeholder="Enter recipe name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Meal Type</Text>
            <View style={styles.mealTypeContainer}>
              {mealTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.mealTypeButton,
                    mealType === type.key && styles.mealTypeButtonActive,
                  ]}
                  onPress={() => setMealType(type.key)}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={mealType === type.key ? "#fff" : "#666"}
                  />
                  <Text
                    style={[
                      styles.mealTypeText,
                      mealType === type.key && styles.mealTypeTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={styles.label}>Calories *</Text>
              <TextInput
                style={styles.input}
                value={calories}
                onChangeText={setCalories}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput
                style={styles.input}
                value={protein}
                onChangeText={setProtein}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.addButton, isLoading && styles.addButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.addButtonText}>
              {isLoading ? "Adding..." : "Add Meal"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  mealTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  mealTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    gap: 8,
  },
  mealTypeButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  mealTypeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  mealTypeTextActive: {
    color: "#fff",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#ccc",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddMealModal;
