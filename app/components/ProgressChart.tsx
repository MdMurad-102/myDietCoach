import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface ProgressChartProps {
  data: DataPoint[];
  title: string;
  color: string;
  unit: string;
  icon: string;
  showTrend?: boolean;
}

const { width: screenWidth } = Dimensions.get("window");
const chartWidth = screenWidth - 80; // Account for padding
const chartHeight = 120;

export default function ProgressChart({
  data,
  title,
  color,
  unit,
  icon,
  showTrend = true,
}: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name={icon as any} size={20} color={color} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
          <Text style={styles.emptySubtext}>
            Start tracking to see your progress
          </Text>
        </View>
      </View>
    );
  }

  // Calculate chart dimensions and scaling
  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1; // Avoid division by zero

  // Calculate trend
  const trend =
    data.length >= 2
      ? ((data[data.length - 1].value - data[0].value) / data[0].value) * 100
      : 0;

  // Generate SVG path for the line chart
  const points = data.map((point, index) => {
    const x = (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y =
      chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
    return { x, y, value: point.value, date: point.date };
  });

  const pathData = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  // Create area fill path
  const areaPath =
    points.length > 1
      ? `${pathData} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
      : "";

  const latestValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || latestValue;
  const change = latestValue - previousValue;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name={icon as any} size={20} color={color} />
          <Text style={styles.title}>{title}</Text>
        </View>
        {showTrend && data.length >= 2 && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={change >= 0 ? "trending-up" : "trending-down"}
              size={16}
              color={change >= 0 ? "#4CAF50" : "#F44336"}
            />
            <Text
              style={[
                styles.trendText,
                { color: change >= 0 ? "#4CAF50" : "#F44336" },
              ]}
            >
              {change >= 0 ? "+" : ""}
              {change.toFixed(1)}
              {unit}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.valueContainer}>
        <Text style={[styles.currentValue, { color }]}>
          {latestValue.toFixed(1)}
        </Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>

      <View style={styles.chartContainer}>
        {/* Simple chart visualization using Views */}
        <View style={styles.chartBackground}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[styles.gridLine, { top: (i / 4) * chartHeight }]}
            />
          ))}

          {/* Data points */}
          {points.map((point, index) => (
            <View key={index}>
              {/* Line segments */}
              {index > 0 && (
                <View
                  style={[
                    styles.lineSegment,
                    {
                      left: points[index - 1].x,
                      top: points[index - 1].y,
                      width: Math.sqrt(
                        Math.pow(point.x - points[index - 1].x, 2) +
                          Math.pow(point.y - points[index - 1].y, 2)
                      ),
                      transform: [
                        {
                          rotate: `${
                            (Math.atan2(
                              point.y - points[index - 1].y,
                              point.x - points[index - 1].x
                            ) *
                              180) /
                            Math.PI
                          }deg`,
                        },
                      ],
                      backgroundColor: color,
                    },
                  ]}
                />
              )}

              {/* Data point */}
              <View
                style={[
                  styles.dataPoint,
                  {
                    left: point.x - 4,
                    top: point.y - 4,
                    backgroundColor: color,
                  },
                ]}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.dateRange}>
        <Text style={styles.dateText}>
          {data[0]?.date} → {data[data.length - 1]?.date}
        </Text>
        <Text style={styles.dataCount}>{data.length} entries</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  currentValue: {
    fontSize: 32,
    fontWeight: "bold",
  },
  unit: {
    fontSize: 16,
    color: "#666",
    marginLeft: 4,
  },
  chartContainer: {
    height: chartHeight,
    marginBottom: 15,
  },
  chartBackground: {
    height: chartHeight,
    width: chartWidth,
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  lineSegment: {
    position: "absolute",
    height: 2,
  },
  dataPoint: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  dateRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#666",
  },
  dataCount: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
});
