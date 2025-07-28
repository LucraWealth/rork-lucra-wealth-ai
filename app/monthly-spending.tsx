import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import AnalyticsView from "@/components/AnalyticsView";

export default function MonthlySpendingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse parameters
  const dateRange = params.startDate && params.endDate ? {
    start: params.startDate as string,
    end: params.endDate as string
  } : undefined;
  
  const category = params.category as string | undefined;
  const title = params.title as string || "Monthly Spending";

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <AnalyticsView
        dateRange={dateRange}
        category={category}
        title={title}
        onBack={handleBack}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});