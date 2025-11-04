import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Circle } from "react-native-progress";
import { LinearGradient } from "expo-linear-gradient";

interface ProgressCircleProps {
    progress: number;
    size?: number;
    color?: string | string[];
    title: string;
    subtitle: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
    progress,
    size = 80,
    color = "#4CAF50",
    title,
    subtitle,
}) => {
    const normalizedProgress = Math.min(Math.max(progress, 0), 100) / 100;

    const gradientColors = Array.isArray(color) ? color : [color, color];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradientColors as [string, string]}
                style={[styles.gradient, { width: size, height: size, borderRadius: size / 2 }]}
            >
                <Circle
                    progress={normalizedProgress}
                    size={size - 10}
                    color={"#fff"}
                    thickness={6}
                    borderWidth={0}
                    showsText
                    formatText={() => `${Math.round(progress)}%`}
                    textStyle={styles.progressText}
                />
            </LinearGradient>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        padding: 8,
    },
    gradient: {
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    progressText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
    title: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginTop: 12,
    },
    subtitle: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
});

export default ProgressCircle;
