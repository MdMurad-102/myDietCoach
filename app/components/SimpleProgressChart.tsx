import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DataPoint {
  date: string;
  value: number;
}

interface SimpleProgressChartProps {
  data: DataPoint[];
  title: string;
  color: string;
  unit: string;
  icon: string;
  targetValue?: number;
}

const { width: screenWidth } = Dimensions.get("window");

export default function SimpleProgressChart({
  data,
  title,
  color,
  unit,
  icon,
  targetValue,
}: SimpleProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View
              style={[styles.iconContainer, { backgroundColor: color + "20" }]}
            >
              <Ionicons name={icon as any} size={20} color={color} />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>📊 No data yet</Text>
          <Text style={styles.emptySubtext}>
            Start tracking to see your amazing progress!
          </Text>
        </View>
      </View>
    );
  }

  const latestValue = data[data.length - 1]?.value || 0;
  const previousValue =
    data.length >= 2 ? data[data.length - 2]?.value : latestValue;
  const change = latestValue - previousValue;
  const percentChange =
    previousValue !== 0 ? (change / previousValue) * 100 : 0;

  // Create simple bar chart with last 7 data points
  const chartData = data.slice(-7);
  const maxValue = Math.max(...chartData.map((d) => d.value));
  const minValue = Math.min(...chartData.map((d) => d.value));
  const range = maxValue - minValue || 1;

  // Calculate progress towards target
  const progressToTarget = targetValue
    ? (latestValue / targetValue) * 100
    : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View
            style={[styles.iconContainer, { backgroundColor: color + "20" }]}
          >
            <Ionicons name={icon as any} size={20} color={color} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>Last 7 days</Text>
          </View>
        </View>

        {/* Change indicator */}
        {data.length >= 2 && (
          <View style={styles.changeContainer}>
            <Ionicons
              name={change >= 0 ? "trending-up" : "trending-down"}
              size={16}
              color={change >= 0 ? "#4CAF50" : "#FF6B6B"}
            />
            <Text
              style={[
                styles.changeText,
                { color: change >= 0 ? "#4CAF50" : "#FF6B6B" },
              ]}
            >
              {change >= 0 ? "+" : ""}
              {Math.abs(percentChange).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>

      {/* Current Value */}
      <View style={styles.valueSection}>
        <View style={styles.currentValueContainer}>
          <Text style={[styles.currentValue, { color }]}>
            {latestValue.toFixed(unit === "kg" || unit === "g" ? 1 : 0)}
          </Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>

        {/* Target progress */}
        {targetValue && (
          <View style={styles.targetContainer}>
            <Text style={styles.targetLabel}>
              Goal: {targetValue}
              {unit}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(progressToTarget!, 100)}%`,
                    backgroundColor:
                      progressToTarget! >= 100 ? "#4CAF50" : color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progressToTarget!.toFixed(0)}% of goal
            </Text>
          </View>
        )}
      </View>

      {/* Simple Bar Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {chartData.map((point, index) => {
            const height =
              range > 0 ? ((point.value - minValue) / range) * 60 + 10 : 10;
            const isLatest = index === chartData.length - 1;

            return (
              <View key={index} style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: isLatest ? color : color + "60",
                    },
                  ]}
                />
                <Text style={styles.barLabel}>
                  {point.date.split("-")[2] || index + 1}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{data.length}</Text>
          <Text style={styles.summaryLabel}>Total entries</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text
            style={[
              styles.summaryValue,
              { color: change >= 0 ? "#4CAF50" : "#FF6B6B" },
            ]}
          >
            {change >= 0 ? "+" : ""}
            {change.toFixed(1)}
            {unit}
          </Text>
          <Text style={styles.summaryLabel}>Latest change</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {(
              chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length
            ).toFixed(1)}
            {unit}
          </Text>
          <Text style={styles.summaryLabel}>Weekly avg</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  valueSection: {
    marginBottom: 20,
  },
  currentValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  currentValue: {
    fontSize: 36,
    fontWeight: "bold",
  },
  unit: {
    fontSize: 18,
    color: "#7f8c8d",
    marginLeft: 6,
  },
  targetContainer: {
    marginTop: 10,
  },
  targetLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  chartContainer: {
    height: 80,
    marginBottom: 15,
  },
  barsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: "100%",
    paddingTop: 10,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
    maxWidth: 40,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 5,
    minHeight: 10,
  },
  barLabel: {
    fontSize: 10,
    color: "#95a5a6",
    fontWeight: "500",
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#95a5a6",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#7f8c8d",
    fontWeight: "600",
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#95a5a6",
    textAlign: "center",
    fontStyle: "italic",
  },
});
