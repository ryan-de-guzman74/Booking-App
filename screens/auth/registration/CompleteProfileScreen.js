import React, { useEffect, useState } from 'react';
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
  Platform,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { setPersonalInfo } from '../../../store/slices/profileSlice';
import DatePickerModal from '../../../components/DatePickerModal';
import CityAutocompleteModal from '../../../components/CityAutocompleteModal';
import LanguagePickerModal from '../../../components/LanguagePickerModal';
import { colors } from '../../../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
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

export default function CompleteProfileScreen({ route, navigation }) {
  const { phoneNumber = '', countryCode = '', mPin = '', source } = route.params ?? {};
  const dispatch = useDispatch();
  const storedInfo = useSelector((state) => state.profile.personalInfo);
  
  const [fullName, setFullName] = useState(storedInfo.fullName || '');
  const [email, setEmail] = useState(storedInfo.email || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    storedInfo.dateOfBirth ? new Date(storedInfo.dateOfBirth) : null,
  );
  const [dateOfBirthFormatted, setDateOfBirthFormatted] = useState(
    storedInfo.dateOfBirthFormatted || storedInfo.dateOfBirth || '',
  );
  const [gender, setGender] = useState(storedInfo.gender || '');
  const [street, setStreet] = useState(storedInfo.street || '');
  const [city, setCity] = useState(storedInfo.city || '');
  const [state, setState] = useState(storedInfo.state || '');
  const [zipCode, setZipCode] = useState(storedInfo.zipCode || '');
  const [country, setCountry] = useState(storedInfo.country || '');
  const [cellPhone, setCellPhone] = useState(storedInfo.phoneNumber || phoneNumber || '');
  const [ssn, setSsn] = useState(storedInfo.ssn || '');
  const [spokenLanguages, setSpokenLanguages] = useState(storedInfo.spokenLanguages || []);
  
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDateConfirm = (date) => {
    setDateOfBirth(date);
    setDateOfBirthFormatted(formatDate(date));
    setShowDatePicker(false);
  };

  const handleAddressSelect = (addressData) => {
    if (addressData.street) setStreet(addressData.street);
    if (addressData.city) setCity(addressData.city);
    if (addressData.state) setState(addressData.state);
    if (addressData.zipCode) setZipCode(addressData.zipCode);
    if (addressData.country) setCountry(addressData.country);
    setShowCityPicker(false);
  };

  useEffect(() => {
    setFullName(storedInfo.fullName || '');
    setEmail(storedInfo.email || '');
    setDateOfBirth(storedInfo.dateOfBirth ? new Date(storedInfo.dateOfBirth) : null);
    setDateOfBirthFormatted(
      storedInfo.dateOfBirthFormatted || storedInfo.dateOfBirth || ''
    );
    setGender(storedInfo.gender || '');
    setStreet(storedInfo.street || '');
    setCity(storedInfo.city || '');
    setState(storedInfo.state || '');
    setZipCode(storedInfo.zipCode || '');
    setCountry(storedInfo.country || '');
    setCellPhone(storedInfo.phoneNumber || phoneNumber || '');
    setSsn(storedInfo.ssn || '');
    setSpokenLanguages(storedInfo.spokenLanguages || []);
  }, [storedInfo, phoneNumber]);

  const handleLanguageSelect = (language) => {
    if (!spokenLanguages.includes(language)) {
      setSpokenLanguages([...spokenLanguages, language]);
    }
  };

  const handleCountrySelect = (selectedCountry) => {
    setCountry(selectedCountry.name);
    setShowCountryPicker(false);
  };

  const handleRemoveLanguage = (language) => {
    setSpokenLanguages(spokenLanguages.filter(lang => lang !== language));
  };

  const handleUpdate = () => {
    // Validate required fields
    if (!fullName || !email || !dateOfBirth || !gender || !city || !state || !zipCode || !country || !cellPhone || !ssn || spokenLanguages.length === 0) {
      alert('Please fill in all required fields');
      return;
    }
    
    dispatch(
      setPersonalInfo({
        fullName,
        email,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : '',
        dateOfBirthFormatted,
        gender,
        street,
        city,
        state,
        zipCode,
        country,
        phoneNumber: cellPhone,
        ssn,
        spokenLanguages,
      }),
    );

    if (source === 'profile') {
      navigation.navigate('PersonalDetails');
    } else {
      navigation.navigate('LocationPermission', route.params ?? {});
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('SetupMPin', {
                  phoneNumber,
                  countryCode,
                  mPin,
                });
              }
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <View style={styles.contentWrapper}>
        {/* Form Content */}
        <View style={styles.contentCard}>
          <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={[styles.input, focusedField === 'fullName' && styles.inputFocused]}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textMuted}
            value={fullName}
            onChangeText={setFullName}
            onFocus={() => setFocusedField('fullName')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, focusedField === 'email' && styles.inputFocused]}
            placeholder="Enter your email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Date of Birth */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth*</Text>
          <TouchableOpacity 
            style={[styles.input, styles.selectInput]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={dateOfBirthFormatted ? styles.inputText : styles.placeholderText}>
              {dateOfBirthFormatted || 'Select date'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Gender */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender*</Text>
          <TouchableOpacity 
            style={[styles.input, styles.selectInput]}
            onPress={() => setShowGenderPicker(true)}
          >
            <Text style={gender ? styles.inputText : styles.placeholderText}>
              {gender || 'Choose Gender'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Street */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Street</Text>
          <View style={styles.inputWithButton}>
            <TextInput
              style={[styles.inputFlex, focusedField === 'street' && styles.inputFocused]}
              placeholder="Enter your street address"
              placeholderTextColor={colors.textMuted}
              value={street}
              onChangeText={setStreet}
              onFocus={() => setFocusedField('street')}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => setShowCityPicker(true)}
            >
              <Ionicons name="search" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* City */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>City*</Text>
          <TextInput
            style={[styles.input, focusedField === 'city' && styles.inputFocused]}
            placeholder="Enter your city name"
            placeholderTextColor={colors.textMuted}
            value={city}
            onChangeText={setCity}
            onFocus={() => setFocusedField('city')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* State */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>State*</Text>
          <TextInput
            style={[styles.input, focusedField === 'state' && styles.inputFocused]}
            placeholder="Enter your state name"
            placeholderTextColor={colors.textMuted}
            value={state}
            onChangeText={setState}
            onFocus={() => setFocusedField('state')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Zip Code */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Zip Code*</Text>
          <TextInput
            style={[styles.input, focusedField === 'zipCode' && styles.inputFocused]}
            placeholder="Enter your zipcode"
            placeholderTextColor={colors.textMuted}
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="number-pad"
            onFocus={() => setFocusedField('zipCode')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Country */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Country*</Text>
          <TouchableOpacity
            style={[styles.input, styles.selectInput]}
            onPress={() => setShowCountryPicker(true)}
            activeOpacity={0.8}
          >
            <Text style={country ? styles.inputText : styles.placeholderText}>
              {country || 'Select Country'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Cell Phone Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cell Phone Number*</Text>
          <TextInput
            style={[styles.input, focusedField === 'cellPhone' && styles.inputFocused]}
            placeholder="Enter your cell phone number"
            placeholderTextColor={colors.textMuted}
            value={cellPhone}
            onChangeText={setCellPhone}
            keyboardType="phone-pad"
            onFocus={() => setFocusedField('cellPhone')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Social Security Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Social Security Number (SSN)*</Text>
          <TextInput
            style={[styles.input, focusedField === 'ssn' && styles.inputFocused]}
            placeholder="Enter your SSN"
            placeholderTextColor={colors.textMuted}
            value={ssn}
            onChangeText={setSsn}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={9}
            onFocus={() => setFocusedField('ssn')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Spoken Language */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Spoken Language*</Text>
          <TouchableOpacity 
            style={[styles.input, styles.selectInput]}
            onPress={() => setShowLanguagePicker(true)}
          >
            <Text style={styles.placeholderText}>
              Select Language
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          {/* Selected Languages Tags */}
          {spokenLanguages.length > 0 && (
            <View style={styles.languageTagsContainer}>
              {spokenLanguages.map((language, index) => (
                <View key={index} style={styles.languageTag}>
                  <Text style={styles.languageTagText}>{language}</Text>
                  <TouchableOpacity 
                    onPress={() => handleRemoveLanguage(language)}
                    style={styles.removeLanguageButton}
                  >
                    <Ionicons name="close" size={16} color={colors.textDark} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
        </View>

      {/* Update Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.updateButton}
          onPress={handleUpdate}
        >
          <Text style={styles.updateButtonText}>Update</Text>
        </TouchableOpacity>
      </View>
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onCancel={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        initialDate={dateOfBirth}
      />

      {/* Address Autocomplete Modal */}
      <CityAutocompleteModal
        visible={showCityPicker}
        onClose={() => setShowCityPicker(false)}
        onSelect={handleAddressSelect}
      />

      {/* Language Picker Modal */}
      <LanguagePickerModal
        visible={showLanguagePicker}
        onClose={() => setShowLanguagePicker(false)}
        onSelect={handleLanguageSelect}
        selectedLanguages={spokenLanguages}
      />

      {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                <Ionicons name="close" size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={genderOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setGender(item);
                    setShowGenderPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

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
                  onPress={() => handleCountrySelect(item)}
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
  safeArea: {
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textLight,
  },
  headerSpacer: {
    width: 36,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#F6FBF9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
  pinSection: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  pinBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  pinBox: {
    width: (screenWidth - 140) / 4,
    height: 60,
    borderWidth: 1,
    borderColor: colors.borderDivider,
    borderRadius: 8,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigit: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textDark,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  continueButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderDivider,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: colors.textDark,
    backgroundColor: colors.backgroundCard,
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFlex: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderDivider,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: colors.textDark,
    backgroundColor: colors.backgroundCard,
    marginRight: 10,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderDivider,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 16,
    color: colors.textDark,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  languageTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  languageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 20,
    paddingVertical: 8,
    paddingLeft: 15,
    paddingRight: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  languageTagText: {
    fontSize: 14,
    color: colors.textDark,
    marginRight: 5,
  },
  removeLanguageButton: {
    padding: 2,
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
  updateButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
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
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDivider,
  },
  modalItemText: {
    fontSize: 16,
    color: colors.textDark,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDivider,
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: colors.textDark,
  },
  countryDialCode: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
});

