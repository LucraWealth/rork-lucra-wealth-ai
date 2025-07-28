import React from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import { theme } from "@/constants/theme";

export interface CategoryData {
  name: string;
  amount: number;
  color: string;
  percentage?: number;
}

interface SpendingChartProps {
  data: CategoryData[];
}

export default function SpendingChart({ data }: SpendingChartProps) {
  // Calculate total amount
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate percentages if not provided
  const chartData = data.map(item => ({
    ...item,
    percentage: item.percentage || (totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0)
  }));
  
  // Sort by amount (largest first)
  chartData.sort((a, b) => b.amount - a.amount);
  
  // Calculate starting angles for each segment
  let startAngle = 0;
  const segments = chartData.map(item => {
    const angle = (item.percentage / 100) * 360;
    const segment = {
      ...item,
      startAngle,
      angle
    };
    startAngle += angle;
    return segment;
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <View style={styles.pieChart}>
          {segments.map((segment, index) => (
            <PieSegment
              key={index}
              color={segment.color}
              startAngle={segment.startAngle}
              angle={segment.angle}
            />
          ))}
          {/* Center circle for donut chart effect */}
          <View style={styles.centerCircle} />
        </View>
      </View>
      
      <View style={styles.legend}>
        {chartData.slice(0, 5).map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.name}</Text>
            <Text style={styles.legendPercent}>{item.percentage.toFixed(1)}%</Text>
          </View>
        ))}
        {chartData.length > 5 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: "#AAAAAA" }]} />
            <Text style={styles.legendText}>Others</Text>
            <Text style={styles.legendPercent}>
              {chartData.slice(5).reduce((sum, item) => sum + item.percentage, 0).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

interface PieSegmentProps {
  color: string;
  startAngle: number;
  angle: number;
}

function PieSegment({ color, startAngle, angle }: PieSegmentProps) {
  // Skip rendering very small segments
  if (angle < 1) return null;
  
  // For React Native, we'll use a positioned View with border radius and rotation
  // Since we can't easily create pie segments with React Native styles,
  // we'll use a simplified approach for the demo
  
  // For web, we need to handle the transform differently
  const transformStyle = Platform.OS === 'web' 
    ? { 
        transform: [
          { rotate: `${startAngle}deg` }
        ],
        // Web-specific styles
        WebkitTransformOrigin: 'center',
        transformOrigin: 'center',
      } 
    : { 
        transform: [{ rotate: `${startAngle}deg` }],
      };
  
  return (
    <View
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={[
          {
            position: 'absolute',
            width: angle / 360 * 100 + '%',
            height: '100%',
            backgroundColor: color,
            borderTopLeftRadius: angle > 180 ? 70 : 0,
            borderTopRightRadius: angle > 180 ? 70 : 0,
            borderBottomLeftRadius: angle > 180 ? 70 : 0,
            borderBottomRightRadius: angle > 180 ? 70 : 0,
          },
          transformStyle
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  pieChart: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.card,
    overflow: 'hidden',
    position: 'relative',
  },
  centerCircle: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.background,
    top: 35,
    left: 35,
  },
  legend: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  legendText: {
    ...theme.typography.bodySmall,
    flex: 1,
  },
  legendPercent: {
    ...theme.typography.bodySmall,
    fontWeight: '500',
  },
});