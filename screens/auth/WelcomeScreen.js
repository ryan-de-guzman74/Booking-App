import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Platform, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StatusBar } from 'react-native';
import { colors, getGradientColors, getGradientLocations } from '../../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient
      colors={getGradientColors()}
      locations={getGradientLocations()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../../assets/Logo.jpeg')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Welcome Text */}
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>SNAH Caregiver</Text>
          <Text style={styles.tagline}>Empower lives through care –</Text>
          <Text style={styles.tagline}>on your schedule.</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>Every care moment counts.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  logoContainer: {
    marginTop: 100,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoCircle: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.7,
    borderRadius: (screenWidth * 0.7) / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  logoImage: {
    width: '115%',
    height: '115%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 30,
  },
  welcomeText: {
    fontSize: 40,
    color: colors.textLight,
    fontWeight: '900',
  },
  appName: {
    fontSize: 40,
    color: colors.textLight,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 15,
  },
  tagline: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: screenWidth * 0.1,
  },
  primaryButton: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
    minHeight: 50,
  },
  primaryButtonText: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: '650',
  },
  secondaryButton: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 50,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: '650',
  },
  footerText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 30,
  },
});


