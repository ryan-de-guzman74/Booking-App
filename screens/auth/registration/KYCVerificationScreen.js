import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import BackButton from '../../../components/BackButton';
import { colors } from '../../../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function KYCVerificationScreen({ navigation }) {
  const handleVerifyKYC = () => {
    // Navigate to VerifyAccount screen
    navigation.navigate('VerifyAccount');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* Back Button */}
      <View style={styles.backButton}>
        <BackButton 
          onPress={() => navigation.navigate('LocationPermission')}
          color={colors.textPrimary}
          activeColor="rgba(12, 64, 58, 0.1)"
        />
      </View>

      {/* Illustration at the very top */}
      <View style={styles.illustrationContainer}>
        <Image
          source={require('../../../assets/img/auth/kyc_verification.jpg')}
          style={styles.illustration}
          resizeMode="cover"
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>
          Complete Your KYC Verification for Seamless Access
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          To proceed to the next step of the registration, please complete your profile settings, 
          take your profile picture, and upload the list of KYC documents.
        </Text><Text style={styles.description}>
          Thank you.
        </Text>
      </ScrollView>

      {/* Verify KYC Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.verifyButton}
          onPress={handleVerifyKYC}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../../assets/img/auth/verification_badge.png')}
            style={styles.buttonIcon}
            resizeMode="contain"
          />
          <Text style={styles.verifyButtonText}>Verify KYC</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  illustrationContainer: {
    width: '100%',
    height: screenHeight * 0.37,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: screenHeight * 0.4 + 60,
    paddingBottom: 120,
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 32,
  },
  description: {
    fontSize: 14,
    color: colors.textDark,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 4,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
    paddingVertical: 25,
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.borderDivider,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  verifyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    marginHorizontal: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  verifyButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '700',
  },
});

