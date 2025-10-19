import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
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

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Types
interface AddMealModalProps {
  visible: boolean;
  onClose: () => void;
  onAddMeal: (meal: any) => Promise<void>;
  selectedDate?: string;
  selectedMealType?: string;
}

interface MealFormData {
  name: string;
  mealType: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  ingredients: string;
  instructions: string;
  cookingTime: string;
  servings: string;
  difficulty: string;
  notes: string;
}

const MEAL_TYPES = [
  {
    key: "breakfast",
    label: "Breakfast",
    icon: "sunny-outline",
    color: "#FF9800",
  },
  {
    key: "lunch",
    label: "Lunch",
    icon: "partly-sunny-outline",
    color: "#4CAF50",
  },
  { key: "dinner", label: "Dinner", icon: "moon-outline", color: "#3F51B5" },
  { key: "snack", label: "Snack", icon: "cafe-outline", color: "#9C27B0" },
];

const DIFFICULTY_LEVELS = [
  { key: "easy", label: "Easy", color: "#4CAF50" },
  { key: "medium", label: "Medium", color: "#FF9800" },
  { key: "hard", label: "Hard", color: "#F44336" },
];

const QUICK_MEALS = [
  {
    name: "Greek Yogurt with Berries",
    calories: "150",
    protein: "15",
    mealType: "breakfast",
  },
  {
    name: "Grilled Chicken Salad",
    calories: "320",
    protein: "35",
    mealType: "lunch",
  },
  {
    name: "Baked Salmon with Quinoa",
    calories: "420",
    protein: "40",
    mealType: "dinner",
  },
  { name: "Mixed Nuts", calories: "180", protein: "6", mealType: "snack" },
  {
    name: "Protein Smoothie",
    calories: "250",
    protein: "25",
    mealType: "breakfast",
  },
  {
    name: "Turkey Sandwich",
    calories: "380",
    protein: "28",
    mealType: "lunch",
  },
];

