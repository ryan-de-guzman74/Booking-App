import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width: screenWidth } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient
      colors={['#43A1A9', '#48B0B1', '#66D1C9', '#55BFBD']}
      locations={[0, 0.33, 0.67, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoGlowOuter}>
            <View style={styles.logoGlowMiddle}>
              <View style={styles.logoGlowInner}>
                <View style={styles.logoCircle}>
                  <Image 
                    source={require('../../assets/Logo.jpeg')} 
                    style={styles.logoImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>
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
            onPress={() => navigation.navigate('VerifyAccount')}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
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
    justifyContent: 'center',
  },
  logoContainer: {
    marginTop: 20,
    marginBottom: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoGlowOuter: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
    elevation: 35,
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 65,
      },
    }),
  },
  logoGlowMiddle: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 45,
    elevation: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 50,
      },
    }),
  },
  logoGlowInner: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 35,
    elevation: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 40,
      },
    }),
  },
  logoCircle: {
    width: 189,
    height: 189,
    borderRadius: 94.5,
    backgroundColor: '#2C7A7A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoImage: {
    width: '115%',
    height: '115%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
    paddingHorizontal: 30,
  },
  welcomeText: {
    fontSize: 42,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
  },
  appName: {
    fontSize: 42,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 26,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 50,
    paddingHorizontal: screenWidth * 0.1,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
    minHeight: 50,
  },
  primaryButtonText: {
    color: '#2C7A7A',
    fontSize: 25,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 50,
  },
  secondaryButtonText: {
    color: '#2C7A7A',
    fontSize: 25,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 30,
  },
});

