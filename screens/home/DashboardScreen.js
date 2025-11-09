import React, { useMemo } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import BottomNav from '../../components/BottomNav';
import { colors, getGradientColors, getGradientLocations } from '../../theme/colors';
import { bookingDetailsData } from '../../data/sampleBookings';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
// BottomNav height is approximately 70px (including padding and safe area)
const BOTTOM_NAV_HEIGHT = Platform.OS === 'ios' ? 88 : 70;
const AVAILABLE_HEIGHT = screenHeight - BOTTOM_NAV_HEIGHT;

// Colorful 3-color palette
const COLOR_PALETTE = {
  primary: colors.primary,        // Main background color (dark teal)
  secondary: 'rgb(0, 64, 0)',         // Vibrant Orange for accents
  tertiary: 'rgb(3, 124, 3)',
  metric: 'rgba(0, 145, 109, 0.74)'           // Vibrant Purple for accents
};

const METRICS = [
  { id: 1, label: 'Earnings', icon: 'dollar-sign', iconType: 'FontAwesome5' },
  { id: 2, label: 'Hours', icon: 'clock', iconType: 'FontAwesome5' },
  { id: 3, label: 'Streak', value: '8.5' },
  { id: 4, label: 'Rating', value: '4.9' },
];

const formatCurrency = (value) => `$${value.toFixed(2)}`;

export default function DashboardScreen() {
  const navigation = useNavigation();

  const careOpportunities = useMemo(
    () =>
      bookingDetailsData.slice(0, 3).map((booking, index) => {
        const addressLabel = booking.address.split(',')[0];
        return {
          id: booking.id,
          title: booking.service,
          location: addressLabel,
          rate: formatCurrency(booking.earning),
          time: `${booking.startTime} - ${booking.endTime}`,
          icon: index === 1 ? 'accessible' : index === 2 ? 'medication' : 'person',
          iconType: 'MaterialIcons',
          hasIndicator: index === 1,
        };
      }),
    [],
  );

  const renderIcon = (iconType, iconName, size = 20, color = colors.primary) => {
    switch (iconType) {
      case 'FontAwesome5':
        return <FontAwesome5 name={iconName} size={size} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName} size={size} color={color} />;
      default:
        return null;
    }
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

      <View style={styles.content}>
        {/* Part 1: Page Header (35%) */}
        <View style={styles.headerPart}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../../assets/Logo.jpeg')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back, Paulina</Text>
            <Text style={styles.careSummary}>
              You've cared for 23 families this month—keep it going!
            </Text>

            {/* Online Status */}
            <TouchableOpacity style={styles.onlineStatus}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Part 2: Care Opportunities (35%) */}
        <View style={styles.opportunitiesPart}>
          <Text style={styles.sectionTitle}>Care Opportunities</Text>
          <View style={styles.opportunitiesContainer}>
            {careOpportunities.map((opportunity, index) => {
              // Alternate between secondary and tertiary colors for icon backgrounds
              return (
                <TouchableOpacity
                  key={opportunity.id}
                  style={styles.opportunityCard}
                  activeOpacity={0.9}
                  onPress={() =>
                    navigation.navigate('BookingDetails', {
                      bookingId: opportunity.id,
                      mode: 'confirm',
                    })
                  }
                >
                  <View style={[styles.opportunityIconContainer]}>
                    {renderIcon(opportunity.iconType, opportunity.icon, 28, '#FFFFFF')}
                  </View>
                <View style={styles.opportunityContent}>
                  <View style={styles.opportunityTitleRow}>
                    <Text style={styles.opportunityTitle}>{opportunity.title}</Text>
                    <Text style={styles.opportunityRate}>{opportunity.rate}</Text>
                  </View>
                  <View style={styles.opportunitySubtitleRow}>
                    <Text style={styles.opportunityLocation}>{opportunity.location}</Text>
                    <View style={styles.opportunityTimeContainer}>
                      {opportunity.hasIndicator && <View style={styles.timeIndicator} />}
                      <Text style={styles.opportunityTime}>{opportunity.time}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Part 3: Extra (30%) */}
        <View style={styles.extraPart}>
          {/* Performance Metrics */}
          <View style={styles.metricsContainer}>
            {METRICS.map((metric, index) => {
              // Use different colors for each metric
              const metricColors = [
                COLOR_PALETTE.secondary,  // Earnings - Orange
                COLOR_PALETTE.tertiary,   // Hours - Purple
                COLOR_PALETTE.secondary,  // Streak - Orange
                COLOR_PALETTE.tertiary,   // Rating - Purple
              ];
              return (
                <View key={metric.id} style={styles.metricItem}>
                  <View style={[styles.metricIconOuter]}>
                    <View style={styles.metricIconInner}>
                      {metric.icon ? (
                        renderIcon(metric.iconType, metric.icon, 20, '#FFFFFF')
                      ) : (
                        <Text style={styles.metricValue}>{metric.value}</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Bonus Message */}
          <View style={styles.bonusCard}>
            <Text style={styles.bonusText}>
              You're 1 shift away from your $100 weekly bonus
            </Text>
          </View>

          {/* Add Availability Button */}
          <TouchableOpacity style={[styles.addAvailabilityButton, { borderColor: COLOR_PALETTE.tertiary }]}>
            <Text style={[styles.addAvailabilityText, { color: COLOR_PALETTE.tertiary }]}>+ Add Availability</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Part 1: Header (35%)
  headerPart: {
    height: AVAILABLE_HEIGHT * 0.35,
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLOR_PALETTE.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoImage: {
    width: '115%',
    height: '115%',
  },
  welcomeSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  careSummary: {
    fontSize: 11,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    marginHorizontal: 30,
    lineHeight: 14,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#03C03C',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginTop: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  // Part 2: Care Opportunities (35%)
  opportunitiesPart: {
    height: AVAILABLE_HEIGHT * 0.4,
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    marginLeft: screenWidth * 0.05,
  },
  opportunitiesContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: screenWidth * 0.02,
    paddingBottom: 0,
  },
  opportunityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 14,
    padding: 8,
    flex: 1,
    minHeight: 0,
    marginBottom: 10
  },
  opportunityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: COLOR_PALETTE.tertiary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  opportunityContent: {
    flex: 1,
  },
  opportunityTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  opportunityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  opportunityRate: {
    fontSize: 18,
    fontWeight: '700',
    color: COLOR_PALETTE.secondary,
  },
  opportunitySubtitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opportunityLocation: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textTertiary,
    flex: 1,
  },
  opportunityTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLOR_PALETTE.secondary,
    marginRight: 4,
  },
  opportunityTime: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  // Part 3: Extra (30%)
  extraPart: {
    height: AVAILABLE_HEIGHT * 0.25,
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: screenWidth * 0.05,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricIconOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLOR_PALETTE.metric,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  metricIconInner: {
    width: 35,
    height: 35,
    borderRadius: 18,

    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  bonusCard: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    marginHorizontal: screenWidth * 0.05,
    backgroundColor: colors.primary,
  },
  bonusText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 16,
  },
  addAvailabilityButton: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 25,
    borderWidth: 2.5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 4,
    elevation: 4,
    shadowColor: COLOR_PALETTE.tertiary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addAvailabilityText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

