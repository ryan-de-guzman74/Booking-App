import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import BottomNav from '../../components/BottomNav';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const careOpportunities = [
  {
    id: 1,
    title: 'Companion Care',
    location: 'Lakeside Apartments',
    rate: '$55/hr',
    time: 'Tomorrow, 7 AM-12 P',
    icon: 'person',
    iconType: 'MaterialIcons',
    hasIndicator: false,
  },
  {
    id: 2,
    title: 'Mobility Assist',
    location: 'Willow Grove Drive',
    rate: '$60/hr',
    time: '2:30 M',
    icon: 'accessible',
    iconType: 'MaterialIcons',
    hasIndicator: true,
  },
  {
    id: 3,
    title: 'Medication Help',
    location: 'Birchwood Avenue',
    rate: '$35/hr',
    time: 'Flexible Hours',
    icon: 'medication',
    iconType: 'MaterialIcons',
    hasIndicator: false,
  },
];

const metrics = [
  { id: 1, label: 'Earnings', icon: 'dollar-sign', iconType: 'FontAwesome5' },
  { id: 2, label: 'Hours', icon: 'clock', iconType: 'FontAwesome5' },
  { id: 3, label: 'Streak', value: '8,5' },
  { id: 4, label: 'Rating', value: '4,9' },
];

export default function DashboardScreen() {
  const renderIcon = (iconType, iconName, size = 20, color = '#2C7A7A') => {
    switch (iconType) {
      case 'FontAwesome5':
        return <FontAwesome5 name={iconName} size={size} color={color} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName} size={size} color={color} />;
      case 'Ionicons':
        return <Ionicons name={iconName} size={size} color={color} />;
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={['#43A1A9', '#48B0B1', '#66D1C9', '#55BFBD']}
      locations={[0, 0.33, 0.67, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoGlowOuter}>
            <View style={styles.logoGlowMiddle}>
              <View style={styles.logoGlowInner}>
                <View style={styles.logoCircle}>
                  <Image 
                    source={require('../../assets/Logo.jpeg')} 
                    style={styles.logoImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back, Paulina</Text>
          <Text style={styles.careSummary}>
            You've cared for 23 families this month—
          </Text>
          <Text style={styles.careSummary}>
            keep it going!
          </Text>
          
          {/* Online Status */}
          <TouchableOpacity style={styles.onlineStatus}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </TouchableOpacity>
        </View>

        {/* Care Opportunities Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Opportunities</Text>
          <View style={styles.opportunitiesContainer}>
            {careOpportunities.map((opportunity) => (
              <TouchableOpacity key={opportunity.id} style={styles.opportunityCard}>
                <View style={styles.opportunityIconContainer}>
                  {renderIcon(opportunity.iconType, opportunity.icon, 35, 'rgb(33,165,174)')}
                </View>
                <View style={styles.opportunityContent}>
                  <View style={styles.opportunityTitleRow}>
                    <Text style={styles.opportunityTitle}>{opportunity.title}</Text>
                    <Text style={styles.opportunityRate}>{opportunity.rate}</Text>
                  </View>
                  <View style={styles.opportunitySubtitleRow}>
                    <Text style={styles.opportunityLocation}>{opportunity.location}</Text>
                    <View style={styles.opportunityTimeContainer}>
                      {opportunity.hasIndicator && <View style={styles.timeIndicator} />}
                      <Text style={styles.opportunityTime}>{opportunity.time}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

         {/* Performance Metrics */}
         <View style={styles.metricsContainer}>
           {metrics.map((metric) => (
             <View key={metric.id} style={styles.metricItem}>
               <View style={styles.metricIconOuter}>
                 <View style={styles.metricIconInner}>
                   {metric.icon ? (
                     renderIcon(metric.iconType, metric.icon, 24, '#FFFFFF')
                   ) : (
                     <Text style={styles.metricValue}>{metric.value}</Text>
                   )}
                 </View>
               </View>
               <Text style={styles.metricLabel}>{metric.label}</Text>
             </View>
           ))}
         </View>

        {/* Bonus Message */}
        <View style={styles.bonusCard}>
          <Text style={styles.bonusText}>
            You're 1 shift away from your $100 weekly bonus
          </Text>
        </View>

        {/* Add Availability Button */}
        <TouchableOpacity style={styles.addAvailabilityButton}>
          <Text style={styles.addAvailabilityText}>+ Add Availability</Text>
        </TouchableOpacity>

        {/* Bottom Navigation Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomNav />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 0
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    marginBottom: 15,
  },
  logoGlowOuter: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
    elevation: 35,
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 65,
      },
    }),
  },
  logoGlowMiddle: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 45,
    elevation: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 50,
      },
    }),
  },
  logoGlowInner: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 35,
    elevation: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 40,
      },
    }),
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2C7A7A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoImage: {
    width: '115%',
    height: '115%',
  },
  welcomeSection: {
    alignItems: 'center'
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  careSummary: {
    fontSize: 16,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 0,
    marginHorizontal: 40
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C7A7A',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 26,
    marginTop:15
  },
  onlineDot: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  onlineText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  section: {
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: screenHeight * 0.3
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: 5,
    marginLeft: screenWidth * 0.1,
    alignSelf: 'flex-start',
    width: screenWidth * 0.8,
  },
  opportunitiesContainer: {
    width: screenWidth * 0.8,
    maxHeight: screenHeight * 0.28,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  opportunityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(228,254,251)',
    borderRadius: 20,
    padding: 8,
    marginBottom: 8,
    width: '100%',
  },
  opportunityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgb(178,252,251)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  opportunityContent: {
    flex: 1,
  },
  opportunityTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  opportunityTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: 'rgb(5,68,71)',
    flex: 1,
  },
  opportunityRate: {
    fontSize: 17,
    fontWeight: '700',
    color: 'rgb(35,143,137)',
  },
  opportunitySubtitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opportunityLocation: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgb(21,106,99)',
    flex: 1,
  },
  opportunityTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#43A1A9',
    marginRight: 6,
  },
  opportunityTime: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgb(5,68,71)',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'space-between',
    marginBottom: 5,
    paddingHorizontal: screenWidth * 0.075,
  },
  metricItem: {
    alignItems: 'center',
    flex: 0,
  },
  metricIconOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgb(12,136,146)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  metricIconInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgb(25, 213, 216)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  bonusCard: {
    backgroundColor: 'rgb(12,136,146)',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    width: screenWidth * 0.85,
    alignSelf: 'center',
  },
  bonusText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  addAvailabilityButton: {
    backgroundColor: 'rgb(228,254,251)',
    borderRadius: 50,
    borderWidth: 2,
    width: screenWidth * 0.45,
    alignSelf: 'center',
    borderColor: '#43A1A9',
    paddingVertical: 5,
    paddingHorizontal: 5,
    alignItems: 'center',
    marginBottom: 0,
  },
  addAvailabilityText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgb(5,68,71)',
  },
  bottomSpacer: {
    height: 40,
  },
});

