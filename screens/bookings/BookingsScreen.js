import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getGradientColors, getGradientLocations, colors } from '../../theme/colors';
import BottomNav from '../../components/BottomNav';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BOOKINGS = [
  {
    id: 'CBID721514',
    service: 'Companionship',
    address: 'Parking Structure 4, 221 Westwood Plaza, Los Angeles, CA 90095, USA',
    distance: '7.42 miles away',
    estimatedEarning: 58.85,
    fees: {
      booking: 72,
      serviceFee: 5.95,
      liaisonFee: 3.6,
      processingFee: 3.6,
    },
    mobility: 'Walker',
    careNeeded: ['Companionship', 'Cooking/Meal Preparation'],
    timeLimit: 60,
  },
  {
    id: 'CBID731880',
    service: 'Medication Reminder',
    address: '1120 Pacific Coast Hwy, Hermosa Beach, CA 90254, USA',
    distance: '5.12 miles away',
    estimatedEarning: 45.4,
    fees: {
      booking: 56,
      serviceFee: 4.8,
      liaisonFee: 2.5,
      processingFee: 3.3,
    },
    mobility: 'Cane',
    careNeeded: ['Medication', 'Safety Check'],
    timeLimit: 60,
  },
  {
    id: 'CBID745402',
    service: 'Personal Care',
    address: '3400 Ocean Park Blvd, Santa Monica, CA 90405, USA',
    distance: '10.9 miles away',
    estimatedEarning: 64.25,
    fees: {
      booking: 78,
      serviceFee: 6.5,
      liaisonFee: 4.1,
      processingFee: 3.15,
    },
    mobility: 'Wheelchair',
    careNeeded: ['Bathing', 'Meal Prep', 'Safety Check'],
    timeLimit: 60,
  },
];

const CARD_HORIZONTAL_MARGIN = 16;
const CARD_HORIZONTAL_PADDING = 22;
const SLIDER_INITIAL_WIDTH = screenWidth - 2 * (CARD_HORIZONTAL_MARGIN + CARD_HORIZONTAL_PADDING);
const KNOB_SIZE = 64;
const TIMER_RADIUS = 23;
const TIMER_STROKE_WIDTH = 6;
const TIMER_SIZE = (TIMER_RADIUS + TIMER_STROKE_WIDTH) * 2;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;
const OTP_LENGTH = 6;

// Custom Circular Progress Component using React Native Animated API
const CircularProgress = ({ progress, radius, strokeWidth, activeColor, activeSecondaryColor, inactiveColor, children }) => {
  const size = (radius + strokeWidth) * 2;
  const rotation = -90; // Start from top

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Background circle */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: inactiveColor,
        }}
      />
      
      {/* Progress arc using two half-circles */}
      {progress > 0 && (
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            transform: [{ rotate: `${rotation}deg` }],
          }}
        >
          {/* First half (0-50%) */}
          {progress <= 50 ? (
            <View
              style={{
                width: size,
                height: size / 2,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: strokeWidth,
                  borderColor: 'transparent',
                  borderTopColor: activeColor,
                  borderRightColor: activeColor,
                  transform: [{ rotate: `${(progress / 50) * 180}deg` }],
                }}
              />
            </View>
          ) : (
            <>
              {/* First half filled */}
              <View
                style={{
                  width: size,
                  height: size / 2,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: 'transparent',
                    borderTopColor: activeColor,
                    borderRightColor: activeColor,
                    transform: [{ rotate: '180deg' }],
                  }}
                />
              </View>
              {/* Second half (50-100%) */}
              <View
                style={{
                  position: 'absolute',
                  top: size / 2,
                  width: size,
                  height: size / 2,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: 'transparent',
                    borderTopColor: activeSecondaryColor,
                    borderRightColor: activeSecondaryColor,
                    transform: [{ rotate: `${((progress - 50) / 50) * 180}deg` }],
                  }}
                />
              </View>
            </>
          )}
        </View>
      )}
      
      {/* Children (timer text) */}
      {children}
    </View>
  );
};

