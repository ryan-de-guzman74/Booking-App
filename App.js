import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import AppNavigator from './navigation/AppNavigator';
import { store } from './store';
import ErrorBoundary from './components/ErrorBoundary';

// Add global error handler
if (!__DEV__) {
  const originalError = console.error;
  console.error = (...args) => {
    originalError(...args);
    // You can send error reports here
  };
}

export default function App() {
  console.log('App component rendering...');
  
  try {
    return (
      <ErrorBoundary>
        <Provider store={store}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
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


