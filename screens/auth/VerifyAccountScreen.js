import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

const documents = [
  {
    id: 1,
    title: "Driver's License",
    icon: 'id-card-alt',
    iconType: 'FontAwesome5',
  },
  {
    id: 2,
    title: 'Vehicle Registration',
    icon: 'car',
    iconType: 'FontAwesome5',
  },
  {
    id: 3,
    title: 'Proof of Insurance',
    icon: 'shield-check',
    iconType: 'MaterialCommunityIcons',
  },
  {
    id: 4,
    title: 'Profile Photo',
    icon: 'person',
    iconType: 'MaterialIcons',
  },
];

export default function VerifyAccountScreen() {
  const navigation = useNavigation();
  
  // Card content minHeight is 80px
  // Icon should be 50% of card height = 40px
  const CARD_MIN_HEIGHT = 80;
  const iconSize = CARD_MIN_HEIGHT * 0.5; // 50% of card height
  
  const renderIcon = (iconType, iconName) => {
    const iconColor = '#2C7A7A';
    
    switch (iconType) {
      case 'FontAwesome5':
        return <FontAwesome5 name={iconName} size={iconSize} color={iconColor} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={iconName} size={iconSize} color={iconColor} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName} size={iconSize} color={iconColor} />;
      default:
        return null;
    }
  };

  const handleScreenPress = () => {
    navigation.navigate('MainApp', { screen: 'Dashboard' });
  };

  return (
    <TouchableOpacity 
      activeOpacity={1} 
      onPress={handleScreenPress}
      style={styles.container}
    >
      <LinearGradient
        colors={['#43A1A9', '#48B0B1', '#66D1C9', '#55BFBD']}
        locations={[0, 0.33, 0.67, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <StatusBar style="light" />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Account</Text>
          <Text style={styles.instruction}>
            Before you can get started, please upload the following documents.
          </Text>
        </View>

        {/* Document Upload Cards */}
        <View style={styles.documentsContainer}>
          {documents.map((doc) => (
            <View key={doc.id} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  {renderIcon(doc.iconType, doc.icon)}
                </View>
                <Text style={styles.cardTitle}>{doc.title}</Text>
                <TouchableOpacity style={styles.uploadButton}>
                  <Text style={styles.uploadButtonText}>Upload</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Footer Text */}
        <Text style={styles.footerText}>
          All information is securely stored and HIPAA-compliant.
        </Text>

        {/* Step Indicator */}
        <Text style={styles.stepIndicator}>Step 2 of 3</Text>
      </ScrollView>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 45,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  instruction: {
    fontSize: 20,
    fontWeight: '400',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  documentsContainer: {
    marginBottom: 10,
    padding:0
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
    }),
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 80,
  },
  iconContainer: {
    marginRight: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    paddingVertical: 8,
    paddingHorizontal: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  stepIndicator: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
});

