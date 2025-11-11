import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomNav from '../../components/BottomNav';
import { colors, getGradientColors, getGradientLocations } from '../../theme/colors';
import { bookingDetailsData } from '../../data/sampleBookings';

// History bookings - Different from BookingsScreen test data
const HISTORY_BOOKINGS = [
  {
    id: 'CBID721514',
    service: 'Companionship',
    startDate: 'Jan 24, 2024',
    endDate: 'Jan 24, 2024',
    startTime: '11:50 AM',
    endTime: '12:50 PM',
    amount: 58.85,
  },
  {
    id: 'CBID731880',
    service: 'Medication Reminder',
    startDate: 'Jan 24, 2024',
    endDate: 'Jan 24, 2024',
    startTime: '10:30 AM',
    endTime: '11:30 AM',
    amount: 45.4,
  },
  {
    id: 'CBID745402',
    service: 'Personal Care',
    startDate: 'Jan 23, 2024',
    endDate: 'Jan 23, 2024',
    startTime: '9:00 PM',
    endTime: '10:00 PM',
    amount: 64.25,
  },
  {
    id: 'CBID999001',
    service: 'Physical Therapy',
    startDate: 'Jan 20, 2024',
    endDate: 'Jan 20, 2024',
    startTime: '3:00 PM',
    endTime: '4:00 PM',
    amount: 85.00,
  },
  {
    id: 'CBID999002',
    service: 'Transportation',
    startDate: 'Jan 18, 2024',
    endDate: 'Jan 18, 2024',
    startTime: '1:00 PM',
    endTime: '2:30 PM',
    amount: 42.50,
  },
  {
    id: 'CBID999003',
    service: 'Errands & Shopping',
    startDate: 'Jan 15, 2024',
    endDate: 'Jan 15, 2024',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    amount: 38.75,
  },
];

const getDateParts = (dateString) => {
  const [month, dayWithComma] = dateString.split(' ');
  const day = dayWithComma.replace(',', '');
  return { month, day };
};

const STATUS_META = {
  completed: { label: 'Completed', color: '#2E7D32' },
  failed: { label: 'Failed', color: '#D32F2F' },
  rejected: { label: 'Rejected', color: '#D32F2F' },
};

const ONGOING_STATES = new Set([
  'on_the_way',
  'arrived',
  'arrival_notified',
  'awaiting_start',
  'ready_to_start',
  'otp_start',
  'in_progress',
  'medical_note',
  'otp_complete',
]);

const parseDateTime = (dateString, timeString) => {
  if (!dateString || !timeString) {
    return null;
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const [timePart, period] = timeString.split(' ');
  if (!timePart || !period) {
    return date;
  }

  const [hours, minutes] = timePart.split(':');
  let hourValue = parseInt(hours, 10);
  const minuteValue = parseInt(minutes, 10);

  if (period === 'PM' && hourValue !== 12) {
    hourValue += 12;
  }
  if (period === 'AM' && hourValue === 12) {
    hourValue = 0;
  }

  date.setHours(hourValue, Number.isNaN(minuteValue) ? 0 : minuteValue, 0, 0);
  return date;
};

const deriveStatus = (booking, bookingStates) => {
  const storedStatus = bookingStates[booking.id];
  if (storedStatus && STATUS_META[storedStatus]) {
    return STATUS_META[storedStatus];
  }

  if (storedStatus && ONGOING_STATES.has(storedStatus)) {
    return { label: 'Ongoing', color: '#FB8C00' };
  }

  const endDateTime = parseDateTime(booking.endDate, booking.endTime);
  const now = new Date();

  if (endDateTime && now > endDateTime) {
    return STATUS_META.failed;
  }

  return storedStatus ? { label: storedStatus, color: '#9E9E9E' } : { label: 'Ongoing', color: '#FB8C00' };
};

// Helper function to parse date string (e.g., "Jan 24, 2024") to Date object for sorting
const parseDateForSort = (dateString) => {
  const monthMap = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11,
  };
  const parts = dateString.split(' ');
  const month = monthMap[parts[0]] || 0;
  const day = parseInt(parts[1].replace(',', ''), 10);
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
};

export default function HistoryScreen() {
  const navigation = useNavigation();
  const bookingStates = useSelector((state) => state.profile.bookingStates || {});
  
  // Include confirmed bookings from BookingsScreen (those with booking states)
  const confirmedBookings = Object.keys(bookingStates).map((bookingId) => {
    const booking = bookingDetailsData.find((b) => b.id === bookingId);
    if (booking) {
      return {
        id: booking.id,
        service: booking.service,
        startDate: booking.startDate,
        endDate: booking.endDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        amount: booking.earning,
      };
    }
    return null;
  }).filter(Boolean);
  
  // Combine static history bookings with confirmed bookings, avoiding duplicates, sorted by date (latest first)
  const allHistoryBookings = [
    ...HISTORY_BOOKINGS,
    ...confirmedBookings.filter((cb) => !HISTORY_BOOKINGS.find((hb) => hb.id === cb.id)),
  ].sort((a, b) => {
    const dateA = parseDateForSort(a.startDate);
    const dateB = parseDateForSort(b.startDate);
    return dateB - dateA; // Descending order (latest first)
  });

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
          <Text style={styles.headerTitle}>My Bookings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {allHistoryBookings.map((booking) => {
              const statusMeta = deriveStatus(booking, bookingStates);
              const { month, day } = getDateParts(booking.startDate);
              const isSameDay = booking.startDate === booking.endDate;
              return (
                <TouchableOpacity
                  key={booking.id}
                  style={styles.cardWrapper}
                  activeOpacity={0.92}
                  onPress={() =>
                    navigation.navigate('BookingDetails', {
                      bookingId: booking.id,
                      mode: 'history',
                      source: 'history',
                    })
                  }
                >
                  <View style={styles.bookingCard}>
                    <View style={styles.dateBadge}>
                      <Text style={styles.dateMonth}>{month}</Text>
                      <Text style={styles.dateDay}>{day}</Text>
                    </View>
                    <View style={styles.bookingDetails}>
                      <Text style={styles.serviceName}>{booking.service}</Text>
                      <Text style={styles.dateRange}>
                        {isSameDay
                          ? booking.startDate
                          : `${booking.startDate} To ${booking.endDate}`}
                      </Text>
                      <View style={styles.timeBadge}>
                        <Text style={styles.timeLabel}>{`${booking.startTime} To ${booking.endTime}`}</Text>
                      </View>
                    </View>
                    <View style={styles.bookingMeta}>
                      <View style={styles.amountBadge}>
                        <Text style={styles.amountText}>{`$${booking.amount.toFixed(2)}`}</Text>
                      </View>
                      <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </SafeAreaView>
      <BottomNav />
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
    paddingHorizontal: 10,
    marginTop: 8,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  cardWrapper: {
    marginBottom: 16,
    position: 'relative',
  },
  bookingCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dateBadge: {
    width: 50,
    borderRadius: 16,
    backgroundColor: colors.textDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginRight: 10,
  },
  dateMonth: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
  },
  dateDay: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textLight,
  },
  bookingDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  dateRange: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 4,
  },
  timeBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#E4F7CC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 2,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
    textTransform: 'uppercase',
  },
  bookingMeta: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  amountBadge: {
    backgroundColor: '#D8F3C0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  statusText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statusIndicator: {
    position: 'absolute',
    right: -12,
    top: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F06292',
    transform: [{ translateY: -12 }],
  },
  bottomSpacer: {
    height: 40,
  },
});