export default function BookingsScreen() {
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BOOKINGS[0].timeLimit);
  const translateX = useRef(new Animated.Value(0)).current;
  const sliderWidthRef = useRef(SLIDER_INITIAL_WIDTH);
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const otpInputsRef = useRef([]);

  useEffect(() => {
    if (otpVisible) {
      const timeout = setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 200);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [otpVisible]);

  const activeBooking = BOOKINGS[index % BOOKINGS.length];

  const advanceBooking = useCallback(() => {
    setIndex((prev) => {
      const next = (prev + 1) % BOOKINGS.length;
      setTimeLeft(BOOKINGS[next].timeLimit);
      return next;
    });
    translateX.setValue(0);
  }, [translateX]);

  const resetSlider = useCallback(() => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [translateX]);

  const openOtpModal = useCallback(() => {
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setOtpVisible(true);
  }, []);

  const closeOtpModal = useCallback(() => {
    setOtpVisible(false);
    resetSlider();
  }, [resetSlider]);

  const handleDigitChange = useCallback((value, index) => {
    const sanitized = value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
    const char = sanitized.slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = char || '';
      return next;
    });
    if (char && index < OTP_LENGTH - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyPress = useCallback(
    (event, index) => {
      if (event.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
        otpInputsRef.current[index - 1]?.focus();
      }
    },
    [otpDigits],
  );

  const handleOtpSubmit = useCallback(() => {
    if (otpDigits.some((digit) => !digit)) {
      Alert.alert('Incomplete OTP', 'Please enter the full code to confirm the booking.');
      return;
    }
    setOtpVisible(false);
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    advanceBooking();
    Alert.alert('Booking confirmed', 'OTP verified successfully.');
  }, [advanceBooking, otpDigits]);

  useEffect(() => {
    const current = BOOKINGS[index % BOOKINGS.length];
    setTimeLeft(current.timeLimit);
    translateX.setValue(0);

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          advanceBooking();
          return current.timeLimit;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [index, advanceBooking, translateX]);


  const sliderResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const sliderWidth = sliderWidthRef.current;
        const clamped = Math.max(0, Math.min(gestureState.dx, sliderWidth - KNOB_SIZE));
        translateX.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        const sliderWidth = sliderWidthRef.current;
        const threshold = sliderWidth * 0.6;
        if (gestureState.dx >= threshold) {
          Animated.timing(translateX, {
            toValue: sliderWidth - KNOB_SIZE,
            duration: 150,
            useNativeDriver: false,
          }).start(() => {
            openOtpModal();
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

  const handleSliderLayout = useCallback(
    (event) => {
      const { width } = event.nativeEvent.layout;
      if (width > 0) {
        sliderWidthRef.current = width;
      }
    },
    [],
  );

  const normalizeTags = useCallback((value) => {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }
    return [value];
  }, []);

  const getDisplayTags = useCallback((tags) => {
    if (tags.length > 3) {
      return [...tags.slice(0, 3), '...'];
    }
    return tags;
  }, []);

  const handleReject = () => {
    advanceBooking();
  };

  const formattedEarning = `$${activeBooking.estimatedEarning.toFixed(2)}`;
  const progressPercentage = (timeLeft / activeBooking.timeLimit) * 100;

  const summarySections = [
    {
      key: 'service',
      icon: 'self-improvement',
      title: 'Service',
      value: activeBooking.service,
      highlight: true,
    },
    {
      key: 'location',
      icon: 'place',
      title: 'Location',
      value: activeBooking.address,
    },
    {
      key: 'distance',
      icon: 'near-me',
      title: 'Distance',
      value: activeBooking.distance,
    },
  ];

  return (
    <LinearGradient
      colors={getGradientColors()}
      locations={getGradientLocations()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.mapContainer}>
        <Image
          style={styles.mapImage}
          source={{ uri: 'https://maps.gstatic.com/tactile/pane/default_ds.png' }}
        />
        <TouchableOpacity style={styles.rejectButton} onPress={handleReject} activeOpacity={0.85}>
          <MaterialIcons name="close" size={18} color="#FFFFFF" />
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.timerWrapper}>
          <View style={styles.timerCircle}>
            <CircularProgress
              progress={progressPercentage}
              radius={TIMER_RADIUS}
              strokeWidth={TIMER_STROKE_WIDTH}
              activeColor={colors.primary}
              activeSecondaryColor={colors.primaryLight}
              inactiveColor={colors.borderMuted}
            >
              <View style={styles.timerLabelWrapper}>
                <Text style={styles.timerValue}>{timeLeft}</Text>
              </View>
            </CircularProgress>
          </View>
          <View style={styles.detailsHeaderText}>
            <Text style={styles.bookingTitle}>New Caregiver Booking!</Text>
            <Text style={styles.bookingSubtitle}>{`#${activeBooking.id}`}</Text>
          </View>
        </View>

        <View style={styles.detailsCardContent}>
          <View style={styles.summaryContainer}>
            {summarySections.map((section) => (
              <View
                key={section.key}
                style={[styles.summaryRow, section.highlight]}
              >
                <View style={styles.summaryRowLeft}>
                  <View
                    style={[
                      section.highlight
                    ]}
                  >
                    <MaterialIcons
                      name={section.icon}
                      size={20}
                      color={section.highlight ? colors.textPrimary : colors.primary}
                    />
                  </View>
                </View>
                <Text
                  style={[
                    styles.summaryValue,
                    section.highlight && styles.summaryValueHighlight,
                  ]}
                  numberOfLines={1}
                >
                  {section.value}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownColumn}>
              <Text style={styles.breakdownLabel}>Booking service</Text>
              <Text style={styles.breakdownValue}>{`$${activeBooking.fees.booking.toFixed(2)}`}</Text>
            </View>
            <View style={styles.breakdownColumn}>
              <Text style={styles.breakdownLabel}>Liaison Fee</Text>
              <Text style={styles.breakdownValueNegative}>{`- $${activeBooking.fees.liaisonFee.toFixed(2)}`}</Text>
            </View>
          </View>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownColumn}>
              <Text style={styles.breakdownLabel}>Service Fee</Text>
              <Text style={styles.breakdownValueNegative}>{`- $${activeBooking.fees.serviceFee.toFixed(2)}`}</Text>
            </View>
            <View style={styles.breakdownColumn}>
              <Text style={styles.breakdownLabel}>Processing Fee</Text>
              <Text style={styles.breakdownValueNegative}>{`- $${activeBooking.fees.processingFee.toFixed(2)}`}</Text>
            </View>
          </View>

          <View style={styles.earningRow}>
            <Text style={styles.earningLabel}>Estimated Earning</Text>
            <Text style={styles.earningValue}>{formattedEarning}</Text>
          </View>

          <View style={styles.tagsRow}>
            <View style={styles.tagGroup}>
              <Text style={styles.tagTitle}>Mobility</Text>
              
              <View style={styles.tagList}>
                {getDisplayTags(normalizeTags(activeBooking.mobility)).map((item, index) => (
                  <View key={`${item}-${index}`} style={styles.tagPill}>
                    <Text style={styles.tagText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.tagGroup}>
              <Text style={styles.tagTitle}>Care Needed</Text>
              <View style={styles.tagList}>
                {getDisplayTags(normalizeTags(activeBooking.careNeeded)).map((item, index) => (
                  <View key={`${item}-${index}`} style={styles.tagPill}>
                    <Text style={styles.tagText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sliderWrapper}>
          <View style={styles.sliderTrack} onLayout={handleSliderLayout}>
            <Text style={styles.sliderTrackLabel} pointerEvents="none">
              Slide to Confirm
            </Text>
            <Animated.View
              {...sliderResponder.panHandlers}
              style={[styles.sliderKnob, { transform: [{ translateX }] }]}
            >
              <MaterialIcons name="chevron-right" size={26} color="#FFFFFF" />
            </Animated.View>
          </View>
        </View>
      </View>

      <Modal visible={otpVisible} transparent animationType="fade" onRequestClose={closeOtpModal}>
        <View style={styles.otpOverlay}>
          <View style={styles.otpCard}>
            <Text style={styles.otpTitle}>Enter OTP to continue</Text>
            <View style={styles.otpInputsRow}>
              {otpDigits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    otpInputsRef.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(value) => handleDigitChange(value, index)}
                  onKeyPress={(event) => handleOtpKeyPress(event, index)}
                  keyboardType="default"
                  autoCapitalize="characters"
                  maxLength={1}
                  style={styles.otpInput}
                  returnKeyType="next"
                />
              ))}
            </View>
            <TouchableOpacity style={styles.otpSubmitButton} onPress={handleOtpSubmit} activeOpacity={0.85}>
              <Text style={styles.otpSubmitText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeOtpModal} style={styles.otpCancelArea} activeOpacity={0.8}>
              <Text style={styles.otpCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: screenHeight * 0.42,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  rejectButton: {
    position: 'absolute',
    top: 48,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  rejectText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },
  detailsCard: {
    flex: 1,
    backgroundColor: '#F6FBF9',
    marginHorizontal: 16,
    marginTop: -148,
    marginBottom: 70,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 48,
  },
  detailsCardContent: {
    flex: 1,
  },
  timerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timerCircle: {
    width: TIMER_SIZE,
    height: TIMER_SIZE,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    marginTop:10
  },
  timerLabelWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  timerLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  detailsHeaderText: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  bookingSubtitle: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  summaryContainer: {
    marginBottom: 15,
    backgroundColor: 'rgba(255, 213, 79, 0.75)',
    padding: 15,
    borderRadius: 20
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  summaryRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  summaryIconHighlight: {
    backgroundColor: '#FFFFFF',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryValue: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: 'right',
    marginLeft: 12,
  },
  summaryValueHighlight: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 20,
  },
  breakdownColumn: {
    width: '48%',
  },
  breakdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  breakdownValueNegative: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
  },
  earningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(12, 64, 58, 0.08)',

  },
  earningLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  earningValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  tagsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tagGroup: {
    flex: 1,
    marginRight: 10,
  },
  tagTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    borderRadius: 16,
    backgroundColor: '#E4F2EF',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  sliderWrapper: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    bottom:-25
  },
  sliderTrack: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D6EDE7',
    alignSelf: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sliderTrackLabel: {
    position: 'absolute',
    alignSelf: 'center',
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  sliderKnob: {
    position: 'absolute',
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    left: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  otpOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  otpCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  otpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 24,
  },
  otpInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDivider,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    backgroundColor: '#F2F6F4',
  },
  otpSubmitButton: {
    width: '100%',
    backgroundColor: '#8BC34A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  otpSubmitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  otpCancelArea: {
    marginTop: 16,
  },
  otpCancelText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});


