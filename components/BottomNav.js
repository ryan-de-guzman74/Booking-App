import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Platform,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';

const { height: screenHeight } = Dimensions.get('window');

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();
  const currentRoute = route.name;

  const isDashboard = currentRoute === 'Dashboard';
  const isProfile = currentRoute === 'Profile';
  const isBookings = currentRoute === 'Bookings';
  const isHistory = currentRoute === 'History';

  const handleNavigation = (screenName) => {
    // Navigate within the tab navigator
    // Since we're using a Tab Navigator, we can navigate directly to screen names
    try {
      navigation.navigate(screenName);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <>
      <View
        style={[
          styles.bottomNav,
          isDashboard ? styles.bottomNavMargin : styles.bottomNavExpanded,
        ]}
      >
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleNavigation('Dashboard')}
        >
          <Ionicons
            name={isDashboard ? 'home' : 'home-outline'}
            size={28}
            color={isDashboard ? colors.primary : colors.textMuted}
          />
          {!isDashboard ? (
            <Text style={[styles.navLabel, isDashboard ? styles.navLabelActive : styles.navLabelInactive]}>
              Home
            </Text>
          ) : (
            <Text style={styles.homestyle}></Text>
          )}

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleNavigation('Bookings')}
        >
          <Ionicons
            name={isBookings ? 'calendar' : 'calendar-outline'}
            size={28}
            color={isBookings ? colors.primary : colors.textMuted}
          />
          {!isDashboard ? (
            <Text style={[styles.navLabel, isDashboard ? styles.navLabelActive : styles.navLabelInactive]}>
              Bookings
            </Text>
          ) : (
            <Text style={styles.homestyle}></Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleNavigation('History')}
        >
          <Ionicons
            name={isHistory ? 'time' : 'time-outline'}
            size={28}
            color={isHistory ? colors.primary : colors.textMuted}
          />
          {!isDashboard ? (
            <Text style={[styles.navLabel, isDashboard ? styles.navLabelActive : styles.navLabelInactive]}>
              History
            </Text>
          ) : (
            <Text style={styles.homestyle}></Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleNavigation('Profile')}
        >
          <Ionicons
            name={isProfile ? 'person' : 'person-outline'}
            size={28}
            color={isProfile ? colors.primary : colors.textMuted}
          />
          {!isDashboard ? (
            <Text style={[styles.navLabel, isDashboard ? styles.navLabelActive : styles.navLabelInactive]}>
              Profile
            </Text>
          ) : (
            <Text style={styles.homestyle}></Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomNavMargin: {
    backgroundColor: colors.backgroundCard,
    paddingVertical: 8,
    marginHorizontal: screenHeight * 0.05,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  bottomNavExpanded: {
    backgroundColor: colors.backgroundCard,
    marginHorizontal: 5,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 4,
  },
  navLabelActive: {
    color: colors.primary,
  },
  navLabelInactive: {
    color: colors.textMuted,
  },
  homestyle: {
    height:0,
    margin:0,
    padding:0
  }
});

