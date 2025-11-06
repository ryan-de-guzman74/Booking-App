import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Main character color - same as DashboardScreen group title color
const MAIN_COLOR = 'rgb(5,68,71)';

export default function ProfileScreen() {

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
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={require('../../assets/avatar.jpg')}
                            style={styles.profileImage}
                        />
                    </View>
                    <Text style={styles.profileName}>Emma Johnson</Text>
                    <Text style={styles.profileRole}>Caregiver</Text>
                </View>

                {/* Menu Options Card */}
                <View style={styles.menuCard}>
                    {/* Personal Details */}
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <MaterialIcons name="person-outline" size={35} color="#43A1A9" />
                        </View>
                        <Text style={styles.menuItemText}>Personal Details</Text>
                        <MaterialIcons name="chevron-right" size={25} color="#CCCCCC" />
                    </TouchableOpacity>
                    <View style={styles.menuDivider} />

                    {/* Payment & Payout */}
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <MaterialIcons name="attach-money" size={35} color="#43A1A9" />
                        </View>
                        <Text style={styles.menuItemText}>Payment & Payout</Text>
                        <MaterialIcons name="chevron-right" size={25} color="#CCCCCC" />
                    </TouchableOpacity>
                    <View style={styles.menuDivider} />

                    {/* Notifications */}
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <MaterialIcons name="notifications-none" size={35} color="#43A1A9" />
                        </View>
                        <Text style={styles.menuItemText}>Notifications</Text>
                        <MaterialIcons name="chevron-right" size={25} color="#CCCCCC" />
                    </TouchableOpacity>
                    <View style={styles.menuDivider} />

                    {/* Help */}
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <MaterialIcons name="help-outline" size={35} color="#43A1A9" />
                        </View>
                        <Text style={styles.menuItemText}>Help</Text>
                        <MaterialIcons name="chevron-right" size={25} color="#CCCCCC" />
                    </TouchableOpacity>
                </View>

                {/* Bottom Navigation Spacer */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Bottom Navigation Bar - Expanded Style (With Titles) */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home-outline" size={30} color="#999999" />
                    <Text style={[styles.navLabel, styles.navLabelInactive]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="calendar-outline" size={30} color="#999999" />
                    <Text style={[styles.navLabel, styles.navLabelInactive]}>Bookings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="time-outline" size={30} color="#999999" />
                    <Text style={[styles.navLabel, styles.navLabelInactive]}>History</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="person" size={30} color="#43A1A9" />
                    <Text style={[styles.navLabel, styles.navLabelActive]}>Profile</Text>
                </TouchableOpacity>
            </View>
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
    profileImage: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
        resizeMode: 'cover',
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
        borderColor: '#43A1A9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemText: {
        flex: 1,
        fontSize: 17,
        fontWeight: '500',
        color: MAIN_COLOR,
    },
    bottomSpacer: {
        height: 40,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 5,
        paddingVertical: 8,
        paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navLabel: {
        fontSize: 12,
        fontWeight: '400',
        marginTop: 4,
    },
    navLabelActive: {
        color: '#43A1A9',
    },
    navLabelInactive: {
        color: '#999999',
    },
});

