import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

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
  const { isDarkMode } = useTheme();
  const hasData = data && data.length > 0 && data.some(d => d.value !== undefined && d.value !== null);

  // Format date to readable format (MM-DD)
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}-${day}`;
    } catch (error) {
      return dateString.substring(5, 10) || 'N/A';
    }
  };

  // Ensure we always have valid numeric data for the chart
  const validData = hasData
    ? data.filter(d => d.value !== undefined && d.value !== null && !isNaN(d.value))
    : [];

  // Debug log to help troubleshoot
  console.log(`ProgressChart: ${title} - Data points:`, validData.length);
  if (validData.length > 0) {
    console.log(`ProgressChart: ${title} - First:`, validData[0]);
    console.log(`ProgressChart: ${title} - Last:`, validData[validData.length - 1]);
  }

  // Create smart labels - show every nth label to avoid crowding
  const createSmartLabels = (dataPoints: DataPoint[]): string[] => {
    if (dataPoints.length <= 5) {
      // Show all labels if 5 or fewer points
      return dataPoints.map(d => formatDate(d.date));
    } else if (dataPoints.length <= 10) {
      // Show every other label
      return dataPoints.map((d, i) => i % 2 === 0 ? formatDate(d.date) : '');
    } else {
      // Show first, middle, and last
      return dataPoints.map((d, i) => {
        if (i === 0 || i === dataPoints.length - 1 || i === Math.floor(dataPoints.length / 2)) {
          return formatDate(d.date);
        }
        return '';
      });
    }
  };

  // Create chart data - ensure we have at least 2 points for proper line display
  const chartData = validData.length > 0
    ? {
      labels: createSmartLabels(validData),
      datasets: [
        {
          data: validData.map(d => Number(d.value) || 0),
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    }
    : {
      labels: ['Start'],
      datasets: [{
        data: [0],
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      }],
    };

  const latestValue = validData.length > 0 && validData[validData.length - 1]?.value !== undefined
    ? Number(validData[validData.length - 1].value)
    : 0;

  // Calculate change from FIRST weight (starting point) to LATEST weight (current)
  // This shows the total weight journey progress
  const change = validData.length > 1 &&
    validData[0]?.value !== undefined &&
    validData[validData.length - 1]?.value !== undefined
    ? Number(validData[validData.length - 1].value) - Number(validData[0].value)
    : 0;

  const shouldShowChart = validData.length > 0;

  return (
    <LinearGradient colors={[color, `${color}99`]} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name={icon} size={22} color="#fff" />
          <Text style={styles.title}>{title}</Text>
        </View>
        {shouldShowChart && validData.length > 1 && change !== 0 && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={change >= 0 ? 'trending-up' : 'trending-down'}
              size={18}
              color="#fff"
            />
            <Text style={styles.trendText}>
              {change >= 0 ? '+' : ''}
              {typeof change === 'number' && !isNaN(change) ? change.toFixed(1) : '0.0'} {unit}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.valueContainer}>
        <View>
          <Text style={styles.currentValue}>
            {typeof latestValue === 'number' && !isNaN(latestValue) ? latestValue.toFixed(1) : '0.0'}
          </Text>
          <Text style={styles.valueLabel}>Current</Text>
        </View>
        <Text style={styles.unit}>{unit}</Text>
        {validData.length > 1 && validData[0]?.value !== undefined && (
          <View style={styles.startingWeightContainer}>
            <Text style={styles.startingWeightLabel}>Started at</Text>
            <Text style={styles.startingWeightValue}>
              {Number(validData[0].value).toFixed(1)} {unit}
            </Text>
          </View>
        )}
      </View>

      {shouldShowChart ? (
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={180}
          withVerticalLines={false}
          withHorizontalLines={true}
          withHorizontalLabels={true}
          withInnerLines={false}
          withOuterLines={false}
          withDots={true}
          withShadow={false}
          chartConfig={{
            backgroundColor: color,
            backgroundGradientFrom: color,
            backgroundGradientTo: color,
            backgroundGradientFromOpacity: 0,
            backgroundGradientToOpacity: 0,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.9})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#fff',
              fill: color,
            },
            propsForBackgroundLines: {
              stroke: 'rgba(255, 255, 255, 0.3)',
              strokeWidth: 1,
              strokeDasharray: '0',
            },
            propsForLabels: {
              fontSize: 12,
              fontWeight: '500',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  currentValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  valueLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  unit: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 6,
    fontWeight: '500',
  },
  startingWeightContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  startingWeightLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  startingWeightValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 2,
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
