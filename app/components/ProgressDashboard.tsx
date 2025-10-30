import { UserContext } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "./Button";
import GoalSettingModal from "./GoalSettingModal";
import ProgressChart from "./ProgressChart";
import ProgressUpdateModal from "./ProgressUpdateModal";

const { width: screenWidth } = Dimensions.get("window");

export default function ProgressDashboard() {
  const context = useContext(UserContext);
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");

  const [progressEntries, setProgressEntries] = useState([
    { date: "2023-10-01", weight: 70, bmi: 22.5 },
    { date: "2023-10-08", weight: 69.5, bmi: 22.3 },
    { date: "2023-10-15", weight: 69, bmi: 22.1 },
    { date: "2023-10-22", weight: 68.8, bmi: 22.0 },
  ]);

  const [nutritionEntries, setNutritionEntries] = useState([
    { date: "2023-10-20", caloriesConsumed: 2200, proteinConsumed: 140 },
    { date: "2023-10-21", caloriesConsumed: 2100, proteinConsumed: 135 },
    { date: "2023-10-22", caloriesConsumed: 2150, proteinConsumed: 138 },
  ]);

  if (!context) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { user } = context;

  const addProgress = (data: any) => {
    const newEntry = { ...data, date: new Date().toISOString().split("T")[0] };
    setProgressEntries([...progressEntries, newEntry]);
  };

  const handleSaveGoal = (goalData: any) => {
    console.log("Goal saved:", goalData);
    setShowGoalModal(false);
  };

  const weightData = progressEntries.map((p) => ({ date: p.date, value: p.weight }));
  const bmiData = progressEntries.map((p) => ({ date: p.date, value: p.bmi }));
  const calorieData = nutritionEntries.map((n) => ({ date: n.date, value: n.caloriesConsumed }));
  const proteinData = nutritionEntries.map((n) => ({ date: n.date, value: n.proteinConsumed }));

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loginRequired}>Please login to view progress</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>A visual journey of your success</Text>
        </View>
      </LinearGradient>

      <View style={styles.mainContent}>
        <View style={styles.periodSelector}>
          {["This Week", "This Month", "3 Months"].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionButtons}>
          <Button
            title="Log Progress"
            onPress={() => setShowAddModal(true)}
            variant="primary"
            icon="add-circle-outline"
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="Set Goal"
            onPress={() => setShowGoalModal(true)}
            variant="outline"
            icon="flag-outline"
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>

        <ProgressChart
          data={weightData}
          title="Weight Journey"
          color="#4CAF50"
          unit="kg"
          icon="scale-outline"
        />
        <ProgressChart
          data={bmiData}
          title="Body Mass Index (BMI)"
          color="#FF9800"
          unit=""
          icon="body-outline"
        />
        <ProgressChart
          data={calorieData}
          title="Calorie Intake"
          color="#2196F3"
          unit="kcal"
          icon="flame-outline"
        />
        <ProgressChart
          data={proteinData}
          title="Protein Intake"
          color="#E91E63"
          unit="g"
          icon="fitness-outline"
        />
      </View>

      <ProgressUpdateModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <GoalSettingModal
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onSaveGoal={handleSaveGoal}
      />

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loginRequired: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 50,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  mainContent: {
    padding: 16,
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 5,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  periodButtonActive: {
    backgroundColor: "#667eea",
  },
  periodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  periodTextActive: {
    color: "#fff",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});
