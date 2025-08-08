import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageSquare } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import LinaAI from '@/components/LinaAI';

export default function LinaChatScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleGoBack}
            testID="back-button"
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>LINA</Text>
            <Text style={styles.subtitle}>Your AI Financial Assistant</Text>
          </View>
          <View style={styles.iconContainer}>
            <MessageSquare size={24} color={theme.colors.info} />
          </View>
        </View>
        
        {/* Chat Content */}
        <Animated.View style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}>
          <LinaAI />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h3,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.info,
    marginTop: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 143, 231, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
});