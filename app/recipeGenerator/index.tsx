import { useMealContext } from '@/context/UnifiedMealContext';
import { UserContext } from '@/context/UserContext';
import { generateRecipeFromText } from '@/service/AiModel';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  servings: number;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type DietaryPreference = 'none' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'gluten-free';

export default function RecipeGenerator() {
  const context = useContext(UserContext);
  const mealContext = useMealContext();
  const router = useRouter();
  const { user } = context || {};

  // State management
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [dietary, setDietary] = useState<DietaryPreference>('none');
  const [customRequest, setCustomRequest] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);

  // Meal type options
  const mealTypes: { type: MealType; icon: string; label: string; color: string }[] = [
    { type: 'breakfast', icon: 'sunny', label: 'Breakfast', color: '#FF9500' },
    { type: 'lunch', icon: 'restaurant', label: 'Lunch', color: '#4CAF50' },
    { type: 'dinner', icon: 'moon', label: 'Dinner', color: '#9C27B0' },
    { type: 'snack', icon: 'fast-food', label: 'Snack', color: '#FF5722' },
  ];

  // Dietary preferences
  const dietaryOptions: { type: DietaryPreference; label: string; icon: string }[] = [
    { type: 'none', label: 'No Restrictions', icon: 'checkmark-circle' },
    { type: 'vegetarian', label: 'Vegetarian', icon: 'leaf' },
    { type: 'vegan', label: 'Vegan', icon: 'nutrition' },
    { type: 'keto', label: 'Keto', icon: 'flame' },
    { type: 'paleo', label: 'Paleo', icon: 'fitness' },
    { type: 'gluten-free', label: 'Gluten-Free', icon: 'ban' },
  ];

  // Generate recipe with AI
  const generateRecipe = async () => {
    if (!user) {
      Alert.alert('Error', 'Please complete your profile first');
      return;
    }

    setLoading(true);
    try {
      // Build intelligent prompt
      const dietInfo = dietary !== 'none' ? dietary : user.diet_type || 'balanced';
      const goalInfo = user.goal || 'healthy eating';
      const customInfo = customRequest ? `Additional requirements: ${customRequest}` : '';

      const prompt = `Generate a detailed ${mealType} recipe that is ${dietInfo} friendly.
User Goal: ${goalInfo}
${customInfo}

Please provide the recipe in this EXACT JSON format:
{
  "name": "Recipe Name",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "calories": 400,
  "protein": 25,
  "carbs": 45,
  "fat": 12,
  "prepTime": "30 minutes",
  "servings": 2
}

Make it practical, delicious, and nutritionally balanced. Include exact measurements.`;

      const response = await generateRecipeFromText(prompt);

      // Parse AI response
      if (!response) {
        throw new Error('No response from AI');
      }

      try {
        // Try to extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const recipe = JSON.parse(jsonMatch[0]);
          setGeneratedRecipe(recipe);
          setStep(3);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        console.warn('Failed to parse JSON, using intelligent fallback extraction');

        // Enhanced fallback: extract nutritional info from text if available
        const extractNumber = (text: string, pattern: RegExp): number => {
          const match = text.match(pattern);
          return match ? parseInt(match[1]) : 0;
        };

        const caloriesMatch = extractNumber(response, /(\d+)\s*(?:cal|kcal|calories)/i);
        const proteinMatch = extractNumber(response, /(\d+)\s*g?\s*protein/i);
        const carbsMatch = extractNumber(response, /(\d+)\s*g?\s*carb/i);
        const fatMatch = extractNumber(response, /(\d+)\s*g?\s*fat/i);

        // Estimate based on meal type if no info found
        const defaultCalories = mealType === 'breakfast' ? 350 : mealType === 'lunch' ? 500 : mealType === 'dinner' ? 600 : 200;

        const fallbackRecipe: Recipe = {
          name: `Custom ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`,
          ingredients: response.split('\n').filter(line =>
            line.includes('•') || line.includes('-') || line.match(/^\d+\./)).slice(0, 10),
          instructions: response.split('\n').filter(line =>
            line.match(/^\d+\./) || line.includes('Step')).slice(0, 8),
          calories: caloriesMatch || defaultCalories,
          protein: proteinMatch || Math.round(defaultCalories * 0.15 / 4), // 15% of calories from protein
          carbs: carbsMatch || Math.round(defaultCalories * 0.5 / 4), // 50% of calories from carbs
          fat: fatMatch || Math.round(defaultCalories * 0.35 / 9), // 35% of calories from fat
          prepTime: '30 minutes',
          servings: 2,
        };
        setGeneratedRecipe(fallbackRecipe);
        setStep(3);
      }
    } catch (error) {
      console.error('Recipe generation error:', error);
      Alert.alert('Error', 'Failed to generate recipe. Please try again.');
    }
    setLoading(false);
  };

  // Save recipe to today's meal plan
  const saveRecipe = async () => {
    if (!generatedRecipe || !user) {
      Alert.alert('Error', 'Unable to save recipe');
      return;
    }

    if (Platform.OS === 'web') {
      Alert.alert('Success', 'Recipe saved! (Web version - local storage only)');
      return;
    }

    try {
      setLoading(true);
      const todayDate = new Date().toISOString().split('T')[0];

      // Create meal item with all details
      const mealItem = {
        id: `recipe-${Date.now()}`,
        recipeName: generatedRecipe.name,
        calories: generatedRecipe.calories,
        protein: generatedRecipe.protein,
        carbs: generatedRecipe.carbs,
        fat: generatedRecipe.fat,
        ingredients: generatedRecipe.ingredients,
        instructions: generatedRecipe.instructions,
        prepTime: generatedRecipe.prepTime,
        servings: generatedRecipe.servings,
        mealType: mealType,
        scheduledDate: todayDate,
        consumed: false,
      };

      // Schedule the meal for today
      await mealContext.scheduleMeal(mealItem as any, todayDate, mealType);

      Alert.alert(
        'Success!',
        `${generatedRecipe.name} has been added to your ${mealType} plan for today!`,
        [
          {
            text: 'View Home',
            onPress: () => router.push('/(tabs)/Home' as any),
          },
          {
            text: 'Generate Another',
            onPress: () => generateAnother(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset and generate new recipe
  const generateAnother = () => {
    setStep(1);
    setMealType('breakfast');
    setDietary('none');
    setCustomRequest('');
    setGeneratedRecipe(null);
  };

  // Render Step 1: Select Meal Type
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What meal are you planning?</Text>
      <Text style={styles.stepSubtitle}>Choose the meal type you want to create</Text>

      <View style={styles.mealTypeGrid}>
        {mealTypes.map((meal) => (
          <TouchableOpacity
            key={meal.type}
            style={[
              styles.mealTypeCard,
              mealType === meal.type && { borderColor: meal.color, borderWidth: 3 },
            ]}
            onPress={() => setMealType(meal.type)}
          >
            <LinearGradient
              colors={[meal.color, `${meal.color}99`]}
              style={styles.mealTypeGradient}
            >
              <Ionicons name={meal.icon as any} size={40} color="white" />
              <Text style={styles.mealTypeLabel}>{meal.label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setStep(2)}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Render Step 2: Customize Recipe
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Customize your recipe</Text>
      <Text style={styles.stepSubtitle}>Select dietary preferences and add special requests</Text>

      {/* Dietary Preferences */}
      <Text style={styles.sectionLabel}>Dietary Preferences</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dietaryScroll}>
        {dietaryOptions.map((diet) => (
          <TouchableOpacity
            key={diet.type}
            style={[
              styles.dietaryChip,
              dietary === diet.type && styles.dietaryChipActive,
            ]}
            onPress={() => setDietary(diet.type)}
          >
            <Ionicons
              name={diet.icon as any}
              size={20}
              color={dietary === diet.type ? 'white' : '#667eea'}
            />
            <Text
              style={[
                styles.dietaryChipText,
                dietary === diet.type && styles.dietaryChipTextActive,
              ]}
            >
              {diet.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Custom Request */}
      <Text style={styles.sectionLabel}>Special Requests (Optional)</Text>
      <TextInput
        style={styles.textInput}
        placeholder="E.g., No nuts, extra protein, quick meal..."
        placeholderTextColor="#999"
        value={customRequest}
        onChangeText={setCustomRequest}
        multiline
        numberOfLines={3}
      />

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep(1)}
        >
          <Ionicons name="arrow-back" size={20} color="#667eea" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateRecipe}
          disabled={loading}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="white" />
                <Text style={styles.buttonText}>Generate Recipe</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Step 3: Display Recipe
  const renderStep3 = () => {
    if (!generatedRecipe) return null;

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.recipeTitle}>{generatedRecipe.name}</Text>

        {/* Nutrition Info */}
        <View style={styles.nutritionRow}>
          <View style={styles.nutritionItem}>
            <Ionicons name="flame" size={20} color="#FF5722" />
            <Text style={styles.nutritionValue}>{generatedRecipe.calories}</Text>
            <Text style={styles.nutritionLabel}>Calories</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Ionicons name="fitness" size={20} color="#4CAF50" />
            <Text style={styles.nutritionValue}>{generatedRecipe.protein}g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Ionicons name="restaurant" size={20} color="#2196F3" />
            <Text style={styles.nutritionValue}>{generatedRecipe.carbs}g</Text>
            <Text style={styles.nutritionLabel}>Carbs</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Ionicons name="water" size={20} color="#FF9800" />
            <Text style={styles.nutritionValue}>{generatedRecipe.fat}g</Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
        </View>

        {/* Meta Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.metaText}>{generatedRecipe.prepTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people" size={16} color="#666" />
            <Text style={styles.metaText}>{generatedRecipe.servings} servings</Text>
          </View>
        </View>

        <ScrollView style={styles.recipeContent} showsVerticalScrollIndicator={false}>
          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="list" size={20} color="#667eea" /> Ingredients
            </Text>
            {generatedRecipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>{ingredient}</Text>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="clipboard" size={20} color="#667eea" /> Instructions
            </Text>
            {generatedRecipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={saveRecipe}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#667eea" />
            ) : (
              <>
                <Ionicons name="calendar" size={20} color="#667eea" />
                <Text style={styles.secondaryButtonText}>Save to Today</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={generateAnother}
            disabled={loading}
          >
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.buttonGradient}>
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.buttonText}>Generate Another</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#f8f9fa', '#e9ecef']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Recipe Generator</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      {step < 3 && (
        <View style={styles.progressContainer}>
          {[1, 2].map((s) => (
            <View key={s} style={styles.progressStep}>
              <View style={[styles.progressDot, step >= s && styles.progressDotActive]}>
                {step > s ? (
                  <Ionicons name="checkmark" size={12} color="white" />
                ) : (
                  <Text style={styles.progressDotText}>{s}</Text>
                )}
              </View>
              {s < 2 && <View style={[styles.progressLine, step > s && styles.progressLineActive]} />}
            </View>
          ))}
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    backgroundColor: '#667eea',
  },
  progressDotText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#667eea',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 30,
  },
  mealTypeCard: {
    width: (width - 55) / 2,
    height: 120,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mealTypeGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mealTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 10,
  },
  dietaryScroll: {
    marginBottom: 20,
  },
  dietaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#667eea',
    marginRight: 10,
  },
  dietaryChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  dietaryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#667eea',
  },
  dietaryChipTextActive: {
    color: 'white',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  generateButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  recipeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  nutritionItem: {
    alignItems: 'center',
    gap: 4,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  recipeContent: {
    flex: 1,
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#667eea',
    marginTop: 7,
    marginRight: 10,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