export default function AddMealModal({
  visible,
  onClose,
  onAddMeal,
  selectedDate,
  selectedMealType = "breakfast",
}: AddMealModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(screenHeight));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<MealFormData>({
    name: "",
    mealType: selectedMealType,
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
    ingredients: "",
    instructions: "",
    cookingTime: "",
    servings: "1",
    difficulty: "easy",
    notes: "",
  });

  useEffect(() => {
    if (visible) {
      setCurrentStep(1);
      setErrors({});
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const updateFormData = (field: keyof MealFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Meal name is required";
    }

    if (!formData.calories.trim()) {
      newErrors.calories = "Calories are required";
    } else if (
      isNaN(Number(formData.calories)) ||
      Number(formData.calories) <= 0
    ) {
      newErrors.calories = "Please enter a valid number";
    }

    if (!formData.protein.trim()) {
      newErrors.protein = "Protein is required";
    } else if (
      isNaN(Number(formData.protein)) ||
      Number(formData.protein) < 0
    ) {
      newErrors.protein = "Please enter a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.servings.trim()) {
      newErrors.servings = "Servings are required";
    } else if (
      isNaN(Number(formData.servings)) ||
      Number(formData.servings) <= 0
    ) {
      newErrors.servings = "Please enter a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleQuickAdd = (quickMeal: any) => {
    setFormData((prev) => ({
      ...prev,
      name: quickMeal.name,
      calories: quickMeal.calories,
      protein: quickMeal.protein,
      mealType: quickMeal.mealType,
    }));
    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      const newMeal = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        mealType: formData.mealType,
        calories: parseInt(formData.calories),
        protein: parseInt(formData.protein),
        carbs: formData.carbs ? parseInt(formData.carbs) : 0,
        fat: formData.fat ? parseInt(formData.fat) : 0,
        fiber: formData.fiber ? parseInt(formData.fiber) : 0,
        ingredients: formData.ingredients.trim()
          ? formData.ingredients.split("\n").filter((i) => i.trim())
          : ["No ingredients specified"],
        instructions: formData.instructions.trim()
          ? formData.instructions.split("\n").filter((i) => i.trim())
          : ["No instructions specified"],
        cookingTime: formData.cookingTime.trim() || "Not specified",
        servings: parseInt(formData.servings),
        difficulty: formData.difficulty,
        notes: formData.notes.trim(),
        isGenerated: false,
        tags: ["custom"],
        dateAdded: selectedDate || new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      };

      await onAddMeal(newMeal);

      // Reset form
      setFormData({
        name: "",
        mealType: selectedMealType,
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        fiber: "",
        ingredients: "",
        instructions: "",
        cookingTime: "",
        servings: "1",
        difficulty: "easy",
        notes: "",
      });

      setCurrentStep(1);
      onClose();

      // Show success message
      Alert.alert(
        "✅ Success!",
        `"${newMeal.name}" has been added to your ${newMeal.mealType}!`,
        [{ text: "Great!", style: "default" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to add meal. Please try again.");
      console.error("Error adding meal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>✨ Quick Add or Create New</Text>

      {/* Quick Add Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Quick Add Popular Meals</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickMealsScroll}
        >
          {QUICK_MEALS.map((meal, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickMealCard}
              onPress={() => handleQuickAdd(meal)}
            >
              <Text style={styles.quickMealName}>{meal.name}</Text>
              <Text style={styles.quickMealStats}>
                {meal.calories} cal • {meal.protein}g protein
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR CREATE CUSTOM</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Basic Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Meal Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(text) => updateFormData("name", text)}
            placeholder="e.g. Grilled Chicken with Rice"
            placeholderTextColor="#999"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Meal Type *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.mealTypeScroll}
          >
            {MEAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.mealTypeCard,
                  formData.mealType === type.key && {
                    backgroundColor: type.color,
                  },
                ]}
                onPress={() => updateFormData("mealType", type.key)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={20}
                  color={formData.mealType === type.key ? "#fff" : type.color}
                />
                <Text
                  style={[
                    styles.mealTypeText,
                    formData.mealType === type.key && { color: "#fff" },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.inputLabel}>Calories *</Text>
            <TextInput
              style={[styles.input, errors.calories && styles.inputError]}
              value={formData.calories}
              onChangeText={(text) => updateFormData("calories", text)}
              placeholder="300"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            {errors.calories && (
              <Text style={styles.errorText}>{errors.calories}</Text>
            )}
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.inputLabel}>Protein (g) *</Text>
            <TextInput
              style={[styles.input, errors.protein && styles.inputError]}
              value={formData.protein}
              onChangeText={(text) => updateFormData("protein", text)}
              placeholder="25"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            {errors.protein && (
              <Text style={styles.errorText}>{errors.protein}</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>🔢 Nutrition & Details</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          📊 Additional Nutrition (Optional)
        </Text>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 5 }]}>
            <Text style={styles.inputLabel}>Carbs (g)</Text>
            <TextInput
              style={styles.input}
              value={formData.carbs}
              onChangeText={(text) => updateFormData("carbs", text)}
              placeholder="30"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginHorizontal: 5 }]}>
            <Text style={styles.inputLabel}>Fat (g)</Text>
            <TextInput
              style={styles.input}
              value={formData.fat}
              onChangeText={(text) => updateFormData("fat", text)}
              placeholder="10"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 5 }]}>
            <Text style={styles.inputLabel}>Fiber (g)</Text>
            <TextInput
              style={styles.input}
              value={formData.fiber}
              onChangeText={(text) => updateFormData("fiber", text)}
              placeholder="5"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Meal Details</Text>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.inputLabel}>Servings *</Text>
            <TextInput
              style={[styles.input, errors.servings && styles.inputError]}
              value={formData.servings}
              onChangeText={(text) => updateFormData("servings", text)}
              placeholder="1"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            {errors.servings && (
              <Text style={styles.errorText}>{errors.servings}</Text>
            )}
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.inputLabel}>Cooking Time</Text>
            <TextInput
              style={styles.input}
              value={formData.cookingTime}
              onChangeText={(text) => updateFormData("cookingTime", text)}
              placeholder="15 minutes"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Difficulty Level</Text>
          <View style={styles.difficultyContainer}>
            {DIFFICULTY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.key}
                style={[
                  styles.difficultyBtn,
                  formData.difficulty === level.key && {
                    backgroundColor: level.color,
                  },
                ]}
                onPress={() => updateFormData("difficulty", level.key)}
              >
                <Text
                  style={[
                    styles.difficultyText,
                    formData.difficulty === level.key && { color: "#fff" },
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>📝 Recipe Details (Optional)</Text>

      <View style={styles.section}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Ingredients</Text>
          <Text style={styles.inputHint}>One ingredient per line</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.ingredients}
            onChangeText={(text) => updateFormData("ingredients", text)}
            placeholder="1 cup rice&#10;200g chicken breast&#10;1 tbsp olive oil"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Instructions</Text>
          <Text style={styles.inputHint}>One step per line</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.instructions}
            onChangeText={(text) => updateFormData("instructions", text)}
            placeholder="1. Cook rice according to package instructions&#10;2. Season and grill chicken breast&#10;3. Serve together"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => updateFormData("notes", text)}
            placeholder="Any additional notes about this meal..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Summary */}
      <View style={[styles.section, styles.summarySection]}>
        <Text style={styles.sectionTitle}>📋 Summary</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {formData.name || "Unnamed Meal"}
          </Text>
          <View style={styles.summaryStats}>
            <Text style={styles.summaryText}>
              🔥 {formData.calories || "0"} calories
            </Text>
            <Text style={styles.summaryText}>
              💪 {formData.protein || "0"}g protein
            </Text>
            <Text style={styles.summaryText}>
              🍽️ {formData.servings || "1"} serving(s)
            </Text>
          </View>
          <Text style={styles.summaryMealType}>
            {MEAL_TYPES.find((t) => t.key === formData.mealType)?.label ||
              "Breakfast"}
          </Text>
        </View>
      </View>
    </View>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}
          >
            {/* Header */}
            <LinearGradient
              colors={["#2E8B57", "#3CB371"]}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Add New Meal</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                {[1, 2, 3].map((step) => (
                  <View key={step} style={styles.progressStep}>
                    <View
                      style={[
                        styles.progressDot,
                        currentStep >= step && styles.progressDotActive,
                      ]}
                    >
                      {currentStep > step ? (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      ) : (
                        <Text
                          style={[
                            styles.progressNumber,
                            currentStep >= step && styles.progressNumberActive,
                          ]}
                        >
                          {step}
                        </Text>
                      )}
                    </View>
                    {step < 3 && (
                      <View
                        style={[
                          styles.progressLine,
                          currentStep > step && styles.progressLineActive,
                        ]}
                      />
                    )}
                  </View>
                ))}
              </View>
            </LinearGradient>

            {/* Content */}
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {getStepContent()}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerButtons}>
                {currentStep > 1 && (
                  <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                    <Ionicons name="arrow-back" size={20} color="#666" />
                    <Text style={styles.backBtnText}>Back</Text>
                  </TouchableOpacity>
                )}

                <View style={{ flex: 1 }} />

                {currentStep < 3 ? (
                  <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                    <Text style={styles.nextBtnText}>Next</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.addBtn, isLoading && styles.addBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Text style={styles.addBtnText}>Adding...</Text>
                    ) : (
                      <>
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.addBtnText}>Add Meal</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: screenHeight * 0.9,
    minHeight: screenHeight * 0.7,
  },
  header: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  closeBtn: {
    padding: 5,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  progressStep: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressDotActive: {
    backgroundColor: "#fff",
  },
  progressNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  progressNumberActive: {
    color: "#2E8B57",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 5,
  },
  progressLineActive: {
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  quickMealsScroll: {
    marginBottom: 10,
  },
  quickMealCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    minWidth: 140,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  quickMealName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  quickMealStats: {
    fontSize: 12,
    color: "#666",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e9ecef",
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  inputHint: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#dc3545",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 12,
    color: "#dc3545",
    marginTop: 5,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  mealTypeScroll: {
    marginBottom: 10,
  },
  mealTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
    color: "#333",
  },
  difficultyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  difficultyBtn: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 3,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  summarySection: {
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 15,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 12,
    color: "#666",
  },
  summaryMealType: {
    fontSize: 12,
    color: "#2E8B57",
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    backgroundColor: "#fff",
  },
  footerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
  },
  backBtnText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 5,
    fontWeight: "500",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#2E8B57",
  },
  nextBtnText: {
    fontSize: 16,
    color: "#fff",
    marginRight: 5,
    fontWeight: "600",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#2E8B57",
  },
  addBtnDisabled: {
    backgroundColor: "#ccc",
  },
  addBtnText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 5,
    fontWeight: "600",
  },
});
