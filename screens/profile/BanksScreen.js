import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { colors, getGradientColors, getGradientLocations } from '../../theme/colors';
import { removeBankAccount } from '../../store/slices/profileSlice';

export default function BanksScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const banks = useSelector((state) => state.profile.banks || []);

  const handleDeleteBank = (bankId) => {
    Alert.alert(
      'Delete Bank Account',
      'Are you sure you want to remove this bank account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(removeBankAccount(bankId)),
        },
      ],
      { cancelable: true }
    );
  };

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber || accountNumber.length < 4) return accountNumber;
    return `*${accountNumber.slice(-4)}`;
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
          <Text style={styles.headerTitle}>Banks</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {banks.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="account-balance" size={64} color={colors.borderMuted} />
                <Text style={styles.emptyTitle}>No Bank Accounts</Text>
                <Text style={styles.emptySubtitle}>
                  Add your first bank account to start receiving payments.
                </Text>
              </View>
            ) : (
              banks.map((bank) => (
                <View key={bank.id} style={styles.bankCard}>
                  <View style={styles.bankCardLeft}>
                    <View style={styles.bankIconContainer}>
                      <MaterialIcons name="account-balance" size={32} color={colors.primary} />
                    </View>
                    <View style={styles.bankInfo}>
                      <Text style={styles.bankLabel}>Bank Name</Text>
                      <Text style={styles.bankName}>{bank.bankName}</Text>
                      <Text style={styles.accountHolderLabel}>Account Holder Name</Text>
                      <Text style={styles.accountHolderName}>{bank.accountHolderName}</Text>
                    </View>
                  </View>
                  <View style={styles.bankCardRight}>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('AddBank', { bankId: bank.id, editMode: true })}
                        activeOpacity={0.85}
                      >
                        <MaterialIcons name="check" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteBank(bank.id)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.deleteBar} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.accountNumberContainer}>
                      <Text style={styles.accountNumberLabel}>Account No.</Text>
                      <Text style={styles.accountNumber}>{maskAccountNumber(bank.accountNumber)}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddBank')}
          activeOpacity={0.85}
        >
          <MaterialIcons name="add" size={28} color={colors.textLight} />
        </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  bankCardLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  bankIconContainer: {
    marginRight: 16,
    justifyContent: 'flex-start',
  },
  bankInfo: {
    flex: 1,
  },
  bankLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  bankName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  accountHolderLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  accountHolderName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bankCardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    padding: 4,
    marginRight: 4,
  },
  deleteButton: {
    padding: 4,
  },
  deleteBar: {
    width: 4,
    height: 20,
    backgroundColor: '#D32F2F',
    borderRadius: 2,
  },
  accountNumberContainer: {
    alignItems: 'flex-end',
  },
  accountNumberLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D32F2F',
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
});

