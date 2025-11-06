import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

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
    // If we're in a nested navigator, navigate within the tab navigator
    if (navigation.getParent()) {
      navigation.navigate(screenName);
    } else {
      navigation.navigate('MainApp', { screen: screenName });
    }
  };

  return (
    <View style={[
      styles.bottomNav,
      isDashboard ? styles.bottomNavMargin : styles.bottomNavExpanded
    ]}>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => handleNavigation('Dashboard')}
      >
        <Ionicons 
          name={isDashboard ? "home" : "home-outline"} 
          size={isDashboard ? 27 : 30} 
          color={isDashboard ? "rgb(5,68,71)" : "#999999"} 
        />
        {!isDashboard && (
          <Text style={[
            styles.navLabel,
            isDashboard ? styles.navLabelActive : styles.navLabelInactive
          ]}>
            Home
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => handleNavigation('Bookings')}
      >
        <Ionicons 
          name="calendar-outline" 
          size={isDashboard ? 27 : 30} 
          color={isDashboard ? "rgb(134,159,156)" : "#999999"} 
        />
        {!isDashboard && (
          <Text style={styles.navLabelInactive}>Bookings</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => handleNavigation('History')}
      >
        <Ionicons 
          name="time-outline" 
          size={isDashboard ? 27 : 30} 
          color={isDashboard ? "rgb(134,159,156)" : "#999999"} 
        />
        {!isDashboard && (
          <Text style={styles.navLabelInactive}>History</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => handleNavigation('Profile')}
      >
        <Ionicons 
          name={isProfile ? "person" : "person-outline"} 
          size={isDashboard ? 27 : 30} 
          color={isProfile ? "#43A1A9" : (isDashboard ? "rgb(134,159,156)" : "#999999")} 
        />
        {!isDashboard && (
          <Text style={[
            styles.navLabel,
            isProfile ? styles.navLabelActive : styles.navLabelInactive
          ]}>
            Profile
          </Text>
        )}
      </TouchableOpacity>
    </View>
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
    backgroundColor: 'rgb(228,254,251)',
    paddingVertical: 8,
    marginHorizontal: screenHeight * 0.05,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  bottomNavExpanded: {
    backgroundColor: '#FFFFFF',
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
    color: '#43A1A9',
  },
  navLabelInactive: {
    color: '#999999',
  },
});

