import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, getGradientColors, getGradientLocations } from '../../theme/colors';

const FAQ_ITEMS = [
  {
    question: 'I downloaded the app, now what?',
    answer:
      'Follow the onboarding steps to complete your profile, submit required documents, and set your working preferences.',
  },
  {
    question: 'The app seems to be slowing down after downloading but it was working before.',
    answer:
      'Close the app completely and reopen it. If the issue persists, ensure you have the latest version installed from the app store.',
  },
  {
    question: 'Why do I need a pin to access my own profile settings?',
    answer:
      'Your personal data is secured with a PIN to prevent unauthorized access to sensitive information.',
  },
  {
    question: 'How do I set up my pin?',
    answer:
      'Open the profile section, select “Personal Details”, and follow the prompts under security to create or reset your PIN.',
  },
  {
    question: 'What if I forget my pin?',
    answer:
      'Use the “Forgot PIN” option on the login screen to verify your identity and create a new PIN.',
  },
  {
    question: "Why can't I access my account?",
    answer:
      'If you are unable to access the account, confirm that your documents are approved and that you have completed the verification steps.',
  },
  {
    question: 'How do I know what KYC documents you need from me?',
    answer:
      'The Update KYC section shows all required documents. Pending items will be highlighted so you can complete them.',
  },
  {
    question: 'Why am I unable to enter and save my profile address?',
    answer:
      'Ensure that all required address fields are filled and that your network connection is stable before saving.',
  },
  {
    question: 'Why is the app not accepting my document(s)?',
    answer:
      'Check that each document is clear, under 2MB, and matches the accepted file formats (JPG or PDF).',
  },
  {
    question: 'Why do I need to take a profile picture?',
    answer:
      'A recent profile photo helps clients recognize you and adds an additional layer of security to your account.',
  },
];

export default function FaqScreen() {
  const navigation = useNavigation();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      locations={getGradientLocations()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FAQ</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Frequently Asked Questions</Text>
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = index === openIndex;
            return (
              <View key={item.question} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => toggleItem(index)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.question}>{item.question}</Text>
                  <MaterialIcons
                    name={isOpen ? 'expand-less' : 'expand-more'}
                    size={24}
                    color={colors.primaryDark}
                  />
                </TouchableOpacity>
                {isOpen && <Text style={styles.answer}>{item.answer}</Text>}
              </View>
            );
          })}
        </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textLight,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
    backgroundColor: '#F6FBF9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 24,
  },
  listContent: {
    paddingBottom: 40,
    gap: 12,
  },
  faqItem: {
    borderRadius: 18,
    backgroundColor: '#F7E3C4',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingRight: 16,
  },
  answer: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
