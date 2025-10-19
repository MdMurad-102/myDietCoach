import { useMealContext } from "@/context/UnifiedMealContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ProgressUpdateModalProps {
  visible: boolean;
  onClose: () => void;
}

const ProgressUpdateModal: React.FC<ProgressUpdateModalProps> = ({
  visible,
  onClose,
}) => {
  const { getTodayMealPlan, updateCurrentProgress } = useMealContext();
  const todayPlan = getTodayMealPlan();

  const [steps, setSteps] = useState("0");
  const [workoutMinutes, setWorkoutMinutes] = useState("0");
  const [calories, setCalories] = useState(
    (todayPlan?.consumedCalories || 0).toString()
  );
  const [protein, setProtein] = useState(
    (todayPlan?.consumedProtein || 0).toString()
  );

  const handleSave = () => {
    updateCurrentProgress(parseInt(calories) || 0, parseInt(protein) || 0);

    Alert.alert("Success", "Progress updated successfully!");
    onClose();
  };

  const handleReset = () => {
    if (todayPlan) {
      setSteps("0");
      setWorkoutMinutes("0");
      setCalories(todayPlan.consumedCalories?.toString() || "0");
      setProtein(todayPlan.consumedProtein?.toString() || "0");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={false}
    >
      <View style={styles.container}>
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Update Your Progress</Text>
            <Text style={styles.subtitle}>
              Track your daily achievements! 🎯
            </Text>
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.description}>
            Update your daily progress to keep track of your health journey! 💪
          </Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="walk" size={20} color="#45B7D1" />
              </View>
              <View style={styles.inputTitleContainer}>
                <Text style={styles.inputLabel}>🚶‍♂️ Steps Today</Text>
                <Text style={styles.inputHint}>
                  How many steps did you take?
                </Text>
              </View>
            </View>
            <TextInput
              style={styles.input}
              value={steps}
              onChangeText={setSteps}
              placeholder="e.g., 8500 steps"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            <Text style={styles.goalText}>Goal: 10,000 steps daily</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="timer" size={20} color="#FF6B6B" />
              </View>
              <View style={styles.inputTitleContainer}>
                <Text style={styles.inputLabel}>🏋️‍♂️ Workout Time</Text>
                <Text style={styles.inputHint}>Minutes of exercise today</Text>
              </View>
            </View>
            <TextInput
              style={styles.input}
              value={workoutMinutes}
              onChangeText={setWorkoutMinutes}
              placeholder="e.g., 30 minutes"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            <Text style={styles.goalText}>Recommended: 30+ minutes daily</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="flame" size={20} color="#FF6B6B" />
              </View>
              <View style={styles.inputTitleContainer}>
                <Text style={styles.inputLabel}>🔥 Calories Consumed</Text>
                <Text style={styles.inputHint}>Total calories eaten today</Text>
              </View>
            </View>
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              placeholder="e.g., 1800 calories"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            <Text style={styles.goalText}>Your daily goal: 2000 calories</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="fitness" size={20} color="#4ECDC4" />
              </View>
              <View style={styles.inputTitleContainer}>
                <Text style={styles.inputLabel}>💪 Protein Intake</Text>
                <Text style={styles.inputHint}>Grams of protein consumed</Text>
              </View>
            </View>
            <TextInput
              style={styles.input}
              value={protein}
              onChangeText={setProtein}
              placeholder="e.g., 120 grams"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            <Text style={styles.goalText}>Your daily goal: 120g protein</Text>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <LinearGradient
              colors={["#27ae60", "#2ecc71"]}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save My Progress</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.encouragementBox}>
            <Text style={styles.encouragementText}>
              🌟 Great job tracking your progress! Every small step counts
              towards your health goals! 🌟
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
  inputGroup: {
    marginBottom: 25,
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
    marginBottom: 8,
  },
  goalText: {
    fontSize: 12,
    color: "#27ae60",
    fontWeight: "500",
    fontStyle: "italic",
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
    color: "#667eea",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
  },
});

export default ProgressUpdateModal;
