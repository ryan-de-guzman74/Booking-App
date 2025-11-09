import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { colors, getGradientColors, getGradientLocations } from '../../theme/colors';
import BottomNav from '../../components/BottomNav';
import { useDispatch } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import { setPersonalInfo } from '../../store/slices/profileSlice';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const personalInfo = useSelector((state) => state.profile.personalInfo);
  const storedMPin = useSelector((state) => state.profile.personalInfo.mPin);
  const profileName = personalInfo.fullName || 'Guest User';
  const avatarUri = personalInfo.avatar;

  const requestPhotoPermission = async () => {
    if (Platform.OS !== 'android') return true;
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handleChangePhoto = async () => {
    try {
      if (Platform.OS === 'android') {
        const hasPermission = await requestPhotoPermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission needed',
            'Please allow photo library access to update your profile photo.',
          );
          return;
        }
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.85,
        selectionLimit: 1,
      });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        dispatch(
          setPersonalInfo({
            avatar: asset.uri,
          }),
        );
      }
    } catch (error) {
      console.error('Profile photo selection error', error);
      Alert.alert('Update failed', 'Unable to change profile photo. Please try again.');
    }
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

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <TouchableOpacity
                      style={styles.profileImageContainer}
                      activeOpacity={0.85}
                      onPress={handleChangePhoto}
                    >
                      <View style={styles.profileImageWrapper}>
                        <Image
                          source={
                            avatarUri
                              ? { uri: avatarUri }
                              : require('../../assets/img/avatar.jpg')
                          }
                          style={styles.profileImage}
                        />
                        <View style={styles.cameraBadge}>
                          <MaterialIcons name="photo-camera" size={20} color={colors.textLight} />
                        </View>
                      </View>
                    </TouchableOpacity>
                    <Text style={styles.profileName}>{profileName}</Text>
                    <Text style={styles.profileRole}>{personalInfo.role || 'Caregiver'}</Text>
                </View>

                {/* Menu Options Card */}
                <View style={styles.menuCard}>
                    {/* Personal Details */}
                    <TouchableOpacity
                      style={styles.menuItem}
                      activeOpacity={0.85}
                      onPress={() => {
                        if (storedMPin) {
                          navigation.navigate('EnterMPin', {
                            redirectTo: 'PersonalDetails',
                            onSuccess: () => navigation.navigate('PersonalDetails'),
                          });
                        } else {
                          navigation.navigate('PersonalDetails');
                        }
                      }}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialIcons name="person-outline" size={35} color={colors.primary} />
                        </View>
                        <Text style={styles.menuItemText}>Personal Details</Text>
                        <MaterialIcons name="chevron-right" size={25} color={colors.borderMuted} />
                    </TouchableOpacity>
                    <View style={styles.menuDivider} />

                    {/* Payment & Payout */}
                    <TouchableOpacity
                      style={styles.menuItem}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('PaymentPayout')}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialIcons name="attach-money" size={35} color={colors.primary} />
                        </View>
                        <Text style={styles.menuItemText}>Payment & Payout</Text>
                        <MaterialIcons name="chevron-right" size={25} color={colors.borderMuted} />
                    </TouchableOpacity>
                    <View style={styles.menuDivider} />

                    {/* Notifications */}
                    <TouchableOpacity 
                      style={styles.menuItem} 
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('Notifications')}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialIcons name="notifications-none" size={35} color={colors.primary} />
                        </View>
                        <Text style={styles.menuItemText}>Notifications</Text>
                        <MaterialIcons name="chevron-right" size={25} color={colors.borderMuted} />
                    </TouchableOpacity>
                    <View style={styles.menuDivider} />

                    {/* Help */}
                    <TouchableOpacity 
                      style={styles.menuItem} 
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('FAQ')}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialIcons name="help-outline" size={35} color={colors.primary} />
                        </View>
                        <Text style={styles.menuItemText}>Help</Text>
                        <MaterialIcons name="chevron-right" size={25} color={colors.borderMuted} />
                    </TouchableOpacity>
                </View>

                {/* Bottom Navigation Spacer */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Bottom Navigation Bar */}
            <BottomNav />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 40,
        paddingBottom: 0,
        paddingHorizontal: 0,
        alignItems: 'center',
    },
    profileSection: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 10,
    },
    profileImageContainer: {
        marginBottom: 10,
    },
    profileImageWrapper: {
        borderWidth: 2,
        borderColor: colors.primaryLight,
        borderRadius: 100,
        padding: 6,
        position: 'relative',
    },
    profileImage: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#FFFFFF',
        resizeMode: 'cover',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    profileName: {
        fontSize: 40,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 0,
    },
    profileRole: {
        fontSize: 25,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    menuCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 20,
        marginTop: 20,
        width: screenWidth * 0.85,
        height: screenHeight * 0.35,
        alignSelf: 'center',
        justifyContent: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        height: (screenHeight * 0.35 - 3) / 4,
        width: '100%',
    },
    menuDivider: {
        height: 1,
        width: '100%',
        backgroundColor: '#F0F0F0',
    },
    menuIconContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemText: {
        flex: 1,
        fontSize: 17,
        fontWeight: '500',
        color: colors.textPrimary,
    }
});

