import { useTheme } from '@/context/ThemeContext';
import { useMealContext } from '@/context/UnifiedMealContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';

export default function SimpleWaterTracker() {
  const { currentDayPlan, updateWaterIntake } = useMealContext();
  const { colors, isDarkMode } = useTheme();
  const waterConsumed = currentDayPlan?.waterGlasses || 0;
  const waterGoal = currentDayPlan?.goals.water || 8;
  const progress = waterGoal > 0 ? waterConsumed / waterGoal : 0;

  const handleAddWater = () => {
    if (waterConsumed < waterGoal) {
      updateWaterIntake(waterConsumed + 1);
    }
  };

  const handleRemoveWater = () => {
    if (waterConsumed > 0) {
      updateWaterIntake(waterConsumed - 1);
    }
  };

  return (
    <LinearGradient
      colors={isDarkMode ? [colors.surface, colors.card] : ['#E0F7FA', '#B2EBF2']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Ionicons name="water-outline" size={26} color="#00796B" />
        <Text style={[styles.title, { color: isDarkMode ? colors.text : '#004D40' }]}>Water Intake</Text>
      </View>

      <View style={styles.tracker}>
        <TouchableOpacity onPress={handleRemoveWater} style={styles.button}>
          <Ionicons name="remove-outline" size={30} color="#00796B" />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <Progress.Circle
            size={120}
            progress={progress}
            showsText={false}
            color="#00796B"
            unfilledColor="rgba(0, 121, 107, 0.1)"
            borderWidth={0}
            thickness={10}
            strokeCap="round"
          />
          <View style={styles.progressTextContainer}>
            <Text style={[styles.waterConsumedText, { color: colors.text }]}>{waterConsumed}</Text>
            <Text style={[styles.waterGoalText, { color: colors.textSecondary }]}>/ {waterGoal} glasses</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleAddWater} style={styles.button}>
          <Ionicons name="add-outline" size={30} color="#00796B" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#00796B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 10,
  },
  tracker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  button: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 50,
  },
  progressContainer: {
    alignItems: 'center',
    position: 'relative',
    width: 120,
    height: 120,
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterConsumedText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00796B',
  },
  waterGoalText: {
    fontSize: 14,
    color: '#004D40',
  },
});
