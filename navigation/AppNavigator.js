import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GetStartedScreen from '../screens/auth/GetStartedScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/registration/RegisterScreen';
import ConfirmPhoneNumberScreen from '../screens/auth/registration/ConfirmPhoneNumberScreen';
import UpdateInformationScreen from '../screens/auth/registration/UpdateInformationScreen';
import EnterAuthCodeScreen from '../screens/auth/registration/EnterAuthCodeScreen';
import SetupMPinScreen from '../screens/auth/registration/SetupMPinScreen';
import CompleteProfileScreen from '../screens/auth/registration/CompleteProfileScreen';
import LocationPermissionScreen from '../screens/auth/registration/LocationPermissionScreen';
import KYCVerificationScreen from '../screens/auth/registration/KYCVerificationScreen';
import ProfilePictureTakenScreen from '../screens/auth/registration/ProfilePictureTakenScreen';
import FaceCaptureCameraScreen from '../screens/auth/registration/FaceCaptureCameraScreen';
import VerifyAccountScreen from '../screens/auth/VerifyAccountScreen';
import MainTabNavigator from './MainTabNavigator';
import BookingDetailsScreen from '../screens/bookings/BookingDetailsScreen';
import EnterMPinScreen from '../screens/auth/EnterMPinScreen';
import NewBookingDetailsScreen from '../screens/bookings/NewBookingDetailsScreen';
import PersonalDetailsScreen from '../screens/profile/PersonalDetailsScreen';
import PaymentPayoutScreen from '../screens/profile/PaymentPayoutScreen';
import BanksScreen from '../screens/profile/BanksScreen';
import AddBankScreen from '../screens/profile/AddBankScreen';
import WithdrawalHistoryScreen from '../screens/profile/WithdrawalHistoryScreen';
import KycStatusScreen from '../screens/profile/KycStatusScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import FaqScreen from '../screens/help/FaqScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="GetStarted"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="GetStarted" component={GetStartedScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ConfirmPhoneNumber" component={ConfirmPhoneNumberScreen} />
      <Stack.Screen name="UpdateInformation" component={UpdateInformationScreen} />
      <Stack.Screen name="EnterAuthCode" component={EnterAuthCodeScreen} />
      <Stack.Screen name="SetupMPin" component={SetupMPinScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
      <Stack.Screen name="ProfilePictureTaken" component={ProfilePictureTakenScreen} />
      <Stack.Screen name="FaceCaptureCamera" component={FaceCaptureCameraScreen} />
      <Stack.Screen name="KYCVerification" component={KYCVerificationScreen} />
      <Stack.Screen name="VerifyAccount" component={VerifyAccountScreen} />
      <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
      <Stack.Screen name="EnterMPin" component={EnterMPinScreen} />
      <Stack.Screen name="PaymentPayout" component={PaymentPayoutScreen} />
      <Stack.Screen name="Banks" component={BanksScreen} />
      <Stack.Screen name="AddBank" component={AddBankScreen} />
      <Stack.Screen name="WithdrawalHistory" component={WithdrawalHistoryScreen} />
      <Stack.Screen name="KycStatus" component={KycStatusScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="FAQ" component={FaqScreen} />
      <Stack.Screen name="MainApp" component={MainTabNavigator} />
      <Stack.Screen name="NewBookingDetails" component={NewBookingDetailsScreen} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
    </Stack.Navigator>
  );
}


