import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DashboardScreen from '../screens/home/DashboardScreen';
import VerifyAccountScreen from '../screens/auth/VerifyAccountScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { setIncomingBooking } from '../store/slices/profileSlice';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator({ route }) {
  const kycApproved = useSelector((state) => state.profile.kyc.isApproved);
  const incomingBooking = useSelector((state) => state.profile.incomingBooking);
  const dispatch = useDispatch();
  const initialRoute = route?.params?.initialRoute || (kycApproved ? 'Dashboard' : 'Profile');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (incomingBooking) {
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(toastTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      const t = setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(toastTranslateY, { toValue: 20, duration: 200, useNativeDriver: true }),
        ]).start(() => dispatch(setIncomingBooking(null)));
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [incomingBooking, dispatch, toastOpacity, toastTranslateY]);
  
  return (
    <>
      <Tab.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hide default tab bar, we'll use custom
        }}
      >
        {/* Show VerifyAccount when KYC not approved, Dashboard when approved */}
        {kycApproved ? (
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        ) : (
          <Tab.Screen name="Dashboard" component={VerifyAccountScreen} />
        )}
        <Tab.Screen name="Bookings" component={BookingsScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      
      {incomingBooking && (
        <Animated.View
          style={[styles.toastContainer, { opacity: toastOpacity, transform: [{ translateY: toastTranslateY }] }]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            activeOpacity={0.95}
            style={styles.toast}
            onPress={() => {
              dispatch(setIncomingBooking(null));
            }}
          >
            <Text style={styles.toastTitle}>{incomingBooking.title || 'New Booking'}</Text>
            <Text style={styles.toastSubtitle}>Tap to view details</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 96,
  },
  toast: {
    backgroundColor: '#E6F4EA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2E7D32',
  },
  toastSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    opacity: 0.8,
  },
});

