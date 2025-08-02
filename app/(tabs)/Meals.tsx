import { Platform, StyleSheet, Text, View } from "react-native";
import MealPlanViewer from "../components/MealPlanViewer";

export default function Meals() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍽️ My Meal Plans</Text>
        <Text style={styles.headerSubtitle}>
          View your personalized daily meal plans
        </Text>
      </View>
      <MealPlanViewer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
});
