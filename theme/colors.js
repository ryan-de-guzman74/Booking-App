// Color Theme Configuration
// Colors extracted from logo
// Generated automatically from logo image

export const colors = {
  // Primary brand color - extracted from logo
  primary: '#0c403a',
  
  // Primary color variations for gradients and accents
  primaryLight: '#305D58',
  primaryLighter: '#557975',
  primaryLightest: '#799693',
  primaryAccent: '#305D58',
  
  // Darker variations for text and emphasis
  primaryDark: '#09302C',
  primaryDarker: '#072623',
  
  // Text colors
  textPrimary: '#072623',
  textSecondary: '#09302C',
  textTertiary: '#001C18',
  textLight: '#FFFFFF',
  textMuted: '#999999',
  textDark: '#333333',
  
  // Background colors
  backgroundLight: 'rgba(48, 93, 88, 0.15)',
  backgroundCard: '#FFFFFF',
  backgroundIcon: 'rgba(48, 93, 88, 0.25)',
  
  // Gradient colors - based on logo colors, creating a smooth dark-to-light gradient
  // Using extracted colors: #0c403a (primary), #6f8c88, #7caca4, #84a49c
  gradient: {
    colors: ["#0c403a", "#305D58", "#6f8c88", "#7caca4"],
    locations: [0, 0.33, 0.67, 1],
  },
  
  // Border and divider colors
  borderLight: 'rgba(255, 255, 255, 0.3)',
  borderDivider: '#F0F0F0',
  borderMuted: '#CCCCCC',
  
  // Status and accent colors
  online: '#FFFFFF',
  indicator: '#0c403a',
  error: '#d32f2f',
};

// Helper function to get gradient colors
export const getGradientColors = () => colors.gradient.colors;
export const getGradientLocations = () => colors.gradient.locations;
