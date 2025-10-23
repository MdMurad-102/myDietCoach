import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "@/context/UserContext";
import Button from "@/app/components/Button";

interface MetricCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    unit: string;
    color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, unit, color }) => (
    <View style={styles.metricCard}>
        <Ionicons name={icon} size={32} color={color} />
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
        {unit && <Text style={styles.metricUnit}>{unit}</Text>}
    </View>
);

interface InsightCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
    color: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ icon, text, color }) => (
    <View style={styles.insightCard}>
        <Ionicons name={icon} size={24} color={color} style={styles.insightIcon} />
        <Text style={styles.insightText}>{text}</Text>
    </View>
);

export default function ProReport() {
    const context = useContext(UserContext);

    if (!context) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const { user } = context;

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.loginRequired}>Please login to view your report.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={["#8A2BE2", "#4B0082"]} style={styles.header}>
                <Text style={styles.headerTitle}>Your Pro Report</Text>
                <Text style={styles.headerSubtitle}>
                    A deep dive into your health and wellness journey.
                </Text>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Performance Summary</Text>
                    <View style={styles.metricsGrid}>
                        <MetricCard
                            icon="walk-outline"
                            label="Avg. Steps"
                            value="8,520"
                            unit="daily"
                            color="#1E90FF"
                        />
                        <MetricCard
                            icon="flame-outline"
                            label="Avg. Calories"
                            value="2,150"
                            unit="kcal"
                            color="#FF4500"
                        />
                        <MetricCard
                            icon="barbell-outline"
                            label="Workouts"
                            value="4"
                            unit="per week"
                            color="#32CD32"
                        />
                        <MetricCard
                            icon="scale-outline"
                            label="Weight Change"
                            value="-1.2"
                            unit="kg this month"
                            color="#FFD700"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>AI-Powered Insights</Text>
                    <InsightCard
                        icon="bulb-outline"
                        text="Your calorie intake has been consistent. Great job maintaining your diet!"
                        color="#FFD700"
                    />
                    <InsightCard
                        icon="trending-up-outline"
                        text="Increasing your daily steps by 10% could accelerate your weight loss progress."
                        color="#1E90FF"
                    />
                    <InsightCard
                        icon="nutrition-outline"
                        text="Consider adding more protein-rich snacks to better support muscle recovery after workouts."
                        color="#32CD32"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Upgrade to Premium</Text>
                    <Text style={styles.premiumText}>
                        Unlock even more detailed analytics, personalized meal plans, and
                        one-on-one coaching sessions.
                    </Text>
                    <Button
                        title="Go Premium"
                        onPress={() => { }}
                        variant="primary"
                        icon="star-outline"
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f2f5",
    },
    loginRequired: {
        textAlign: "center",
        fontSize: 16,
        color: "#666",
        marginTop: 50,
    },
    header: {
        paddingTop: Platform.OS === "ios" ? 70 : 50,
        paddingBottom: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
    },
    headerSubtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
        marginTop: 5,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
    },
    metricsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    metricCard: {
        width: "48%",
        alignItems: "center",
        marginBottom: 20,
        padding: 15,
        backgroundColor: "#f8f9fa",
        borderRadius: 10,
    },
    metricIcon: {
        marginBottom: 10,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    metricLabel: {
        fontSize: 14,
        color: "#666",
        marginTop: 5,
    },
    metricUnit: {
        fontSize: 12,
        color: "#999",
    },
    insightCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    insightIcon: {
        marginRight: 15,
    },
    insightText: {
        flex: 1,
        fontSize: 15,
        color: "#555",
        lineHeight: 22,
    },
    premiumText: {
        fontSize: 16,
        color: "#666",
        lineHeight: 24,
        marginBottom: 20,
        textAlign: "center",
    },
});