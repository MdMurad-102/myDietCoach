import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMealContext } from '@/context/UnifiedMealContext';
import Button from './Button'; // Import the new Button component

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

  const [steps, setSteps] = useState('0');
  const [workoutMinutes, setWorkoutMinutes] = useState('0');
  const [calories, setCalories] = useState('0');
  const [protein, setProtein] = useState('0');

  useEffect(() => {
    if (visible && todayPlan) {
      setCalories((todayPlan.consumedCalories || 0).toString());
      setProtein((todayPlan.consumedProtein || 0).toString());
    }
  }, [visible, todayPlan]);

  const handleSave = () => {
    updateCurrentProgress(parseInt(calories) || 0, parseInt(protein) || 0);
    Alert.alert('Success', 'Progress updated successfully!');
    onClose();
  };

  const handleReset = () => {
    setSteps('0');
    setWorkoutMinutes('0');
    if (todayPlan) {
      setCalories((todayPlan.consumedCalories || 0).toString());
      setProtein((todayPlan.consumedProtein || 0).toString());
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
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
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
            <Text style={styles.inputLabel}>🚶‍♂️ Steps Today</Text>
            <TextInput
              style={styles.input}
              value={steps}
              onChangeText={setSteps}
              placeholder="e.g., 8500"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            <Text style={styles.goalText}>Goal: 10,000 steps daily</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🏋️‍♂️ Workout Time (minutes)</Text>
            <TextInput
              style={styles.input}
              value={workoutMinutes}
              onChangeText={setWorkoutMinutes}
              placeholder="e.g., 30"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            <Text style={styles.goalText}>Recommended: 30+ minutes daily</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>🔥 Calories Consumed</Text>
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              placeholder="e.g., 1800"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            <Text style={styles.goalText}>Your daily goal: 2000 calories</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>💪 Protein Intake (grams)</Text>
            <TextInput
              style={styles.input}
              value={protein}
              onChangeText={setProtein}
              placeholder="e.g., 120"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            <Text style={styles.goalText}>Your daily goal: 120g protein</Text>
          </View>

          <Button
            title="Save My Progress"
            onPress={handleSave}
            variant="primary"
            icon="checkmark-circle-outline"
            style={{ marginTop: 20, marginBottom: 20 }}
          />

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
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  goalText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  encouragementBox: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  encouragementText: {
    fontSize: 14,
    color: '#667eea',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default ProgressUpdateModal;
