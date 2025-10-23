import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    Animated,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { UserContext } from '@/context/UserContext';
import { generateRecipeFromText } from '@/service/AiModel';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Button from './Button';

const { width } = Dimensions.get('window');

interface BMIResult {
    bmi: number;
    category: string;
    color: string;
    description: string;
}

interface BMICategoryIndicatorProps {
    category: string;
    color: string;
}

const BMICategoryIndicator: React.FC<BMICategoryIndicatorProps> = ({ category, color }) => (
    <View style={[styles.categoryIndicator, { backgroundColor: `${color}20` }]}>
        <View style={[styles.categoryDot, { backgroundColor: color }]} />
        <Text style={[styles.categoryText, { color }]}>{category}</Text>
    </View>
);

export default function BMICalculator() {
    const context = useContext(UserContext);
    const router = useRouter();
    const { user } = context || {};

    const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);
    const [aiAdvice, setAiAdvice] = useState('');
    const [loading, setLoading] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const adviceOpacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (user?.height && user?.weight) {
            calculateBMI();
        }
    }, [user?.height, user?.weight]);

    const calculateBMI = () => {
        if (!user?.height || !user?.weight) {
            Alert.alert('Missing Data', 'Please update your profile with height and weight.');
            return;
        }

        const heightM = parseFloat(user.height) / 100;
        const weightKg = parseFloat(user.weight);

        if (isNaN(heightM) || isNaN(weightKg) || heightM <= 0 || weightKg <= 0) {
            Alert.alert('Invalid Data', 'Please check your height and weight values.');
            return;
        }

        const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
        let category = '', color = '', description = '';

        if (bmi < 18.5) {
            category = 'Underweight'; color = '#3498db'; description = 'Below healthy range';
        } else if (bmi < 25) {
            category = 'Normal'; color = '#2ecc71'; description = 'Within healthy range';
        } else if (bmi < 30) {
            category = 'Overweight'; color = '#f39c12'; description = 'Above healthy range';
        } else {
            category = 'Obese'; color = '#e74c3c'; description = 'Significantly above healthy range';
        }

        setBmiResult({ bmi, category, color, description });
        getAIAdvice(bmi, category);

        scaleAnim.setValue(0);
        Animated.spring(scaleAnim, { toValue: 1, tension: 40, friction: 7, useNativeDriver: true }).start();
    };

    const getAIAdvice = async (bmi: number, category: string) => {
        setLoading(true);
        setAiAdvice('');
        adviceOpacityAnim.setValue(0);
        try {
            const prompt = `
        User BMI: ${bmi} (${category}).
        Goal: ${user?.goal || 'General health'}.
        Provide concise, actionable diet and lifestyle advice (3-4 bullet points) 
        and a short motivational message. Be practical and supportive.
      `;
            const advice = await generateRecipeFromText(prompt);
            setAiAdvice(advice || 'Unable to generate advice.');
            Animated.timing(adviceOpacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        } catch (error) {
            setAiAdvice('Error fetching advice. Please try again.');
        }
        setLoading(false);
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Please log in to use the BMI Calculator.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>BMI Analysis</Text>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons name="body-outline" size={24} color="#667eea" />
                            <Text style={styles.infoValue}>{user.height} cm</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="scale-outline" size={24} color="#667eea" />
                            <Text style={styles.infoValue}>{user.weight} kg</Text>
                        </View>
                    </View>
                    <Button title="Re-calculate BMI" onPress={calculateBMI} variant="outline" icon="calculator-outline" />
                </View>

                {bmiResult && (
                    <Animated.View style={[styles.resultCard, { transform: [{ scale: scaleAnim }] }]}>
                        <Text style={styles.resultLabel}>Your Body Mass Index (BMI)</Text>
                        <Text style={[styles.bmiValue, { color: bmiResult.color }]}>{bmiResult.bmi}</Text>
                        <BMICategoryIndicator category={bmiResult.category} color={bmiResult.color} />
                        <Text style={styles.bmiDescription}>{bmiResult.description}</Text>
                    </Animated.View>
                )}

                <View style={styles.adviceCard}>
                    <View style={styles.adviceHeader}>
                        <Ionicons name="bulb-outline" size={24} color="#667eea" />
                        <Text style={styles.adviceTitle}>AI-Powered Health Advice</Text>
                    </View>
                    {loading ? (
                        <ActivityIndicator size="large" color="#667eea" style={{ marginVertical: 20 }} />
                    ) : (
                        <Animated.View style={{ opacity: adviceOpacityAnim }}>
                            <Text style={styles.aiAdviceText}>{aiAdvice}</Text>
                        </Animated.View>
                    )}
                </View>
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

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
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 20,
        zIndex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        flex: 1,
    },
    content: {
        padding: 20,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    infoItem: {
        alignItems: 'center',
    },
    infoValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 5,
    },
    resultCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    resultLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    bmiValue: {
        fontSize: 64,
        fontWeight: 'bold',
    },
    categoryIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginTop: 10,
    },
    categoryDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    categoryText: {
        fontSize: 16,
        fontWeight: '600',
    },
    bmiDescription: {
        fontSize: 14,
        color: '#888',
        marginTop: 10,
    },
    adviceCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    adviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    adviceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    aiAdviceText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
    },
    errorText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#666',
    },
});