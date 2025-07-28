import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { theme } from "@/constants/theme";
import { User } from "lucide-react-native";

export interface ContactItemProps {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function ContactItem({
  id,
  name,
  email,
  phone,
  avatar,
  onPress,
  disabled = false,
}: ContactItemProps) {
  const renderAvatar = () => {
    // Instead of using an image with defaultSource which causes issues,
    // we'll just use a placeholder for all avatars
    return (
      <View style={styles.avatarPlaceholder}>
        <User size={20} color={theme.colors.text} />
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.container, disabled && styles.disabled]} 
      onPress={onPress}
      disabled={disabled}
    >
      {renderAvatar()}
      <View style={styles.info}>
        <Text style={[styles.name, disabled && styles.disabledText]}>{name}</Text>
        <Text style={[styles.email, disabled && styles.disabledText]}>{email}</Text>
        {phone && <Text style={[styles.phone, disabled && styles.disabledText]}>{phone}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...theme.typography.body,
    fontWeight: "500",
    marginBottom: 2,
  },
  email: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  phone: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
});