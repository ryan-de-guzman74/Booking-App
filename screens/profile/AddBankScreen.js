import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { colors, getGradientColors, getGradientLocations } from '../../theme/colors';
import { addBankAccount, updateBankAccount } from '../../store/slices/profileSlice';

const ACCOUNT_TYPES = ['Checking', 'Savings'];
const ACCOUNT_OWNERSHIP = ['Individual', 'Joint', 'Corporate'];

export default function AddBankScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { bankId, editMode } = route.params || {};
  
  const existingBank = useSelector((state) => 
    bankId ? state.profile.banks?.find((b) => b.id === bankId) : null
  );

  const [accountHolderName, setAccountHolderName] = useState(existingBank?.accountHolderName || '');
  const [accountNumber, setAccountNumber] = useState(existingBank?.accountNumber || '');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [bankName, setBankName] = useState(existingBank?.bankName || '');
  const [branchName, setBranchName] = useState(existingBank?.branchName || '');
  const [routingNumber, setRoutingNumber] = useState(existingBank?.routingNumber || '');
  const [accountType, setAccountType] = useState(existingBank?.accountType || '');
  const [accountOwnership, setAccountOwnership] = useState(existingBank?.accountOwnership || '');
  const [street, setStreet] = useState(existingBank?.street || '');
  const [city, setCity] = useState(existingBank?.city || '');
  const [state, setState] = useState(existingBank?.state || '');
  const [zipCode, setZipCode] = useState(existingBank?.zipCode || '');

  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
  const [showAccountOwnershipModal, setShowAccountOwnershipModal] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (existingBank) {
      setAccountHolderName(existingBank.accountHolderName || '');
      setAccountNumber(existingBank.accountNumber || '');
      setBankName(existingBank.bankName || '');
      setBranchName(existingBank.branchName || '');
      setRoutingNumber(existingBank.routingNumber || '');
      setAccountType(existingBank.accountType || '');
      setAccountOwnership(existingBank.accountOwnership || '');
      setStreet(existingBank.street || '');
      setCity(existingBank.city || '');
      setState(existingBank.state || '');
      setZipCode(existingBank.zipCode || '');
    }
  }, [existingBank]);

  const handleSubmit = () => {
    // Validation
    if (!accountHolderName.trim()) {
      Alert.alert('Validation Error', 'Please enter account holder name.');
      return;
    }
    if (!accountNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter account number.');
      return;
    }
    if (!editMode && accountNumber !== confirmAccountNumber) {
      Alert.alert('Validation Error', 'Account numbers do not match.');
      return;
    }
    if (!bankName.trim()) {
      Alert.alert('Validation Error', 'Please enter bank name.');
      return;
    }
    if (!branchName.trim()) {
      Alert.alert('Validation Error', 'Please enter branch name.');
      return;
    }
    if (!routingNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter routing number.');
      return;
    }
    if (!accountType) {
      Alert.alert('Validation Error', 'Please select account type.');
      return;
    }
    if (!accountOwnership) {
      Alert.alert('Validation Error', 'Please select account ownership.');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Validation Error', 'Please enter city.');
      return;
    }
    if (!state.trim()) {
      Alert.alert('Validation Error', 'Please enter state.');
      return;
    }
    if (!zipCode.trim()) {
      Alert.alert('Validation Error', 'Please enter zip code.');
      return;
    }

    const bankData = {
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.trim(),
      bankName: bankName.trim(),
      branchName: branchName.trim(),
      routingNumber: routingNumber.trim(),
      accountType,
      accountOwnership,
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
    };

    if (editMode && bankId) {
      dispatch(updateBankAccount({ id: bankId, ...bankData }));
      Alert.alert('Success', 'Bank account updated successfully.');
    } else {
      dispatch(addBankAccount(bankData));
      Alert.alert('Success', 'Bank account added successfully.');
    }

    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      locations={getGradientLocations()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={24} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editMode ? 'Edit Bank' : 'Add New Bank'}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <MaterialIcons name="info" size={20} color={colors.textDark} />
              <Text style={styles.infoText}>
                Kindly input the following bank details with utmost precision, as this account will be utilized for processing your withdrawal requests.
              </Text>
            </View>

            {/* Account holder name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Account holder name<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, focusedField === 'accountHolderName' && styles.inputFocused]}
                placeholder="Enter account holder name"
                placeholderTextColor={colors.textMuted}
                value={accountHolderName}
                onChangeText={setAccountHolderName}
                onFocus={() => setFocusedField('accountHolderName')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Account number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Account number<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, focusedField === 'accountNumber' && styles.inputFocused]}
                placeholder="Enter account number"
                placeholderTextColor={colors.textMuted}
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="number-pad"
                onFocus={() => setFocusedField('accountNumber')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Confirm account number */}
            {!editMode && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Confirm account number<Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, focusedField === 'confirmAccountNumber' && styles.inputFocused]}
                  placeholder="Confirm account number"
                  placeholderTextColor={colors.textMuted}
                  value={confirmAccountNumber}
                  onChangeText={setConfirmAccountNumber}
                  keyboardType="number-pad"
                  onFocus={() => setFocusedField('confirmAccountNumber')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            )}

            {/* Bank name & Branch name */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  Bank name<Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, focusedField === 'bankName' && styles.inputFocused]}
                  placeholder="Enter bank name"
                  placeholderTextColor={colors.textMuted}
                  value={bankName}
                  onChangeText={setBankName}
                  onFocus={() => setFocusedField('bankName')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  Branch name<Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, focusedField === 'branchName' && styles.inputFocused]}
                  placeholder="Enter branch name"
                  placeholderTextColor={colors.textMuted}
                  value={branchName}
                  onChangeText={setBranchName}
                  onFocus={() => setFocusedField('branchName')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Routing number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Routing number<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, focusedField === 'routingNumber' && styles.inputFocused]}
                placeholder="Enter routing number"
                placeholderTextColor={colors.textMuted}
                value={routingNumber}
                onChangeText={setRoutingNumber}
                keyboardType="number-pad"
                onFocus={() => setFocusedField('routingNumber')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Account type & Account ownership */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  Account type<Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.selectInput, focusedField === 'accountType' && styles.inputFocused]}
                  onPress={() => {
                    setShowAccountTypeModal(true);
                    setFocusedField('accountType');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.selectText, !accountType && styles.placeholderText]}>
                    {accountType || 'Select type'}
                  </Text>
                  <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.textDark} />
                </TouchableOpacity>
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  Account ownership<Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.selectInput, focusedField === 'accountOwnership' && styles.inputFocused]}
                  onPress={() => {
                    setShowAccountOwnershipModal(true);
                    setFocusedField('accountOwnership');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.selectText, !accountOwnership && styles.placeholderText]}>
                    {accountOwnership || 'Select ownership'}
                  </Text>
                  <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.textDark} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Street & City */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  Street<Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, focusedField === 'street' && styles.inputFocused]}
                  placeholder="Enter your street name"
                  placeholderTextColor={colors.textMuted}
                  value={street}
                  onChangeText={setStreet}
                  onFocus={() => setFocusedField('street')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  City<Text style={styles.required}>*</Text>
                </Text>
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
            </View>

            {/* State & Zip Code */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  State<Text style={styles.required}>*</Text>
                </Text>
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
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  Zip Code<Text style={styles.required}>*</Text>
                </Text>
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
            </View>

            {/* Add Bank Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.85}>
              <Text style={styles.submitButtonText}>{editMode ? 'Update bank' : 'Add bank'}</Text>
            </TouchableOpacity>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Account Type Modal */}
      <Modal
        visible={showAccountTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAccountTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Account Type</Text>
              <TouchableOpacity onPress={() => setShowAccountTypeModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={ACCOUNT_TYPES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, accountType === item && styles.modalItemSelected]}
                  onPress={() => {
                    setAccountType(item);
                    setShowAccountTypeModal(false);
                    setFocusedField(null);
                  }}
                >
                  <Text style={[styles.modalItemText, accountType === item && styles.modalItemTextSelected]}>
                    {item}
                  </Text>
                  {accountType === item && (
                    <MaterialIcons name="check" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Account Ownership Modal */}
      <Modal
        visible={showAccountOwnershipModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAccountOwnershipModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Account Ownership</Text>
              <TouchableOpacity onPress={() => setShowAccountOwnershipModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={ACCOUNT_OWNERSHIP}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, accountOwnership === item && styles.modalItemSelected]}
                  onPress={() => {
                    setAccountOwnership(item);
                    setShowAccountOwnershipModal(false);
                    setFocusedField(null);
                  }}
                >
                  <Text style={[styles.modalItemText, accountOwnership === item && styles.modalItemTextSelected]}>
                    {item}
                  </Text>
                  {accountOwnership === item && (
                    <MaterialIcons name="check" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
  content: {
    flex: 1,
    backgroundColor: '#F6FBF9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 213, 79, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textDark,
    marginLeft: 12,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: '#D32F2F',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDivider,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  selectInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDivider,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  placeholderText: {
    color: colors.textMuted,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDivider,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDivider,
  },
  modalItemSelected: {
    backgroundColor: 'rgba(12, 64, 58, 0.05)',
  },
  modalItemText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  modalItemTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
});

