# Project Structure

This document outlines the folder organization for the Booking App, grouped by functionality.

## Folder Structure

```
Booking-App/
├── screens/              # Screen components organized by feature
│   └── auth/            # Authentication & Onboarding screens
│       ├── WelcomeScreen.js
│       └── VerifyAccountScreen.js
│
├── navigation/          # Navigation configuration
│   └── AppNavigator.js  # Main navigation stack
│
├── components/          # Reusable UI components
│   └── (future components)
│
├── assets/             # Static assets (images, fonts, etc.)
│   ├── Logo.jpeg
│   └── ...
│
└── App.js              # Main app entry point
```

## Screen Organization

### Authentication Screens (`screens/auth/`)
- **WelcomeScreen.js**: Initial welcome/onboarding screen with logo and account creation/login options
- **VerifyAccountScreen.js**: Document upload screen for account verification (Step 2 of 3)

## Navigation

- Uses React Navigation with Native Stack Navigator
- Slide animation between screens
- Header hidden for full-screen gradient backgrounds

## Future Organization

As the app grows, additional folders can be added:
- `screens/booking/` - Booking-related screens
- `screens/profile/` - User profile screens
- `screens/history/` - Booking history screens
- `screens/settings/` - Settings screens
- `components/forms/` - Form components
- `components/cards/` - Card components
- `utils/` - Utility functions
- `constants/` - App constants and configuration
- `hooks/` - Custom React hooks
- `services/` - API services
- `context/` - React Context providers

