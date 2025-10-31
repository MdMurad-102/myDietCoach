import { useMealContext } from "@/context/UnifiedMealContext";
import { UserContext } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ReportCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value: string;
    color: string;
    bgColor: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ icon, title, value, color, bgColor }) => (
    <View style={styles.reportCard}>
        <View style={[styles.reportIconContainer, { backgroundColor: bgColor }]}>
            <Ionicons name={icon} size={32} color={color} />
        </View>
        <Text style={styles.reportTitle}>{title}</Text>
        <Text style={styles.reportValue}>{value}</Text>
    </View>
);

interface WeeklySummaryProps {
    day: string;
    calories: number;
    protein: number;
    completed: boolean;
}

const WeeklySummaryRow: React.FC<WeeklySummaryProps> = ({ day, calories, protein, completed }) => (
    <View style={styles.summaryRow}>
        <View style={styles.summaryDay}>
            <Text style={styles.summaryDayText}>{day}</Text>
            {completed && <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />}
        </View>
        <View style={styles.summaryStats}>
            <Text style={styles.summaryText}>{calories} kcal</Text>
            <Text style={styles.summarySeparator}>•</Text>
            <Text style={styles.summaryText}>{protein}g protein</Text>
        </View>
    </View>
);

export default function MyReport() {
    const context = useContext(UserContext);
    const { getTodayMealPlan } = useMealContext();
    const router = useRouter();

    if (!context) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    const { user } = context;

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loginRequired}>Please login to view your report.</Text>
            </SafeAreaView>
        );
    }

    const todayPlan = getTodayMealPlan();
    const caloriesConsumed = todayPlan?.consumedCalories || 0;
    const proteinConsumed = todayPlan?.consumedProtein || 0;
    const waterConsumed = todayPlan?.waterGlasses || 0;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Report</Text>
                    <Text style={styles.headerSubtitle}>
                        Your personalized health report
                    </Text>
                </LinearGradient>

                <View style={styles.content}>
                    {/* Today's Summary */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Today's Summary</Text>
                        <View style={styles.reportGrid}>
                            <ReportCard
                                icon="flame-outline"
                                title="Calories"
                                value={`${caloriesConsumed}/${todayPlan?.goals.calories || 2000}`}
                                color="#FF4500"
                                bgColor="#FF450020"
                            />
                            <ReportCard
                                icon="nutrition-outline"
                                title="Protein"
                                value={`${proteinConsumed}/${todayPlan?.goals.protein || 150}g`}
                                color="#32CD32"
                                bgColor="#32CD3220"
                            />
                            <ReportCard
                                icon="water-outline"
                                title="Water"
                                value={`${waterConsumed}/${todayPlan?.goals.water || 8} glasses`}
                                color="#1E90FF"
                                bgColor="#1E90FF20"
                            />
                            <ReportCard
                                icon="restaurant-outline"
                                title="Meals"
                                value={`${todayPlan?.meals.filter(m => m.consumed).length || 0}/${todayPlan?.meals.length || 4}`}
                                color="#FF6B35"
                                bgColor="#FF6B3520"
                            />
                        </View>
                    </View>

                    {/* Weekly Summary */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Weekly Summary</Text>
                            <Text style={styles.weekLabel}>This Week</Text>
                        </View>
                        <View style={styles.summaryContainer}>
                            <WeeklySummaryRow day="Monday" calories={1850} protein={142} completed={true} />
                            <WeeklySummaryRow day="Tuesday" calories={1920} protein={155} completed={true} />
                            <WeeklySummaryRow day="Wednesday" calories={1780} protein={138} completed={true} />
                            <WeeklySummaryRow day="Thursday" calories={2050} protein={162} completed={true} />
                            <WeeklySummaryRow day="Friday" calories={1890} protein={148} completed={true} />
                            <WeeklySummaryRow day="Saturday" calories={caloriesConsumed} protein={proteinConsumed} completed={false} />
                            <WeeklySummaryRow day="Sunday" calories={0} protein={0} completed={false} />
                        </View>
                    </View>

                    {/* Achievements */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Achievements</Text>
                        <View style={styles.achievementContainer}>
                            <View style={styles.achievementCard}>
                                <Ionicons name="trophy" size={40} color="#FFD700" />
                                <Text style={styles.achievementTitle}>5 Day Streak</Text>
                                <Text style={styles.achievementDesc}>Keep it up!</Text>
                            </View>
                            <View style={styles.achievementCard}>
                                <Ionicons name="flame" size={40} color="#FF4500" />
                                <Text style={styles.achievementTitle}>Calorie Goal</Text>
                                <Text style={styles.achievementDesc}>Met 20 times</Text>
                            </View>
                            <View style={styles.achievementCard}>
                                <Ionicons name="water" size={40} color="#1E90FF" />
                                <Text style={styles.achievementTitle}>Hydration Hero</Text>
                                <Text style={styles.achievementDesc}>7 days in a row</Text>
                            </View>
                        </View>
                    </View>

                    {/* Health Insights */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Health Insights</Text>
                        <View style={styles.insightCard}>
                            <Ionicons name="bulb" size={24} color="#FFD700" />
                            <Text style={styles.insightText}>
                                You're doing great! You've met your calorie goals 5 days this week.
                            </Text>
                        </View>
                        <View style={styles.insightCard}>
                            <Ionicons name="trending-up" size={24} color="#32CD32" />
                            <Text style={styles.insightText}>
                                Your protein intake has improved by 15% compared to last week.
                            </Text>
                        </View>
                        <View style={styles.insightCard}>
                            <Ionicons name="alert-circle" size={24} color="#FF9800" />
                            <Text style={styles.insightText}>
                                Try to increase your water intake by 2 more glasses per day.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    loginRequired: {
        textAlign: "center",
        fontSize: 16,
        color: "#666",
        marginTop: 50,
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
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
    },
    headerSubtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.9)",
        marginTop: 5,
    },
    content: {
        padding: 20,
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    weekLabel: {
        fontSize: 14,
        color: "#667eea",
        fontWeight: "600",
    },
    reportGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    reportCard: {
        width: "48%",
        alignItems: "center",
        marginBottom: 15,
        padding: 15,
        backgroundColor: "#f8f9fa",
        borderRadius: 15,
    },
    reportIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    reportTitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
    },
    reportValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    summaryContainer: {
        gap: 10,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: "#f8f9fa",
        borderRadius: 10,
    },
    summaryDay: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flex: 1,
    },
    summaryDayText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    summaryStats: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    summaryText: {
        fontSize: 14,
        color: "#666",
    },
    summarySeparator: {
        fontSize: 14,
        color: "#ccc",
    },
    achievementContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    achievementCard: {
        flex: 1,
        alignItems: "center",
        padding: 15,
        backgroundColor: "#f8f9fa",
        borderRadius: 15,
        marginHorizontal: 5,
    },
    achievementTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginTop: 10,
        textAlign: "center",
    },
    achievementDesc: {
        fontSize: 12,
        color: "#666",
        marginTop: 5,
        textAlign: "center",
    },
    insightCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    insightText: {
        flex: 1,
        fontSize: 15,
        color: "#555",
        lineHeight: 22,
        marginLeft: 15,
    },
});
