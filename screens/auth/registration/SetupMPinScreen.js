import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useDispatch } from 'react-redux';
import BackButton from '../../../components/BackButton';
import { colors } from '../../../theme/colors';
import { setMPin } from '../../../store/slices/profileSlice';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SetupMPinScreen({ route, navigation }) {
  const { phoneNumber, countryCode } = route.params;
  const dispatch = useDispatch();
  
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  
  const newPinRefs = useRef([]);
  const confirmPinRefs = useRef([]);

  const handleNewPinChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 4) {
      setNewPin(numericValue);
      setError('');
    }
  };

  const handleConfirmPinChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 4) {
      setConfirmPin(numericValue);
      setError('');
    }
  };

  const handleContinue = () => {
    if (newPin.length !== 4) {
      setError('Please enter a 4-digit M-Pin');
      return;
    }
    
    if (confirmPin.length !== 4) {
      setError('Please confirm your M-Pin');
      return;
    }

    if (newPin !== confirmPin) {
      setError('M-Pins do not match. Please try again.');
      return;
    }

    dispatch(setMPin(newPin));

    // Navigate to CompleteProfile screen
    navigation.navigate('CompleteProfile', {
      phoneNumber,
      countryCode,
      mPin: newPin
    });
  };

  const renderPinBoxes = (pinValue) => {
    const pinArray = pinValue.split('');
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
          onPress={() => navigation.navigate('EnterAuthCode', {
            phoneNumber,
            countryCode
          })}
          color={colors.textPrimary}
          activeColor="rgba(12, 64, 58, 0.1)"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Setup M-Pin</Text>
        {/* Error Message */}
        {error !== '' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Enter New M-Pin */}
        <View style={styles.pinSection}>
          <Text style={styles.label}>Enter New M-Pin</Text>
          <TouchableOpacity 
            style={styles.pinBoxContainer}
            activeOpacity={1}
            onPress={() => newPinRefs.current[0]?.focus()}
          >
            {renderPinBoxes(newPin).map((digit, index) => (
              <View key={index} style={styles.pinBox}>
                <Text style={styles.pinDigit}>{digit ? '•' : ''}</Text>
              </View>
            ))}
          </TouchableOpacity>
          <TextInput
            ref={(ref) => (newPinRefs.current[0] = ref)}
            style={styles.hiddenInput}
            value={newPin}
            onChangeText={handleNewPinChange}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            autoFocus
          />
        </View>

        {/* Confirm New M-Pin */}
        <View style={styles.pinSection}>
          <Text style={styles.label}>Confirm New M-Pin</Text>
          <TouchableOpacity 
            style={styles.pinBoxContainer}
            activeOpacity={1}
            onPress={() => confirmPinRefs.current[0]?.focus()}
          >
            {renderPinBoxes(confirmPin).map((digit, index) => (
              <View key={index} style={styles.pinBox}>
                <Text style={styles.pinDigit}>{digit ? '•' : ''}</Text>
              </View>
            ))}
          </TouchableOpacity>
          <TextInput
            ref={(ref) => (confirmPinRefs.current[0] = ref)}
            style={styles.hiddenInput}
            value={confirmPin}
            onChangeText={handleConfirmPinChange}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
  pinSection: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  pinBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  pinBox: {
    width: (screenWidth - 140) / 4,
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
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  continueButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '700',
  },
});

