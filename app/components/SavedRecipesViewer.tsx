import { UserContext } from "@/context/UserContext";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React, { useContext, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SavedRecipesViewer: React.FC = () => {
  const context = useContext(UserContext);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  if (!context)
    throw new Error("UserContext must be used within a UserProvider");
  const { user } = context;

  const recipes = useQuery(
    api.allRecipe.GetUserRecipes,
    user?._id ? { userId: user._id } : "skip"
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>
          Please log in to view saved recipes
        </Text>
      </View>
    );
  }

  const openRecipeDetails = (recipe: any) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👨‍🍳 Your Saved Recipes</Text>

      {!recipes || recipes.length === 0 ? (
        <View style={styles.noRecipesContainer}>
          <Text style={styles.noRecipesText}>
            No saved recipes yet. Generate your first custom recipe above! 🚀
          </Text>
        </View>
      ) : (
        <>
          {/* Show only 3 most recent recipes */}
          {recipes.slice(0, 3).map((recipe, index) => (
            <TouchableOpacity
              key={recipe._id}
              style={styles.recipeCard}
              onPress={() => openRecipeDetails(recipe)}
            >
              <Text style={styles.recipeName}>{recipe.recipeName}</Text>
              <Text style={styles.recipeDescription} numberOfLines={2}>
                {recipe.jsonData?.description || "No description available"}
              </Text>
              <View style={styles.recipeStats}>
                <Text style={styles.statText}>
                  🔥 {recipe.jsonData?.calories || "N/A"} cal
                </Text>
                <Text style={styles.statText}>
                  ⏱️ {recipe.jsonData?.cookingTime || "N/A"}
                </Text>
                <Text style={styles.statText}>
                  🍽️ {recipe.jsonData?.servings || "N/A"} servings
                </Text>
              </View>
              <Text style={styles.createdDate}>
                Created: {new Date(recipe._creationTime).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))}
          {recipes.length > 3 && (
            <Text style={styles.moreText}>
              + {recipes.length - 3} more recipes. Tap any recipe to view
              details.
            </Text>
          )}
        </>
      )}

      {/* Modal for Recipe Details */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedRecipe?.recipeName || "Recipe Details"}
            </Text>
          </View>

          {selectedRecipe && (
            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.recipeHeader}>
                <Text style={styles.recipeTitle}>
                  {selectedRecipe.recipeName}
                </Text>
                <Text style={styles.recipeDescription}>
                  {selectedRecipe.jsonData?.description}
                </Text>
              </View>

              <View style={styles.quickStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {selectedRecipe.jsonData?.calories || "N/A"}
                  </Text>
                  <Text style={styles.statLabel}>Calories</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {selectedRecipe.jsonData?.cookingTime || "N/A"}
                  </Text>
                  <Text style={styles.statLabel}>Cook Time</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {selectedRecipe.jsonData?.servings || "N/A"}
                  </Text>
                  <Text style={styles.statLabel}>Servings</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {selectedRecipe.jsonData?.difficulty || "N/A"}
                  </Text>
                  <Text style={styles.statLabel}>Difficulty</Text>
                </View>
              </View>

              {selectedRecipe.jsonData?.ingredients && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🛒 Ingredients</Text>
                  {selectedRecipe.jsonData.ingredients.map(
                    (ingredient: any, index: number) => (
                      <Text key={index} style={styles.ingredientItem}>
                        •{" "}
                        {typeof ingredient === "string"
                          ? ingredient
                          : `${ingredient.emoji || ""} ${ingredient.quantity || ""} ${ingredient.name || ingredient}${ingredient.notes ? ` (${ingredient.notes})` : ""}`}
                      </Text>
                    )
                  )}
                </View>
              )}

              {selectedRecipe.jsonData?.instructions && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>👨‍🍳 Instructions</Text>
                  {selectedRecipe.jsonData.instructions.map(
                    (instruction: string, index: number) => (
                      <Text key={index} style={styles.instructionItem}>
                        {index + 1}. {instruction}
                      </Text>
                    )
                  )}
                </View>
              )}

              {selectedRecipe.jsonData?.nutritionTips && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>💡 Nutrition Tips</Text>
                  <Text style={styles.tipsText}>
                    {selectedRecipe.jsonData.nutritionTips}
                  </Text>
                </View>
              )}

              {selectedRecipe.jsonData?.chefTips && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>👨‍🍳 Chef Tips</Text>
                  <Text style={styles.tipsText}>
                    {selectedRecipe.jsonData.chefTips}
                  </Text>
                </View>
              )}

              <View style={styles.recipeFooter}>
                <Text style={styles.footerText}>
                  Created:{" "}
                  {new Date(selectedRecipe._creationTime).toLocaleDateString()}
                </Text>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  recipesList: {
    flex: 1,
  },
  noRecipesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  noRecipesText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
  recipeCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  recipeStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  statText: {
    fontSize: 12,
    color: "#555",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  createdDate: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingTop: 50,
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginRight: 50,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  recipeHeader: {
    marginBottom: 20,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  ingredientItem: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    lineHeight: 20,
  },
  instructionItem: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 22,
  },
  tipsText: {
    fontSize: 14,
    color: "#4CAF50",
    fontStyle: "italic",
    lineHeight: 20,
  },
  recipeFooter: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  moreText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
});

export default SavedRecipesViewer;
