import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Animated,
    Alert,
} from 'react-native';
import { UserContext } from '@/context/UserContext';
import { GenerateRecipeAi } from '@/service/AiModel';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface BMIResult {
    bmi: number;
    category: string;
    color: string;
    description: string;
    healthRisk: string;
}

export default function BMICalculator() {
    const context = useContext(UserContext);
    const router = useRouter();

    if (!context) {
        throw new Error('UserContext must be used within a UserProvider');
    }

    const { user } = context;
    const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);
    const [aiAdvice, setAiAdvice] = useState('');
    const [loading, setLoading] = useState(false);
    const [scaleAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (user?.height && user?.weight) {
            calculateBMI();
        }
    }, []);

    const calculateBMI = async () => {
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

        let category = '';
        let color = '';
        let description = '';
        let healthRisk = '';

        if (bmi < 18.5) {
            category = 'Underweight';
            color = '#3498db';
            description = 'You are below the healthy weight range';
            healthRisk = 'May indicate malnutrition or other health issues';
        } else if (bmi < 25) {
            category = 'Normal Weight';
            color = '#2ecc71';
            description = 'You are in the healthy weight range';
            healthRisk = 'Low risk of weight-related health issues';
        } else if (bmi < 30) {
            category = 'Overweight';
            color = '#f39c12';
            description = 'You are above the healthy weight range';
            healthRisk = 'Moderate risk of weight-related health issues';
        } else {
            category = 'Obese';
            color = '#e74c3c';
            description = 'You are significantly above the healthy weight range';
            healthRisk = 'High risk of weight-related health issues';
        }

        setBmiResult({ bmi, category, color, description, healthRisk });

        // Animate the BMI gauge
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();

        // Get AI advice
        await getAIAdvice(bmi, category);
    };

    const getAIAdvice = async (bmi: number, category: string) => {
        setLoading(true);
        try {
            const prompt = `
You are a certified nutritionist. A user has the following details:
- BMI: ${bmi} (${category})
- Age: ${user?.age || 'Not specified'}
- Current Weight: ${user?.weight}kg
- Height: ${user?.height}cm
- Goal: ${user?.goal || 'General health'}
- Diet Type: ${user?.diet_type || 'No preference'}

Please provide:
1. A clear interpretation of their BMI and what it means for their health
2. 5 specific, actionable diet recommendations tailored to their BMI category
3. A sample balanced meal plan for ONE day (breakfast, lunch, dinner, snacks) with approximate calories
4. Motivational message to encourage them

Keep the advice practical, friendly, and culturally appropriate. Format with clear sections.
`;

            const advice = await GenerateRecipeAi(prompt);
            setAiAdvice(advice || 'Unable to generate advice at this time. Please try again.');
        } catch (error) {
            console.error('Error getting AI advice:', error);
            setAiAdvice('Unable to generate AI advice. Please check your connection and try again.');
        }
        setLoading(false);
    };

    const getBMIPosition = (bmi: number) => {
        // Map BMI to position on scale (0-100%)
        // Range: 15 (left) to 35 (right)
        const minBMI = 15;
        const maxBMI = 35;
        const clampedBMI = Math.min(Math.max(bmi, minBMI), maxBMI);
        return ((clampedBMI - minBMI) / (maxBMI - minBMI)) * 100;
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Please log in to use BMI Calculator</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>BMI Calculator</Text>
                <Text style={styles.headerSubtitle}>Body Mass Index & Health Analysis</Text>
            </LinearGradient>

            {/* User Info Card */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Ionicons name="resize" size={24} color="#667eea" />
                        <Text style={styles.infoLabel}>Height</Text>
                        <Text style={styles.infoValue}>{user.height} cm</Text>
                    </View>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoItem}>
                        <Ionicons name="fitness" size={24} color="#667eea" />
                        <Text style={styles.infoLabel}>Weight</Text>
                        <Text style={styles.infoValue}>{user.weight} kg</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.calculateButton}
                    onPress={calculateBMI}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="calculator" size={20} color="#fff" />
                        <Text style={styles.calculateButtonText}>Calculate BMI</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* BMI Result */}
            {bmiResult && (
                <Animated.View
                    style={[
                        styles.resultCard,
                        { transform: [{ scale: scaleAnim }] }
                    ]}
                >
                    {/* BMI Value */}
                    <View style={[styles.bmiCircle, { borderColor: bmiResult.color }]}>
                        <Text style={[styles.bmiValue, { color: bmiResult.color }]}>
                            {bmiResult.bmi}
                        </Text>
                        <Text style={styles.bmiLabel}>BMI</Text>
                    </View>

                    {/* Category Badge */}
                    <View style={[styles.categoryBadge, { backgroundColor: bmiResult.color }]}>
                        <Text style={styles.categoryText}>{bmiResult.category}</Text>
                    </View>

                    <Text style={styles.descriptionText}>{bmiResult.description}</Text>

                    {/* BMI Scale */}
                    <View style={styles.scaleContainer}>
                        <View style={styles.scale}>
                            <View style={[styles.scaleSection, { backgroundColor: '#3498db' }]} />
                            <View style={[styles.scaleSection, { backgroundColor: '#2ecc71' }]} />
                            <View style={[styles.scaleSection, { backgroundColor: '#f39c12' }]} />
                            <View style={[styles.scaleSection, { backgroundColor: '#e74c3c' }]} />
                        </View>

                        {/* BMI Indicator */}
                        <View
                            style={[
                                styles.indicator,
                                { left: `${getBMIPosition(bmiResult.bmi)}%` }
                            ]}
                        >
                            <View style={[styles.indicatorDot, { backgroundColor: bmiResult.color }]} />
                        </View>

                        {/* Scale Labels */}
                        <View style={styles.scaleLabels}>
                            <Text style={styles.scaleLabel}>15</Text>
                            <Text style={styles.scaleLabel}>18.5</Text>
                            <Text style={styles.scaleLabel}>25</Text>
                            <Text style={styles.scaleLabel}>30</Text>
                            <Text style={styles.scaleLabel}>35</Text>
                        </View>
                    </View>

                    {/* Health Risk */}
                    <View style={styles.riskContainer}>
                        <Ionicons name="information-circle" size={20} color={bmiResult.color} />
                        <Text style={styles.riskText}>{bmiResult.healthRisk}</Text>
                    </View>
                </Animated.View>
            )}

            {/* AI Advice Section */}
            {loading && (
                <View style={styles.loadingCard}>
                    <Text style={styles.loadingText}>🤖 AI is analyzing your BMI...</Text>
                </View>
            )}

            {aiAdvice && !loading && (
                <View style={styles.adviceCard}>
                    <View style={styles.adviceHeader}>
                        <Ionicons name="medical" size={24} color="#667eea" />
                        <Text style={styles.adviceTitle}>AI Nutritionist Advice</Text>
                    </View>
                    <View style={styles.adviceDivider} />
                    <Text style={styles.adviceText}>{aiAdvice}</Text>
                </View>
            )}

            {/* BMI Categories Reference */}
            <View style={styles.referenceCard}>
                <Text style={styles.referenceTitle}>BMI Categories</Text>
                <View style={styles.referenceItem}>
                    <View style={[styles.referenceDot, { backgroundColor: '#3498db' }]} />
                    <Text style={styles.referenceText}>Underweight: Less than 18.5</Text>
                </View>
                <View style={styles.referenceItem}>
                    <View style={[styles.referenceDot, { backgroundColor: '#2ecc71' }]} />
                    <Text style={styles.referenceText}>Normal: 18.5 - 24.9</Text>
                </View>
                <View style={styles.referenceItem}>
                    <View style={[styles.referenceDot, { backgroundColor: '#f39c12' }]} />
                    <Text style={styles.referenceText}>Overweight: 25 - 29.9</Text>
                </View>
                <View style={styles.referenceItem}>
                    <View style={[styles.referenceDot, { backgroundColor: '#e74c3c' }]} />
                    <Text style={styles.referenceText}>Obese: 30 or greater</Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push('/NewUser/Index')}
                >
                    <Ionicons name="create" size={20} color="#667eea" />
                    <Text style={styles.actionButtonText}>Update Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push('/recipeGenerator' as any)}
                >
                    <Ionicons name="restaurant" size={20} color="#667eea" />
                    <Text style={styles.actionButtonText}>Get Meal Plan</Text>
                </TouchableOpacity>
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
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
    },
    infoCard: {
        backgroundColor: '#fff',
        margin: 20,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    infoItem: {
        flex: 1,
        alignItems: 'center',
    },
    infoDivider: {
        width: 1,
        height: 60,
        backgroundColor: '#e0e0e0',
    },
    infoLabel: {
        fontSize: 14,
        color: '#757575',
        marginTop: 8,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
    },
    calculateButton: {
        borderRadius: 15,
        overflow: 'hidden',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    calculateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    resultCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    bmiCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    bmiValue: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    bmiLabel: {
        fontSize: 16,
        color: '#757575',
        marginTop: 4,
    },
    categoryBadge: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 15,
    },
    categoryText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    descriptionText: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        marginBottom: 20,
    },
    scaleContainer: {
        width: '100%',
        marginVertical: 20,
    },
    scale: {
        flexDirection: 'row',
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
    },
    scaleSection: {
        flex: 1,
    },
    indicator: {
        position: 'absolute',
        top: -8,
        marginLeft: -8,
    },
    indicatorDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: '#fff',
    },
    scaleLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    scaleLabel: {
        fontSize: 12,
        color: '#757575',
    },
    riskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 12,
        gap: 10,
    },
    riskText: {
        flex: 1,
        fontSize: 14,
        color: '#424242',
    },
    loadingCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    loadingText: {
        fontSize: 16,
        color: '#757575',
    },
    adviceCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    adviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 15,
    },
    adviceTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#212121',
    },
    adviceDivider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginBottom: 15,
    },
    adviceText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#424242',
    },
    referenceCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    referenceTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 15,
    },
    referenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    referenceDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    referenceText: {
        fontSize: 15,
        color: '#424242',
    },
    actionsContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        gap: 15,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderRadius: 15,
        gap: 8,
        borderWidth: 2,
        borderColor: '#667eea',
    },
    actionButtonText: {
        color: '#667eea',
        fontSize: 15,
        fontWeight: '600',
    },
    errorText: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        marginTop: 50,
    },
});
