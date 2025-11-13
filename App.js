import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider, useSelector, useDispatch } from 'react-redux';
import AppNavigator from './navigation/AppNavigator';
import { store } from './store';
import ErrorBoundary from './components/ErrorBoundary';
import KycSuccessModal from './components/KycSuccessModal';
import { setKycSuccessModalVisible } from './store/slices/profileSlice';

// Add global error handler
if (!__DEV__) {
  const originalError = console.error;
  console.error = (...args) => {
    originalError(...args);
    // You can send error reports here
  };
}

// Inner component that can use hooks
function AppContent() {
  const dispatch = useDispatch();
  const showKycSuccessModal = useSelector((state) => state.profile.kyc.showSuccessModal);

  const handleCloseKycModal = () => {
    dispatch(setKycSuccessModalVisible(false));
  };

  return (
    <>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <KycSuccessModal visible={showKycSuccessModal} onClose={handleCloseKycModal} />
    </>
  );
}

export default function App() {
  console.log('App component rendering...');
  
  try {
    return (
      <ErrorBoundary>
        <Provider store={store}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <AppContent />
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </Provider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('App render error:', error);
    throw error;
  }
}


