import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { theme } from '@/constants/theme';
import { Svg, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

export interface DataPoint {
  month: string;
  fullMonth: string;
  amount: number;
  date: string;
}

interface CashbackChartProps {
  data: DataPoint[];
  height?: number;
  width?: number;
  lineColor?: string;
  fillColor?: string;
  showLabels?: boolean;
  onPointSelected?: (point: DataPoint, index: number) => void;
  horizontalScrollEnabled?: boolean;
  onMonthPress?: (point: DataPoint, index: number) => void;
}

export const CashbackChart: React.FC<CashbackChartProps> = ({
  data,
  height = 220,
  width = screenWidth - 40,
  lineColor = theme.colors.primary,
  fillColor = 'rgba(74, 227, 168, 0.1)',
  showLabels = true,
  onPointSelected,
  horizontalScrollEnabled = true,
  onMonthPress,
}) => {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipContent, setTooltipContent] = useState({ month: '', value: 0 });
  const [chartWidth, setChartWidth] = useState(width);
  const [chartHeight, setChartHeight] = useState(height - 40); // Subtract padding
  const [isDragging, setIsDragging] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const monthsScrollViewRef = useRef<ScrollView>(null);
  
  // For draggable chart
  const [contentWidth, setContentWidth] = useState(width);
  const [visibleWidth, setVisibleWidth] = useState(width);
  const [scrollEnabled, setScrollEnabled] = useState(horizontalScrollEnabled);
  
  // Track if initial selection has been made
  const [initialSelectionMade, setInitialSelectionMade] = useState(false);

  // Calculate the maximum value for scaling
  const maxValue = Math.max(...data.map(item => item.amount));
  const minValue = Math.min(...data.map(item => item.amount));
  const valueRange = maxValue - minValue;

  // Calculate point positions - memoized to prevent recalculation
  const points = React.useMemo(() => {
    // For draggable chart, we need to space points evenly
    const pointSpacing = Math.max(80, width / (data.length - 1));
    const calculatedWidth = pointSpacing * (data.length - 1);
    
    // Update content width for scrolling
    if (calculatedWidth > width) {
      setContentWidth(calculatedWidth + 40); // Add padding
    }
    
    return data.map((point, index) => {
      const x = index * pointSpacing;
      const normalizedValue = valueRange === 0 ? 0.5 : (point.amount - minValue) / valueRange;
      const y = chartHeight - (normalizedValue * chartHeight * 0.8) - 10; // Leave some space at top and bottom
      return { x, y, ...point };
    });
  }, [data, chartHeight, width, valueRange, minValue]);

  // Create SVG path for the line - memoized
  const linePath = React.useMemo(() => {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      // Create a smooth curve using cubic bezier
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      
      const controlPointX1 = prevPoint.x + (currentPoint.x - prevPoint.x) / 3;
      const controlPointY1 = prevPoint.y;
      const controlPointX2 = currentPoint.x - (currentPoint.x - prevPoint.x) / 3;
      const controlPointY2 = currentPoint.y;
      
      path += ` C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${currentPoint.x} ${currentPoint.y}`;
    }
    
    return path;
  }, [points]);

  // Create SVG path for the area under the line - memoized
  const areaPath = React.useMemo(() => {
    if (points.length === 0) return '';
    
    let path = linePath;
    path += ` L ${points[points.length - 1].x} ${chartHeight}`;
    path += ` L ${points[0].x} ${chartHeight}`;
    path += ' Z';
    
    return path;
  }, [points, chartHeight, linePath]);

  // Handle touch/drag events
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsDragging(true);
        handleTouch(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        handleTouch(evt.nativeEvent.locationX);
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
      },
    })
  ).current;

  const handleTouch = (locationX: number) => {
    if (points.length === 0) return;
    
    // Find the closest point to the touch location
    const adjustedX = locationX + scrollOffset;
    let closestPointIndex = 0;
    let minDistance = Math.abs(points[0].x - adjustedX);
    
    for (let i = 1; i < points.length; i++) {
      const distance = Math.abs(points[i].x - adjustedX);
      if (distance < minDistance) {
        minDistance = distance;
        closestPointIndex = i;
      }
    }
    
    // Update selected point
    setSelectedPointIndex(closestPointIndex);
    
    // Update tooltip
    updateTooltipPosition(closestPointIndex);
    
    // Call the callback if provided
    if (onPointSelected) {
      onPointSelected(data[closestPointIndex], closestPointIndex);
    }
    
    // Scroll to the selected point
    scrollToPoint(closestPointIndex);
    
    // Also scroll the months ScrollView
    scrollMonthsToIndex(closestPointIndex);
    
    // Mark that a selection has been made
    setInitialSelectionMade(true);
  };

  // Scroll to a specific point
  const scrollToPoint = (pointIndex: number) => {
    if (scrollViewRef.current && points[pointIndex]) {
      const targetX = Math.max(0, points[pointIndex].x - visibleWidth / 2);
      scrollViewRef.current.scrollTo({ x: targetX, animated: true });
    }
  };
  
  // Scroll months ScrollView to the selected month
  const scrollMonthsToIndex = (index: number) => {
    if (monthsScrollViewRef.current) {
      // Calculate the position to scroll to
      // This is approximate - each label is about 60-70px wide
      const labelWidth = 70;
      const scrollPosition = Math.max(0, index * labelWidth - (screenWidth / 2) + (labelWidth / 2));
      
      monthsScrollViewRef.current.scrollTo({
        x: scrollPosition,
        animated: true
      });
    }
  };

  // Update tooltip position based on selected point
  const updateTooltipPosition = (pointIndex: number) => {
    if (!points[pointIndex]) return;
    
    const selectedPoint = points[pointIndex];
    
    // Calculate tooltip position relative to the visible area
    // This is the key fix - we need to adjust for scroll offset
    const pointPositionInView = selectedPoint.x - scrollOffset;
    
    // Ensure tooltip stays within visible area
    // We need to account for tooltip width (approx 100px) and padding
    const tooltipWidth = 100;
    const tooltipPadding = 10;
    
    // Calculate the best X position to keep tooltip visible
    let tooltipX = pointPositionInView - (tooltipWidth / 2);
    
    // Adjust if tooltip would go off left edge
    if (tooltipX < tooltipPadding) {
      tooltipX = tooltipPadding;
    }
    
    // Adjust if tooltip would go off right edge
    if (tooltipX + tooltipWidth > visibleWidth - tooltipPadding) {
      tooltipX = visibleWidth - tooltipWidth - tooltipPadding;
    }
    
    // Calculate Y position (above the point)
    const tooltipY = Math.max(selectedPoint.y - 45, 10);
    
    setTooltipPosition({
      x: tooltipX,
      y: tooltipY,
    });
    
    setTooltipContent({
      month: selectedPoint.fullMonth,
      value: selectedPoint.amount,
    });
    
    setTooltipVisible(true);
  };

  // Handle scroll events
  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    setScrollOffset(offsetX);
    
    // If we're not dragging, find the closest point to the center of the view
    if (!isDragging && initialSelectionMade) {
      const centerX = offsetX + visibleWidth / 2;
      let closestPointIndex = 0;
      let minDistance = Math.abs(points[0].x - centerX);
      
      for (let i = 1; i < points.length; i++) {
        const distance = Math.abs(points[i].x - centerX);
        if (distance < minDistance) {
          minDistance = distance;
          closestPointIndex = i;
        }
      }
      
      // Only update if the closest point has changed
      if (closestPointIndex !== selectedPointIndex) {
        setSelectedPointIndex(closestPointIndex);
        updateTooltipPosition(closestPointIndex);
        
        // Also scroll the months ScrollView
        scrollMonthsToIndex(closestPointIndex);
        
        if (onPointSelected) {
          onPointSelected(data[closestPointIndex], closestPointIndex);
        }
      }
    }
  };

  // Select a default point on mount and scroll to current month
  useEffect(() => {
    if (data.length > 0 && !initialSelectionMade) {
      // Find current month index
      const currentDate = new Date();
      const currentMonthYear = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
      
      let defaultIndex = data.length - 1; // Default to last point
      
      // Try to find current month
      for (let i = 0; i < data.length; i++) {
        const dataDate = new Date(data[i].date);
        const dataMonthYear = `${dataDate.getFullYear()}-${dataDate.getMonth() + 1}`;
        
        if (dataMonthYear === currentMonthYear) {
          defaultIndex = i;
          break;
        }
      }
      
      setSelectedPointIndex(defaultIndex);
      
      // We need to wait for layout to complete before updating tooltip position and scrolling
      setTimeout(() => {
        updateTooltipPosition(defaultIndex);
        scrollToPoint(defaultIndex);
        scrollMonthsToIndex(defaultIndex);
        
        // Mark that initial selection has been made
        setInitialSelectionMade(true);
      }, 300);
      
      if (onPointSelected) {
        onPointSelected(data[defaultIndex], defaultIndex);
      }
    }
  }, [data, onPointSelected, initialSelectionMade]);

  // Update tooltip position when scroll offset changes
  useEffect(() => {
    if (selectedPointIndex !== null) {
      updateTooltipPosition(selectedPointIndex);
    }
  }, [scrollOffset, selectedPointIndex, visibleWidth]);

  // Handle month label click
  const handleMonthPress = (index: number) => {
    // Update selected point
    setSelectedPointIndex(index);
    
    // Update tooltip
    updateTooltipPosition(index);
    
    // Scroll to the selected point
    scrollToPoint(index);
    
    // Call the callback if provided
    if (onPointSelected) {
      onPointSelected(data[index], index);
    }
    
    // Mark that a selection has been made
    setInitialSelectionMade(true);
  };

  // Handle layout to get visible width
  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setVisibleWidth(width);
  };

  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.chartContainer, { width, height: chartHeight + 40 }]} onLayout={handleLayout}>
        {/* Background grid lines */}
        <View style={[styles.gridLine, { top: chartHeight * 0.25 }]} />
        <View style={[styles.gridLine, { top: chartHeight * 0.5 }]} />
        <View style={[styles.gridLine, { top: chartHeight * 0.75 }]} />

        {/* Scrollable Chart Area */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ width: contentWidth }}
          onMomentumScrollEnd={handleScroll} // Update tooltip after momentum scroll ends
        >
          <View 
            {...panResponder.panHandlers}
            style={{ width: contentWidth, height: chartHeight }}
          >
            <Svg width={contentWidth} height={chartHeight}>
              <Defs>
                <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={lineColor} stopOpacity="0.2" />
                  <Stop offset="1" stopColor={lineColor} stopOpacity="0.05" />
                </LinearGradient>
              </Defs>

              {/* Area fill */}
              <Path d={areaPath} fill="url(#areaGradient)" />

              {/* Line */}
              <Path
                d={linePath}
                stroke={lineColor}
                strokeWidth={3}
                fill="none"
              />

              {/* Data points */}
              {points.map((point, index) => (
                <Circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={index === selectedPointIndex ? 6 : 4}
                  fill={index === selectedPointIndex ? lineColor : theme.colors.background}
                  stroke={lineColor}
                  strokeWidth={2}
                />
              ))}
            </Svg>
          </View>
        </ScrollView>

        {/* Tooltip - positioned absolutely over the ScrollView */}
        {tooltipVisible && selectedPointIndex !== null && (
          <View
            style={[
              styles.tooltip,
              {
                left: tooltipPosition.x,
                top: tooltipPosition.y,
              },
            ]}
          >
            <Text style={styles.tooltipMonth}>{tooltipContent.month}</Text>
            <Text style={styles.tooltipValue}>${tooltipContent.value.toFixed(2)}</Text>
          </View>
        )}
      </View>

      {/* X-axis labels */}
      {showLabels && (
        <View style={styles.labelsContainer}>
          <ScrollView 
            ref={monthsScrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          >
            {data.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.labelButton,
                  selectedPointIndex === index && styles.selectedLabelButton,
                ]}
                onPress={() => handleMonthPress(index)}
              >
                <Text
                  style={[
                    styles.labelText,
                    selectedPointIndex === index && styles.selectedLabelText,
                  ]}
                >
                  {item.month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartContainer: {
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    padding: 10,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: theme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(74, 227, 168, 0.3)',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipMonth: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  tooltipValue: {
    ...theme.typography.bodyMedium,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  labelsContainer: {
    marginTop: 40, // Increased from 32 to add more space between chart and labels
    paddingHorizontal: 10,
  },
  labelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: theme.borderRadius.md,
  },
  selectedLabelButton: {
    backgroundColor: theme.colors.primary,
  },
  labelText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  selectedLabelText: {
    color: theme.colors.background,
    fontWeight: '600',
  },
});