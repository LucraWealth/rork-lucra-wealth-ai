import React, { useState, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions, Image } from "react-native";
import { theme } from "@/constants/theme";

export interface LucraCardProps {
  cardNumber: string;
  expiryDate: string;
  cardholderName?: string;
  cvv?: string;
  isFrozen?: boolean;
  onPress?: () => void;
}

export default function LucraCard({
  cardNumber,
  expiryDate,
  cardholderName = "CARDHOLDER NAME",
  cvv = "123",
  isFrozen = false,
  onPress,
}: LucraCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Format card number with spaces
  const formatCardNumber = (number: string) => {
    if (!number) return "•••• •••• •••• ••••";
    if (number.includes("••••")) return number;
    return number.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const handleCardPress = () => {
    flipCard();
    if (onPress) onPress();
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  // Interpolate for front and back animations
  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      },
    ],
  };

  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["180deg", "360deg"],
        }),
      },
    ],
  };

  const safeCardholderName = cardholderName ? cardholderName.toUpperCase() : "CARDHOLDER NAME";

  return (
    <View style={styles.container}>
      {/* Front of card */}
      <Animated.View
        style={[
          styles.cardFace,
          frontAnimatedStyle,
          { zIndex: isFlipped ? 0 : 1, opacity: isFlipped ? 0 : 1 },
        ]}
      >
        <TouchableOpacity
          style={[styles.card, isFrozen && styles.frozenCard]}
          onPress={handleCardPress}
          activeOpacity={0.9}
        >
          {/* Card Image Background */}
          <Image
            source={require("../assets/images/lucracard.png")}
            style={styles.cardImage}
            resizeMode="cover"
          />
          


          {isFrozen && (
            <View style={styles.frozenOverlay}>
              <Text style={styles.frozenText}>Card Frozen</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Back of card */}
      <Animated.View
        style={[
          styles.cardFace,
          backAnimatedStyle,
          { zIndex: isFlipped ? 1 : 0, opacity: isFlipped ? 1 : 0 },
        ]}
      >
        <TouchableOpacity
          style={[styles.card, isFrozen && styles.frozenCard]}
          onPress={handleCardPress}
          activeOpacity={0.9}
        >
          <View style={styles.cardBackground}>
            {/* Maple leaf patterns */}
            <View style={styles.leaf1} />
            <View style={styles.leaf2} />
            <View style={styles.leaf3} />
            <View style={styles.leaf4} />
            <View style={styles.leaf5} />
            <View style={styles.leaf6} />
            <View style={styles.leaf7} />
            <View style={styles.leaf8} />
          </View>

          <View style={styles.backContent}>
            <View style={styles.magneticStrip} />
            
            <View style={styles.cvvContainer}>
              <Text style={styles.cvvLabel}>CVV</Text>
              <View style={styles.cvvBox}>
                <Text style={styles.cvvValue}>{cvv}</Text>
              </View>
            </View>
            
            <View style={styles.expiryContainer}>
              <Text style={styles.expiryLabel}>EXPIRY DATE</Text>
              <Text style={styles.expiryValue}>{expiryDate || "MM/YY"}</Text>
            </View>
            
            <View style={styles.backFooter}>
              <Text style={styles.backFooterText}>
                This card is property of Lucra. Authorized use only.
              </Text>
            </View>
          </View>

          {isFrozen && (
            <View style={styles.frozenOverlay}>
              <Text style={styles.frozenText}>Card Frozen</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    position: "relative",
  },
  cardFace: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
  },
  card: {
    height: "100%",
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    position: "relative",
    ...theme.shadows.large,
  },
  frozenCard: {
    opacity: 0.8,
  },
  
  // Front card image styles
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  frontOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Optional: slight overlay for better text readability
  },
  
  // Back card background (keep original design)
  cardBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0A0A0A",
  },
  
  // Maple leaf shapes (for back of card)
  leaf1: {
    position: "absolute",
    width: 60,
    height: 60,
    backgroundColor: "#9F8C5B",
    borderRadius: 5,
    top: 20,
    left: 40,
    opacity: 0.2,
    transform: [{ rotate: '45deg' }, { scale: 1.5 }],
  },
  leaf2: {
    position: "absolute",
    width: 50,
    height: 50,
    backgroundColor: "#9F8C5B",
    borderRadius: 5,
    top: 80,
    right: 30,
    opacity: 0.15,
    transform: [{ rotate: '30deg' }, { scale: 1.3 }],
  },
  leaf3: {
    position: "absolute",
    width: 70,
    height: 70,
    backgroundColor: "#9F8C5B",
    borderRadius: 5,
    bottom: 40,
    left: 20,
    opacity: 0.2,
    transform: [{ rotate: '15deg' }, { scale: 1.4 }],
  },
  leaf4: {
    position: "absolute",
    width: 55,
    height: 55,
    backgroundColor: "#9F8C5B",
    borderRadius: 5,
    top: 60,
    left: 120,
    opacity: 0.15,
    transform: [{ rotate: '60deg' }, { scale: 1.2 }],
  },
  leaf5: {
    position: "absolute",
    width: 65,
    height: 65,
    backgroundColor: "#9F8C5B",
    borderRadius: 5,
    bottom: 20,
    right: 60,
    opacity: 0.2,
    transform: [{ rotate: '20deg' }, { scale: 1.3 }],
  },
  leaf6: {
    position: "absolute",
    width: 45,
    height: 45,
    backgroundColor: "#9F8C5B",
    borderRadius: 5,
    top: 120,
    right: 100,
    opacity: 0.18,
    transform: [{ rotate: '75deg' }, { scale: 1.1 }],
  },
  leaf7: {
    position: "absolute",
    width: 55,
    height: 55,
    backgroundColor: "#9F8C5B",
    borderRadius: 5,
    bottom: 70,
    right: 150,
    opacity: 0.15,
    transform: [{ rotate: '35deg' }, { scale: 1.2 }],
  },
  leaf8: {
    position: "absolute",
    width: 60,
    height: 60,
    backgroundColor: "#9F8C5B",
    borderRadius: 5,
    top: 150,
    left: 200,
    opacity: 0.2,
    transform: [{ rotate: '50deg' }, { scale: 1.3 }],
  },
  
  content: {
    padding: theme.spacing.xl,
    height: "100%",
    justifyContent: "space-between",
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 4,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  chipSection: {
    marginTop: theme.spacing.md,
  },
  chip: {
    width: 45,
    height: 35,
    backgroundColor: "#D4AF37",
    borderRadius: 5,
    padding: 5,
    justifyContent: "center",
    ...theme.shadows.small,
  },
  chipInner: {
    flex: 1,
    justifyContent: "space-around",
  },
  chipLine: {
    height: 3,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 2,
    marginVertical: 1,
  },
  cardholderName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 10,
  },
  cardNumber: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  frozenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  frozenText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  
  // Back of card styles
  backContent: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: "space-between",
    zIndex: 1,
  },
  magneticStrip: {
    height: 40,
    backgroundColor: "#444",
    marginHorizontal: -theme.spacing.xl,
    marginTop: 20,
  },
  cvvContainer: {
    alignItems: "flex-end",
    marginTop: 20,
  },
  cvvLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: 5,
  },
  cvvBox: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    width: 60,
    alignItems: "center",
  },
  cvvValue: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },
  expiryContainer: {
    marginTop: 20,
  },
  expiryLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: 5,
  },
  expiryValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  backFooter: {
    marginTop: 20,
  },
  backFooterText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 10,
    textAlign: "center",
  },
});