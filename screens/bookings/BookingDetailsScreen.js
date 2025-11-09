import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  SafeAreaView,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, getGradientColors, getGradientLocations } from '../../theme/colors';
import { getBookingById } from '../../data/sampleBookings';

const { width: screenWidth } = Dimensions.get('window');
const KNOB_SIZE = 60;
const TRACK_HORIZONTAL_MARGIN = 24;
const SLIDER_INITIAL_WIDTH = screenWidth - TRACK_HORIZONTAL_MARGIN * 2;
const OTP_LENGTH = 6;

const formatCurrency = (value) => `$${value.toFixed(2)}`;

export default function BookingDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingId, booking: routeBooking, mode: routeMode = 'confirm' } = route.params || {};

  const booking = useMemo(() => {
    if (routeBooking) {
      return routeBooking;
    }
    if (bookingId) {
      return getBookingById(bookingId);
    }
    return getBookingById();
  }, [routeBooking, bookingId]);

  const mode = routeMode === 'history' ? 'history' : 'confirm';
  const sliderLabel = mode === 'history' ? 'Slide to reject booking' : 'Slide to make on the way';
  const sliderTrackStyle = mode === 'history' ? styles.sliderTrackReject : styles.sliderTrackConfirm;
  const sliderKnobStyle = mode === 'history' ? styles.sliderKnobReject : styles.sliderKnobConfirm;
  const sliderLabelStyle = mode === 'history' ? styles.sliderLabelReject : styles.sliderLabelConfirm;

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
      Alert.alert('Incomplete OTP', 'Please enter the full code to continue.');
      return;
    }

    closeOtpModal();

    if (mode === 'history') {
      Alert.alert('Booking rejected', 'You have rejected this booking.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      Alert.alert('Verification successful', 'OTP verified. You are on your way!', [
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  }, [closeOtpModal, mode, navigation, otpDigits]);

  const handleCompletion = useCallback(() => {
    openOtpModal();
  }, [openOtpModal]);

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
            handleCompletion();
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

  const handleSliderLayout = useCallback((event) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      sliderWidthRef.current = width;
    }
  }, []);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={24} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <Text style={styles.refreshText}>SWIPE DOWN TO REFRESH</Text>

          <View style={styles.mapContainer}>
            <Image source={{ uri: booking.mapImage }} style={styles.mapImage} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>User</Text>
            <View style={styles.userHeaderRow}>
              <Text style={styles.userName}>{booking.userName}</Text>
              <Text style={styles.bookingId}>{`Booking ID: #${booking.id}`}</Text>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={18} color={colors.primary} style={styles.locationIcon} />
              <Text style={styles.locationText}>{booking.address}</Text>
            </View>

            {!!booking.distance && (
              <View style={styles.distanceRow}>
                <Ionicons name="navigate" size={16} color={colors.textSecondary} />
                <Text style={styles.distanceText}>{booking.distance}</Text>
              </View>
            )}

            <Text style={styles.cardSectionTitle}>Care Needed</Text>
            <View style={styles.tagList}>
              {booking.careNeeded.map((item) => (
                <View key={item} style={styles.tagPill}>
                  <Text style={styles.tagText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Care Schedule</Text>
            <View style={styles.scheduleRow}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeMonth}>{booking.startDate.split(' ')[0]}</Text>
                <Text style={styles.dateBadgeDay}>{booking.startDate.split(' ')[1].replace(',', '')}</Text>
              </View>
              <View style={styles.scheduleContent}>
                <View style={styles.scheduleTimes}>
                  <View style={styles.scheduleTimeItem}>
                    <View style={styles.timeIconGreen} />
                    <Text style={styles.scheduleTimeLabel}>{booking.startTime}</Text>
                  </View>
                  <View style={styles.scheduleTimeItem}>
                    <View style={styles.timeIconRed} />
                    <Text style={styles.scheduleTimeLabel}>{booking.endTime}</Text>
                  </View>
                </View>
                <View style={styles.scheduleDivider} />
                <View style={styles.scheduleFees}>
                  <Text style={styles.scheduleFeeText}>{`Charges: ${formatCurrency(booking.charges)}`}</Text>
                  <Text style={styles.scheduleFeeText}>{`Total Fee: ${formatCurrency(booking.totalFee)}`}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.earningHint}>{`For this booking you will get ${formatCurrency(
              booking.earning,
            )}`}</Text>
          </View>
        </View>

        <View style={styles.sliderWrapper}>
          <View style={[styles.sliderTrack, sliderTrackStyle]} onLayout={handleSliderLayout}>
            <Text style={[styles.sliderLabel, sliderLabelStyle]} pointerEvents="none">
              {sliderLabel}
            </Text>
            <Animated.View
              {...sliderResponder.panHandlers}
              style={[styles.sliderKnob, sliderKnobStyle, { transform: [{ translateX }] }]}
            >
              <MaterialIcons
                name={mode === 'history' ? 'close' : 'done'}
                size={26}
                color="#FFFFFF"
              />
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>

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
    paddingTop: 10,
    paddingBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
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
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  refreshText: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 12,
    marginBottom: 10,
    letterSpacing: 1,
  },
  mapContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  mapImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  userHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  bookingId: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 6,
  },
  locationIcon: {
    marginTop: 2,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  distanceText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: '#E4F7CC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4CAF50',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBadge: {
    width: 70,
    borderRadius: 18,
    backgroundColor: colors.textDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginRight: 16,
  },
  dateBadgeMonth: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
  },
  dateBadgeDay: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textLight,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scheduleTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeIconGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  timeIconRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E53935',
  },
  scheduleTimeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scheduleDivider: {
    height: 1,
    backgroundColor: '#E4E4E4',
    marginBottom: 12,
  },
  scheduleFees: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scheduleFeeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  earningHint: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  sliderWrapper: {
    paddingHorizontal: TRACK_HORIZONTAL_MARGIN,
    paddingBottom: 24,
  },
  sliderTrack: {
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  sliderTrackConfirm: {
    backgroundColor: '#4CAF50',
  },
  sliderTrackReject: {
    backgroundColor: '#F06292',
  },
  sliderLabel: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  sliderLabelConfirm: {
    color: '#FFFFFF',
  },
  sliderLabelReject: {
    color: '#FFFFFF',
  },
  sliderKnob: {
    position: 'absolute',
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    left: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sliderKnobConfirm: {
    backgroundColor: colors.primaryDark,
  },
  sliderKnobReject: {
    backgroundColor: '#C2185B',
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


