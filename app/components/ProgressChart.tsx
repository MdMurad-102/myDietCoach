import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface DataPoint {
  date: string;
  value: number;
}

interface ProgressChartProps {
  data: DataPoint[];
  title: string;
  color: string;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ProgressChart({
  data,
  title,
  color,
  unit,
  icon,
}: ProgressChartProps) {
  const hasData = data && data.length > 0;

  const chartData = hasData
    ? {
      labels: data.map(d => d.date.substring(5)), // "MM-DD"
      datasets: [
        {
          data: data.map(d => d.value),
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    }
    : {
      labels: ['Start'],
      datasets: [{ data: [0] }],
    };

  const latestValue = hasData ? data[data.length - 1].value : 0;
  const change = hasData && data.length > 1
    ? data[data.length - 1].value - data[data.length - 2].value
    : 0;

  return (
    <LinearGradient colors={[color, `${color}99`]} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name={icon} size={22} color="#fff" />
          <Text style={styles.title}>{title}</Text>
        </View>
        {hasData && data.length > 1 && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={change >= 0 ? 'trending-up' : 'trending-down'}
              size={18}
              color="#fff"
            />
            <Text style={styles.trendText}>
              {change >= 0 ? '+' : ''}
              {change.toFixed(1)} {unit}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.valueContainer}>
        <Text style={styles.currentValue}>{latestValue.toFixed(1)}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>

      {hasData ? (
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={180}
          withVerticalLines={false}
          withHorizontalLines={true}
          withHorizontalLabels={true}
          withInnerLines={false}
          withOuterLines={false}
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: 'transparent',
            backgroundGradientTo: 'transparent',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.8})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: color,
            },
            propsForBackgroundLines: {
              stroke: 'rgba(255, 255, 255, 0.2)',
              strokeDasharray: '4',
            },
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="analytics" size={40} color="rgba(255,255,255,0.7)" />
          <Text style={styles.emptyText}>No data to display</Text>
          <Text style={styles.emptySubtext}>Start tracking to see your progress!</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 5,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  currentValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  unit: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 6,
    fontWeight: '500',
  },
  chart: {
    marginLeft: -20,
  },
  emptyState: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 5,
  },
});
