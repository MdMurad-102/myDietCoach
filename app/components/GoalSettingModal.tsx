import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface GoalSettingModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveGoal: (goalData: any) => void;
}

const GoalSettingModal: React.FC<GoalSettingModalProps> = ({
  visible,
  onClose,
  onSaveGoal,
}) => {
  const [goalType, setGoalType] = useState<string>("weight");
  const [targetWeight, setTargetWeight] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [weeklyCalories, setWeeklyCalories] = useState("");
  const [dailyProtein, setDailyProtein] = useState("");
  const [weeklyWorkouts, setWeeklyWorkouts] = useState("");

  const goalTypes = [
    {
      id: "weight",
      label: "🎯 Weight Goal",
      icon: "scale",
      description: "Set your target weight",
    },
    {
      id: "fitness",
      label: "💪 Fitness Goal",
      icon: "fitness",
      description: "Set workout targets",
    },
    {
      id: "nutrition",
      label: "🥗 Nutrition Goal",
      icon: "nutrition",
      description: "Set daily nutrition targets",
    },
  ];

  const handleSave = () => {
    if (goalType === "weight" && !targetWeight) {
      Alert.alert("Missing Info", "Please enter your target weight");
      return;
    }

    const goalData = {
      type: goalType,
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
      targetDate: targetDate || undefined,
      weeklyCalories: weeklyCalories ? parseInt(weeklyCalories) : undefined,
      dailyProtein: dailyProtein ? parseInt(dailyProtein) : undefined,
      weeklyWorkouts: weeklyWorkouts ? parseInt(weeklyWorkouts) : undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveGoal(goalData);

    // Reset form
    setTargetWeight("");
    setTargetDate("");
    setWeeklyCalories("");
    setDailyProtein("");
    setWeeklyWorkouts("");

    Alert.alert(
      "Success! 🎉",
      "Your goal has been set! Let's work towards it together!",
      [{ text: "Let's Go!", onPress: onClose }]
    );
  };

  const handleReset = () => {
    setTargetWeight("");
    setTargetDate("");
    setWeeklyCalories("");
    setDailyProtein("");
    setWeeklyWorkouts("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={false}
    >
      <View style={styles.container}>
        <LinearGradient colors={["#4CAF50", "#45A049"]} style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Set Your Goals</Text>
            <Text style={styles.subtitle}>
              Let's create your success plan! 🚀
            </Text>
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.description}>
            Setting clear goals helps you stay motivated and track your
            progress! 💪
          </Text>

          {/* Goal Type Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Choose Your Goal Type</Text>
            <View style={styles.goalTypeContainer}>
              {goalTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.goalTypeCard,
                    goalType === type.id && styles.goalTypeCardActive,
                  ]}
                  onPress={() => setGoalType(type.id)}
                >
                  <View style={styles.goalTypeIcon}>
                    <Ionicons
                      name={type.icon as any}
                      size={24}
                      color={goalType === type.id ? "#4CAF50" : "#7f8c8d"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.goalTypeLabel,
                      goalType === type.id && styles.goalTypeLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                  <Text style={styles.goalTypeDescription}>
                    {type.description}
                  </Text>
                  {goalType === type.id && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark" size={16} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weight Goal Form */}
          {goalType === "weight" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚖️ Weight Goal Details</Text>

              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="flag" size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.inputTitleContainer}>
                    <Text style={styles.inputLabel}>🎯 Target Weight</Text>
                    <Text style={styles.inputHint}>
                      What's your goal weight?
                    </Text>
                  </View>
                </View>
                <TextInput
                  style={styles.input}
                  value={targetWeight}
                  onChangeText={setTargetWeight}
                  placeholder="e.g., 70 kg"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="calendar" size={20} color="#2196F3" />
                  </View>
                  <View style={styles.inputTitleContainer}>
                    <Text style={styles.inputLabel}>
                      📅 Target Date (Optional)
                    </Text>
                    <Text style={styles.inputHint}>
                      When do you want to achieve this?
                    </Text>
                  </View>
                </View>
                <TextInput
                  style={styles.input}
                  value={targetDate}
                  onChangeText={setTargetDate}
                  placeholder="e.g., 2024-12-31"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          )}

          {/* Fitness Goal Form */}
          {goalType === "fitness" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏋️‍♂️ Fitness Goal Details</Text>

              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="fitness" size={20} color="#FF6B6B" />
                  </View>
                  <View style={styles.inputTitleContainer}>
                    <Text style={styles.inputLabel}>💪 Weekly Workouts</Text>
                    <Text style={styles.inputHint}>
                      How many times per week?
                    </Text>
                  </View>
                </View>
                <TextInput
                  style={styles.input}
                  value={weeklyWorkouts}
                  onChangeText={setWeeklyWorkouts}
                  placeholder="e.g., 4 times per week"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          {/* Nutrition Goal Form */}
          {goalType === "nutrition" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🥗 Nutrition Goal Details</Text>

              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="flame" size={20} color="#FF6B6B" />
                  </View>
                  <View style={styles.inputTitleContainer}>
                    <Text style={styles.inputLabel}>🔥 Daily Calories</Text>
                    <Text style={styles.inputHint}>
                      Target calories per day
                    </Text>
                  </View>
                </View>
                <TextInput
                  style={styles.input}
                  value={weeklyCalories}
                  onChangeText={setWeeklyCalories}
                  placeholder="e.g., 2000 calories"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="nutrition" size={20} color="#4ECDC4" />
                  </View>
                  <View style={styles.inputTitleContainer}>
                    <Text style={styles.inputLabel}>💪 Daily Protein</Text>
                    <Text style={styles.inputHint}>
                      Target protein in grams
                    </Text>
                  </View>
                </View>
                <TextInput
                  style={styles.input}
                  value={dailyProtein}
                  onChangeText={setDailyProtein}
                  placeholder="e.g., 120 grams"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <LinearGradient
              colors={["#4CAF50", "#45A049"]}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="flag" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Set My Goal</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.encouragementBox}>
            <Text style={styles.encouragementText}>
              🌟 Great choice! Setting goals is the first step towards success!
              We'll help you track your progress every step of the way! 🌟
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 25,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  description: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 25,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 15,
  },
  goalTypeContainer: {
    gap: 12,
  },
  goalTypeCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: "#e9ecef",
    position: "relative",
  },
  goalTypeCardActive: {
    borderColor: "#4CAF50",
    backgroundColor: "#4CAF50" + "10",
  },
  goalTypeIcon: {
    marginBottom: 10,
  },
  goalTypeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 5,
  },
  goalTypeLabelActive: {
    color: "#4CAF50",
  },
  goalTypeDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  selectedIndicator: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50" + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  inputTitleContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 2,
  },
  inputHint: {
    fontSize: 12,
    color: "#7f8c8d",
    fontStyle: "italic",
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
  saveButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  encouragementBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  encouragementText: {
    fontSize: 14,
    color: "#4CAF50",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
  },
});

export default GoalSettingModal;
