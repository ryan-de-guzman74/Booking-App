import React, { useState, useEffect, useRef } from 'react';
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
import BackButton from '../../../components/BackButton';
import { colors } from '../../../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function EnterAuthCodeScreen({ route, navigation }) {
  const { phoneNumber, countryCode, redirectTo } = route.params ?? {};
  
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(118); // 1:58 in seconds
  const inputRef = useRef(null);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (value) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 6) {
      setCode(numericValue);
    }
  };

  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  const handleResend = () => {
    // Reset timer and clear code
    setTimeLeft(118);
    setCode('');
    inputRef.current?.focus();
  };

  const handleDone = () => {
    if (code.length !== 6) {
      alert('Please enter the complete 6-digit code.');
      return;
    }

    if (redirectTo) {
      navigation.replace(redirectTo);
      return;
    }

    // After 6-digit authentication, navigate to LocationPermission
    navigation.navigate('LocationPermission', {
      phoneNumber,
      countryCode,
    });
  };

  const isCodeComplete = code.length === 6;

  // Convert code string to array for display
  const codeArray = code.split('');
  while (codeArray.length < 6) {
    codeArray.push('');
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Back Button */}
      <View style={styles.backButton}>
        <BackButton 
          onPress={() => navigation.navigate('UpdateInformation', {
            phoneNumber,
            countryCode
          })}
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
        <Text style={styles.title}>Enter Authentication Code</Text>
        <Text style={styles.instruction}>
          Enter the 6 digit number sent to you via text or email
        </Text>
        
        {/* Phone Number Display */}
        <Text style={styles.phoneNumber}>{phoneNumber}</Text>

        {/* Code Input Fields */}
        <TouchableOpacity 
          style={styles.codeInputContainer}
          activeOpacity={1}
          onPress={handleContainerPress}
        >
          {codeArray.map((digit, index) => (
            <View key={index} style={styles.codeBox}>
              <Text style={styles.codeDigit}>{digit}</Text>
              <View style={styles.codeDash} />
            </View>
          ))}
        </TouchableOpacity>

        {/* Hidden Input */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />

        {/* Resend and Timer */}
        <View style={styles.resendContainer}>
          <View style={styles.resendTextContainer}>
            <Text style={styles.resendText}>Don't have a code? </Text>
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Re-send</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
        </View>

        {/* Done Button */}
        <TouchableOpacity 
          style={[styles.doneButton, !isCodeComplete && styles.doneButtonDisabled]}
          onPress={handleDone}
          disabled={!isCodeComplete}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
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
    paddingTop: 100,
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
    marginBottom: 20,
    lineHeight: 20,
  },
  phoneNumber: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  codeBox: {
    width: (screenWidth - 200) / 6,
    height: 50,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  codeDigit: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 5,
  },
  codeDash: {
    width: '100%',
    height: 2,
    backgroundColor: colors.textDark,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  resendTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: colors.textDark,
  },
  resendLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  timer: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  doneButtonDisabled: {
    backgroundColor: colors.borderMuted,
    opacity: 0.6,
  },
  doneButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '700',
  },
});

