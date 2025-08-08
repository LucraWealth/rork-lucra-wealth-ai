import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/constants/theme";
import Button from "@/components/Button";

export default function OnboardingScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/auth/login");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", theme.colors.background]}
        style={styles.gradient}
      />

      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/tokens/lucra.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Spending should be{" "}
          <Text style={styles.highlightText}>rewarding</Text>
        </Text>
        <Text style={styles.subtitle}>
          Track your spending and save for what matters.
        </Text>

        <View style={styles.illustrationContainer}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/2807/2807571.png",
            }}
            style={styles.bankIcon}
          />
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/3037/3037156.png",
            }}
            style={styles.phoneIcon}
          />
          <View style={styles.securityIcon}>
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/2807/2807571.png",
              }}
              style={styles.shieldIcon}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={handleGetStarted}
          variant="primary"
          size="large"
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 80,
  },
  logo: {
    width: '170%',
    height: '170%',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  title: {
    fontSize: 42,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  highlightText: {
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxl,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bankIcon: {
    width: 100,
    height: 100,
    position: "absolute",
    top: 20,
    left: 20,
    tintColor: "#AAAAAA",
  },
  phoneIcon: {
    width: 200,
    height: 200,
    transform: [{ rotate: "15deg" }],
    tintColor: "#FFFFFF",
  },
  securityIcon: {
    position: "absolute",
    bottom: 40,
    right: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(74, 227, 168, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  shieldIcon: {
    width: 30,
    height: 30,
    tintColor: theme.colors.primary,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  button: {
    width: "100%",
  },
});