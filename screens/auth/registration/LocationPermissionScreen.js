import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import BackButton from '../../../components/BackButton';
import { colors } from '../../../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const features = [
    'To update your location when the app is closed or in background.',
    'Receive hassle-free care booking request.',
    'Allow users to track you easily when you go for a care.',
];

export default function LocationPermissionScreen({ route, navigation }) {
  const handleEnablePermission = async () => {
    // In a real app, you would request location permission here
    // For now, we'll just navigate to the next screen
    navigation.navigate('KYCVerification');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* Back Button */}
      <View style={styles.backButton}>
        <BackButton 
          onPress={() => navigation.navigate('CompleteProfile', route.params || {})}
          color={colors.textPrimary}
          activeColor="rgba(12, 64, 58, 0.1)"
        />
      </View>

            {/* Illustration at the very top */}
            <View style={styles.illustrationContainer}>
                <Image
                    source={require('../../../assets/img/auth/location.jpg')}
                    style={styles.illustration}
                    resizeMode="cover"
                />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                {/* Title */}
                <Text style={styles.title}>Location Permission</Text>

                {/* Introduction */}

                {/* Features List */}
                <View style={styles.featuresList}>
                    <Text style={styles.introText}>
                        We require a location permission for following features,
                    </Text>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <View style={styles.bulletPoint} />
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Enable Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.enableButton}
                    onPress={handleEnablePermission}
                    activeOpacity={0.8}
                >
                    <Text style={styles.enableButtonText}>Enable Location Permission</Text>
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
  illustrationContainer: {
        width: '100%',
        height: screenHeight * 0.37,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 0,
    },
    illustration: {
        width: '100%',
        height: '100%',
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: screenHeight * 0.4+60,
        paddingBottom: 120,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 25,
        paddingHorizontal: 30,
    },
    introText: {
        fontSize: 15,
        color: colors.textDark,
        textAlign: 'left',
        marginBottom: 5,
        paddingHorizontal: 0,
        lineHeight: 22,
    },
    featuresList: {
        paddingHorizontal: 40,
        marginBottom: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    bulletPoint: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
        marginTop: 7,
        marginRight: 12,
    },
    featureText: {
        flex: 1,
        fontSize: 14,
        color: colors.textDark,
        lineHeight: 20,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 30,
        paddingVertical: 25,
        backgroundColor: colors.backgroundCard,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    enableButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    enableButtonText: {
        color: colors.textLight,
        fontSize: 18,
        fontWeight: '700',
    },
});

