import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Image, Dimensions, Animated, PanResponder } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, getGradientColors, getGradientLocations } from '../../theme/colors';
import { getBookingById } from '../../data/sampleBookings';
import { useDispatch } from 'react-redux';
import { setBookingState as setBookingStateInRedux } from '../../store/slices/profileSlice';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const formatCurrency = (value) => `$${value.toFixed(2)}`;

export default function NewBookingDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingId } = route.params || {};
  const dispatch = useDispatch();

  const booking = useMemo(() => getBookingById(bookingId), [bookingId]);

  // 60-second availability timer
  const [timeLeft, setTimeLeft] = useState(60);
  useEffect(() => {
    setTimeLeft(60);
  }, [bookingId]);
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  // Slider state
  const translateX = useRef(new Animated.Value(0)).current;
  const sliderWidthRef = useRef(0);
  const KNOB_SIZE = 48;

  const onConfirm = () => {
    if (!booking) return;
    // Mark this booking as ongoing so History shows "ONGOING"
    dispatch(setBookingStateInRedux({ bookingId: booking.id, status: 'on_the_way' }));
    // Navigate to Dashboard with acceptance toast
    navigation.navigate('MainApp', { screen: 'Dashboard', params: { acceptedToast: true } });
  };

  const sliderResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const width = sliderWidthRef.current || 0;
        const clamped = Math.max(0, Math.min(gestureState.dx, width - KNOB_SIZE));
        translateX.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        const width = sliderWidthRef.current || 0;
        const threshold = width * 0.6;
        if (gestureState.dx >= threshold) {
          Animated.timing(translateX, {
            toValue: width - KNOB_SIZE,
            duration: 120,
            useNativeDriver: false,
          }).start(() => {
            onConfirm();
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

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
          <Text style={styles.headerTitle}>New Bookings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.mapContainer}>
            <Image
              style={styles.mapImage}
              source={{ uri: 'https://maps.gstatic.com/tactile/pane/default_ds.png' }}
            />
            <TouchableOpacity style={styles.rejectButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
              <MaterialIcons name="close" size={18} color="#FFFFFF" />
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <View style={styles.timerCircle}>
                <Text style={styles.timerValue}>{timeLeft}</Text>
              </View>
              <View style={styles.detailsHeaderText}>
                <Text style={styles.bookingTitle}>New Caregiver Booking!</Text>
                <Text style={styles.bookingSubtitle}>{`#${booking.id}`}</Text>
              </View>
            </View>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <MaterialIcons name="self-improvement" size={screenHeight * 0.025} color={colors.textPrimary} />
                <Text style={styles.summaryValue} numberOfLines={1}>
                  {booking.service}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <MaterialIcons name="place" size={screenHeight * 0.025} color={colors.primary} />
                <Text style={styles.summaryValue} numberOfLines={1}>
                  {booking.address}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <MaterialIcons name="near-me" size={screenHeight * 0.025} color={colors.primary} />
                <Text style={styles.summaryValue} numberOfLines={1}>
                  {booking.distance}
                </Text>
              </View>
            </View>

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownColumn}>
                <Text style={styles.breakdownLabel}>Charges</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(booking.charges)}</Text>
              </View>
              <View style={styles.breakdownColumn}>
                <Text style={styles.breakdownLabel}>Total Fee</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(booking.totalFee)}</Text>
              </View>
            </View>

            <View style={styles.earningRow}>
              <Text style={styles.earningLabel}>Estimated Earning</Text>
              <Text style={styles.earningValue}>{formatCurrency(booking.earning)}</Text>
            </View>

            <View style={styles.tagsRow}>
              <View style={styles.tagGroup}>
                <Text style={styles.tagTitle}>Mobility</Text>
                <View style={styles.tagList}>
                  <View style={styles.tagPill}>
                    <Text style={styles.tagText}>{booking.mobility}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.tagGroup}>
                <Text style={styles.tagTitle}>Care Needed</Text>
                <View style={[styles.tagList, styles.tagListTwoRows]}>
                  {(() => {
                    const MAX_CARE_TAGS = 6; // limit to 2 rows visually
                    const hasOverflow = booking.careNeeded.length > MAX_CARE_TAGS;
                    const display = hasOverflow
                      ? [...booking.careNeeded.slice(0, MAX_CARE_TAGS - 1), '...']
                      : booking.careNeeded;
                    return display.map((item, index) => (
                      <View key={`${item}-${index}`} style={styles.tagPill}>
                        <Text style={styles.tagText}>{item}</Text>
                      </View>
                    ));
                  })()}
                </View>
              </View>
            </View>

            <View style={styles.sliderWrapper}>
              <View
                style={styles.sliderTrack}
                onLayout={(e) => {
                  const { width } = e.nativeEvent.layout;
                  if (width > 0) sliderWidthRef.current = width;
                }}
              >
                <Text style={styles.sliderTrackLabel} pointerEvents="none">
                  Slide to Confirm
                </Text>
                <Animated.View
                  {...sliderResponder.panHandlers}
                  style={[
                    styles.sliderKnob,
                    {
                      transform: [{ translateX }],
                    },
                  ]}
                >
                  <MaterialIcons name="chevron-right" size={26} color="#FFFFFF" />
                </Animated.View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const TIMER_SIZE = screenHeight * 0.07;

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
    paddingBottom: 40,
  },
  mapContainer: {
    height: screenHeight * 0.27,
    marginHorizontal: screenWidth * 0.04,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  rejectButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 3,
  },
  rejectText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: screenHeight * 0.035,
    paddingHorizontal: screenWidth * 0.055,
    paddingVertical: screenHeight * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: screenHeight * 0.02,
  },
  timerCircle: {
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    borderRadius: TIMER_SIZE / 2,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: screenWidth * 0.05,
  },
  timerValue: {
    fontSize: screenHeight * 0.022,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  detailsHeaderText: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: screenHeight * 0.025,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  bookingSubtitle: {
    marginTop: screenHeight * 0.005,
    fontSize: screenHeight * 0.015,
    fontWeight: '600',
    color: colors.primary,
  },
  summaryContainer: {
    backgroundColor: 'rgba(255, 213, 79, 0.75)',
    padding: 10,
    borderRadius: screenHeight * 0.025,
    marginBottom: screenHeight * 0.01,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 5,
  },
  summaryValue: {
    flexShrink: 1,
    fontSize: screenHeight * 0.016,
    color: colors.textSecondary,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: screenWidth * 0.02,
  },
  breakdownColumn: {
    width: '48%',
  },
  breakdownLabel: {
    fontSize: screenHeight * 0.015,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: screenHeight * 0.005,
  },
  breakdownValue: {
    fontSize: screenHeight * 0.017,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  breakdownValueNegative: {
    fontSize: screenHeight * 0.017,
    fontWeight: '600',
    color: '#D32F2F',
  },
  earningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EEF7E8',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 12,
    marginBottom: 12,
  },
  earningLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  earningValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2E7D32',
  },
  tagsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 20,
  },
  tagGroup: {
    width: '48%',
  },
  tagTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 8,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  // visually constrain to two rows height
  tagListTwoRows: {
    maxHeight: screenHeight * 0.09,
    overflow: 'hidden',
  },
  tagPill: {
    backgroundColor: '#E8EFE9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  sliderWrapper: {
    marginTop: 6,
    marginBottom: 8,
  },
  sliderTrack: {
    height: 50,
    borderRadius: 32,
    backgroundColor: '#E6EFE9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sliderTrackLabel: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sliderKnob: {
    position: 'absolute',
    left: 0,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


