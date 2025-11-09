import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomNav from '../../components/BottomNav';
import { colors, getGradientColors, getGradientLocations } from '../../theme/colors';
import { bookingDetailsData } from '../../data/sampleBookings';

const HISTORY_BOOKINGS = bookingDetailsData.map((booking) => ({
  id: booking.id,
  service: booking.service,
  startDate: booking.startDate,
  endDate: booking.endDate,
  startTime: booking.startTime,
  endTime: booking.endTime,
  amount: booking.earning,
}));

const getDateParts = (dateString) => {
  const [month, dayWithComma] = dateString.split(' ');
  const day = dayWithComma.replace(',', '');
  return { month, day };
};

export default function HistoryScreen() {
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
          <Text style={styles.headerTitle}>My Bookings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {HISTORY_BOOKINGS.map((booking) => {
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
    width: 70,
    borderRadius: 16,
    backgroundColor: colors.textDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginRight: 14,
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


