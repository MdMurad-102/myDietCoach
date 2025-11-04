import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Button from './Button';

interface GoalSettingModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveGoal: (goalData: any) => void;
}

const goalTypes = [
  { id: 'weight', label: 'Weight', icon: 'scale-outline' },
  { id: 'fitness', label: 'Fitness', icon: 'barbell-outline' },
  { id: 'nutrition', label: 'Nutrition', icon: 'nutrition-outline' },
];

interface GoalTypeSelectorProps {
  selected: string;
  onSelect: (type: string) => void;
}

const GoalTypeSelector: React.FC<GoalTypeSelectorProps> = ({ selected, onSelect }) => (
  <View style={styles.goalTypeContainer}>
    {goalTypes.map(type => (
      <TouchableOpacity
        key={type.id}
        style={[
          styles.goalTypeChip,
          selected === type.id && styles.goalTypeChipActive,
        ]}
        onPress={() => onSelect(type.id)}
      >
        <Ionicons
          name={type.icon as any}
          size={20}
          color={selected === type.id ? '#fff' : '#667eea'}
        />
        <Text
          style={[
            styles.goalTypeLabel,
            selected === type.id && styles.goalTypeLabelActive,
          ]}
        >
          {type.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const GoalSettingModal: React.FC<GoalSettingModalProps> = ({
  visible,
  onClose,
  onSaveGoal,
}) => {
  const [goalType, setGoalType] = useState<string>('weight');
  const [targetWeight, setTargetWeight] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [weeklyWorkouts, setWeeklyWorkouts] = useState('');
  const [dailyCalories, setDailyCalories] = useState('');
  const [dailyProtein, setDailyProtein] = useState('');

  const handleSave = () => {
    if (goalType === 'weight' && !targetWeight) {
      Alert.alert('Missing Info', 'Please enter your target weight.');
      return;
    }

    const goalData = {
      type: goalType,
      targetWeight: targetWeight || undefined,
      targetDate: targetDate || undefined,
      weeklyWorkouts: weeklyWorkouts || undefined,
      dailyCalories: dailyCalories || undefined,
      dailyProtein: dailyProtein || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveGoal(goalData);
    Alert.alert('Success!', 'Your new goal is set. Let\'s achieve it!', [
      { text: 'Awesome!', onPress: onClose },
    ]);
  };

  const renderForm = () => {
    switch (goalType) {
      case 'weight':
        return (
          <>
            <Text style={styles.sectionTitle}>Weight Goal</Text>
            <TextInput
              style={styles.input}
              value={targetWeight}
              onChangeText={setTargetWeight}
              placeholder="Target Weight (e.g., 70 kg)"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="Target Date (e.g., 2024-12-31)"
              placeholderTextColor="#999"
            />
          </>
        );
      case 'fitness':
        return (
          <>
            <Text style={styles.sectionTitle}>Fitness Goal</Text>
            <TextInput
              style={styles.input}
              value={weeklyWorkouts}
              onChangeText={setWeeklyWorkouts}
              placeholder="Workouts per week (e.g., 4)"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </>
        );
      case 'nutrition':
        return (
          <>
            <Text style={styles.sectionTitle}>Nutrition Goal</Text>
            <TextInput
              style={styles.input}
              value={dailyCalories}
              onChangeText={setDailyCalories}
              placeholder="Daily Calorie Target (e.g., 2000 kcal)"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              value={dailyProtein}
              onChangeText={setDailyProtein}
              placeholder="Daily Protein Target (e.g., 150 g)"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <Text style={styles.title}>Set a New Goal</Text>
          <Text style={styles.subtitle}>Define what you want to achieve.</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's Your Focus?</Text>
            <GoalTypeSelector selected={goalType} onSelect={setGoalType} />
          </View>

          <View style={styles.section}>{renderForm()}</View>

          <Button
            title="Save Goal"
            onPress={handleSave}
            variant="primary"
            icon="checkmark-circle-outline"
            style={{ marginTop: 20 }}
          />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 35,
    right: 20,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  goalTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  goalTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  goalTypeChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  goalTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338ca',
    marginLeft: 8,
  },
  goalTypeLabelActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
});

export default GoalSettingModal;
