import { useTheme } from "@/context/ThemeContext";
import { useMealContext } from "@/context/UnifiedMealContext";
import { UserContext } from "@/context/UserContext";
import { getWeightHistory } from "@/service/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
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
  const { colors } = useTheme();
  const { dailyMealPlans, refreshMealData } = useMealContext();
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("This Week");
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [loadingWeight, setLoadingWeight] = useState(true);

  const loadWeightData = async () => {
    if (!context?.user?.id) return;

    setLoadingWeight(true);
    try {
      // Calculate date range based on selected period
      const today = new Date();
      let startDate = new Date();

      switch (selectedPeriod) {
        case "This Week":
          startDate.setDate(today.getDate() - 7);
          break;
        case "This Month":
          startDate.setMonth(today.getMonth() - 1);
          break;
        case "3 Months":
          startDate.setMonth(today.getMonth() - 3);
          break;
      }

      // Fetch weight logs for the selected period
      const logs = await getWeightHistory(
        context.user.id,
        startDate.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );

      setWeightLogs(logs);

      console.log('📥 LOADED WEIGHT LOGS:', {
        totalLogs: logs.length,
        period: selectedPeriod
      });
    } catch (error) {
      console.error('Error loading weight data:', error);
    } finally {
      setLoadingWeight(false);
    }
  };

  useEffect(() => {
    // Refresh meal data when component mounts
    refreshMealData();
    loadWeightData();
  }, []);

  useEffect(() => {
    // Reload weight data when period changes
    loadWeightData();
  }, [selectedPeriod]);

  if (!context) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { user } = context;

  const {
    weightData,
    bmiData,
    calorieData,
    proteinData,
    filteredDates
  } = useMemo(() => {
    // Get dates based on selected period
    const today = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case "This Week":
        startDate.setDate(today.getDate() - 7);
        break;
      case "This Month":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "3 Months":
        startDate.setMonth(today.getMonth() - 3);
        break;
    }

    // Get all dates in the range and sort them
    const dates = Object.keys(dailyMealPlans)
      .filter(date => {
        const planDate = new Date(date);
        return planDate >= startDate && planDate <= today;
      })
      .sort();

    // Get user's current weight and height
    const currentWeight = parseFloat(String(user?.weight || 70));
    const currentHeight = parseFloat(String(user?.height || 170));

    // Get user's creation date
    const userCreatedDate = user?.created_at
      ? new Date(user.created_at).toISOString().split('T')[0]
      : startDate.toISOString().split('T')[0];

    // Generate weight data from database logs
    let weightDataPoints: any[] = [];

    // STARTING WEIGHT = The weight user entered when creating account (user.weight in profile)
    // This is the FIXED baseline weight that NEVER changes
    const startingWeight = parseFloat(String(user?.weight || 70));
    const startingDate = user?.created_at
      ? new Date(user.created_at).toISOString().split('T')[0]
      : startDate.toISOString().split('T')[0];

    console.log('🏋️ STARTING WEIGHT from PROFILE (account creation):', {
      weight: startingWeight + ' kg',
      date: startingDate,
      userId: user?.id
    });

    // ALWAYS add the profile weight as the STARTING POINT (72kg from account creation)
    weightDataPoints.push({
      date: startingDate,
      value: startingWeight
    });

    console.log('📊 STARTING POINT ADDED:', startingWeight, 'kg on', startingDate);

    if (weightLogs && weightLogs.length > 0) {
      // Sort logged weights by date
      const sortedLogs = [...weightLogs].sort((a, b) =>
        new Date(a.log_date).getTime() - new Date(b.log_date).getTime()
      );

      console.log('📝 CURRENT WEIGHT LOGS:', sortedLogs.length, 'logs');

      // Add all logged weights (current weight updates like 62kg)
      sortedLogs.forEach(log => {
        const logDate = log.log_date;
        const logWeight = parseFloat(log.weight);

        console.log('  ➕ Adding log:', logDate, '=', logWeight, 'kg');

        // Skip if same date as account creation to avoid duplicate
        if (logDate !== startingDate) {
          weightDataPoints.push({
            date: logDate,
            value: logWeight
          });
          console.log('    ✅ Added to chart');
        } else {
          console.log('    ⚠️ Skipped (same as account creation date)');
        }
      });

      const currentWeight = weightDataPoints[weightDataPoints.length - 1].value;
      const weightChange = startingWeight - currentWeight;

      console.log('✅ WEIGHT JOURNEY:', {
        STARTING: startingWeight + ' kg (from profile - account creation)',
        CURRENT: currentWeight + ' kg (latest log)',
        CHANGE: weightChange.toFixed(1) + ' kg ' + (weightChange > 0 ? 'lost' : 'gained'),
        TOTAL_POINTS: weightDataPoints.length
      });
    } else {
      // No current weight logged yet - only show starting weight
      console.log('⚠️ No weight logs yet, showing starting weight only');
    }

    // Weight data structure:
    // - First point: user.weight (72kg from account creation - FIXED)
    // - Rest: logged weights (62kg, etc. - user's current progress)
    console.log('🎯 FINAL WEIGHT DATA:', {
      totalPoints: weightDataPoints.length,
      points: weightDataPoints,
      startingWeight: weightDataPoints[0]?.value,
      endingWeight: weightDataPoints[weightDataPoints.length - 1]?.value
    });

    // Generate BMI data based on weight logs
    const bmiDataPoints = weightDataPoints.map(point => {
      const bmi = point.value / Math.pow(currentHeight / 100, 2);
      return {
        date: point.date,
        value: parseFloat(bmi.toFixed(1))
      };
    });

    // Get real calorie data from daily plans
    const calorieDataPoints = dates.map(date => {
      const plan = dailyMealPlans[date];
      return {
        date,
        value: plan?.consumedCalories || 0
      };
    });

    // Get real protein data from daily plans
    const proteinDataPoints = dates.map(date => {
      const plan = dailyMealPlans[date];
      return {
        date,
        value: plan?.consumedProtein || 0
      };
    });

    return {
      weightData: weightDataPoints,
      bmiData: bmiDataPoints,
      calorieData: calorieDataPoints,
      proteinData: proteinDataPoints,
      filteredDates: dates
    };
  }, [dailyMealPlans, selectedPeriod, user, weightLogs]);

  const addProgress = (data: any) => {
    // This could be implemented to save weight tracking data to backend
    console.log("Progress logged:", data);
  };

  const handleSaveGoal = (goalData: any) => {
    console.log("Goal saved:", goalData);
    setShowGoalModal(false);
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loginRequired, { color: colors.textSecondary }]}>Please login to view progress</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
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
        onSuccess={() => {
          loadWeightData(); // Reload weight data after logging
        }}
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
