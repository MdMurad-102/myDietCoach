import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function BMICalculator() {
    const { colors } = useTheme();
    const router = useRouter();

    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState<"male" | "female">("male");
    const [bmi, setBMI] = useState<number | null>(null);
    const [bmr, setBMR] = useState<number | null>(null);
    const [bmiCategory, setBMICategory] = useState("");

    const calculateBMI = () => {
        const weightNum = parseFloat(weight);
        const heightNum = parseFloat(height);
        const ageNum = parseFloat(age);

        if (!weightNum || !heightNum || weightNum <= 0 || heightNum <= 0) {
            alert("Please enter valid weight and height values");
            return;
        }

        // Calculate BMI: weight (kg) / (height (cm) / 100)^2
        const heightInMeters = heightNum / 100;
        const bmiValue = weightNum / (heightInMeters * heightInMeters);
        setBMI(parseFloat(bmiValue.toFixed(1)));

        // Determine BMI category
        if (bmiValue < 18.5) {
            setBMICategory("Underweight");
        } else if (bmiValue >= 18.5 && bmiValue < 25) {
            setBMICategory("Normal weight");
        } else if (bmiValue >= 25 && bmiValue < 30) {
            setBMICategory("Overweight");
        } else {
            setBMICategory("Obese");
        }

        // Calculate BMR (Basal Metabolic Rate) if age is provided
        if (ageNum > 0) {
            let bmrValue: number;
            if (gender === "male") {
                // Mifflin-St Jeor Equation for men
                bmrValue = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
            } else {
                // Mifflin-St Jeor Equation for women
                bmrValue = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
            }
            setBMR(parseFloat(bmrValue.toFixed(0)));
        } else {
            setBMR(null);
        }
    };

    const resetForm = () => {
        setWeight("");
        setHeight("");
        setAge("");
        setGender("male");
        setBMI(null);
        setBMR(null);
        setBMICategory("");
    };

    const getBMICategoryColor = () => {
        if (bmiCategory === "Underweight") return "#3498db";
        if (bmiCategory === "Normal weight") return "#2ecc71";
        if (bmiCategory === "Overweight") return "#f39c12";
        if (bmiCategory === "Obese") return "#e74c3c";
        return "#95a5a6";
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            showsVerticalScrollIndicator={false}
        >
            <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.title}>BMI Calculator</Text>
                    <Text style={styles.subtitle}>Calculate your Body Mass Index & BMR</Text>
                </View>
            </LinearGradient>

            <View style={styles.mainContent}>
                {/* Input Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Enter Your Details</Text>

                    {/* Weight Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Weight (kg)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter weight in kg"
                            keyboardType="numeric"
                            value={weight}
                            onChangeText={setWeight}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Height Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Height (cm)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter height in cm"
                            keyboardType="numeric"
                            value={height}
                            onChangeText={setHeight}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Age Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Age (optional for BMR)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter age"
                            keyboardType="numeric"
                            value={age}
                            onChangeText={setAge}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Gender Selection */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gender (for BMR calculation)</Text>
                        <View style={styles.genderButtonRow}>
                            <TouchableOpacity
                                style={[
                                    styles.genderButton,
                                    gender === "male" && styles.genderButtonActive,
                                ]}
                                onPress={() => setGender("male")}
                            >
                                <Ionicons
                                    name="male"
                                    size={24}
                                    color={gender === "male" ? "#fff" : "#667eea"}
                                />
                                <Text
                                    style={[
                                        styles.genderButtonText,
                                        gender === "male" && styles.genderButtonTextActive,
                                    ]}
                                >
                                    Male
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.genderButton,
                                    gender === "female" && styles.genderButtonActive,
                                ]}
                                onPress={() => setGender("female")}
                            >
                                <Ionicons
                                    name="female"
                                    size={24}
                                    color={gender === "female" ? "#fff" : "#e74c3c"}
                                />
                                <Text
                                    style={[
                                        styles.genderButtonText,
                                        gender === "female" && styles.genderButtonTextActive,
                                    ]}
                                >
                                    Female
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.calculateButton]}
                            onPress={calculateBMI}
                        >
                            <Text style={styles.buttonText}>Calculate</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.resetButton]}
                            onPress={resetForm}
                        >
                            <Text style={[styles.buttonText, styles.resetButtonText]}>Reset</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Results Card */}
                {bmi !== null && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Your Results</Text>

                        {/* BMI Result */}
                        <View style={styles.resultCard}>
                            <Ionicons name="body-outline" size={32} color="#667eea" />
                            <View style={styles.resultContent}>
                                <Text style={styles.resultLabel}>Body Mass Index (BMI)</Text>
                                <Text style={styles.resultValue}>{bmi}</Text>
                                <View
                                    style={[
                                        styles.categoryBadge,
                                        { backgroundColor: getBMICategoryColor() },
                                    ]}
                                >
                                    <Text style={styles.categoryText}>{bmiCategory}</Text>
                                </View>
                            </View>
                        </View>

                        {/* BMR Result */}
                        {bmr !== null && (
                            <View style={[styles.resultCard, { marginTop: 15 }]}>
                                <Ionicons name="flame-outline" size={32} color="#ff6b6b" />
                                <View style={styles.resultContent}>
                                    <Text style={styles.resultLabel}>Basal Metabolic Rate (BMR)</Text>
                                    <Text style={styles.resultValue}>{bmr} kcal/day</Text>
                                    <Text style={styles.resultDescription}>
                                        Calories burned at rest
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* BMI Information Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>BMI Categories</Text>
                    <View style={styles.infoRow}>
                        <View style={[styles.categoryDot, { backgroundColor: "#3498db" }]} />
                        <Text style={styles.infoText}>Underweight: BMI &lt; 18.5</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={[styles.categoryDot, { backgroundColor: "#2ecc71" }]} />
                        <Text style={styles.infoText}>Normal weight: BMI 18.5 - 24.9</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={[styles.categoryDot, { backgroundColor: "#f39c12" }]} />
                        <Text style={styles.infoText}>Overweight: BMI 25 - 29.9</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={[styles.categoryDot, { backgroundColor: "#e74c3c" }]} />
                        <Text style={styles.infoText}>Obese: BMI ≥ 30</Text>
                    </View>
                </View>

                {/* BMR Information Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>About BMR</Text>
                    <Text style={styles.description}>
                        BMR (Basal Metabolic Rate) is the number of calories your body needs to
                        perform basic life-sustaining functions like breathing, circulation, and
                        cell production while at rest.
                    </Text>
                    <Text style={[styles.description, { marginTop: 10 }]}>
                        To maintain your current weight, you need to consume approximately your
                        BMR calories plus calories burned through daily activities.
                    </Text>
                </View>
            </View>

            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        paddingTop: Platform.OS === "ios" ? 60 : 40,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
    },
    mainContent: {
        padding: 16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#555",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: "#333",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    pickerContainer: {
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        overflow: "hidden",
    },
    picker: {
        height: 50,
        color: "#333",
    },
    genderButtonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    genderButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        padding: 14,
        borderWidth: 2,
        borderColor: "#e0e0e0",
    },
    genderButtonActive: {
        backgroundColor: "#667eea",
        borderColor: "#667eea",
    },
    genderButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginLeft: 8,
    },
    genderButtonTextActive: {
        color: "#fff",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    calculateButton: {
        backgroundColor: "#667eea",
        marginRight: 8,
    },
    resetButton: {
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#667eea",
        marginLeft: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    resetButtonText: {
        color: "#667eea",
    },
    resultCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        padding: 16,
        borderRadius: 12,
    },
    resultContent: {
        flex: 1,
        marginLeft: 16,
    },
    resultLabel: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    resultValue: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    categoryBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    categoryText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    resultDescription: {
        fontSize: 12,
        color: "#888",
        marginTop: 4,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    categoryDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    infoText: {
        fontSize: 14,
        color: "#555",
    },
    description: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    bottomSpacing: {
        height: 40,
    },
});
