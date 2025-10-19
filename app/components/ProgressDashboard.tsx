import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { UserContext } from "@/context/UserContext";
import SimpleProgressChart from "./SimpleProgressChart";
import GoalSettingModal from "./GoalSettingModal";

const { width: screenWidth } = Dimensions.get("window");

interface ProgressEntry {
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  bmi?: number;
  measurements?: {
    waist?: number;
    chest?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  notes?: string;
}

export default function ProgressDashboard() {
  const context = useContext(UserContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [userGoals, setUserGoals] = useState<any>(null);
  const [newEntry, setNewEntry] = useState<ProgressEntry>({
    date: new Date().toISOString().split("T")[0],
  });

  // Local state to store progress entries
  const [progressEntries, setProgressEntries] = useState<any[]>([
    // Sample data to show the charts working
    {
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      weight: 70,
      bmi: 22.5,
    },
    {
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      weight: 69.5,
      bmi: 22.3,
    },
  ]);

  const [nutritionEntries, setNutritionEntries] = useState<any[]>([
    // Sample nutrition data
    {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      caloriesConsumed: 2200,
      proteinConsumed: 140,
    },
    {
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      caloriesConsumed: 2100,
      proteinConsumed: 135,
    },
  ]);

  if (!context) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { user } = context;

  // Calculate BMI
  const calculateBMI = (
    weight: number,
    heightCm?: string
  ): number | undefined => {
    if (!heightCm) return undefined;
    const heightM = parseFloat(heightCm) / 100;
    return weight / (heightM * heightM);
  };

  // Filter entries based on selected period
  const filteredProgressEntries = progressEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - selectedPeriod);
    return entryDate >= cutoffDate;
  });

  // Calculate progress stats
  const progressStats = {
    totalEntries: progressEntries.length,
    weightChange:
      progressEntries.length >= 2
        ? progressEntries[progressEntries.length - 1].weight -
          progressEntries[0].weight
        : 0,
    consistency: Math.min(nutritionEntries.length, 7),
    latestWeight:
      progressEntries.length > 0
        ? progressEntries[progressEntries.length - 1].weight
        : user?.weight
          ? parseFloat(user.weight)
          : null,
    latestBMI:
      progressEntries.length > 0
        ? progressEntries[progressEntries.length - 1].bmi
        : null,
  };

  const activeWeightGoal = null; // Will be implemented when backend is ready

  // Working add progress function
  const addProgress = async (data: any) => {
    console.log("Adding progress data:", data);

    // Calculate BMI if weight is provided
    let bmi = undefined;
    if (data.weight && user?.height) {
      bmi = calculateBMI(data.weight, user.height);
    }

    // Create new entry
    const newProgressEntry = {
      date: data.date,
      weight: data.weight,
      bodyFat: data.bodyFat,
      muscleMass: data.muscleMass,
      bmi: bmi,
      measurements: data.measurements,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    // Add to local state
    setProgressEntries((prev) => {
      // Remove existing entry for the same date if it exists
      const filtered = prev.filter((entry) => entry.date !== data.date);
      // Add new entry and sort by date
      return [...filtered, newProgressEntry].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });

    return newProgressEntry;
  };

  const setWeightGoal = async (data: any) => {
    console.log("Weight goal would be set:", data);
    Alert.alert("Success", "Weight goal would be set (demo mode)");
  };

  const handleAddProgress = async () => {
    if (!user || !newEntry.weight) {
      Alert.alert("Error", "Please enter at least your weight");
      return;
    }

    try {
      await addProgress({
        userId: user._id,
        date: newEntry.date,
        weight: newEntry.weight,
        bodyFat: newEntry.bodyFat,
        muscleMass: newEntry.muscleMass,
        measurements: newEntry.measurements,
        notes: newEntry.notes,
      });

      setShowAddModal(false);
      setNewEntry({ date: new Date().toISOString().split("T")[0] });
      Alert.alert("Success", "Progress entry added successfully!");
    } catch (error) {
      console.error("Error adding progress:", error);
      Alert.alert("Error", "Failed to add progress entry");
    }
  };

  const handleSetGoal = () => {
    setShowGoalModal(true);
  };

  const handleSaveGoal = (goalData: any) => {
    console.log("Goal saved:", goalData);
    setUserGoals(goalData);
    // Here you would typically save to your backend
    setShowGoalModal(false);
  };

  // Prepare chart data - Using real local data
  const weightData =
    filteredProgressEntries
      ?.filter((p: any) => p.weight)
      .map((p: any) => ({
        date: p.date,
        value: p.weight,
      })) || [];

  const bmiData =
    filteredProgressEntries
      ?.filter((p: any) => p.bmi)
      .map((p: any) => ({
        date: p.date,
        value: p.bmi,
      })) || [];

  const calorieData =
    nutritionEntries?.map((n: any) => ({
      date: n.date,
      value: n.caloriesConsumed,
    })) || [];

  const proteinData =
    nutritionEntries?.map((n: any) => ({
      date: n.date,
      value: n.proteinConsumed,
    })) || [];

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loginRequired}>Please login to view progress</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Your Health Journey</Text>
            <Text style={styles.subtitle}>
              Track your progress & celebrate wins! 🎉
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#667eea" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Overview Cards */}
      <View style={styles.quickOverview}>
        <Text style={styles.sectionTitle}>📊 Your Progress at a Glance</Text>

        <View style={styles.overviewGrid}>
          <View style={styles.overviewCard}>
            <View style={styles.overviewIcon}>
              <Ionicons name="calendar" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.overviewNumber}>
              {progressStats?.totalEntries || 0}
            </Text>
            <Text style={styles.overviewLabel}>Days Tracked</Text>
            <Text style={styles.overviewDescription}>Keep logging daily!</Text>
          </View>

          <View style={styles.overviewCard}>
            <View style={styles.overviewIcon}>
              <Ionicons
                name={
                  (progressStats?.weightChange || 0) <= 0
                    ? "trending-down"
                    : "trending-up"
                }
                size={20}
                color={
                  (progressStats?.weightChange || 0) <= 0
                    ? "#4CAF50"
                    : "#FF9800"
                }
              />
            </View>
            <Text
              style={[
                styles.overviewNumber,
                {
                  color:
                    (progressStats?.weightChange || 0) <= 0
                      ? "#4CAF50"
                      : "#FF9800",
                },
              ]}
            >
              {progressStats?.weightChange
                ? `${progressStats.weightChange > 0 ? "+" : ""}${Math.abs(progressStats.weightChange)}kg`
                : "0kg"}
            </Text>
            <Text style={styles.overviewLabel}>
              {(progressStats?.weightChange || 0) <= 0
                ? "Weight Lost"
                : "Weight Gained"}
            </Text>
            <Text style={styles.overviewDescription}>
              {(progressStats?.weightChange || 0) <= 0
                ? "Great job! 💪"
                : "Stay focused! 💪"}
            </Text>
          </View>
        </View>

        <View style={styles.overviewGrid}>
          <View style={styles.overviewCard}>
            <View style={styles.overviewIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
            </View>
            <Text style={styles.overviewNumber}>
              {progressStats?.consistency || 0}
            </Text>
            <Text style={styles.overviewLabel}>Days This Week</Text>
            <Text style={styles.overviewDescription}>
              {(progressStats?.consistency || 0) >= 5
                ? "Amazing consistency! 🔥"
                : "Let's log more! 💪"}
            </Text>
          </View>

          <View style={styles.overviewCard}>
            <View style={styles.overviewIcon}>
              <Ionicons name="trophy" size={20} color="#FFD700" />
            </View>
            <Text style={styles.overviewNumber}>
              {progressStats?.latestWeight
                ? `${progressStats.latestWeight}kg`
                : "N/A"}
            </Text>
            <Text style={styles.overviewLabel}>Current Weight</Text>
            <Text style={styles.overviewDescription}>Last recorded</Text>
          </View>
        </View>
      </View>

      {/* Time Period Selector */}
      <View style={styles.periodSection}>
        <Text style={styles.sectionTitle}>📅 View Progress For</Text>
        <View style={styles.periodSelector}>
          {[
            { days: 7, label: "This Week" },
            { days: 30, label: "This Month" },
            { days: 90, label: "3 Months" },
          ].map((period) => (
            <TouchableOpacity
              key={period.days}
              style={[
                styles.periodButton,
                selectedPeriod === period.days && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.days)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period.days && styles.periodTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Motivational Goal Card */}
      <View style={styles.goalSection}>
        <TouchableOpacity style={styles.goalCard} onPress={handleSetGoal}>
          <LinearGradient
            colors={["#4CAF50", "#45A049"]}
            style={styles.goalGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.goalContent}>
              <View style={styles.goalIcon}>
                <Ionicons name="flag" size={24} color="#fff" />
              </View>
              <View style={styles.goalText}>
                <Text style={styles.goalTitle}>🎯 Set Your Goal</Text>
                <Text style={styles.goalSubtitle}>
                  Ready to set a weight goal? We'll help you get there!
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Charts Section */}
      <View style={styles.chartsSection}>
        <Text style={styles.sectionTitle}>📈 Your Progress Charts</Text>

        <SimpleProgressChart
          data={weightData}
          title="🏃‍♂️ Weight Journey"
          color="#4CAF50"
          unit="kg"
          icon="scale"
          targetValue={userGoals?.targetWeight}
        />

        <SimpleProgressChart
          data={bmiData}
          title="💪 Body Mass Index"
          color="#FF9800"
          unit=""
          icon="fitness"
        />

        <SimpleProgressChart
          data={calorieData}
          title="🔥 Daily Calories"
          color="#2196F3"
          unit="kcal"
          icon="restaurant"
          targetValue={userGoals?.weeklyCalories}
        />

        <SimpleProgressChart
          data={proteinData}
          title="🥩 Daily Protein"
          color="#E91E63"
          unit="g"
          icon="nutrition"
          targetValue={userGoals?.dailyProtein}
        />
      </View>

      {/* Add Progress Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.modalHeader}
          >
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAddModal(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>📝 Log Your Progress</Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleAddProgress}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Track your daily progress to see how far you've come! 💪
            </Text>

            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <Ionicons name="calendar" size={20} color="#667eea" />
                <Text style={styles.inputTitle}>📅 Date</Text>
              </View>
              <TextInput
                style={styles.input}
                value={newEntry.date}
                onChangeText={(text) =>
                  setNewEntry({ ...newEntry, date: text })
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
              <Text style={styles.inputHint}>When did you weigh yourself?</Text>
            </View>

            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <Ionicons name="scale" size={20} color="#4CAF50" />
                <Text style={styles.inputTitle}>⚖️ Your Weight</Text>
              </View>
              <TextInput
                style={styles.input}
                value={newEntry.weight?.toString() || ""}
                onChangeText={(text) =>
                  setNewEntry({
                    ...newEntry,
                    weight: parseFloat(text) || undefined,
                  })
                }
                placeholder="Enter your weight in kg"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              <Text style={styles.inputHint}>How much do you weigh today?</Text>
            </View>

            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <Ionicons name="fitness" size={20} color="#FF6B6B" />
                <Text style={styles.inputTitle}>💪 Body Fat % (Optional)</Text>
              </View>
              <TextInput
                style={styles.input}
                value={newEntry.bodyFat?.toString() || ""}
                onChangeText={(text) =>
                  setNewEntry({
                    ...newEntry,
                    bodyFat: parseFloat(text) || undefined,
                  })
                }
                placeholder="Enter body fat percentage"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              <Text style={styles.inputHint}>If you have a body fat scale</Text>
            </View>

            <View style={styles.inputSection}>
              <View style={styles.inputHeader}>
                <Ionicons name="chatbubble" size={20} color="#9C27B0" />
                <Text style={styles.inputTitle}>📝 How are you feeling?</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newEntry.notes || ""}
                onChangeText={(text) =>
                  setNewEntry({ ...newEntry, notes: text })
                }
                placeholder="Any notes about today? (e.g., 'Felt great after workout!', 'Had a good meal day')"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
              <Text style={styles.inputHint}>
                Share how you're feeling about your progress!
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <Text style={styles.encouragementText}>
                🌟 Every step counts! You're doing great! 🌟
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Goal Setting Modal */}
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

  // Header Styles
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  addButton: {
    backgroundColor: "#fff",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Quick Overview Styles
  quickOverview: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 15,
  },
  overviewGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  overviewCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: (screenWidth - 55) / 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  overviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  overviewLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 5,
  },
  overviewDescription: {
    fontSize: 12,
    color: "#95a5a6",
    textAlign: "center",
    fontStyle: "italic",
  },

  // Period Selector Styles
  periodSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 5,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flex: 1,
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: "#667eea",
  },
  periodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7f8c8d",
  },
  periodTextActive: {
    color: "#fff",
  },

  // Goal Section Styles
  goalSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  goalCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  goalGradient: {
    padding: 20,
  },
  goalContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  goalSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },

  // Charts Section
  chartsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  modalSaveButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 25,
    fontStyle: "italic",
  },
  inputSection: {
    marginBottom: 25,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: "#2c3e50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputHint: {
    fontSize: 12,
    color: "#95a5a6",
    marginTop: 5,
    fontStyle: "italic",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalFooter: {
    alignItems: "center",
    paddingVertical: 20,
  },
  encouragementText: {
    fontSize: 16,
    color: "#667eea",
    fontWeight: "600",
    textAlign: "center",
  },
  bottomSpacing: {
    height: 30,
  },

  // Deprecated styles (keeping for compatibility)
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    width: (screenWidth - 80) / 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 5,
  },
  setGoalCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  setGoalText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginLeft: 15,
  },
  cancelButton: {
    fontSize: 16,
    color: "#666",
  },
  saveButton: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
  },
});
