import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import { colors } from '../../../theme/colors';
import LinearGradient from 'react-native-linear-gradient';
import { getGradientColors, getGradientLocations } from '../../../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProfilePictureTakenScreen({ navigation }) {
  const handleGetStarted = () => {
    // Navigate to camera screen for face capture
    navigation.navigate('FaceCaptureCamera');
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
      <SafeAreaView style={styles.safeArea}>
        {/* Face Recognition Graphic */}
        <View style={styles.graphicContainer}>
          <View style={styles.faceFrame}>
            <Image
              source={require('../../../assets/img/face_detect.jpg')}
              style={styles.faceImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>FACE RECOGNITION</Text>

        {/* Instructional Text */}
        <Text style={styles.instructionText}>
          To update your profile picture you must need to put your face inside the box like above in next screen.
        </Text>

        {/* Get Started Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
  graphicContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: 30,
  },
  faceFrame: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    borderRadius: (screenWidth * 0.8) / 2,
    borderWidth: 3,
    borderColor: '#4FC3F7',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  faceImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
    letterSpacing: 1,
  },
  instructionText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
    marginBottom: 40,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  getStartedButton: {
    backgroundColor: '#C6FF00',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
});


