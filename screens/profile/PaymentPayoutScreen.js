import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { colors, getGradientColors, getGradientLocations } from '../../theme/colors';

const PAYMENT_OPTIONS = [
  {
    key: 'banks',
    label: 'My Banks',
    icon: 'account-balance',
  },
  {
    key: 'withdrawals',
    label: 'My Withdrawals',
    icon: 'attach-money',
  },
];

export default function PaymentPayoutScreen() {
  const navigation = useNavigation();

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
          <Text style={styles.headerTitle}>Payment & Payout</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {PAYMENT_OPTIONS.map((item, index) => (
            <TouchableOpacity 
              key={item.key} 
              style={styles.listItem} 
              activeOpacity={0.85}
              onPress={() => {
                if (item.key === 'banks') {
                  navigation.navigate('Banks');
                } else if (item.key === 'withdrawals') {
                  navigation.navigate('WithdrawalHistory');
                }
              }}
            >
              <View style={styles.listItemLeft}>
                <MaterialIcons name={item.icon} size={26} color={colors.primary} />
                <Text style={styles.listItemLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.borderMuted} />
            </TouchableOpacity>
          ))}
        </View>
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
  listItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  listItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});


