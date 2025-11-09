import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView, ScrollView, Modal, TextInput, Alert, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { colors, getGradientColors, getGradientLocations } from '../../theme/colors';
import { addWithdrawal } from '../../store/slices/profileSlice';

const { height: screenHeight } = Dimensions.get('window');

export default function WithdrawalHistoryScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const withdrawals = useSelector((state) => state.profile.withdrawals || []);
  const banks = useSelector((state) => state.profile.banks || []);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return colors.success || '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'rejected':
        return colors.error || '#D32F2F';
      default:
        return colors.textMuted;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber || accountNumber.length < 4) return accountNumber;
    return `*${accountNumber.slice(-4)}`;
  };

  const handleCreateRequest = () => {
    if (banks.length === 0) {
      Alert.alert('No Bank Accounts', 'Please add a bank account first before creating a withdrawal request.');
      navigation.navigate('Banks');
      return;
    }
    setModalVisible(true);
    setSelectedBankId(banks[0]?.id || null);
    setWithdrawalAmount('');
  };

  const handleContinue = () => {
    if (!selectedBankId) {
      Alert.alert('Validation Error', 'Please select a bank account.');
      return;
    }
    if (!withdrawalAmount.trim() || parseFloat(withdrawalAmount) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid withdrawal amount.');
      return;
    }

    const selectedBank = banks.find((b) => b.id === selectedBankId);
    dispatch(
      addWithdrawal({
        bankId: selectedBankId,
        bankName: selectedBank.bankName,
        accountHolderName: selectedBank.accountHolderName,
        accountNumber: maskAccountNumber(selectedBank.accountNumber),
        amount: parseFloat(withdrawalAmount),
      })
    );

    Alert.alert('Success', 'Withdrawal request created successfully.');
    setModalVisible(false);
    setWithdrawalAmount('');
    setSelectedBankId(banks[0]?.id || null);
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
          <Text style={styles.headerTitle}>Withdrawal History</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {withdrawals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyMessage}>
                No withdrawals found. Press on the button below to create a request
              </Text>
              <TouchableOpacity style={styles.createButton} onPress={handleCreateRequest} activeOpacity={0.85}>
                <MaterialIcons name="add" size={24} color={colors.textLight} />
                <Text style={styles.createButtonText}>Create request</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {withdrawals.map((withdrawal) => {
                const selectedBank = banks.find((b) => b.id === withdrawal.bankId);
                return (
                  <View key={withdrawal.id} style={styles.withdrawalCard}>
                    <View style={styles.withdrawalHeader}>
                      <View style={styles.withdrawalInfo}>
                        <Text style={styles.withdrawalDate}>{formatDate(withdrawal.createdAt)}</Text>
                        <Text style={styles.withdrawalAmount}>{formatAmount(withdrawal.amount)}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(withdrawal.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(withdrawal.status) }]}>
                          {getStatusLabel(withdrawal.status)}
                        </Text>
                      </View>
                    </View>
                    {selectedBank && (
                      <View style={styles.bankInfo}>
                        <Text style={styles.bankLabel}>Bank: {withdrawal.bankName}</Text>
                        <Text style={styles.accountLabel}>Account: {withdrawal.accountNumber}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
              <View style={styles.bottomSpacer} />
            </ScrollView>
          )}
        </View>

        {withdrawals.length > 0 && (
          <TouchableOpacity style={styles.fab} onPress={handleCreateRequest} activeOpacity={0.85}>
            <MaterialIcons name="add" size={28} color={colors.textLight} />
          </TouchableOpacity>
        )}

        {/* Create Withdrawal Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.85}>
                  <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.modalHeaderSpacer} />
              </View>

              <ScrollView 
                style={styles.modalScroll} 
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* All Banks Section */}
                <Text style={styles.sectionTitle}>All Banks</Text>
                {banks.length > 0 ? (
                  banks.map((bank) => (
                    <TouchableOpacity
                      key={bank.id}
                      style={[
                        styles.bankCard,
                        selectedBankId === bank.id && styles.bankCardSelected,
                      ]}
                      onPress={() => setSelectedBankId(bank.id)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.bankCardContent}>
                        <View style={styles.bankCardLeft}>
                          <Text style={styles.bankCardLabel}>Bank Name</Text>
                          <Text style={styles.bankCardValue}>{bank.bankName}</Text>
                          <Text style={styles.bankCardLabel}>Account Holder Name</Text>
                          <Text style={styles.bankCardValue}>{bank.accountHolderName}</Text>
                          <Text style={styles.bankCardLabel}>Account No</Text>
                          <Text style={styles.bankCardAccountNumber}>{maskAccountNumber(bank.accountNumber)}</Text>
                        </View>
                        {selectedBankId === bank.id && (
                          <View style={styles.selectedIndicator}>
                            <Ionicons name="checkmark-circle" size={24} color={colors.textLight} />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noBanksContainer}>
                    <Text style={styles.noBanksText}>No bank accounts available</Text>
                  </View>
                )}

                {/* Add New Bank Button */}
                <TouchableOpacity
                  style={styles.addBankButton}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('AddBank');
                  }}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="add" size={24} color={colors.primary} />
                  <Text style={styles.addBankText}>Add New Bank</Text>
                </TouchableOpacity>

                {/* Withdrawal Amount Section */}
                <Text style={styles.sectionTitle}>Withdrawal amount</Text>
                <TextInput
                  style={[styles.amountInput, focusedField === 'amount' && styles.amountInputFocused]}
                  placeholder="Enter the amount here"
                  placeholderTextColor={colors.textMuted}
                  value={withdrawalAmount}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9.]/g, '');
                    setWithdrawalAmount(numericValue);
                  }}
                  keyboardType="decimal-pad"
                  onFocus={() => setFocusedField('amount')}
                  onBlur={() => setFocusedField(null)}
                />

                {/* Continue Button */}
                <TouchableOpacity
                  style={[styles.continueButton, (!selectedBankId || !withdrawalAmount.trim()) && styles.continueButtonDisabled]}
                  onPress={handleContinue}
                  disabled={!selectedBankId || !withdrawalAmount.trim()}
                  activeOpacity={0.85}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>

                <View style={styles.modalBottomSpacer} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textLight,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  withdrawalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  withdrawalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  withdrawalInfo: {
    flex: 1,
  },
  withdrawalDate: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  withdrawalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bankInfo: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderDivider,
  },
  bankLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  accountLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  bottomSpacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: screenHeight * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  modalHeaderSpacer: {
    flex: 1,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 16,
  },
  noBanksContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noBanksText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  bankCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 120,
  },
  bankCardSelected: {
    borderColor: colors.primaryDark || '#0A4A3E',
  },
  bankCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankCardLeft: {
    flex: 1,
  },
  bankCardLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  bankCardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: 8,
  },
  bankCardAccountNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF5252',
  },
  selectedIndicator: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
    gap: 8,
  },
  addBankText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  amountInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 24,
  },
  amountInputFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textLight,
  },
  modalBottomSpacer: {
    height: 20,
  },
});

