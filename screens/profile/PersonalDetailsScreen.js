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
  const kycApproved = useSelector((state) => state.profile.kyc.isApproved);

  // Check if all 4 documents are uploaded (regardless of status)
  const uploadedCount = useMemo(() => {
    return Object.values(kycDocuments || {}).filter(
      (doc) => doc && doc.uri && doc.uri.length > 0,
    ).length;
  }, [kycDocuments]);

  const totalDocuments = KYC_DOCUMENTS.length;

  // Get KYC status message
  const getKycStatusMessage = useMemo(() => {
    if (kycApproved) {
      return 'KYC verification passed';
    }
    if (uploadedCount === totalDocuments) {
      return 'All documents uploaded';
    }
    return `${uploadedCount}/${totalDocuments} documents uploaded`;
  }, [kycApproved, uploadedCount, totalDocuments]);

  const isKycComplete = kycApproved || uploadedCount === totalDocuments;

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
            onPress={() => {
              // Always navigate to Profile screen regardless of history
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainApp', params: { screen: 'Profile' } }],
              });
            }}
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
            <View style={styles.kycRow}>
              <View style={styles.kycInfoContainer}>
                <Text style={[styles.rowLabel, isKycComplete && styles.rowLabelActive]}>Update KYC</Text>
                <Text style={[styles.helperText, isKycComplete && styles.helperTextSuccess]}>
                  {getKycStatusMessage}
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
  kycRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  kycInfoContainer: {
    flex: 1,
    marginRight: 12,
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
  rowLabelActive: {
    color: colors.primary,
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
  helperTextSuccess: {
    color: colors.primary,
    fontWeight: '600',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});

