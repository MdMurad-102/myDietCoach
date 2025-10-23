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
import Button from './Button';
import { useMealContext } from '@/context/UnifiedMealContext';

interface AddMealModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
}

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
  { id: 'lunch', label: 'Lunch', icon: 'partly-sunny-outline' },
  { id: 'dinner', label: 'Dinner', icon: 'moon-outline' },
  { id: 'snack', label: 'Snack', icon: 'cafe-outline' },
];

const AddMealModal: React.FC<AddMealModalProps> = ({
  visible,
  onClose,
  selectedDate,
}) => {
  const { addCustomMeal } = useMealContext();
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [mealType, setMealType] = useState('breakfast');

  const handleSave = async () => {
    if (!mealName || !calories || !protein) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }

    const mealData = {
      name: mealName,
      calories: parseInt(calories, 10),
      protein: parseInt(protein, 10),
      mealType,
      date: selectedDate,
    };

    await addCustomMeal(mealData);
    Alert.alert('Success!', 'Your meal has been added.', [
      { text: 'Great!', onPress: onClose },
    ]);
    // Reset form
    setMealName('');
    setCalories('');
    setProtein('');
    setMealType('breakfast');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <Text style={styles.title}>Add a Custom Meal</Text>
          <Text style={styles.subtitle}>
            Log your food intake for {selectedDate}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meal Type</Text>
            <View style={styles.mealTypeContainer}>
              {mealTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.mealTypeChip,
                    mealType === type.id && styles.mealTypeChipActive,
                  ]}
                  onPress={() => setMealType(type.id)}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={mealType === type.id ? '#fff' : '#667eea'}
                  />
                  <Text
                    style={[
                      styles.mealTypeLabel,
                      mealType === type.id && styles.mealTypeLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meal Details</Text>
            <TextInput
              style={styles.input}
              value={mealName}
              onChangeText={setMealName}
              placeholder="Meal Name (e.g., Chicken Salad)"
              placeholderTextColor="#999"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                value={calories}
                onChangeText={setCalories}
                placeholder="Calories (kcal)"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                value={protein}
                onChangeText={setProtein}
                placeholder="Protein (g)"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <Button
            title="Add Meal"
            onPress={handleSave}
            variant="primary"
            icon="add-circle-outline"
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
  mealTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  mealTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    width: '48%',
    marginBottom: 10,
    justifyContent: 'center',
  },
  mealTypeChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  mealTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338ca',
    marginLeft: 8,
  },
  mealTypeLabelActive: {
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
});

export default AddMealModal;
