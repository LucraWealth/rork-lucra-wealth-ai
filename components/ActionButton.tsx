import React, { useState } from "react";
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Animated, 
  View,
  Dimensions,
  Platform
} from "react-native";
import { theme } from "@/constants/theme";
import { Check, X } from "lucide-react-native";

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant: "confirm" | "cancel";
  size?: "medium" | "large";
  style?: any;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function ActionButton({
  title,
  onPress,
  variant,
  size = "large",
  style,
  loading = false,
  disabled = false,
  icon,
}: ActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const buttonScale = useState(new Animated.Value(1))[0];
  const textTranslateX = useState(new Animated.Value(0))[0];
  const textScaleX = useState(new Animated.Value(0))[0];
  const textOpacity = useState(new Animated.Value(0))[0];
  const iconOpacity = useState(new Animated.Value(1))[0];
  
  const windowWidth = Dimensions.get('window').width;
  
  const handlePressIn = () => {
    setIsPressed(true);
    
    // Scale down button slightly
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
    
    // Animate text appearing and icon fading
    Animated.parallel([
      Animated.timing(textScaleX, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateX, {
        toValue: variant === "confirm" ? 10 : -10,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const handlePressOut = () => {
    setIsPressed(false);
    
    // Scale back to normal
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
    
    // Animate text disappearing and icon appearing
    Animated.parallel([
      Animated.timing(textScaleX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const getButtonStyle = () => {
    if (variant === "confirm") {
      return styles.confirmButton;
    } else {
      return styles.cancelButton;
    }
  };
  
  const getTextStyle = () => {
    if (variant === "confirm") {
      return styles.confirmText;
    } else {
      return styles.cancelText;
    }
  };
  
  const getSizeStyle = () => {
    if (size === "large") {
      return styles.largeButton;
    } else {
      return styles.mediumButton;
    }
  };
  
  const renderIcon = () => {
    if (icon) {
      return icon;
    }
    
    if (variant === "confirm") {
      return <Check size={22} color={theme.colors.background} />;
    } else {
      return <X size={22} color={theme.colors.text} />;
    }
  };
  
  // Calculate the expanded width based on the title length
  const getExpandedWidth = () => {
    const baseWidth = size === "large" ? 52 : 44;
    const textWidth = title.length * 8 + 30; // Approximate width based on text length
    return Math.max(baseWidth + textWidth, 120);
  };
  
  const expandedWidth = getExpandedWidth();
  
  // Calculate the position for the text based on variant
  const getTextContainerStyle = () => {
    const baseStyle = {
      opacity: textOpacity,
      transform: [
        { translateX: textTranslateX },
        { scaleX: textScaleX }
      ],
    };
    
    if (variant === "confirm") {
      return {
        ...baseStyle,
        left: 10,
        width: expandedWidth - 60,
      };
    } else {
      return {
        ...baseStyle,
        right: 10,
        width: expandedWidth - 60,
      };
    }
  };
  
  return (
    <Animated.View
      style={[
        { transform: [{ scale: buttonScale }] },
        style
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          getButtonStyle(),
          getSizeStyle(),
          isPressed && { width: expandedWidth },
          disabled && styles.disabledButton,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
      >
        <View style={styles.contentContainer}>
          <Animated.View style={[styles.iconContainer, { opacity: iconOpacity }]}>
            {renderIcon()}
          </Animated.View>
          
          <Animated.View
            style={[
              styles.textContainer,
              getTextContainerStyle(),
            ]}
          >
            <Text style={[styles.text, getTextStyle()]} numberOfLines={1}>
              {title}
            </Text>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 26, // Make it circular
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1,
    width: 52, // Default circular size
    overflow: "hidden",
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderColor: theme.colors.border,
  },
  largeButton: {
    height: 52,
  },
  mediumButton: {
    height: 44,
    width: 44,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  confirmText: {
    color: theme.colors.background,
  },
  cancelText: {
    color: theme.colors.text,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "100%",
    height: "100%",
  },
  iconContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});