import { UserContext } from '@/context/UserContext';
import { logWeight } from '@/service/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from './Button';

interface ProgressUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProgressUpdateModal: React.FC<ProgressUpdateModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const context = useContext(UserContext);
  const user = context?.user;

  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && user?.weight) {
      setWeight(user.weight.toString());
    }
  }, [visible, user]);

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    const weightValue = parseFloat(weight);
    if (!weightValue || weightValue <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid weight');
      return;
    }

    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      await logWeight(user.id, weightValue, today, notes);

      Alert.alert('Success', 'Weight logged successfully! 🎉');

      // Call onSuccess callback to refresh data
      onSuccess?.();

      // Reset and close
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error logging weight:', error);
      Alert.alert('Error', 'Failed to log weight. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (user?.weight) {
      setWeight(user.weight.toString());
    }
    setNotes('');
  };

  const calculateBMI = () => {
    const weightValue = parseFloat(weight);
    const heightValue = parseFloat(user?.height || '0');

    if (weightValue && heightValue) {
      const bmi = weightValue / Math.pow(heightValue / 100, 2);
      return bmi.toFixed(1);
    }
    return '0.0';
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
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Log Your Weight</Text>
            <Text style={styles.subtitle}>
              Track your weight journey! ⚖️
            </Text>
          </View>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.description}>
            Log your current weight to track your progress over time! 💪
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>⚖️ Current Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="e.g., 65.5"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
            <Text style={styles.goalText}>Enter your weight in kilograms</Text>
          </View>

          <View style={styles.bmiCard}>
            <Text style={styles.bmiLabel}>Estimated BMI</Text>
            <Text style={styles.bmiValue}>{calculateBMI()}</Text>
            <Text style={styles.bmiInfo}>
              {user?.height ? `Based on height: ${user.height} cm` : 'Update height in profile'}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>� Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about your progress..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <Button
            title={loading ? 'Saving...' : 'Log Weight'}
            onPress={handleSave}
            variant="primary"
            icon="checkmark-circle-outline"
            disabled={loading}
            style={{ marginTop: 20, marginBottom: 20 }}
          />

          {loading && (
            <ActivityIndicator size="large" color="#667eea" style={{ marginBottom: 20 }} />
          )}

          <View style={styles.encouragementBox}>
            <Text style={styles.encouragementText}>
              🌟 Consistency is key! Log your weight regularly to see your progress! 🌟
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
    zIndex: 10,
    elevation: 5,
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
    zIndex: 10,
    elevation: 5,
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
  bmiCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#4CAF50',
  },
  bmiLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  bmiValue: {
    fontSize: 36,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bmiInfo: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
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
