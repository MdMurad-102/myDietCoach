import { UserContext } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";

// Only import database on native platforms
let getWaterTracking: any, trackWater: any;
if (Platform.OS !== 'web') {
  const tracking = require("@/database/tracking");
  getWaterTracking = tracking.getWaterTracking;
  trackWater = tracking.trackWater;
}

const SimpleWaterTracker: React.FC = () => {
  const context = useContext(UserContext);
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!context) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { user } = context;
  const today = new Date().toISOString().split("T")[0];
  const waterGoal = user?.daily_water_goal || 2000;
  const progressPercentage = Math.min((waterConsumed / waterGoal) * 100, 100);

  // Load water data
  useEffect(() => {
    async function loadWaterData() {
      if (!user?.id) return;

      // Skip database on web - use local state only
      if (Platform.OS === 'web') {
        return;
      }

      try {
        const data = await getWaterTracking(user.id, today);
        if (data) {
          setWaterConsumed(data.water_consumed);
        }
      } catch (error) {
        console.error("Error loading water data:", error);
      }
    }

    loadWaterData();
  }, [user?.id, today]);

  const handleAddWater = async (amount: number) => {
    if (!user?.id || loading) return;

    try {
      setLoading(true);

      // On web, just update local state (no database)
      if (Platform.OS === 'web') {
        setWaterConsumed(prev => prev + amount);
        setLoading(false);
        return;
      }

      await trackWater(user.id, today, amount);

      // Reload water data
      const data = await getWaterTracking(user.id, today);
      if (data) {
        setWaterConsumed(data.water_consumed);
      }
    } catch (error) {
      console.error("Error adding water:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="water" size={24} color="#2196F3" />
        <Text style={styles.title}>Water Intake</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {waterConsumed}ml / {waterGoal}ml
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddWater(250)}
        >
          <Text style={styles.buttonText}>+250ml</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddWater(500)}
        >
          <Text style={styles.buttonText}>+500ml</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E3F2FD",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2196F3",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  addButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default SimpleWaterTracker;
