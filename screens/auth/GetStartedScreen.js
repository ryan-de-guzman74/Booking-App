import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
} from 'react-native';
import { colors } from '../../theme/colors';
import Page1MakeDifference from './getstarted/Page1MakeDifference';
import Page2InstantBookings from './getstarted/Page2InstantBookings';
import Page3Paycheck from './getstarted/Page3Paycheck';
import Page4BeYourOwnBoss from './getstarted/Page4BeYourOwnBoss';

const { width: screenWidth } = Dimensions.get('window');

const getStartedPages = [
  { id: '1', component: Page1MakeDifference },
  { id: '2', component: Page2InstantBookings },
  { id: '3', component: Page3Paycheck },
  { id: '4', component: Page4BeYourOwnBoss },
];

export default function GetStartedScreen({ navigation }) {
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef(null);

  const handleSkip = () => {
    navigation.navigate('Welcome');
  };

  const handleGetStarted = () => {
    if (currentPage === getStartedPages.length - 1) {
      navigation.navigate('Welcome');
    } else {
      const nextPage = currentPage + 1;
      if (nextPage < getStartedPages.length) {
        flatListRef.current?.scrollToIndex({ index: nextPage, animated: true });
        setCurrentPage(nextPage);
      }
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      flatListRef.current?.scrollToIndex({ index: prevPage, animated: true });
      setCurrentPage(prevPage);
    }
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setCurrentPage(index);
  };

  const renderPage = ({ item, index }) => {
    const PageComponent = item.component;
    // Only pass onBack to pages 2-4 (index 1-3)
    if (index > 0) {
      return <PageComponent onSkip={handleSkip} onBack={handleBack} />;
    }
    return <PageComponent onSkip={handleSkip} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        ref={flatListRef}
        data={getStartedPages}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScroll}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <View style={styles.indicatorsContainer}>
          {getStartedPages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentPage && styles.indicatorActive,
                index < getStartedPages.length - 1 && styles.indicatorSpacing,
              ]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedText}>
            {currentPage === getStartedPages.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 20,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  indicatorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  indicatorSpacing: {
    marginRight: 6,
  },
  indicatorActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textLight,
  },
  getStartedButton: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 28,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});

