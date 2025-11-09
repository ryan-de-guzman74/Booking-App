import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function BackButton({ onPress, color = '#FFFFFF', activeColor = 'rgba(255, 255, 255, 0.2)' }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.backButton,
        pressed && { backgroundColor: activeColor }
      ]}
      onPress={onPress}
    >
      <Ionicons name="arrow-back" size={24} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

