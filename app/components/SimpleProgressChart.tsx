import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Button from './Button'; // Assuming you have a standard Button component

interface DataPoint {
  date: string;
  value: number;
}

interface SimpleProgressChartProps {
  data: DataPoint[];
  title: string;
  color: string;
  unit: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  targetValue?: number;
  onAddData?: () => void; // Optional: for a button to add new data
}

const { width: screenWidth } = Dimensions.get('window');

export default function SimpleProgressChart({
  data,
  title,
  color,
  unit,
  icon,
  targetValue,
  onAddData,
}: SimpleProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <LinearGradient colors={['#f5f7fa', '#e9ecf2']} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}30` }]}>
              <Ionicons name={icon} size={22} color={color} />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="stats-chart-outline" size={48} color="#bdc3c7" />
          <Text style={styles.emptyText}>No Data Available</Text>
          <Text style={styles.emptySubtext}>
            Start tracking your progress to see your chart.
          </Text>
          {onAddData && (
            <Button
              title="Add First Entry"
              onPress={onAddData}
              variant="primary"
              style={{ marginTop: 20 }}
            />
          )}
        </View>
      </LinearGradient>
    );
  }

  const latestValue = data[data.length - 1]?.value || 0;
  const previousValue = data.length >= 2 ? data[data.length - 2]?.value : latestValue;
  const change = latestValue - previousValue;
  const percentChange = previousValue !== 0 ? (change / previousValue) * 100 : 0;

  const chartData = data.slice(-7);
  const maxValue = Math.max(...chartData.map((d) => d.value), targetValue || 0);
  const minValue = Math.min(...chartData.map((d) => d.value));

  const progressToTarget = targetValue ? (latestValue / targetValue) * 100 : null;

  return (
    <LinearGradient colors={['#ffffff', '#fdfdff']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon} size={22} color={color} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>Last 7 entries</Text>
          </View>
        </View>

        {data.length >= 2 && (
          <View style={styles.changeContainer}>
            <Ionicons
              name={change >= 0 ? 'arrow-up' : 'arrow-down'}
              size={14}
              color={change >= 0 ? '#27ae60' : '#c0392b'}
            />
            <Text
              style={[
                styles.changeText,
                { color: change >= 0 ? '#27ae60' : '#c0392b' },
              ]}
            >
              {Math.abs(percentChange).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>

      {/* Current Value & Target */}
      <View style={styles.valueSection}>
        <View style={styles.currentValueContainer}>
          <Text style={[styles.currentValue, { color }]}>
            {latestValue.toFixed(unit === 'kg' || unit === 'g' ? 1 : 0)}
          </Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>

        {targetValue && (
          <View style={styles.targetContainer}>
            <Text style={styles.targetLabel}>Goal: {targetValue} {unit}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(progressToTarget!, 100)}%`,
                    backgroundColor: color,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </View>

      {/* Bar Chart */}
      <View style={styles.chartContainer}>
        {chartData.map((point, index) => {
          const barHeight = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
          const isLatest = index === chartData.length - 1;
          return (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barInner}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${barHeight}%`,
                      backgroundColor: isLatest ? color : `${color}80`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>
                {new Date(point.date).getDate()}
              </Text>
            </View>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#4a4a6a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {},
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34495e',
  },
  subtitle: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  valueSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 25,
  },
  currentValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentValue: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 18,
    fontWeight: '500',
    color: '#7f8c8d',
    marginLeft: 6,
  },
  targetContainer: {
    alignItems: 'flex-end',
  },
  targetLabel: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  progressBar: {
    width: 100,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 120,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f2f5',
    paddingTop: 20,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barInner: {
    height: '100%',
    width: 12,
    backgroundColor: '#f0f2f5',
    borderRadius: 6,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});