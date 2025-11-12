import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Linking,
  PanResponder,
  RefreshControl,
  SafeAreaView,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setBookingState as setBookingStateInRedux } from '../../store/slices/profileSlice';
import { colors, getGradientColors, getGradientLocations } from '../../theme/colors';
import { getBookingById } from '../../data/sampleBookings';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const KNOB_SIZE = 60;
const TRACK_HORIZONTAL_MARGIN = 24;
const SLIDER_INITIAL_WIDTH = screenWidth - TRACK_HORIZONTAL_MARGIN * 2;
const OTP_LENGTH = 6;
const NOTIFICATION_DURATION = 3000; // 3 seconds

const formatCurrency = (value) => `$${value.toFixed(2)}`;

// Booking states
const BOOKING_STATES = {
  ON_THE_WAY: 'on_the_way',
  ARRIVED: 'arrived',
  ARRIVAL_NOTIFIED: 'arrival_notified',
  AWAITING_START: 'awaiting_start',
  READY_TO_START: 'ready_to_start',
  OTP_START: 'otp_start',
  IN_PROGRESS: 'in_progress',
  MEDICAL_NOTE: 'medical_note',
  OTP_COMPLETE: 'otp_complete',
  COMPLETED: 'completed',
};

export default function BookingDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
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

  // Get stored booking state from Redux
  const storedBookingState = useSelector((state) => {
    const id = booking?.id || bookingId;
    return id ? state.profile.bookingStates[id] : null;
  });

  // State management - initialize from Redux if available, or null for initial state
  const [bookingStateLocal, setBookingStateLocal] = useState(
    storedBookingState || null
  );

  // Sync local state with Redux when stored state changes
  useEffect(() => {
    if (storedBookingState) {
      setBookingStateLocal(storedBookingState);
    }
  }, [storedBookingState]);

  // Update Redux whenever booking state changes
  const setBookingState = useCallback((newState) => {
    setBookingStateLocal(newState);
    const id = booking?.id || bookingId;
    if (id) {
      dispatch(setBookingStateInRedux({ bookingId: id, status: newState }));
    }
  }, [booking?.id, bookingId, dispatch]);

  // Use local state for rendering
  const bookingState = bookingStateLocal;
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpType, setOtpType] = useState('start'); // 'start' or 'complete'
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [medicalNoteVisible, setMedicalNoteVisible] = useState(false);
  const [medicalNote, setMedicalNote] = useState('');
  const [bloodPressureUpper, setBloodPressureUpper] = useState('');
  const [bloodPressureLower, setBloodPressureLower] = useState('');
  const [oxygenLevel, setOxygenLevel] = useState('');
  const [ecgReading, setEcgReading] = useState('');
  const [patientHealthInfo, setPatientHealthInfo] = useState('');
  const [treatmentDetails, setTreatmentDetails] = useState('');
  const [otherCareDetails, setOtherCareDetails] = useState('');
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showJobStatusBanner, setShowJobStatusBanner] = useState(false);
  const [showCheckButton, setShowCheckButton] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const personalInfo = useSelector((state) => state.profile.personalInfo);

  const translateX = useRef(new Animated.Value(0)).current;
  const sliderWidthRef = useRef(SLIDER_INITIAL_WIDTH);
  const otpInputsRef = useRef([]);
  const notificationOpacity = useRef(new Animated.Value(0)).current;

  // Parse start time from booking
  const startDateTime = useMemo(() => {
    const [time, period] = booking.startTime.split(' ');
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours, 10);
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    if (period === 'AM' && hour24 === 12) hour24 = 0;

    const date = new Date(booking.startDate);
    date.setHours(hour24, parseInt(minutes, 10), 0, 0);
    return date;
  }, [booking.startTime, booking.startDate]);

  // Check if start time has been reached
  const isStartTimeReached = useMemo(() => {
    return currentTime >= startDateTime;
  }, [currentTime, startDateTime]);

  // Update time periodically and check state transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle state transitions based on time
  useEffect(() => {
    if (bookingState === BOOKING_STATES.AWAITING_START && isStartTimeReached) {
      setBookingState(BOOKING_STATES.READY_TO_START);
    }
  }, [bookingState, isStartTimeReached]);

  // Auto-advance from AWAITING_START to READY_TO_START after 1 second (for convenience)
  useEffect(() => {
    if (bookingState === BOOKING_STATES.AWAITING_START && !isStartTimeReached) {
      const timer = setTimeout(() => {
        setBookingState(BOOKING_STATES.READY_TO_START);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [bookingState, isStartTimeReached]);

  // Handle job status banner display and auto-hide after 3 seconds
  useEffect(() => {
    if (bookingState === BOOKING_STATES.IN_PROGRESS) {
      // Show banner when entering IN_PROGRESS state
      setShowJobStatusBanner(true);
      // Hide banner after 3 seconds
      const timer = setTimeout(() => {
        setShowJobStatusBanner(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // Hide banner when leaving IN_PROGRESS state
      setShowJobStatusBanner(false);
    }
  }, [bookingState]);

  // Handle arrival notification fade out
  useEffect(() => {
    if (bookingState === BOOKING_STATES.ARRIVAL_NOTIFIED) {
      setNotificationVisible(true);
      Animated.sequence([
        Animated.timing(notificationOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(NOTIFICATION_DURATION),
        Animated.timing(notificationOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setNotificationVisible(false);
        if (isStartTimeReached) {
          setBookingState(BOOKING_STATES.READY_TO_START);
        } else {
          setBookingState(BOOKING_STATES.AWAITING_START);
        }
      });
    }
  }, [bookingState, isStartTimeReached, notificationOpacity]);

  useEffect(() => {
    if (otpVisible) {
      const timeout = setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 200);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [otpVisible]);

  // Handle keyboard show/hide for Medical Note Modal
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!medicalNoteVisible) {
      setKeyboardHeight(0);
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
      return;
    }

    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const height = e.endCoordinates.height;
        setKeyboardHeight(height);
        // Move modal up just enough so Continue button stays above keyboard
        // Use a smaller, more conservative offset to prevent modal from rising too much
        // The modal should only move up enough to keep the button visible, not the full keyboard height
        const offset = Math.min(height * 0.2, 100); // 20% of keyboard height, max 100px
        Animated.timing(keyboardOffset, {
          toValue: -offset,
          duration: Platform.OS === 'ios' ? e.duration || 250 : 250,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [medicalNoteVisible, keyboardOffset]);

  const resetSlider = useCallback(() => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [translateX]);

  const openOtpModal = useCallback((type) => {
    setOtpType(type);
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

    if (otpType === 'start') {
      setBookingState(BOOKING_STATES.IN_PROGRESS);
      // Show "You are starting your job" banner for 2 seconds
      setShowJobStatusBanner(true);
      setTimeout(() => {
        setShowJobStatusBanner(false);
      }, 2000);
    } else if (otpType === 'complete') {
      // Show notification first
      const userName = personalInfo.fullName || booking.userName;
      setNotificationTitle(`${userName} Caregiver`);
      setNotificationMessage('You finished the job successfully for the day!');
      setNotificationVisible(true);
      Animated.sequence([
        Animated.timing(notificationOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(notificationOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setNotificationVisible(false);
        setBookingState(BOOKING_STATES.COMPLETED);
        // Navigate to HistoryScreen after 1 second
        setTimeout(() => {
          navigation.navigate('MainApp', { screen: 'History' });
        }, 1000);
      });
    }
  }, [closeOtpModal, otpType, otpDigits, navigation, personalInfo, booking]);

  const handleSliderCompleteRef = useRef();
  handleSliderCompleteRef.current = () => {
    // If no state is set (initial), sliding "Slide to make on the way" should mark as "on the way"
    if (!bookingState) {
      setShowCheckButton(true);
      setTimeout(() => {
        setShowCheckButton(false);
        setBookingState(BOOKING_STATES.ON_THE_WAY);
        // Show notification
        const userName = personalInfo.fullName || booking.userName;
        setNotificationTitle(`${userName} Caregiver`);
        setNotificationMessage('The job mark as "On the way" successfully');
        setNotificationVisible(true);
        Animated.sequence([
          Animated.timing(notificationOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
          Animated.timing(notificationOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setNotificationVisible(false);
        });
      }, 1000);
      return;
    }

    switch (bookingState) {
      case BOOKING_STATES.ON_THE_WAY:
        // Show check button for 1 second, then show notification and transition
        setShowCheckButton(true);
        setTimeout(() => {
          setShowCheckButton(false);
          setBookingState(BOOKING_STATES.ARRIVED);
          // Show notification
          const userName = personalInfo.fullName || booking.userName;
          setNotificationTitle(`${userName} Caregiver`);
          setNotificationMessage('The job mark as "Arrived" successfully!');
          setNotificationVisible(true);
          Animated.sequence([
            Animated.timing(notificationOpacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.delay(2000),
            Animated.timing(notificationOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setNotificationVisible(false);
            // After notification, show "Awaiting to start job..." for 3 seconds
            setBookingState(BOOKING_STATES.AWAITING_START);
            setTimeout(() => {
              setBookingState(BOOKING_STATES.READY_TO_START);
            }, 3000);
          });
        }, 1000);
        break;
      case BOOKING_STATES.ARRIVED:
        // This state should not be reached via slider, but handle it just in case
        break;
      case BOOKING_STATES.READY_TO_START:
        // Show check button, then open OTP modal
        setShowCheckButton(true);
        setTimeout(() => {
          setShowCheckButton(false);
          openOtpModal('start');
        }, 1000);
        break;
      default:
        break;
    }
  };

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
            handleSliderCompleteRef.current();
            resetSlider();
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

  const handleMapPress = useCallback(() => {
    const encodedAddress = encodeURIComponent(booking.address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    Linking.openURL(url).catch((err) => {
      Alert.alert('Error', 'Could not open maps.');
      console.error('Error opening maps:', err);
    });
  }, [booking.address]);

  const handleTrackLocation = useCallback(() => {
    const encodedAddress = encodeURIComponent(booking.address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    Linking.openURL(url).catch((err) => {
      Alert.alert('Error', 'Could not open navigation.');
      console.error('Error opening navigation:', err);
    });
  }, [booking.address]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentTime(new Date());
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleAddMedicalNote = useCallback(() => {
    setMedicalNoteVisible(true);
  }, []);

  const handleMedicalNoteSubmit = useCallback(() => {
    // Combine all medical record fields into a single note
    const medicalRecordData = {
      bloodPressure: bloodPressureUpper && bloodPressureLower ? `${bloodPressureUpper}-${bloodPressureLower}` : '',
      oxygenLevel,
      ecgReading,
      patientHealthInfo,
      treatmentDetails,
      otherCareDetails,
    };

    // Create a formatted medical note from all fields
    const formattedNote = Object.entries(medicalRecordData)
      .filter(([_, value]) => value && value.trim())
      .map(([key, value]) => {
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase())
          .replace('Blood Pressure', 'Blood Pressure')
          .replace('Oxygen Level', 'Oxygen Level')
          .replace('Ecg Reading', 'ECG (bpm)')
          .replace('Patient Health Info', 'Patient Health Information')
          .replace('Treatment Details', 'Treatment Details')
          .replace('Other Care Details', 'Other Care Details');
        return `${label}: ${value}`;
      })
      .join('\n');

    if (!formattedNote.trim()) {
      Alert.alert('Empty Record', 'Please enter at least one medical record field.');
      return;
    }

    setMedicalNote(formattedNote);
    setMedicalNoteVisible(false);
    // Reset all fields
    setBloodPressureUpper('');
    setBloodPressureLower('');
    setOxygenLevel('');
    setEcgReading('');
    setPatientHealthInfo('');
    setTreatmentDetails('');
    setOtherCareDetails('');

    // Show orange check mark and notification
    setShowCheckButton(true);
    const userName = personalInfo.fullName || booking.userName;
    setNotificationTitle(`${userName} Caregiver`);
    setNotificationMessage('Medical Note Added Successfully!');
    setNotificationVisible(true);

    Animated.sequence([
      Animated.timing(notificationOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(notificationOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setNotificationVisible(false);
      setShowCheckButton(false);
      // After few seconds, show OTP modal
      setTimeout(() => {
        openOtpModal('complete');
      }, 2000);
    });
  }, [bloodPressureUpper, bloodPressureLower, oxygenLevel, ecgReading, patientHealthInfo, treatmentDetails, otherCareDetails, openOtpModal, personalInfo, booking]);

  // Get slider button configuration based on state
  const getSliderConfig = useCallback(() => {
    // If no state is set (initial), show initial "Slide to make on the way"
    if (!bookingState) {
      return {
        label: 'Slide to make on the way',
        trackColor: '#4CAF50',
        knobColor: colors.primaryDark,
        icon: 'navigation',
        enabled: true,
      };
    }

    switch (bookingState) {
      case BOOKING_STATES.ON_THE_WAY:
        return {
          label: 'Slide to Mark as Arrived',
          trackColor: '#4CAF50',
          knobColor: colors.primaryDark,
          icon: 'check-circle',
          enabled: true,
        };
      case BOOKING_STATES.ARRIVED:
      case BOOKING_STATES.ARRIVAL_NOTIFIED:
      case BOOKING_STATES.AWAITING_START:
        return {
          label: 'AWAITING TO START JOB...',
          trackColor: '#FF9800',
          knobColor: '#FF9800',
          icon: 'schedule',
          enabled: false,
        };
      case BOOKING_STATES.READY_TO_START:
        return {
          label: 'Slide To Start the job',
          trackColor: '#4CAF50',
          knobColor: colors.primaryDark,
          icon: 'play-arrow',
          enabled: true,
        };
      case BOOKING_STATES.IN_PROGRESS:
        return null; // Show buttons instead
      default:
        return null;
    }
  }, [bookingState]);

  const sliderConfig = getSliderConfig();

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

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.textLight} />}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.refreshText}>SWIPE DOWN TO REFRESH</Text>

          <TouchableOpacity style={styles.mapContainer} onPress={handleMapPress} activeOpacity={0.9}>
            <Image source={{ uri: booking.mapImage }} style={styles.mapImage} />
            {(bookingState === BOOKING_STATES.ON_THE_WAY ||
              bookingState === BOOKING_STATES.ARRIVED ||
              bookingState === BOOKING_STATES.ARRIVAL_NOTIFIED ||
              bookingState === BOOKING_STATES.AWAITING_START ||
              bookingState === BOOKING_STATES.READY_TO_START ||
              bookingState === BOOKING_STATES.OTP_START) && (
                <TouchableOpacity
                  style={styles.trackLocationButton}
                  onPress={handleTrackLocation}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="my-location" size={18} color="#FFFFFF" />
                  <Text style={styles.trackLocationText}>Track Location</Text>
                </TouchableOpacity>
              )}
          </TouchableOpacity>

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

            <Text style={styles.cardSectionTitle}>Care Needed</Text>
            <View style={styles.tagList}>
              {booking.careNeeded.slice(0, 3).map((item) => (
                <View key={item} style={styles.tagPill}>
                  <Text style={styles.tagText}>{item}</Text>
                </View>
              ))}
              {booking.careNeeded.length > 3 && (
                <View style={styles.tagPill}>
                  <Text style={styles.tagText}>...</Text>
                </View>
              )}
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
            <Text style={styles.earningHint}>{`For this booking you will get ${formatCurrency(booking.earning)}`}</Text>

            {/* Slider Button, Notification, or Action Buttons - Inside Care Schedule Card */}
            {bookingState === BOOKING_STATES.COMPLETED ? (
              <View style={styles.sliderWrapperInCard}>
                <View style={styles.completedCard}>
                  <View style={styles.completedIconWrapper}>
                    <MaterialIcons name="check-circle" size={32} color="#2E7D32" />
                  </View>
                  <View style={styles.completedTextGroup}>
                    <Text style={styles.completedTitle}>Booking Completed</Text>
                    <Text style={styles.completedSubtitle}>Great job! This visit is closed.</Text>
                  </View>
                  <View style={styles.completedAmountBadge}>
                    <Text style={styles.completedAmountText}>{formatCurrency(booking.earning)}</Text>
                  </View>
                </View>
              </View>
            ) : showCheckButton && bookingState === BOOKING_STATES.IN_PROGRESS ? (
              <View style={styles.sliderWrapperInCard}>
                <View style={[styles.sliderTrack, { backgroundColor: '#FF9800' }]}>
                  <View style={styles.checkButtonContainer}>
                    <MaterialIcons name="check" size={32} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            ) : showCheckButton ? (
              <View style={styles.sliderWrapperInCard}>
                <View style={[styles.sliderTrack, { backgroundColor: '#4CAF50' }]}>
                  <View style={styles.checkButtonContainer}>
                    <MaterialIcons name="check" size={32} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            ) : bookingState === BOOKING_STATES.IN_PROGRESS ? (
              <View style={styles.sliderWrapperInCard}>
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity style={styles.careInProgressButton} activeOpacity={0.85}>
                    <Text style={styles.careInProgressText}>CARE UNDER PROGRESS...</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addMedicalNoteButton} onPress={handleAddMedicalNote} activeOpacity={0.85}>
                    <Text style={styles.addMedicalNoteText}>ADD MEDICAL NOTE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : sliderConfig ? (
              <View style={styles.sliderWrapperInCard}>
                <View
                  style={[styles.sliderTrack, { backgroundColor: sliderConfig.trackColor }]}
                  onLayout={handleSliderLayout}
                >
                  <Text style={styles.sliderLabel} pointerEvents="none">
                    {sliderConfig.label}
                  </Text>
                  {sliderConfig.enabled && (
                    <Animated.View
                      {...sliderResponder.panHandlers}
                      style={[
                        styles.sliderKnob,
                        { backgroundColor: sliderConfig.knobColor },
                        { transform: [{ translateX }] },
                      ]}
                    >
                      <MaterialIcons name={sliderConfig.icon} size={26} color="#FFFFFF" />
                    </Animated.View>
                  )}
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Notifications - Independent from Care Schedule */}
        {notificationVisible && bookingState !== BOOKING_STATES.COMPLETED && (
          <View style={styles.notificationContainer}>
            <Animated.View
              style={[
                styles.notificationInSliderPosition,
                {
                  opacity: notificationOpacity,
                },
              ]}
              pointerEvents="none"
            >
              <MaterialIcons name="info" size={24} color="#FFFFFF" />
              <View style={styles.notificationTextContainer}>
                <Text style={styles.notificationTitleWhite}>{notificationTitle}</Text>
                <Text style={styles.notificationMessageWhite}>{notificationMessage}</Text>
              </View>
            </Animated.View>
          </View>
        )}

        {/* Job Status Banner */}
        {showJobStatusBanner && (
          <View style={styles.jobStatusBanner}>
            <Text style={styles.jobStatusText}>You are starting your job.</Text>
          </View>
        )}

        {/* Bottom Notification for completion */}
        {bookingState === BOOKING_STATES.COMPLETED && notificationVisible && (
          <View style={styles.bottomNotificationContainer}>
            <Animated.View
              style={[
                styles.bottomNotification,
                {
                  opacity: notificationOpacity,
                },
              ]}
              pointerEvents="none"
            >
              <MaterialIcons name="info" size={24} color="#FFFFFF" />
              <View style={styles.bottomNotificationTextContainer}>
                <Text style={styles.bottomNotificationTitle}>{notificationTitle}</Text>
                <Text style={styles.bottomNotificationMessage}>{notificationMessage}</Text>
              </View>
            </Animated.View>
          </View>
        )}

        {/* OTP Modal */}
        <Modal visible={otpVisible} transparent animationType="fade" onRequestClose={closeOtpModal}>
          <KeyboardAvoidingView
            style={styles.otpOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
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
          </KeyboardAvoidingView>
        </Modal>

        {/* Medical Note Modal */}
        <Modal visible={medicalNoteVisible} transparent animationType="fade" onRequestClose={() => setMedicalNoteVisible(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.medicalNoteOverlay}
            keyboardVerticalOffset={0}
          >
            <Animated.View
              style={[
                styles.medicalNoteCardContainer,
                {
                  transform: [
                    {
                      translateY: keyboardOffset,
                    },
                  ],
                },
              ]}
            >
              <View style={[styles.medicalNoteCard, { maxHeight: keyboardHeight > 0 ? screenHeight - keyboardHeight - 60 : screenHeight * 0.75 }]}>
                <View style={styles.medicalNoteHeader}>
                  <Text style={styles.medicalNoteTitle}>Add Medical Record Log</Text>
                  <TouchableOpacity
                    style={styles.medicalNoteCloseButton}
                    onPress={() => {
                      setMedicalNoteVisible(false);
                      setBloodPressureUpper('');
                      setBloodPressureLower('');
                      setOxygenLevel('');
                      setEcgReading('');
                      setPatientHealthInfo('');
                      setTreatmentDetails('');
                      setOtherCareDetails('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.medicalNoteScrollView} showsVerticalScrollIndicator={false}>
                  {/* Blood Pressure */}
                  <View style={styles.medicalNoteFieldGroup}>
                    <Text style={styles.medicalNoteLabel}>Blood Pressure</Text>
                    <View style={styles.bloodPressureRow}>
                      <TextInput
                        style={[styles.medicalNoteInput, styles.bloodPressureInput]}
                        placeholder="Upper value"
                        placeholderTextColor={colors.textMuted}
                        value={bloodPressureUpper}
                        onChangeText={setBloodPressureUpper}
                        keyboardType="numeric"
                      />
                      <Text style={styles.bloodPressureSeparator}>-</Text>
                      <TextInput
                        style={[styles.medicalNoteInput, styles.bloodPressureInput]}
                        placeholder="Lower value"
                        placeholderTextColor={colors.textMuted}
                        value={bloodPressureLower}
                        onChangeText={setBloodPressureLower}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {/* Oxygen Level */}
                  <View style={styles.medicalNoteFieldGroup}>
                    <Text style={styles.medicalNoteLabel}>Oxygen Level</Text>
                    <TextInput
                      style={styles.medicalNoteInput}
                      placeholder="Enter oxygen level of patient"
                      placeholderTextColor={colors.textMuted}
                      value={oxygenLevel}
                      onChangeText={setOxygenLevel}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* ECG */}
                  <View style={styles.medicalNoteFieldGroup}>
                    <Text style={styles.medicalNoteLabel}>ECG (in bpm)</Text>
                    <TextInput
                      style={styles.medicalNoteInput}
                      placeholder="Enter ECG reading"
                      placeholderTextColor={colors.textMuted}
                      value={ecgReading}
                      onChangeText={setEcgReading}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* Patient's health information */}
                  <View style={styles.medicalNoteFieldGroup}>
                    <Text style={styles.medicalNoteLabel}>Patient's health information</Text>
                    <TextInput
                      style={[styles.medicalNoteInput, styles.medicalNoteTextArea]}
                      placeholder="Enter patient's health information here"
                      placeholderTextColor={colors.textMuted}
                      value={patientHealthInfo}
                      onChangeText={setPatientHealthInfo}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Treatment details */}
                  <View style={styles.medicalNoteFieldGroup}>
                    <Text style={styles.medicalNoteLabel}>Treatment details</Text>
                    <TextInput
                      style={[styles.medicalNoteInput, styles.medicalNoteTextArea]}
                      placeholder="Enter treatment details here"
                      placeholderTextColor={colors.textMuted}
                      value={treatmentDetails}
                      onChangeText={setTreatmentDetails}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Other care details */}
                  <View style={styles.medicalNoteFieldGroup}>
                    <Text style={styles.medicalNoteLabel}>Other care details</Text>
                    <TextInput
                      style={[styles.medicalNoteInput, styles.medicalNoteTextArea]}
                      placeholder="Enter other care details here"
                      placeholderTextColor={colors.textMuted}
                      value={otherCareDetails}
                      onChangeText={setOtherCareDetails}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.medicalNoteContinueButton}
                  onPress={handleMedicalNoteSubmit}
                  activeOpacity={0.85}
                >
                  <Text style={styles.medicalNoteContinueText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  content: {
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
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  trackLocationButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  trackLocationText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
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
    width: 60,
    borderRadius: 10,
    backgroundColor: colors.textDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    marginRight: 16,
  },
  dateBadgeMonth: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textLight,
    textTransform: 'uppercase',
  },
  dateBadgeDay: {
    fontSize: 18,
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
  sliderWrapperInCard: {
    marginTop: 16,
    paddingTop: 0,
  },
  checkButtonContainer: {
    width: '100%',
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 0,
    marginTop: 16,
  },
  careInProgressButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  careInProgressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  addMedicalNoteButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMedicalNoteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bottomNotificationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
    paddingBottom: 15,
    zIndex: 10,
  },
  bottomNotification: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    padding: 36,
    alignItems: 'center',
    gap: 12,
  },
  bottomNotificationTextContainer: {
    flex: 1,
  },
  bottomNotificationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bottomNotificationMessage: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  sliderTrack: {
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  sliderLabel: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '700',
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
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: TRACK_HORIZONTAL_MARGIN,
    paddingBottom: 20,
    gap: 0,
  },
  progressButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  medicalNoteButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicalNoteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  notificationContainer: {
    paddingHorizontal: TRACK_HORIZONTAL_MARGIN,
    paddingBottom: 0,
  },
  notificationInSliderPosition: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    justifyContent: 'center',
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitleWhite: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationMessageWhite: {
    fontSize: 12,
    color: '#FFFFFF',
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
  medicalNoteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  medicalNoteCardContainer: {
    width: '100%',
    maxWidth: screenWidth * 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicalNoteCard: {
    width: '100%',
    height: screenHeight * 0.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    justifyContent: 'space-between',
  },
  medicalNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  medicalNoteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  medicalNoteCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicalNoteScrollView: {
    flexGrow: 1,
    flexShrink: 1,
  },
  medicalNoteFieldGroup: {
    marginBottom: 10,
  },
  medicalNoteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  medicalNoteInput: {
    width: '100%',
    minHeight: 28,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: '#FFFFFF',
  },
  medicalNoteTextArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  bloodPressureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bloodPressureInput: {
    flex: 1,
  },
  bloodPressureSeparator: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginHorizontal: 4,
  },
  medicalNoteContinueButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  medicalNoteContinueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  jobStatusBanner: {
    marginTop: 0,
    paddingVertical: screenHeight * 0.02,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  jobStatusText: {
    fontSize: screenHeight * 0.018,
    fontWeight: '700',
    color: '#ffffff',
  },
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    borderRadius: screenHeight * 0.03,
    paddingVertical: screenHeight * 0.02,
    paddingHorizontal: screenWidth * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  completedIconWrapper: {
    width: screenHeight * 0.055,
    height: screenHeight * 0.055,
    borderRadius: (screenHeight * 0.055) / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: screenWidth * 0.04,
  },
  completedTextGroup: {
    flex: 1,
  },
  completedTitle: {
    fontSize: screenHeight * 0.022,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  completedSubtitle: {
    marginTop: screenHeight * 0.006,
    fontSize: screenHeight * 0.016,
    color: colors.textSecondary,
  },
  completedAmountBadge: {
    marginLeft: screenWidth * 0.04,
    backgroundColor: '#D8F3C0',
    borderRadius: screenHeight * 0.02,
    paddingHorizontal: screenWidth * 0.04,
    paddingVertical: screenHeight * 0.012,
  },
  completedAmountText: {
    fontSize: screenHeight * 0.018,
    fontWeight: '700',
    color: '#2E7D32',
  },
});
