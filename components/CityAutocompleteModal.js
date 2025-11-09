import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { GOOGLE_PLACES_API_KEY } from '../config/googlePlacesConfig';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CityAutocompleteModal({ visible, onClose, onSelect }) {
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchText.length > 2) {
      searchPlaces(searchText);
    } else {
      setPredictions([]);
    }
  }, [searchText]);

  const searchPlaces = async (text) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();
      
      if (data.predictions) {
        setPredictions(data.predictions);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_components&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();
      
      if (data.result && data.result.address_components) {
        const addressComponents = data.result.address_components;
        
        const streetNumber = addressComponents.find(c => 
          c.types.includes('street_number')
        );
        const route = addressComponents.find(c => 
          c.types.includes('route')
        );
        const cityComponent = addressComponents.find(c => 
          c.types.includes('locality') || c.types.includes('administrative_area_level_2')
        );
        const stateComponent = addressComponents.find(c => 
          c.types.includes('administrative_area_level_1')
        );
        const zipComponent = addressComponents.find(c => 
          c.types.includes('postal_code')
        );
        const countryComponent = addressComponents.find(c => 
          c.types.includes('country')
        );
        
        const streetAddress = [streetNumber?.long_name, route?.long_name]
          .filter(Boolean)
          .join(' ');
        
        return {
          street: streetAddress,
          city: cityComponent?.long_name || '',
          state: stateComponent?.short_name || '',
          zipCode: zipComponent?.long_name || '',
          country: countryComponent?.long_name || '',
        };
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
    return null;
  };

  const handleCitySelect = async (prediction) => {
    setIsLoading(true);
    const placeDetails = await getPlaceDetails(prediction.place_id);
    setIsLoading(false);
    
    if (placeDetails) {
      onSelect(placeDetails);
      setSearchText('');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.textDark} />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
          </View>

          {/* Google branding */}
          <View style={styles.googleBranding}>
            <Text style={styles.poweredByText}>powered by </Text>
            <Text style={styles.googleText}>Google</Text>
          </View>

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          {/* City List */}
          {!isLoading && (
            <FlatList
              data={predictions}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => handleCitySelect(item)}
                >
                  <Ionicons name="location-outline" size={20} color={colors.textMuted} style={styles.locationIcon} />
                  <View style={styles.cityInfo}>
                    <Text style={styles.cityName}>{item.structured_formatting.main_text}</Text>
                    <Text style={styles.cityDetails}>{item.structured_formatting.secondary_text}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchText.length > 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {searchText.length <= 2 ? 'Type at least 3 characters to search' : 'No results found'}
                    </Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    marginTop: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDivider,
  },
  backButton: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textDark,
  },
  googleBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  poweredByText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  googleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4285F4',
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDivider,
  },
  locationIcon: {
    marginRight: 15,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textDark,
    marginBottom: 4,
  },
  cityDetails: {
    fontSize: 14,
    color: colors.textMuted,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

