import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import BackButton from '../../components/BackButton';
import { colors } from '../../theme/colors';
import { useSelector } from 'react-redux';

const { width: screenWidth } = Dimensions.get('window');

export default function EnterMPinScreen({ route, navigation }) {
  const { onSuccess, redirectTo } = route.params ?? {};
  const storedMPin = useSelector((state) => state.profile.personalInfo.mPin);
  const defaultPin = '1111';
  const pinToMatch = storedMPin || defaultPin;
  
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handlePinChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 4) {
      setPin(numericValue);
      setError('');
      
      // Auto-submit when 4 digits are entered
      if (numericValue.length === 4) {
        handleSubmit(numericValue);
      }
    }
  };

  const handleSubmit = (pinValue = pin) => {
    if (pinValue.length !== 4) {
      setError('Please enter a 4-digit M-Pin');
      return;
    }

    if (pinValue === pinToMatch) {
      setError('');
      if (onSuccess) {
        onSuccess();
      } else if (redirectTo) {
        navigation.replace(redirectTo);
      } else {
        navigation.goBack();
      }
    } else {
      setError('Incorrect M-Pin. Please try again.');
      setPin('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const renderPinBoxes = () => {
    const pinArray = pin.split('');
    while (pinArray.length < 4) {
      pinArray.push('');
    }
    return pinArray;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Back Button */}
      <View style={styles.backButton}>
        <BackButton 
          onPress={() => navigation.goBack()}
          color={colors.textPrimary}
          activeColor="rgba(12, 64, 58, 0.1)"
        />
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Text style={styles.title}>Enter M-Pin</Text>
        <Text style={styles.instruction}>
          Enter your 4-digit M-Pin to access this section
        </Text>
        
        {/* Error Message */}
        {error !== '' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Pin Input Fields */}
        <TouchableOpacity 
          style={styles.pinBoxContainer}
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
        >
          {renderPinBoxes().map((digit, index) => (
            <View key={index} style={styles.pinBox}>
              <Text style={styles.pinDigit}>{digit ? '•' : ''}</Text>
            </View>
          ))}
        </TouchableOpacity>

        {/* Hidden Input */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={pin}
          onChangeText={handlePinChange}
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          autoFocus
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 120,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 15,
  },
  instruction: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
  pinBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  pinBox: {
    width: (screenWidth - 200) / 4,
    height: 60,
    borderWidth: 1,
    borderColor: colors.borderDivider,
    borderRadius: 8,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigit: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textDark,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
});

