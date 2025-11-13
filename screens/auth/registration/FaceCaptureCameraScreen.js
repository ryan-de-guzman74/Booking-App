import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import ImageEditor from '@react-native-community/image-editor';
import { useDispatch } from 'react-redux';
import { setPersonalInfo, setProfilePictureTaken } from '../../../store/slices/profileSlice';
import { colors } from '../../../theme/colors';
import FaceDetection from '@react-native-ml-kit/face-detection';

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
  const [faceDetected, setFaceDetected] = useState(false);
  const device = useCameraDevice('front');
  const autoCaptureTriggeredRef = useRef(false);
  const detectionTimeoutRef = useRef(null);
  const detectionInProgressRef = useRef(false);
  const detectionActiveRef = useRef(false);
  const consecutiveDetectionsRef = useRef(0);
  const isCapturingRef = useRef(false);
  const [cameraReady, setCameraReady] = useState(false);

  // Calculate circular face area bounds
  const faceAreaCenterX = screenWidth / 2;
  const faceAreaCenterY = FACE_AREA_CENTER_Y;
  const faceAreaRadius = FACE_AREA_SIZE / 2;

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    return () => {
      detectionActiveRef.current = false;
      detectionInProgressRef.current = false;
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
        detectionTimeoutRef.current = null;
      }
    };
  }, []);

  // Crop and resize image to circular area matching avatar size (180x180)
  const cropAndResizeImage = useCallback(async (photoPath, photoWidth, photoHeight) => {
    try {
      // Calculate the circular area bounds on screen
      const circleCenterX = faceAreaCenterX;
      const circleCenterY = faceAreaCenterY;
      const circleRadius = faceAreaRadius;
      
      // Map screen coordinates to photo coordinates
      // Account for potential aspect ratio differences
      const screenAspectRatio = screenWidth / screenHeight;
      const photoAspectRatio = photoWidth / photoHeight;
      
      // Calculate scale factors
      let scaleX, scaleY, offsetX = 0, offsetY = 0;
      
      if (photoAspectRatio > screenAspectRatio) {
        // Photo is wider - scale based on height
        scaleY = photoHeight / screenHeight;
        scaleX = scaleY;
        offsetX = (photoWidth - screenWidth * scaleX) / 2;
      } else {
        // Photo is taller - scale based on width
        scaleX = photoWidth / screenWidth;
        scaleY = scaleX;
        offsetY = (photoHeight - screenHeight * scaleY) / 2;
      }
      
      // Calculate crop area (square that contains the circle)
      const cropSize = circleRadius * 2;
      const cropX = (circleCenterX - circleRadius) * scaleX + offsetX;
      const cropY = (circleCenterY - circleRadius) * scaleY + offsetY;
      const cropWidth = cropSize * scaleX;
      const cropHeight = cropSize * scaleY;
      
      // Ensure crop area is within photo bounds
      const finalCropX = Math.max(0, Math.min(cropX, photoWidth - cropWidth));
      const finalCropY = Math.max(0, Math.min(cropY, photoHeight - cropHeight));
      const finalCropWidth = Math.min(cropWidth, photoWidth - finalCropX);
      const finalCropHeight = Math.min(cropHeight, photoHeight - finalCropY);
      
      // Crop the image to circular area (square that contains the circle)
      // The crop will be square, and we'll let the Image component resize it
      const cropResult = await ImageEditor.cropImage(
        photoPath.startsWith('file://') ? photoPath : `file://${photoPath}`,
        {
          offset: { x: finalCropX, y: finalCropY },
          size: { width: finalCropWidth, height: finalCropHeight },
          displaySize: { width: 180, height: 180 }, // Resize to avatar size
        }
      );
      
      return cropResult.uri || cropResult.path;
    } catch (error) {
      console.error('[FaceCapture] Error cropping/resizing image:', error);
      // Return original if cropping fails
      return photoPath.startsWith('file://') ? photoPath : `file://${photoPath}`;
    }
  }, [faceAreaCenterX, faceAreaCenterY, faceAreaRadius]);

  const handleCapture = useCallback(async () => {
    if (!camera.current || isCapturing) {
      return;
    }

    try {
      setIsCapturing(true);
      isCapturingRef.current = true;
      autoCaptureTriggeredRef.current = true;

      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
      });
      
      // Crop and resize to circular area matching avatar size
      const croppedPhotoUri = await cropAndResizeImage(
        photo.path,
        photo.width,
        photo.height
      );

      dispatch(setPersonalInfo({ avatar: croppedPhotoUri }));
      dispatch(setProfilePictureTaken(true));

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp', params: { screen: 'Profile' } }],
      });
    } catch (error) {
      console.error('[FaceCapture] Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
      setIsCapturing(false);
      autoCaptureTriggeredRef.current = false;
    } finally {
      isCapturingRef.current = false;
      detectionActiveRef.current = false;
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
        detectionTimeoutRef.current = null;
      }
    }
  }, [camera, isCapturing, dispatch, navigation, cropAndResizeImage]);

  const startDetectionLoop = useCallback(() => {
    if (detectionActiveRef.current) {
      return;
    }

    detectionActiveRef.current = true;
    const detectionIntervalMs = 800;

    const runDetection = async () => {
      if (!detectionActiveRef.current) {
        return;
      }

      if (
        detectionInProgressRef.current ||
        !camera.current ||
        !hasPermission ||
        isCapturingRef.current
      ) {
        detectionTimeoutRef.current = setTimeout(runDetection, detectionIntervalMs);
        return;
      }

      detectionInProgressRef.current = true;

      try {
        const photoForDetection = await camera.current.takePhoto({
          qualityPrioritization: 'speed',
          flash: 'off',
          enableShutterSound: false,
        });

        if (!photoForDetection?.path) {
          detectionTimeoutRef.current = setTimeout(runDetection, detectionIntervalMs);
          return;
        }

        let imagePath = photoForDetection.path;
        if (Platform.OS === 'android') {
          if (!imagePath.startsWith('file://')) {
            imagePath = `file://${imagePath}`;
          }
        }

        const faces = await FaceDetection.detect(imagePath, {
          performanceMode: 'fast',
          landmarkMode: 'none',
          contourMode: 'none',
          classificationMode: 'none',
          minFaceSize: 0.2,
        });

        if (!faces || faces.length === 0) {
          consecutiveDetectionsRef.current = 0;
          setFaceDetected(false);
          detectionTimeoutRef.current = setTimeout(runDetection, detectionIntervalMs);
          return;
        }

        const face = faces[0];
        const snapshotWidth = photoForDetection.width || screenWidth;
        const snapshotHeight = photoForDetection.height || screenHeight;

        const faceCenterXImage =
          photoForDetection.isMirrored
            ? snapshotWidth - (face.frame.left + face.frame.width / 2)
            : face.frame.left + face.frame.width / 2;
        const faceCenterYImage = face.frame.top + face.frame.height / 2;

        const centerXOnScreen =
          (faceCenterXImage / snapshotWidth) * screenWidth;
        const centerYOnScreen =
          (faceCenterYImage / snapshotHeight) * screenHeight;

        const dx = centerXOnScreen - faceAreaCenterX;
        const dy = centerYOnScreen - faceAreaCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const faceWidthRatio = face.frame.width / snapshotWidth;

        const isWithinCircle = distance <= faceAreaRadius * 0.65;
        const isAcceptableSize = faceWidthRatio >= 0.22 && faceWidthRatio <= 0.55;

        if (isWithinCircle && isAcceptableSize) {
          consecutiveDetectionsRef.current += 1;
          setFaceDetected(true);
        } else {
          consecutiveDetectionsRef.current = 0;
          setFaceDetected(false);
        }

        if (consecutiveDetectionsRef.current >= 3 && !autoCaptureTriggeredRef.current) {
          consecutiveDetectionsRef.current = 0;
          detectionActiveRef.current = false;
          if (detectionTimeoutRef.current) {
            clearTimeout(detectionTimeoutRef.current);
            detectionTimeoutRef.current = null;
          }
          await handleCapture();
          return;
        }
      } catch (error) {
        console.error('[FaceCapture] Detection error:', error);
        consecutiveDetectionsRef.current = 0;
        setFaceDetected(false);
      } finally {
        detectionInProgressRef.current = false;
        if (detectionActiveRef.current) {
          detectionTimeoutRef.current = setTimeout(runDetection, detectionIntervalMs);
        }
      }
    };

    detectionTimeoutRef.current = setTimeout(runDetection, detectionIntervalMs);
  }, [
    camera,
    faceAreaCenterX,
    faceAreaCenterY,
    faceAreaRadius,
    hasPermission,
    handleCapture,
  ]);

  useEffect(() => {
    if (cameraReady && hasPermission && device) {
      startDetectionLoop();
    }
  }, [cameraReady, hasPermission, device, startDetectionLoop]);

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
        ref={(ref) => {
          camera.current = ref;
        }}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
        video={Platform.OS === 'ios'}
        onError={(error) => {
          console.error('[FaceCapture] Camera error:', error);
        }}
        onInitialized={() => {
          setCameraReady(true);
        }}
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
            {isCapturing 
              ? 'Capturing...' 
              : faceDetected 
                ? 'Face detected! Capturing...' 
                : 'Position your face inside the circle'}
          </Text>
        </View>

        {/* Face Detection Area (Circular) */}
        <View style={styles.faceAreaContainer}>
          <View 
            style={[
              styles.faceAreaCircle, 
              { 
                top: FACE_AREA_CENTER_Y - FACE_AREA_SIZE / 2,
                borderColor: faceDetected ? '#4CAF50' : '#4FC3F7',
              }
            ]} 
          />
          <View style={[styles.faceAreaGuide, { top: FACE_AREA_CENTER_Y - FACE_AREA_SIZE / 2 }]}>
            {/* Guide lines */}
            <View style={[styles.guideLine, styles.guideLineTop]} />
            <View style={[styles.guideLine, styles.guideLineBottom]} />
            <View style={[styles.guideLine, styles.guideLineLeft]} />
            <View style={[styles.guideLine, styles.guideLineRight]} />
          </View>
          {faceDetected && (
            <View style={[styles.faceDetectedIndicator, { top: FACE_AREA_CENTER_Y - FACE_AREA_SIZE / 2 }]}>
              <Text style={styles.faceDetectedText}>Face Detected</Text>
            </View>
          )}
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
  faceDetectedIndicator: {
    position: 'absolute',
    top: FACE_AREA_CENTER_Y - FACE_AREA_SIZE / 2 - 40,
    left: (screenWidth - 120) / 2,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceDetectedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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


