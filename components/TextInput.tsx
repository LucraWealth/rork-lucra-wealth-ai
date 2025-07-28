import React, { useState } from "react";
import {
  StyleSheet,
  TextInput as RNTextInput,
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps as RNTextInputProps,
  Keyboard,
  Platform,
  Animated,
} from "react-native";
import { theme } from "@/constants/theme";
import { Eye, EyeOff } from "lucide-react-native";

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
  required?: boolean;
}

export default function TextInput({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  icon,
  leftIcon,
  rightIcon,
  secureTextEntry,
  required,
  returnKeyType = "done",
  onSubmitEditing = () => Keyboard.dismiss(),
  ...props
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const focusAnimation = React.useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  const iconToUse = leftIcon || icon;

  const borderColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? theme.colors.error : "rgba(255, 255, 255, 0.1)", theme.colors.primary],
  });

  const backgroundColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(37, 37, 37, 0.8)", "rgba(37, 37, 37, 1)"],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label} {required && <Text style={styles.requiredStar}>*</Text>}
        </Text>
      )}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor,
          },
          error && styles.errorInput,
        ]}
      >
        {iconToUse && <View style={styles.leftIcon}>{iconToUse}</View>}
        <RNTextInput
          style={[
            styles.input,
            iconToUse && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholderTextColor={theme.colors.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={Platform.OS !== 'ios'}
          {...props}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={togglePasswordVisibility}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={theme.colors.textSecondary} />
            ) : (
              <Eye size={20} color={theme.colors.textSecondary} />
            )}
          </TouchableOpacity>
        ) : (
          rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </Animated.View>
      {error && (
        <Text style={[styles.errorText, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.bodySmall,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  requiredStar: {
    color: theme.colors.error,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    minHeight: 56,
    ...theme.shadows.small,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    fontSize: 16,
    fontWeight: "500",
  },
  inputWithLeftIcon: {
    paddingLeft: theme.spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: theme.spacing.sm,
  },
  leftIcon: {
    paddingLeft: theme.spacing.lg,
  },
  rightIcon: {
    paddingRight: theme.spacing.lg,
    padding: 8,
  },
  errorInput: {
    borderColor: theme.colors.error,
    backgroundColor: "rgba(255, 107, 107, 0.05)",
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: theme.spacing.sm,
    fontWeight: "500",
  },
});