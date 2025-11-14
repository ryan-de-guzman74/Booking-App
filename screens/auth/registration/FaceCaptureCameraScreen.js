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
  NativeModules,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import ImageEditor from '@react-native-community/image-editor';
import { useDispatch } from 'react-redux';
import { setPersonalInfo, setProfilePictureTaken } from '../../../store/slices/profileSlice';
import { colors } from '../../../theme/colors';
import FaceDetection from '@react-native-ml-kit/face-detection';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import { Image } from 'react-native';

const { AssetFileModule } = NativeModules;

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
  const [isEmulator, setIsEmulator] = useState(false);
  const [testImageUri, setTestImageUri] = useState(null);
  const [isLoadingTestImage, setIsLoadingTestImage] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const [detectedFaces, setDetectedFaces] = useState([]);
  const [imageLayout, setImageLayout] = useState({ width: 250, height: 250, x: 0, y: 0 });
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 });
  const [faceVisualizations, setFaceVisualizations] = useState([]); // Store faces with screen coordinates for visualization

  // Calculate circular face area bounds
  const faceAreaCenterX = screenWidth / 2;
  const faceAreaCenterY = FACE_AREA_CENTER_Y;
  const faceAreaRadius = FACE_AREA_SIZE / 2;
  useEffect(() => {
    const checkEmulator = async () => {
      const emulator = await DeviceInfo.isEmulator();
      setIsEmulator(emulator);
      if (emulator) {
        setIsLoadingTestImage(true);
        try {
          // For Android, copy the asset file to an accessible location
          if (Platform.OS === 'android' && AssetFileModule) {
            console.log('[FaceCapture] Copying test image from assets...');
            const copiedPath = await AssetFileModule.copyAssetToFiles('test-face.jpg');
            if (copiedPath) {
              // Ensure the path has file:// prefix for consistency
              // Add timestamp to force image reload and bypass cache
              const timestamp = Date.now();
              const uri = copiedPath.startsWith('file://') 
                ? `${copiedPath}?t=${timestamp}` 
                : `file://${copiedPath}?t=${timestamp}`;
              console.log('[FaceCapture] Test image copied to:', uri);
              setTestImageUri(uri);
              // Force Image component to re-render by updating key
              setImageKey(timestamp);
              // Clear previous face detections when image changes
              setDetectedFaces([]);
              setOriginalImageSize({ width: 0, height: 0 });
            } else {
              console.warn('[FaceCapture] Failed to copy test image from assets');
              Alert.alert('Error', 'Failed to copy test image from assets. Please check that test-face.jpg exists in android/app/src/main/assets/');
            }
          } else if (Platform.OS === 'ios') {
            // iOS
            const path = `${RNFS.MainBundlePath}/test-face.jpg`;
            if (await RNFS.exists(path)) {
              setTestImageUri(path);
            } else {
              console.warn('[FaceCapture] Test image not found in bundle');
              Alert.alert('Error', 'Test image not found in bundle');
            }
          } else {
            console.warn('[FaceCapture] AssetFileModule not available');
            Alert.alert('Error', 'AssetFileModule not available. Please rebuild the app.');
          }
        } catch (error) {
          console.error('[FaceCapture] Error setting up test image:', error);
          Alert.alert('Error', `Failed to load test image: ${error.message}`);
        } finally {
          setIsLoadingTestImage(false);
        }
      }
    };
    checkEmulator();
  }, []);
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

  // Crop image around detected face center
  // Creates a square crop (35% of screen width) centered on the face and saves it
  const cropAndResizeImage = useCallback(async (photoPath, photoWidth, photoHeight, faceCenterX, faceCenterY, isMirrored = false) => {
    try {
      // Crop size is 35% of screen width (square)
      const cropSizeOnScreen = screenWidth * 0.75;
      
      console.log('[FaceCapture] Cropping image around face center:', {
        photoPath,
        photoWidth,
        photoHeight,
        isMirrored,
        screenWidth,
        screenHeight,
        faceCenterScreen: { x: faceCenterX, y: faceCenterY },
        cropSizeOnScreen,
      });

      // Map screen coordinates to photo coordinates
      // The image/preview is displayed with "cover" mode, filling the screen
      // We need to reverse this mapping to find what part of the photo corresponds to the screen circle
      const screenAspectRatio = screenWidth / screenHeight;
      const photoAspectRatio = photoWidth / photoHeight;

      // Calculate how the photo is displayed on screen (cover mode)
      // In cover mode, the image is scaled to fill the screen while maintaining aspect ratio
      let photoToScreenScale, screenOffsetX = 0, screenOffsetY = 0;

      if (photoAspectRatio > screenAspectRatio) {
        // Photo is wider than screen - photo fills screen height, crops width
        // Display scale: photo is scaled so its height fills screen height
        photoToScreenScale = screenHeight / photoHeight;
        // The visible photo width on screen
        const visiblePhotoWidth = photoWidth * photoToScreenScale;
        // Horizontal offset (how much is cropped on each side)
        screenOffsetX = (visiblePhotoWidth - screenWidth) / 2;
      } else {
        // Photo is taller than screen - photo fills screen width, crops height
        // Display scale: photo is scaled so its width fills screen width
        photoToScreenScale = screenWidth / photoWidth;
        // The visible photo height on screen
        const visiblePhotoHeight = photoHeight * photoToScreenScale;
        // Vertical offset (how much is cropped on each side)
        screenOffsetY = (visiblePhotoHeight - screenHeight) / 2;
      }

      // Account for front camera mirroring
      let mappedFaceCenterX = faceCenterX;
      if (isMirrored) {
        // For front camera, mirror the X coordinate
        mappedFaceCenterX = screenWidth - faceCenterX;
      }

      // Reverse the cover mode transformation to map screen coordinates to photo coordinates
      // screenCoordinate = (photoCoordinate * photoToScreenScale) - screenOffset
      // Therefore: photoCoordinate = (screenCoordinate + screenOffset) / photoToScreenScale
      const photoFaceCenterX = (mappedFaceCenterX + screenOffsetX) / photoToScreenScale;
      const photoFaceCenterY = (faceCenterY + screenOffsetY) / photoToScreenScale;
      
      // Map crop size from screen to photo coordinates
      const cropSizeInPhoto = cropSizeOnScreen / photoToScreenScale;

      // Calculate crop area (square centered on face) in photo coordinates
      const cropX = photoFaceCenterX - cropSizeInPhoto / 2;
      const cropY = photoFaceCenterY - cropSizeInPhoto / 2;
      const cropWidth = cropSizeInPhoto;
      const cropHeight = cropSizeInPhoto;

      // Ensure crop area is within photo bounds
      const finalCropX = Math.max(0, Math.min(cropX, photoWidth - cropWidth));
      const finalCropY = Math.max(0, Math.min(cropY, photoHeight - cropHeight));
      const finalCropWidth = Math.min(cropWidth, photoWidth - finalCropX);
      const finalCropHeight = Math.min(cropHeight, photoHeight - finalCropY);

      console.log('[FaceCapture] Crop coordinates:', {
        faceCenterScreen: { x: faceCenterX, y: faceCenterY },
        mappedFaceCenterX,
        photoFaceCenterX,
        photoFaceCenterY,
        cropSizeOnScreen,
        cropSizeInPhoto,
        cropX: finalCropX,
        cropY: finalCropY,
        cropWidth: finalCropWidth,
        cropHeight: finalCropHeight,
        photoToScreenScale,
        screenOffsetX,
        screenOffsetY,
      });

      // Crop the image around face center (square crop)
      // Resize to avatar size (180x180)
      const cropResult = await ImageEditor.cropImage(
        photoPath.startsWith('file://') ? photoPath : `file://${photoPath}`,
        {
          offset: { x: finalCropX, y: finalCropY },
          size: { width: finalCropWidth, height: finalCropHeight },
          displaySize: { width: 180, height: 180 }, // Resize to avatar size
        }
      );

      const croppedImageUri = cropResult.uri || cropResult.path;
      const cleanUri = croppedImageUri.startsWith('file://') 
        ? croppedImageUri.replace('file://', '') 
        : croppedImageUri;

      // Generate filename with timestamp
      const timestamp = Date.now();
      const filename = `avatar_${timestamp}.jpg`;
      
      // Save to internal memory (DocumentDirectoryPath)
      const internalPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
      await RNFS.copyFile(cleanUri, internalPath);
      console.log('[FaceCapture] Saved to internal memory:', internalPath);

      // Save to project directory for checking (Android: external storage, iOS: DocumentDirectory)
      let projectPath;
      if (Platform.OS === 'android') {
        // For Android, save to external storage Pictures directory
        const externalPath = `${RNFS.PicturesDirectoryPath}/${filename}`;
        try {
          await RNFS.copyFile(cleanUri, externalPath);
          projectPath = externalPath;
          console.log('[FaceCapture] Saved to project directory (Android):', externalPath);
        } catch (error) {
          console.warn('[FaceCapture] Could not save to external storage, using internal:', error);
          projectPath = internalPath;
        }
      } else {
        // For iOS, use DocumentDirectory
        projectPath = internalPath;
        console.log('[FaceCapture] Saved to project directory (iOS):', internalPath);
      }

      // Return the internal path with file:// prefix for React Native Image component
      const finalUri = `file://${internalPath}`;
      console.log('[FaceCapture] Final avatar URI:', finalUri);
      console.log('[FaceCapture] Project directory path:', projectPath);

      return finalUri;
    } catch (error) {
      console.error('[FaceCapture] Error cropping/resizing image:', error);
      // Return original if cropping fails
      return photoPath.startsWith('file://') ? photoPath : `file://${photoPath}`;
    }
  }, []);

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

      // Detect face in the captured photo to get face center
      let imagePath = photo.path;
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
        Alert.alert('No Face Detected', 'Please ensure your face is visible in the frame.');
        setIsCapturing(false);
        autoCaptureTriggeredRef.current = false;
        isCapturingRef.current = false;
        return;
      }

      // Get face center coordinates
      const face = faces[0];
      const snapshotWidth = photo.width || screenWidth;
      const snapshotHeight = photo.height || screenHeight;

      const faceCenterXImage =
        photo.isMirrored
          ? snapshotWidth - (face.frame.left + face.frame.width / 2)
          : face.frame.left + face.frame.width / 2;
      const faceCenterYImage = face.frame.top + face.frame.height / 2;

      // Map face center from photo coordinates to screen coordinates
      const faceCenterXOnScreen = (faceCenterXImage / snapshotWidth) * screenWidth;
      const faceCenterYOnScreen = (faceCenterYImage / snapshotHeight) * screenHeight;

      console.log('[FaceCapture] Face center for cropping:', {
        faceCenterImage: { x: faceCenterXImage, y: faceCenterYImage },
        faceCenterScreen: { x: faceCenterXOnScreen, y: faceCenterYOnScreen },
      });

      // Crop and resize around face center (35% of screen width)
      const croppedPhotoUri = await cropAndResizeImage(
        photo.path,
        photo.width,
        photo.height,
        faceCenterXOnScreen,
        faceCenterYOnScreen,
        photo.isMirrored || false
      );

      dispatch(setPersonalInfo({ avatar: croppedPhotoUri }));
      dispatch(setProfilePictureTaken(true));

      // Navigate back to Profile screen
      navigation.navigate('MainApp', { screen: 'Profile' });
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
    const detectionIntervalMs = 500; // 0.5 seconds

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
          setFaceVisualizations([]); // Clear visualizations
          detectionTimeoutRef.current = setTimeout(runDetection, detectionIntervalMs);
          return;
        }

        const snapshotWidth = photoForDetection.width || screenWidth;
        const snapshotHeight = photoForDetection.height || screenHeight;

        // Map all detected faces to screen coordinates for visualization
        const visualizations = faces.map((face) => {
          const faceCenterXImage =
            photoForDetection.isMirrored
              ? snapshotWidth - (face.frame.left + face.frame.width / 2)
              : face.frame.left + face.frame.width / 2;
          const faceCenterYImage = face.frame.top + face.frame.height / 2;

          const centerXOnScreen =
            (faceCenterXImage / snapshotWidth) * screenWidth;
          const centerYOnScreen =
            (faceCenterYImage / snapshotHeight) * screenHeight;

          // Map face bounds to screen coordinates
          const leftOnScreen = photoForDetection.isMirrored
            ? screenWidth - ((face.frame.left + face.frame.width) / snapshotWidth) * screenWidth
            : (face.frame.left / snapshotWidth) * screenWidth;
          const topOnScreen = (face.frame.top / snapshotHeight) * screenHeight;
          const widthOnScreen = (face.frame.width / snapshotWidth) * screenWidth;
          const heightOnScreen = (face.frame.height / snapshotHeight) * screenHeight;

          return {
            left: leftOnScreen,
            top: topOnScreen,
            width: widthOnScreen,
            height: heightOnScreen,
            centerX: centerXOnScreen,
            centerY: centerYOnScreen,
          };
        });

        setFaceVisualizations(visualizations);

        const face = faces[0];
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

        // Use a more lenient threshold (0.8 instead of 0.65) and adjust size range
        const isWithinCircle = distance <= faceAreaRadius * 0.8;
        const isAcceptableSize = faceWidthRatio >= 0.15 && faceWidthRatio <= 0.6;

        if (isWithinCircle && isAcceptableSize) {
          consecutiveDetectionsRef.current += 1;
          setFaceDetected(true);
          console.log('[FaceCapture] Face detected! Consecutive:', consecutiveDetectionsRef.current);
          
          // Auto-capture after 4 consecutive detections (2 seconds at 0.5s interval)
          if (consecutiveDetectionsRef.current >= 4 && !autoCaptureTriggeredRef.current) {
            consecutiveDetectionsRef.current = 0;
            detectionActiveRef.current = false;
            if (detectionTimeoutRef.current) {
              clearTimeout(detectionTimeoutRef.current);
              detectionTimeoutRef.current = null;
            }
            await handleCapture();
            return;
          }
        } else {
          consecutiveDetectionsRef.current = 0;
          setFaceDetected(false);
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

  // Start detection loop for emulator mode
  useEffect(() => {
    if (isEmulator && testImageUri && !detectionActiveRef.current) {
      const startEmulatorDetection = async () => {
        detectionActiveRef.current = true;
        const detectionIntervalMs = 500; // 0.5 seconds

        const runDetection = async () => {
          if (!detectionActiveRef.current || !testImageUri) {
            return;
          }

          if (detectionInProgressRef.current || isCapturingRef.current) {
            setTimeout(runDetection, detectionIntervalMs);
            return;
          }

          detectionInProgressRef.current = true;

          try {
            const cleanUri = testImageUri.split('?')[0];
            const imagePath = cleanUri.startsWith('file://') 
              ? cleanUri 
              : `file://${cleanUri}`;

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
              setFaceVisualizations([]); // Clear visualizations
              setTimeout(runDetection, detectionIntervalMs);
              return;
            }

            // Get image dimensions for coordinate mapping
            const imageSize = await new Promise((resolve, reject) => {
              Image.getSize(
                cleanUri,
                (width, height) => resolve({ width, height }),
                reject
              );
            });

            // Map image coordinates to screen coordinates
            // The test image is displayed fullscreen with cover mode, so we need to account for aspect ratio
            const imageAspectRatio = imageSize.width / imageSize.height;
            const screenAspectRatio = screenWidth / screenHeight;
            
            let scaleX, scaleY, offsetX = 0, offsetY = 0;
            
            // For cover mode: image is scaled to fill the screen, cropping if necessary
            if (imageAspectRatio > screenAspectRatio) {
              // Image is wider than screen - scale based on height (image fills height, crops width)
              scaleY = screenHeight / imageSize.height;
              scaleX = scaleY; // Same scale for both dimensions
              offsetX = (screenWidth - imageSize.width * scaleX) / 2; // Center horizontally
            } else {
              // Image is taller than screen - scale based on width (image fills width, crops height)
              scaleX = screenWidth / imageSize.width;
              scaleY = scaleX; // Same scale for both dimensions
              offsetY = (screenHeight - imageSize.height * scaleY) / 2; // Center vertically
            }

            // Map all detected faces to screen coordinates for visualization
            const visualizations = faces.map((face) => {
              const faceCenterXImage = face.frame.left + face.frame.width / 2;
              const faceCenterYImage = face.frame.top + face.frame.height / 2;
              
              const centerXOnScreen = faceCenterXImage * scaleX + offsetX;
              const centerYOnScreen = faceCenterYImage * scaleY + offsetY;

              // Map face bounds to screen coordinates
              const leftOnScreen = face.frame.left * scaleX + offsetX;
              const topOnScreen = face.frame.top * scaleY + offsetY;
              const widthOnScreen = face.frame.width * scaleX;
              const heightOnScreen = face.frame.height * scaleY;

              return {
                left: leftOnScreen,
                top: topOnScreen,
                width: widthOnScreen,
                height: heightOnScreen,
                centerX: centerXOnScreen,
                centerY: centerYOnScreen,
              };
            });

            setFaceVisualizations(visualizations);

            const face = faces[0];
            const faceCenterXImage = face.frame.left + face.frame.width / 2;
            const faceCenterYImage = face.frame.top + face.frame.height / 2;
            
            // Map face center from image coordinates to screen coordinates
            const centerXOnScreen = faceCenterXImage * scaleX + offsetX;
            const centerYOnScreen = faceCenterYImage * scaleY + offsetY;
            
            console.log('[FaceCapture] Coordinate mapping:', {
              imageSize: { width: imageSize.width, height: imageSize.height },
              screenSize: { width: screenWidth, height: screenHeight },
              imageAspectRatio,
              screenAspectRatio,
              scaleX,
              scaleY,
              offsetX,
              offsetY,
              faceCenterImage: { x: faceCenterXImage, y: faceCenterYImage },
              faceCenterScreen: { x: centerXOnScreen, y: centerYOnScreen },
            });

            const dx = centerXOnScreen - faceAreaCenterX;
            const dy = centerYOnScreen - faceAreaCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Calculate face width ratio based on screen dimensions
            const faceWidthOnScreen = face.frame.width * scaleX;
            const faceWidthRatio = faceWidthOnScreen / screenWidth;

            // Log detection details for debugging
            console.log('[FaceCapture] Detection details:', {
              faceCenterImage: { x: faceCenterXImage, y: faceCenterYImage },
              faceCenterScreen: { x: centerXOnScreen, y: centerYOnScreen },
              circleCenter: { x: faceAreaCenterX, y: faceAreaCenterY },
              distance,
              faceAreaRadius,
              distanceThreshold: faceAreaRadius * 0.8,
              isWithinCircle: distance <= faceAreaRadius * 0.8,
              faceWidthRatio,
              isAcceptableSize: faceWidthRatio >= 0.15 && faceWidthRatio <= 0.6,
            });

            // Use a more lenient threshold (0.8 instead of 0.65) and adjust size range
            const isWithinCircle = distance <= faceAreaRadius * 0.8;
            const isAcceptableSize = faceWidthRatio >= 0.15 && faceWidthRatio <= 0.6;

            if (isWithinCircle && isAcceptableSize) {
              consecutiveDetectionsRef.current += 1;
              setFaceDetected(true);
              console.log('[FaceCapture] Face detected! Consecutive:', consecutiveDetectionsRef.current);

              // Auto-capture after 4 consecutive detections (2 seconds at 0.5s interval)
              if (consecutiveDetectionsRef.current >= 4 && !autoCaptureTriggeredRef.current) {
                consecutiveDetectionsRef.current = 0;
                detectionActiveRef.current = false;
                
                // Simulate capture with test image
                try {
                  setIsCapturing(true);
                  isCapturingRef.current = true;
                  autoCaptureTriggeredRef.current = true;

                  // Get face center coordinates in screen coordinates (already calculated above)
                  // centerXOnScreen and centerYOnScreen are available from the detection logic
                  
                  console.log('[FaceCapture] Emulator - Face center for cropping:', {
                    faceCenterImage: { x: faceCenterXImage, y: faceCenterYImage },
                    faceCenterScreen: { x: centerXOnScreen, y: centerYOnScreen },
                  });

                  // Crop the test image around face center (35% of screen width)
                  const croppedPhotoUri = await cropAndResizeImage(
                    cleanUri,
                    imageSize.width,
                    imageSize.height,
                    centerXOnScreen,
                    centerYOnScreen,
                    false
                  );

                  dispatch(setPersonalInfo({ avatar: croppedPhotoUri }));
                  dispatch(setProfilePictureTaken(true));

                  // Navigate back to Profile screen
                  navigation.navigate('MainApp', { screen: 'Profile' });
                } catch (error) {
                  console.error('[FaceCapture] Error capturing photo:', error);
                  Alert.alert('Error', 'Failed to capture photo. Please try again.');
                  setIsCapturing(false);
                  autoCaptureTriggeredRef.current = false;
                  detectionActiveRef.current = true;
                  setTimeout(runDetection, detectionIntervalMs);
                }
                return;
              }
            } else {
              consecutiveDetectionsRef.current = 0;
              setFaceDetected(false);
              console.log('[FaceCapture] Face not in valid position:', {
                isWithinCircle,
                isAcceptableSize,
                distance,
                faceWidthRatio,
              });
            }
          } catch (error) {
            console.error('[FaceCapture] Detection error:', error);
            consecutiveDetectionsRef.current = 0;
            setFaceDetected(false);
          } finally {
            detectionInProgressRef.current = false;
            if (detectionActiveRef.current) {
              setTimeout(runDetection, detectionIntervalMs);
            }
          }
        };

        setTimeout(runDetection, detectionIntervalMs);
      };

      startEmulatorDetection();

      return () => {
        detectionActiveRef.current = false;
        detectionInProgressRef.current = false;
      };
    }
  }, [isEmulator, testImageUri, faceAreaCenterX, faceAreaCenterY, faceAreaRadius, cropAndResizeImage, dispatch, navigation]);

  if (isEmulator) {
    if (isLoadingTestImage || !testImageUri) {
      return (
        <View style={styles.container}>
          <StatusBar barStyle="light-content" />
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>Loading test image...</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Simulated Camera View with Test Image */}
        <View style={styles.camera}>
          <Image
            source={{ uri: testImageUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </View>

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
                  ? 'Face Detected! Keep this for a few seconds...'
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
                  borderColor: faceDetected ? '#4CAF50' : '#87CEEB', // Green when detected, sky-blue otherwise
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

          {/* Red borders around detected faces */}
          {faceVisualizations.map((face, index) => (
            <View
              key={index}
              style={{
                position: 'absolute',
                left: face.left,
                top: face.top,
                width: face.width,
                height: face.height,
                borderWidth: 3,
                borderColor: 'red',
                borderRadius: 4,
                backgroundColor: 'transparent',
              }}
            >
              {/* Face number label */}
              <View
                style={{
                  position: 'absolute',
                  top: -20,
                  left: 0,
                  backgroundColor: 'red',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                  Face {index + 1}
                </Text>
              </View>
            </View>
          ))}

          {/* Auto-capture mode - no manual button needed */}
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
                ? 'Face Detected! Keep this for a few seconds...'
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
                borderColor: faceDetected ? '#4CAF50' : '#87CEEB', // Green when detected, sky-blue otherwise
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

        {/* Red borders around detected faces */}
        {faceVisualizations.map((face, index) => (
          <View
            key={index}
            style={{
              position: 'absolute',
              left: face.left,
              top: face.top,
              width: face.width,
              height: face.height,
              borderWidth: 3,
              borderColor: 'red',
              borderRadius: 4,
              backgroundColor: 'transparent',
            }}
          >
            {/* Face number label */}
            <View
              style={{
                position: 'absolute',
                top: -20,
                left: 0,
                backgroundColor: 'red',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                Face {index + 1}
              </Text>
            </View>
          </View>
        ))}

        {/* Auto-capture mode - no manual button needed */}
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
    borderColor: '#87CEEB', // Sky-blue color
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
    backgroundColor: 'rgba(135, 206, 235, 0.3)', // Sky-blue with transparency
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


