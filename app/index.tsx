import React from "react";
import { useAuthStore } from "@/store/authStore";
import { Redirect } from "expo-router";

export default function RootScreen() {
  const { isAuthenticated } = useAuthStore();

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}