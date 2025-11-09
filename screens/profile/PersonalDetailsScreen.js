import React, { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { KYC_DOCUMENTS } from '../../config/kycDocuments';

const detailRows = [
  { key: 'fullName', label: 'Full name' },
  { key: 'dateOfBirthFormatted', fallbackKey: 'dateOfBirth', label: 'Date of Birth' },
  { key: 'gender', label: 'Gender' },
  { key: 'email', label: 'Email' },
  { key: 'phoneNumber', label: 'Cell Phone Number' },
  { key: 'ssn', label: 'Social Security Number (SSN)' },
  { key: 'street', label: 'Street' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
  { key: 'zipCode', label: 'Zip Code' },
];

export default function PersonalDetailsScreen() {
  const navigation = useNavigation();
  const personalInfo = useSelector((state) => state.profile.personalInfo);
  const kycDocuments = useSelector((state) => state.profile.kyc.documents);

  const remainingVerifications = useMemo(() => {
    const approvedCount = Object.values(kycDocuments || {}).filter(
      (doc) => doc?.status === 'approved',
    ).length;
    const totalNeeded = KYC_DOCUMENTS.length;
    return Math.max(totalNeeded - approvedCount, 0);
  }, [kycDocuments]);

  const renderValue = (row) => {
    const value = personalInfo[row.key] || personalInfo[row.fallbackKey] || '';
    if (!value) {
      return { text: '-', isEmpty: true };
    }
    if (row.key === 'dateOfBirthFormatted' || row.key === 'dateOfBirth') {
      const dateValue = personalInfo.dateOfBirth || personalInfo.dateOfBirthFormatted;
      if (dateValue) {
        const parsed = new Date(dateValue);
        if (!Number.isNaN(parsed.getTime())) {
          return { text: parsed.toLocaleDateString(), isEmpty: false };
        }
      }
    }
    const textValue = typeof value === 'string' ? value : String(value);
    return { text: textValue, isEmpty: false };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editActionButton}
            onPress={() => navigation.navigate('CompleteProfile', { source: 'profile' })}
            activeOpacity={0.85}
          >
            <MaterialIcons name="edit" size={18} color={colors.textLight} style={styles.editIcon} />
            <Text style={styles.editAction}>Edit</Text>
            
          </TouchableOpacity>
          
        </View>
      </SafeAreaView>

      <View style={styles.contentWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>General Details</Text>
          <View style={styles.card}>
            {detailRows.map((row) => {
              const { text, isEmpty } = renderValue(row);
              return (
                <View key={row.key} style={styles.row}>
                  <Text style={[styles.rowLabel, !isEmpty && styles.rowLabelFilled]}>{row.label}</Text>
                  <Text style={[styles.rowValue, isEmpty && styles.rowValuePlaceholder]}>{text}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.rowLabel}>Update KYC</Text>
                <Text style={styles.helperText}>
                  {remainingVerifications === 0
                    ? 'All verifications completed'
                    : `${remainingVerifications} verification${remainingVerifications > 1 ? 's' : ''
                    } remaining`}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => navigation.navigate('KycStatus')}
                activeOpacity={0.85}
              >
                <Text style={styles.viewButtonText}>View Details</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  safeArea: {
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    marginTop: 20,
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
  editActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editIcon: {
    marginRight: 2,
  },
  editAction: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    backgroundColor: '#F6FBF9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    flex: 1,
  },
  rowLabelFilled: {
    color: colors.textPrimary,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  rowValuePlaceholder: {
    color: colors.textMuted,
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});

