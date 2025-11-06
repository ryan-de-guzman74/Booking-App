import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import BottomNav from '../../components/BottomNav';

export default function BookingsScreen() {
  return (
    <LinearGradient
      colors={['#43A1A9', '#48B0B1', '#66D1C9', '#55BFBD']}
      locations={[0, 0.33, 0.67, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.text}>Bookings Screen</Text>
      </View>
      <BottomNav />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

