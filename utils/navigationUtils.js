/**
 * Navigation utility functions
 */

/**
 * Get the restricted/home page based on KYC approval status
 * @param {boolean} kycApproved - Whether KYC is approved
 * @returns {string} - Screen name to navigate to
 */
export const getRestrictedPage = (kycApproved) => {
  return kycApproved ? 'Dashboard' : 'Dashboard'; // Both map to Dashboard tab, but VerifyAccount shows when not approved
};

/**
 * Navigate to the restricted page (home page based on KYC status)
 * @param {object} navigation - Navigation object
 * @param {boolean} kycApproved - Whether KYC is approved
 */
export const navigateToRestrictedPage = (navigation, kycApproved) => {
  // Try to navigate to Dashboard tab first (works if we're in MainApp)
  try {
    navigation.navigate('Dashboard');
  } catch (e) {
    // If that fails, navigate to MainApp with Dashboard screen
    try {
      navigation.navigate('MainApp', { screen: 'Dashboard' });
    } catch (e2) {
      // Last resort: reset to MainApp
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp', params: { initialRoute: 'Dashboard' } }],
      });
    }
  }
};

