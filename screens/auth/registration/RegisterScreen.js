import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Modal,
  FlatList,
        } from 'react-native';
        import LinearGradient from 'react-native-linear-gradient';
        import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../../../components/BackButton';
import { colors, getGradientColors, getGradientLocations } from '../../../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Country codes list
const countries = [
  { code: 'US', dial_code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', dial_code: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', dial_code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', dial_code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: 'MX', dial_code: '+52', name: 'Mexico', flag: '🇲🇽' },
  { code: 'FR', dial_code: '+33', name: 'France', flag: '🇫🇷' },
  { code: 'DE', dial_code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: 'IT', dial_code: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', dial_code: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: 'BR', dial_code: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: 'IN', dial_code: '+91', name: 'India', flag: '🇮🇳' },
  { code: 'CN', dial_code: '+86', name: 'China', flag: '🇨🇳' },
  { code: 'JP', dial_code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', dial_code: '+82', name: 'South Korea', flag: '🇰🇷' },
  { code: 'NL', dial_code: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', dial_code: '+46', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', dial_code: '+47', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', dial_code: '+45', name: 'Denmark', flag: '🇩🇰' },
  { code: 'PL', dial_code: '+48', name: 'Poland', flag: '🇵🇱' },
  { code: 'RU', dial_code: '+7', name: 'Russia', flag: '🇷🇺' },
];

export default function RegisterScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isPhoneInputFocused, setIsPhoneInputFocused] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Top Section - Green Background */}
      <LinearGradient
        colors={getGradientColors()}
        locations={getGradientLocations()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topSection}
      >
        {/* Back Button */}
        <View style={styles.backButton}>
          <BackButton 
            onPress={() => navigation.navigate('Welcome')}
            color={colors.textLight}
          />
        </View>
      </LinearGradient>

      {/* Circular Logo - Positioned between top and register field */}
      <View style={styles.imageSection}>
        <View style={styles.imageCircleContainer}>
          <View style={styles.imageCircle}>
            <Image
              source={require('../../../assets/Logo.jpeg')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      {/* Bottom Section - White Background with Form */}
      <View style={styles.bottomSection}>
        <Text style={styles.mainTitle}>Register</Text>

        {/* Phone Number Input with Country Selector */}
        <View style={[
          styles.phoneInputContainer,
          isPhoneInputFocused && styles.phoneInputContainerFocused
        ]}>
          <TouchableOpacity 
            style={styles.countrySelector}
            onPress={() => setShowCountryPicker(true)}
          >
            <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
            <Text style={styles.countryCode}>{selectedCountry.dial_code}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textMuted} style={styles.chevron} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TextInput
            style={styles.phoneInput}
            placeholder="Your Phone Number"
            placeholderTextColor={colors.textMuted}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            onFocus={() => setIsPhoneInputFocused(true)}
            onBlur={() => setIsPhoneInputFocused(false)}
          />
        </View>

        {/* Terms and Conditions Checkbox - Entire row clickable */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAgreeToTerms(!agreeToTerms)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
            {agreeToTerms && <Ionicons name="checkmark" size={16} color={colors.textLight} />}
          </View>
          <Text style={styles.checkboxText}>
            I agree to <Text style={styles.termsLink}>Terms and Conditions</Text>
          </Text>
        </TouchableOpacity>

        {/* Register Button */}
        <TouchableOpacity 
          style={[styles.registerButton, !agreeToTerms && styles.registerButtonDisabled]}
          disabled={!agreeToTerms}
          onPress={() => navigation.navigate('ConfirmPhoneNumber', {
            phoneNumber: phoneNumber,
            countryCode: selectedCountry.dial_code
          })}
        >
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Ionicons name="close" size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={countries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setSelectedCountry(item);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryDialCode}>{item.dial_code}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
  },
  topSection: {
    height: screenHeight * 0.55,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  imageSection: {
    position: 'absolute',
    top: screenHeight * 0.05,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageCircleContainer: {
    width: screenWidth * 0.65,
    height: screenWidth * 0.65,
  },
  imageCircle: {
    width: '100%',
    height: '100%',
    borderRadius: (screenWidth * 0.7) / 2,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 18,
    borderWidth: 8,
    borderColor: colors.backgroundCard,
  },
  logoImage: {
    width: '110%',
    height: '110%',
    right:10,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.6,
    backgroundColor: colors.backgroundCard,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: screenWidth * 0.45,
    paddingTop: 40,
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 5
  },
  mainTitle: {
    fontSize: 35,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 18,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDivider,
    borderRadius: 12,
    backgroundColor: colors.backgroundCard,
    marginBottom: 20,
  },
  phoneInputContainerFocused: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    color: colors.textDark,
    fontWeight: '500',
    marginRight: 6,
  },
  chevron: {
    marginLeft: 2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.borderDivider,
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textDark,
    paddingVertical: 15,
    paddingRight: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.borderMuted,
    borderRadius: 4,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    fontSize: 14,
    color: colors.textDark,
    flex: 1,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  registerButtonDisabled: {
    backgroundColor: colors.borderMuted,
    opacity: 0.6,
  },
  registerButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14,
    color: colors.textDark,
  },
  loginLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    marginTop: screenHeight * 0.38,
    paddingTop: 30,
    borderTopEndRadius: 25,
    borderTopStartRadius: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDivider,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDivider,
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 15,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: colors.textDark,
  },
  countryDialCode: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },
});

