import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useSelector } from 'react-redux';
import BottomNav from '../../components/BottomNav';
import { useRoute } from '@react-navigation/native';
import { Animated } from 'react-native';
import { colors, getGradientColors, getGradientLocations } from '../../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
// Bottom nav height approximation
const BOTTOM_NAV_HEIGHT = Platform.OS === 'ios' ? 88 : 70;
const AVAILABLE_HEIGHT = screenHeight - BOTTOM_NAV_HEIGHT;

export default function DashboardScreen() {
  const personalInfo = useSelector((state) => state.profile.personalInfo);
  const profileName = personalInfo.fullName || 'Caretaker Snah';
  const avatarUri = personalInfo.avatar;
  const [isPowerOn, setIsPowerOn] = useState(false);
  const route = useRoute();
  const showAcceptToast = route?.params?.acceptedToast;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (showAcceptToast) {
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(toastTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      const t = setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(toastTranslateY, { toValue: 20, duration: 200, useNativeDriver: true }),
        ]).start();
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [showAcceptToast, toastOpacity, toastTranslateY]);

  // Sample data - replace with actual data from your state/API
  const income = 132.10;
  const withdrawal = 0.00;
  const earningData = [0, 0, 0, 0, 0, 0, 132.10]; // Last 7 days earnings

  const maxEarning = Math.max(...earningData, 100);
  // Make graph height relative to screen height (increased from 120 to ~20% of screen)
  const graphHeight = screenHeight * 0.2;
  const graphWidth = screenWidth - 60;

  const handlePowerToggle = () => {
    setIsPowerOn(!isPowerOn);
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
      <Animated.View
        pointerEvents="none"
        style={[styles.acceptToast, { opacity: toastOpacity, transform: [{ translateY: toastTranslateY }] }]}
      >
        <Text style={styles.acceptToastTitle}>{profileName}</Text>
        <Text style={styles.acceptToastMsg}>Accepted Successfully!</Text>
      </Animated.View>

      <View style={styles.contentContainer}>
        {/* Part 1: Profile Section + Action Cards */}
        <View style={styles.partContainer}>
          <View style={styles.profileSection}>
              <Image
              source={
                avatarUri
                  ? { uri: avatarUri }
                  : require('../../assets/img/avatar.jpg')
              }
              style={styles.profileImage}
            />
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeText}>Hi {profileName},</Text>
              <Text style={styles.welcomeSubtext}>Welcome Back to SNAH!</Text>
            </View>
          </View>

          {/* Action Cards */}
          <View style={styles.actionCard}>
            <TouchableOpacity style={styles.actionItem} onPress={handlePowerToggle}>
              <View style={[styles.powerButton, { backgroundColor: isPowerOn ? '#4CAF50' : '#EF4444' }]}>
                <MaterialIcons name="power-settings-new" size={24} color={colors.textLight} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <MaterialIcons name="receipt" size={28} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>My Billing</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <MaterialIcons name="phone" size={28} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>Help Center</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Part 2: Last 30 Days Section + Income/Withdrawal Cards */}
        <View style={styles.partContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name="cloud" size={16} color={colors.textLight} />
              <Text style={styles.sectionTitle}>Last 30 days</Text>
                  </View>
                  </View>

          {/* Income and Withdrawal Cards */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, styles.incomeCard]}>
              <MaterialIcons name="trending-up" size={screenHeight * 0.05} color="#8B5CF6" style={styles.metricIcon} />
              <View style={styles.metricContent}>
                <Text style={styles.metricValue}>${income.toFixed(2)}</Text>
                <Text style={styles.metricLabel}>Income</Text>
                    </View>
            </View>

            <View style={[styles.metricCard, styles.withdrawalCard]}>
              <MaterialIcons name="trending-down" size={screenHeight * 0.05} color="#F97316" style={styles.metricIcon} />
              <View style={styles.metricContent}>
                <Text style={styles.metricValue}>${withdrawal.toFixed(2)}</Text>
                <Text style={styles.metricLabel}>Withdrawal</Text>
                  </View>
                </View>
          </View>
        </View>

        {/* Part 3: Last 7 days + Earning Statistics + Graph */}
        <View style={styles.partContainer}>
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>Last 7 days</Text>
            <Text style={styles.statsSubtitle}>Earning Statistics</Text>

            {/* Graph */}
            <View style={styles.graphContainer}>
              {/* Y-axis labels */}
              <View style={styles.yAxisContainer}>
                {[500, 400, 300, 200, 100].map((value) => (
                  <Text key={value} style={styles.yAxisLabel}>
                    ${value}
                  </Text>
                ))}
              </View>

              {/* Graph area */}
              <View style={styles.graphArea}>
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.gridLine,
                      { top: (index * graphHeight) / 4 },
                    ]}
                  />
                ))}

                {/* Bars */}
                <View style={styles.barsContainer}>
                  {earningData.map((value, index) => {
                    const barHeight = (value / maxEarning) * graphHeight;
                    // Calculate available width accounting for margins (2% on each side)
                    const availableWidth = graphWidth - (screenWidth * 0.04);
                    const barSpacing = availableWidth / earningData.length;
                    const barWidth = barSpacing * 0.6-5;
                    const marginOffset = screenWidth * 0.02;
              return (
                      <View
                        key={index}
                        style={[
                          styles.bar,
                          {
                            height: Math.max(barHeight, 4),
                            left: (index * barSpacing),
                            width: barWidth,
                          },
                        ]}
                      />
              );
            })}
          </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <BottomNav />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  acceptToast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 36,
    backgroundColor: '#E6F4EA',
    borderRadius: 5,
    padding: 12,
    zIndex: 5,
  },
  acceptToastTitle: {
    color: '#2E7D32',
    fontWeight: '800',
    fontSize: 14,
  },
  acceptToastMsg: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 12,
    opacity: 0.9,
  },
  contentContainer: {
    height: AVAILABLE_HEIGHT,
    paddingTop: Platform.OS === 'ios' ? screenHeight * 0.06 : screenHeight * 0.04,
    paddingHorizontal: screenWidth * 0.05,
    justifyContent: 'space-around',
    paddingBottom: screenHeight * 0.01,
  },
  partContainer: {
    flexShrink: 0,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: screenHeight * 0.045,
  },
  profileImage: {
    width: screenHeight * 0.095,
    height: screenHeight * 0.095,
    borderRadius: screenHeight * 0.0475,
    borderWidth: 2,
    borderColor: colors.textLight,
    marginRight: screenWidth * 0.03,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: screenHeight * 0.04,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: screenHeight * 0.002,
  },
  welcomeSubtext: {
    fontSize: screenHeight * 0.02,
    fontWeight: '400',
    color: colors.textLight,
    opacity: 0.9,
  },
  actionCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: screenHeight * 0.02,
    padding: screenHeight * 0.02,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  powerButton: {
    width: screenHeight * 0.08,
    height: screenHeight * 0.08,
    borderRadius: screenHeight * 0.04,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconContainer: {
    width: screenHeight * 0.07,
    height: screenHeight * 0.07,
    borderRadius: screenHeight * 0.02,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: screenHeight * 0.01,
  },
  actionLabel: {
    fontSize: screenHeight * 0.018,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  notificationText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:5
  },
  sectionTitle: {
    fontSize: screenHeight * 0.03,
    fontWeight: '500',
    color: colors.textLight,
    marginLeft: screenWidth * 0.015,
  },
  notificationBadgeSmall: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationTextSmall: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textLight,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: screenWidth * 0.04,
    flexShrink: 0,
  },
  metricCard: {
    flex: 1,
    borderRadius: screenHeight * 0.02,
    padding: screenHeight * 0.022,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    marginRight: screenWidth * 0.03,
  },
  metricContent: {
    flex: 1,
  },
  incomeCard: {
    backgroundColor: '#F3E8FF',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  withdrawalCard: {
    backgroundColor: '#FFF4E6',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  metricValue: {
    fontSize: screenHeight * 0.025,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: screenHeight * 0.008,
  },
  metricLabel: {
    fontSize: screenHeight * 0.017,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  statsSection: {
    flexShrink: 0,
  },
  statsTitle: {
    fontSize: screenHeight * 0.02,
    fontWeight: '400',
    color: colors.textLight,
    marginBottom: screenHeight * 0.005,
  },
  statsSubtitle: {
    fontSize: screenHeight * 0.03,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: screenHeight * 0.015,
  },
  graphContainer: {
    flexDirection: 'row',
    height: screenHeight * 0.2,
  },
  yAxisContainer: {
    width: screenWidth * 0.1,
    justifyContent: 'space-between',
    paddingRight: screenWidth * 0.02,
  },
  yAxisLabel: {
    fontSize: screenHeight * 0.012,
    fontWeight: '400',
    color: colors.textLight,
    opacity: 0.7,
  },
  graphArea: {
    flex: 1,
    position: 'relative',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.textLight,
    marginLeft: screenWidth * 0.02,
    marginRight: screenWidth * 0.02,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.textLight,
    opacity: 0.2,
  },
  barsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.16,
  },
  bar: {
    position: 'absolute',
    backgroundColor: 'rgb(255, 230, 0)',
    bottom: 0,
  },
});
