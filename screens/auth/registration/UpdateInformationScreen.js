import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
        } from 'react-native';
        import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { setPersonalInfo } from '../../../store/slices/profileSlice';
import BackButton from '../../../components/BackButton';
import { colors } from '../../../theme/colors';

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

export default function UpdateInformationScreen({ route, navigation }) {
  const { phoneNumber, countryCode } = route.params;
  const dispatch = useDispatch();
  const storedInfo = useSelector((state) => state.profile.personalInfo);
  
  // Parse fullName into firstName and lastName if it exists
  const getInitialName = () => {
    if (storedInfo.fullName) {
      const nameParts = storedInfo.fullName.trim().split(' ');
      if (nameParts.length >= 2) {
        return {
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' '),
        };
      }
      return { firstName: nameParts[0], lastName: '' };
    }
    return { firstName: '', lastName: '' };
  };

  const initialName = getInitialName();
  
  const [firstName, setFirstName] = useState(initialName.firstName);
  const [lastName, setLastName] = useState(initialName.lastName);
  const [email, setEmail] = useState(storedInfo.email || '');
  const [invitationCode, setInvitationCode] = useState(storedInfo.referralCode || '');
  const [selectedCountry] = useState(
    countries.find(c => c.dial_code === countryCode) || countries[0]
  );
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Update form fields when storedInfo changes
  useEffect(() => {
    if (storedInfo.fullName) {
      const nameParts = storedInfo.fullName.trim().split(' ');
      if (nameParts.length >= 2) {
        setFirstName(nameParts[0]);
        setLastName(nameParts.slice(1).join(' '));
      } else {
        setFirstName(nameParts[0] || '');
        setLastName('');
      }
    }
    setEmail(storedInfo.email || '');
    setInvitationCode(storedInfo.referralCode || '');
  }, [storedInfo]);

  const handleSave = () => {
    // Validate required fields
    if (!firstName || !lastName || !email) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Save to Redux store
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    dispatch(setPersonalInfo({
      fullName,
      email,
      phoneNumber,
      referralCode: invitationCode || '', // Store invitation code as referralCode
    }));
    
    // Navigate to EnterAuthCode screen
    navigation.navigate('EnterAuthCode', {
      phoneNumber,
      countryCode
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Back Button */}
      <View style={styles.backButton}>
        <BackButton 
          onPress={() => navigation.navigate('ConfirmPhoneNumber', {
            phoneNumber,
            countryCode
          })}
          color={colors.textPrimary}
          activeColor="rgba(12, 64, 58, 0.1)"
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Update your information</Text>
      </View>

      {/* Form Content */}
      <KeyboardAvoidingView
        style={styles.scrollView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* First Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name*</Text>
          <TextInput
            style={[styles.input, focusedField === 'firstName' && styles.inputFocused]}
            placeholder="Enter your first name..."
            placeholderTextColor={colors.textMuted}
            value={firstName}
            onChangeText={setFirstName}
            onFocus={() => setFocusedField('firstName')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Last Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name*</Text>
          <TextInput
            style={[styles.input, focusedField === 'lastName' && styles.inputFocused]}
            placeholder="Enter your last name..."
            placeholderTextColor={colors.textMuted}
            value={lastName}
            onChangeText={setLastName}
            onFocus={() => setFocusedField('lastName')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email*</Text>
          <TextInput
            style={[styles.input, focusedField === 'email' && styles.inputFocused]}
            placeholder="Enter your email..."
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Invitation Code */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Invitation code (Optional)</Text>
          <TextInput
            style={[styles.input, focusedField === 'invitationCode' && styles.inputFocused]}
            placeholder="Enter your invitation code..."
            placeholderTextColor={colors.textMuted}
            value={invitationCode}
            onChangeText={setInvitationCode}
            onFocus={() => setFocusedField('invitationCode')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Phone Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number*</Text>
          <View style={styles.phoneInputContainer}>
            <TouchableOpacity 
              style={styles.countrySelector}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
              <Text style={styles.countryCode}>{selectedCountry.dial_code}</Text>
              <Text style={styles.phoneSeparator}>-</Text>
            </TouchableOpacity>
            <View style={styles.phoneNumberDisplay}>
              <Text style={styles.phoneNumber}>{phoneNumber}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
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
                  onPress={() => setShowCountryPicker(false)}
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.backgroundCard,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft:10,
    color: colors.textPrimary,
    marginBottom: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderDivider,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.textDark,
    backgroundColor: colors.backgroundCard,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDivider,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: colors.backgroundCard,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    color: colors.textDark,
    fontWeight: '600',
  },
  phoneSeparator: {
    fontSize: 16,
    color: colors.textDark,
    marginLeft: 4,
    marginRight: 8,
  },
  phoneNumberDisplay: {
    flex: 1,
    justifyContent: 'center',
  },
  phoneNumber: {
    fontSize: 16,
    color: colors.textDark,
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.borderDivider,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '700',
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

