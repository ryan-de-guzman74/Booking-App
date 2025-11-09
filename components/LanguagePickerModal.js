import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Bengali', 'Punjabi',
  'Turkish', 'Vietnamese', 'Polish', 'Ukrainian', 'Romanian', 'Dutch',
  'Greek', 'Czech', 'Swedish', 'Hungarian', 'Hebrew', 'Thai', 'Danish',
  'Finnish', 'Norwegian', 'Slovak', 'Croatian', 'Bulgarian', 'Lithuanian',
  'Slovenian', 'Latvian', 'Estonian', 'Icelandic', 'Irish', 'Albanian',
  'Macedonian', 'Serbian', 'Bosnian', 'Malay', 'Indonesian', 'Filipino',
  'Swahili', 'Afrikaans', 'Zulu', 'Xhosa', 'Hausa', 'Yoruba', 'Amharic',
  'Somali', 'Persian', 'Urdu', 'Pashto', 'Kurdish', 'Tagalog', 'Cebuano',
];

export default function LanguagePickerModal({ visible, onClose, onSelect, selectedLanguages = [] }) {
  const [searchText, setSearchText] = useState('');

  const filteredLanguages = languages.filter((lang) =>
    lang.toLowerCase().includes(searchText.toLowerCase()) &&
    !selectedLanguages.includes(lang)
  );

  const handleLanguageSelect = (language) => {
    onSelect(language);
    setSearchText('');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header with Search */}
          <View style={styles.header}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          {/* Language List */}
          <FlatList
            data={filteredLanguages}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.languageItem}
                onPress={() => handleLanguageSelect(item)}
              >
                <Text style={styles.languageText}>{item}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No languages found</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.7,
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDivider,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textDark,
    paddingVertical: 8,
  },
  closeButton: {
    marginLeft: 10,
  },
  languageItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDivider,
  },
  languageText: {
    fontSize: 16,
    color: colors.textDark,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});

