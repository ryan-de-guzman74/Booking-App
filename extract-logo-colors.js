// Script to extract colors from logo
const getColors = require('get-image-colors');
const path = require('path');
const fs = require('fs');

const logoPath = path.join(__dirname, 'assets', 'Logo.jpeg');

getColors(logoPath, { count: 5, type: 'image/jpeg' })
  .then(colors => {
    console.log('=== Extracted Colors from Logo ===\n');
    
    colors.forEach((color, index) => {
      const rgb = color.rgb();
      const hex = color.hex();
      console.log(`Color ${index + 1}: ${hex} - rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})`);
    });
    
    // Use the first (most dominant) color as primary
    const primaryColor = colors[0];
    const rgb = primaryColor.rgb();
    const hex = primaryColor.hex();
    
    console.log('\n=== Primary Color ===');
    console.log(`Primary: ${hex}`);
    console.log(`RGB: rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})`);
    
    // Generate theme colors
    const primaryLight = lightenColor(rgb, 0.15);
    const primaryLighter = lightenColor(rgb, 0.30);
    const primaryLightest = lightenColor(rgb, 0.45);
    const primaryDark = darkenColor(rgb, 0.25);
    const primaryDarker = darkenColor(rgb, 0.40);
    
    console.log('\n=== Generated Theme Colors ===');
    console.log(`Primary Light: #${rgbToHex(primaryLight[0], primaryLight[1], primaryLight[2])}`);
    console.log(`Primary Lighter: #${rgbToHex(primaryLighter[0], primaryLighter[1], primaryLighter[2])}`);
    console.log(`Primary Lightest: #${rgbToHex(primaryLightest[0], primaryLightest[1], primaryLightest[2])}`);
    console.log(`Primary Dark: #${rgbToHex(primaryDark[0], primaryDark[1], primaryDark[2])}`);
    console.log(`Primary Darker: #${rgbToHex(primaryDarker[0], primaryDarker[1], primaryDarker[2])}`);
    
    // Create gradient from extracted colors
    const gradientColors = [
      hex,
      colors[1] ? colors[1].hex() : `#${rgbToHex(primaryLight[0], primaryLight[1], primaryLight[2])}`,
      colors[2] ? colors[2].hex() : `#${rgbToHex(primaryLighter[0], primaryLighter[1], primaryLighter[2])}`,
      colors[3] ? colors[3].hex() : `#${rgbToHex(primaryLightest[0], primaryLightest[1], primaryLightest[2])}`
    ];
    
    console.log('\n=== Gradient Colors ===');
    gradientColors.forEach((color, index) => {
      console.log(`Gradient ${index + 1}: ${color}`);
    });
    
    // Update theme file
    updateThemeFile(hex, primaryLight, primaryLighter, primaryLightest, primaryDark, primaryDarker, gradientColors, rgb);
    
  })
  .catch(err => {
    console.error('Error extracting colors:', err);
    console.log('\nUsing fallback colors. Please manually update theme/colors.js with logo colors.');
  });

function rgbToHex(r, g, b) {
  return ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1).toUpperCase();
}

function lightenColor(rgb, amount) {
  return [
    Math.min(255, rgb[0] + (255 - rgb[0]) * amount),
    Math.min(255, rgb[1] + (255 - rgb[1]) * amount),
    Math.min(255, rgb[2] + (255 - rgb[2]) * amount)
  ];
}

function darkenColor(rgb, amount) {
  return [
    Math.max(0, rgb[0] * (1 - amount)),
    Math.max(0, rgb[1] * (1 - amount)),
    Math.max(0, rgb[2] * (1 - amount))
  ];
}

function updateThemeFile(primaryHex, primaryLight, primaryLighter, primaryLightest, primaryDark, primaryDarker, gradientColors, primaryRgb) {
  const themePath = path.join(__dirname, 'theme', 'colors.js');
  
  const themeContent = `// Color Theme Configuration
// Colors extracted from logo
// Generated automatically from logo image

export const colors = {
  // Primary brand color - extracted from logo
  primary: '${primaryHex}',
  
  // Primary color variations for gradients and accents
  primaryLight: '#${rgbToHex(primaryLight[0], primaryLight[1], primaryLight[2])}',
  primaryLighter: '#${rgbToHex(primaryLighter[0], primaryLighter[1], primaryLighter[2])}',
  primaryLightest: '#${rgbToHex(primaryLightest[0], primaryLightest[1], primaryLightest[2])}',
  primaryAccent: '#${rgbToHex(primaryLight[0], primaryLight[1], primaryLight[2])}',
  
  // Darker variations for text and emphasis
  primaryDark: '#${rgbToHex(primaryDark[0], primaryDark[1], primaryDark[2])}',
  primaryDarker: '#${rgbToHex(primaryDarker[0], primaryDarker[1], primaryDarker[2])}',
  
  // Text colors
  textPrimary: '#${rgbToHex(primaryDarker[0], primaryDarker[1], primaryDarker[2])}',
  textSecondary: '#${rgbToHex(primaryDark[0], primaryDark[1], primaryDark[2])}',
  textTertiary: '#${rgbToHex(Math.max(0, primaryDark[0] - 20), Math.max(0, primaryDark[1] - 20), Math.max(0, primaryDark[2] - 20))}',
  textLight: '#FFFFFF',
  textMuted: '#999999',
  textDark: '#333333',
  
  // Background colors
  backgroundLight: 'rgba(${Math.round(primaryLight[0])}, ${Math.round(primaryLight[1])}, ${Math.round(primaryLight[2])}, 0.15)',
  backgroundCard: '#FFFFFF',
  backgroundIcon: 'rgba(${Math.round(primaryLight[0])}, ${Math.round(primaryLight[1])}, ${Math.round(primaryLight[2])}, 0.25)',
  
  // Gradient colors - based on logo colors
  gradient: {
    colors: ${JSON.stringify(gradientColors)},
    locations: [0, 0.33, 0.67, 1],
  },
  
  // Border and divider colors
  borderLight: 'rgba(255, 255, 255, 0.3)',
  borderDivider: '#F0F0F0',
  borderMuted: '#CCCCCC',
  
  // Status and accent colors
  online: '#FFFFFF',
  indicator: '${primaryHex}',
};

// Helper function to get gradient colors
export const getGradientColors = () => colors.gradient.colors;
export const getGradientLocations = () => colors.gradient.locations;
`;
  
  fs.writeFileSync(themePath, themeContent);
  console.log('\n✓ Theme file updated at theme/colors.js');
  console.log('All screens will now use colors extracted from your logo!');
}


