import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, getGradientColors, getGradientLocations } from '../../../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

export default function Page1MakeDifference({ onSkip }) {
  return (
    <View style={styles.pageContainer}>
      <LinearGradient
        colors={getGradientColors()}
        locations={getGradientLocations()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Illustration Container */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationCircleBackground}>
            <View style={styles.illustrationCircle}>
              <Image
                source={require('../../../assets/img/getstarted/helper.jpg')}
                style={styles.illustration}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Make Difference</Text>
          <Text style={styles.description}>
            Make a difference to those in need of care with your set of skills and compassion
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    width: screenWidth,
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 100,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '500',
  },
  illustrationContainer: {
    flex: 0.6,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 40,
    marginTop: 60,
  },
  illustrationCircleBackground: {
    width: screenWidth * 0.88,
    height: screenWidth * 0.88,
    borderRadius: (screenWidth * 0.88) / 2,
    backgroundColor: 'rgba(12, 64, 58, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationCircle: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    borderRadius: (screenWidth * 0.8) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 0.4,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.95,
    paddingHorizontal: 10,
  },
});

