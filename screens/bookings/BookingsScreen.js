import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { getGradientColors, getGradientLocations, colors } from '../../theme/colors';
import BottomNav from '../../components/BottomNav';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Mock: new incoming bookings (not confirmed yet) - Different from History
const BOOKINGS = [
  {
    id: 'CBID888001',
    service: 'Respite Care',
    startDate: 'Feb 15, 2024',
    endDate: 'Feb 15, 2024',
    startTime: '2:00 PM To 4:00 PM',
    endTime: '4:00 PM',
    earning: 75.50,
  },
  {
    id: 'CBID888002',
    service: 'Meal Preparation',
    startDate: 'Feb 16, 2024',
    endDate: 'Feb 16, 2024',
    startTime: '12:00 PM To 1:30 PM',
    endTime: '1:30 PM',
    earning: 52.25,
  },
  {
    id: 'CBID888003',
    service: 'Light Housekeeping',
    startDate: 'Feb 17, 2024',
    endDate: 'Feb 17, 2024',
    startTime: '10:00 AM To 11:00 AM',
    endTime: '11:00 AM',
    earning: 48.75,
  },
];

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

export default function BookingsScreen() {
  const navigation = useNavigation();
  const bookingStates = useSelector((state) => state.profile.bookingStates || {});

  // Filter to only new/unconfirmed bookings by absence in stored states, sorted by date (latest first)
  const incomingBookings = BOOKINGS.filter((b) => !bookingStates[b.id])
    .sort((a, b) => {
      const dateA = parseDateForSort(a.startDate);
      const dateB = parseDateForSort(b.startDate);
      return dateB - dateA; // Descending order (latest first)
    });

  const getDateParts = (dateString) => {
    const [month, dayWithComma] = dateString.split(' ');
    const day = dayWithComma.replace(',', '');
    return { month, day };
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
      <View style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => {}} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={24} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Bookings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.listWrapper}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {incomingBookings.map((booking) => {
              const { month, day } = getDateParts(booking.startDate);
              const isSameDay = booking.startDate === booking.endDate;
              return (
                <TouchableOpacity
                  key={booking.id}
                  style={styles.cardWrapper}
                  activeOpacity={0.92}
                  onPress={() => navigation.navigate('NewBookingDetails', { bookingId: booking.id })}
                >
                  <View style={styles.bookingCard}>
                    <View style={styles.dateBadge}>
                      <Text style={styles.dateMonth}>{month}</Text>
                      <Text style={styles.dateDay}>{day}</Text>
                    </View>
                    <View style={styles.bookingDetails}>
                      <Text style={styles.serviceName}>{booking.service}</Text>
                      <Text style={styles.dateRange}>
                        {isSameDay ? booking.startDate : `${booking.startDate} To ${booking.endDate}`}
                      </Text>
                      <View style={styles.timeBadge}>
                        <Text style={styles.timeLabel}>{booking.startTime}</Text>
                      </View>
                    </View>
                    <View style={styles.bookingMeta}>
                      <View style={styles.amountBadge}>
                        <Text style={styles.amountText}>{`$${booking.earning.toFixed(2)}`}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            <View style={styles.bottomSpacer} />
          </ScrollView>
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
  listWrapper: {
    flex: 1,
    backgroundColor: '#F6FBF9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
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
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dateBadge: {
    width: 60,
    borderRadius: 16,
    backgroundColor: colors.textDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    marginRight: 10,
  },
  dateMonth: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
  },
  dateDay: {
    fontSize: 22,
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
  bottomSpacer: {
    height: 40,
  },
});


