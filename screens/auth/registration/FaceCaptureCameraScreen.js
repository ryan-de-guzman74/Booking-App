import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useDispatch } from 'react-redux';
import { setPersonalInfo, setProfilePictureTaken } from '../../../store/slices/profileSlice';
import { colors } from '../../../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Face detection area dimensions (circular)
const FACE_AREA_SIZE = screenWidth * 0.7;
// Position circle center at 65% of screen height
const FACE_AREA_CENTER_Y = screenHeight * 0.2;

export default function FaceCaptureCameraScreen({ navigation }) {
  const dispatch = useDispatch();
  const camera = useRef(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Get front camera device
  const device = useCameraDevice('front');

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const handleCapture = async () => {
    if (!camera.current || isCapturing) return;

    try {
      setIsCapturing(true);
      
      // Take photo
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'speed',
        flash: 'off',
      });

      // Crop image to face area (circular)
      // In a real implementation, you would use an image processing library
      // For now, we'll use the full photo and let the backend handle cropping
      const photoUri = `file://${photo.path}`;

      // Save to profile
      dispatch(setPersonalInfo({ avatar: photoUri }));
      dispatch(setProfilePictureTaken(true));

      // Always navigate to Profile screen after taking picture
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp', params: { screen: 'Profile' } }],
      });
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
      setIsCapturing(false);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera permission is required</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera not available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Camera View */}
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Face Recognition</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>
            Position your face inside the circle
          </Text>
        </View>

        {/* Face Detection Area (Circular) */}
        <View style={styles.faceAreaContainer}>
          <View style={[styles.faceAreaCircle, { top: FACE_AREA_CENTER_Y - FACE_AREA_SIZE / 2 }]} />
          <View style={[styles.faceAreaGuide, { top: FACE_AREA_CENTER_Y - FACE_AREA_SIZE / 2 }]}>
            {/* Guide lines */}
            <View style={[styles.guideLine, styles.guideLineTop]} />
            <View style={[styles.guideLine, styles.guideLineBottom]} />
            <View style={[styles.guideLine, styles.guideLineLeft]} />
            <View style={[styles.guideLine, styles.guideLineRight]} />
          </View>
        </View>

        {/* Capture Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={isCapturing}
            activeOpacity={0.8}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
  },
  headerSpacer: {
    width: 40,
  },
  instructionsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  instructionText: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500',
    textAlign: 'center',
  },
  faceAreaContainer: {
    flex: 1,
    alignItems: 'center',
  },
  faceAreaCircle: {
    position: 'absolute',
    width: FACE_AREA_SIZE,
    height: FACE_AREA_SIZE,
    borderRadius: FACE_AREA_SIZE / 2,
    borderWidth: 3,
    borderColor: '#4FC3F7',
    backgroundColor: 'transparent',
    left: (screenWidth - FACE_AREA_SIZE) / 2,
  },
  faceAreaGuide: {
    position: 'absolute',
    width: FACE_AREA_SIZE,
    height: FACE_AREA_SIZE,
    borderRadius: FACE_AREA_SIZE / 2,
    left: (screenWidth - FACE_AREA_SIZE) / 2,
  },
  guideLine: {
    position: 'absolute',
    backgroundColor: 'rgba(79, 195, 247, 0.3)',
  },
  guideLineTop: {
    top: 0,
    left: '45%',
    width: '10%',
    height: 20,
  },
  guideLineBottom: {
    bottom: 0,
    left: '45%',
    width: '10%',
    height: 20,
  },
  guideLineLeft: {
    left: 0,
    top: '45%',
    width: 20,
    height: '10%',
  },
  guideLineRight: {
    right: 0,
    top: '45%',
    width: 20,
    height: '10%',
  },
  bottomContainer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.textLight,
    borderWidth: 5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  permissionText: {
    fontSize: 18,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});


