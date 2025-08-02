import { UserContext } from "@/context/UserContext";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import React, { useContext, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const WaterTracker: React.FC = () => {
  const context = useContext(UserContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  if (!context) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { user } = context;
  const today = new Date().toISOString().split("T")[0];

  // Get today's water data
  const waterData = useQuery(
    api.allRecipe.GetWaterTracking,
    user?._id ? { userId: user._id, date: today } : "skip"
  );

  const addWater = useMutation(api.allRecipe.AddWaterIntake);

  const handleAddWater = async (amount: number) => {
    if (!user?._id) return;

    try {
      await addWater({
        userId: user._id,
        date: today,
        amount: amount,
      });
    } catch (error) {
      console.error("Error adding water:", error);
      Alert.alert("Error", "Failed to add water intake");
    }
  };

  const handleCustomAmount = () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    handleAddWater(amount);
    setCustomAmount("");
    setModalVisible(false);
  };

  const dailyGoal = user?.dailyWaterGoal || 2000; // Default 2L
  const consumed = waterData?.waterConsumed || 0;
  const progressPercentage = Math.min((consumed / dailyGoal) * 100, 100);
  const remainingWater = Math.max(dailyGoal - consumed, 0);

  const getProgressColor = () => {
    if (progressPercentage >= 100) return "#4CAF50";
    if (progressPercentage >= 70) return "#2196F3";
    if (progressPercentage >= 40) return "#FF9800";
    return "#F44336";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="water" size={24} color="#2196F3" />
        <Text style={styles.title}>💧 Water Intake</Text>
      </View>

      {/* Progress Circle */}
      <View style={styles.progressSection}>
        <View style={styles.progressCircle}>
          <View
            style={[styles.progressInner, { borderColor: getProgressColor() }]}
          >
            <Text style={styles.progressText}>
              {Math.round(progressPercentage)}%
            </Text>
            <Text style={styles.progressSubtext}>
              {(consumed / 1000).toFixed(1)}L / {(dailyGoal / 1000).toFixed(1)}L
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.statLabel}>Consumed</Text>
            <Text style={styles.statValue}>{consumed}ml</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="timer" size={20} color="#FF9800" />
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={styles.statValue}>{remainingWater}ml</Text>
          </View>
        </View>
      </View>

      {/* Quick Add Buttons */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => handleAddWater(250)}
          >
            <Ionicons name="wine" size={20} color="#2196F3" />
            <Text style={styles.buttonText}>Glass</Text>
            <Text style={styles.buttonSubtext}>250ml</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => handleAddWater(500)}
          >
            <Ionicons name="flask" size={20} color="#4CAF50" />
            <Text style={styles.buttonText}>Bottle</Text>
            <Text style={styles.buttonSubtext}>500ml</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => handleAddWater(1000)}
          >
            <Ionicons name="fitness" size={20} color="#FF9800" />
            <Text style={styles.buttonText}>Large</Text>
            <Text style={styles.buttonSubtext}>1L</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickButton, styles.customButton]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle" size={20} color="#9C27B0" />
            <Text style={styles.buttonText}>Custom</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Glasses Progress */}
      <View style={styles.glassesSection}>
        <Text style={styles.sectionTitle}>Today's Glasses</Text>
        <View style={styles.glassesRow}>
          {Array.from({ length: 8 }, (_, index) => {
            const glassAmount = 250;
            const filled = consumed >= (index + 1) * glassAmount;
            return (
              <View key={index} style={styles.glassContainer}>
                <Ionicons
                  name={filled ? "wine" : "wine-outline"}
                  size={24}
                  color={filled ? "#2196F3" : "#E0E0E0"}
                />
              </View>
            );
          })}
        </View>
      </View>

      {/* Custom Amount Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Amount</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter amount in ml"
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleCustomAmount}
              >
                <Text style={styles.addButtonText}>Add Water</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
    color: "#333",
  },
  progressSection: {
    alignItems: "center",
    marginBottom: 25,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  progressInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  progressSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 2,
  },
  quickActions: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickButton: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 3,
  },
  customButton: {
    backgroundColor: "#f3e5f5",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginTop: 5,
  },
  buttonSubtext: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
  },
  glassesSection: {
    marginBottom: 10,
  },
  glassesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  glassContainer: {
    flex: 1,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  addButton: {
    backgroundColor: "#2196F3",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default WaterTracker;
