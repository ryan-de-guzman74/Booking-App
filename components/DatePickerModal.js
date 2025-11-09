import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function DatePickerModal({ visible, onCancel, onConfirm, initialDate }) {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const formatSelectedDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()].substring(0, 3);
    const day = date.getDate();
    return `${dayName}, ${monthName} ${day}`;
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    onConfirm(selectedDate);
  };

  const handleYearSelect = (year) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setShowYearPicker(false);
  };

  const handleMonthSelect = (monthIndex) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setShowMonthPicker(false);
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 100; year--) {
      years.push(year);
    }
    return years;
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }
    
    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = 
        day === selectedDate.getDate() &&
        month === selectedDate.getMonth() &&
        year === selectedDate.getFullYear();
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[styles.dayCell, isSelected && styles.selectedDay]}
          onPress={() => handleDateSelect(day)}
        >
          <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerLabel}>SELECT DATE</Text>
            <View style={styles.selectedDateContainer}>
              <Text style={styles.selectedDateText}>{formatSelectedDate(selectedDate)}</Text>
              <Ionicons name="pencil" size={18} color={colors.textLight} />
            </View>
          </View>

          {/* Calendar */}
          <View style={styles.calendar}>
            {/* Month/Year Navigation */}
          <View style={styles.monthYearRow}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
              <Ionicons name="chevron-back" size={22} color={colors.textDark} />
            </TouchableOpacity>
            <View style={styles.monthYearCenter}>
              <TouchableOpacity
                onPress={() => {
                  setShowMonthPicker(!showMonthPicker);
                  setShowYearPicker(false);
                }}
                style={styles.monthYearButton}
                activeOpacity={0.8}
              >
                <Text style={styles.monthYearText}>
                  {months[currentDate.getMonth()]}
                </Text>
                <Ionicons
                  name={showMonthPicker ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textDark}
                  style={styles.monthYearChevron}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowYearPicker(!showYearPicker);
                  setShowMonthPicker(false);
                }}
                style={styles.monthYearButton}
                activeOpacity={0.8}
              >
                <Text style={styles.monthYearText}>
                  {currentDate.getFullYear()}
                </Text>
                <Ionicons
                  name={showYearPicker ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textDark}
                  style={styles.monthYearChevron}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={22} color={colors.textDark} />
            </TouchableOpacity>
          </View>

            {/* Year Picker */}
            {showYearPicker && (
              <ScrollView 
                style={styles.pickerContainer}
                showsVerticalScrollIndicator={false}
              >
                {generateYears().map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.pickerItem,
                      year === currentDate.getFullYear() && styles.pickerItemSelected
                    ]}
                    onPress={() => handleYearSelect(year)}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      year === currentDate.getFullYear() && styles.pickerItemTextSelected
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Month Picker */}
            {showMonthPicker && (
              <ScrollView 
                style={styles.pickerContainer}
                showsVerticalScrollIndicator={false}
              >
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pickerItem,
                      index === currentDate.getMonth() && styles.pickerItemSelected
                    ]}
                    onPress={() => handleMonthSelect(index)}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      index === currentDate.getMonth() && styles.pickerItemTextSelected
                    ]}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Days of Week */}
            {!showYearPicker && !showMonthPicker && (
              <>
                <View style={styles.daysOfWeekRow}>
                  {daysOfWeek.map((day, index) => (
                    <View key={index} style={styles.dayOfWeekCell}>
                      <Text style={styles.dayOfWeekText}>{day}</Text>
                    </View>
                  ))}
                </View>

                {/* Calendar Grid */}
                <View style={styles.calendarGrid}>
                  {renderCalendar()}
                </View>
              </>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={styles.actionButton}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.actionButton}>
              <Text style={styles.okText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: screenWidth * 0.9,
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
  },
  headerLabel: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedDateText: {
    color: colors.textLight,
    fontSize: 24,
    fontWeight: '700',
  },
  calendar: {
    padding: 20,
  },
  monthYearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  monthYearCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  monthYearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
  },
  monthYearChevron: {
    marginLeft: 6,
  },
  pickerContainer: {
    maxHeight: 250,
    marginVertical: 10,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  pickerItemText: {
    fontSize: 16,
    color: colors.textDark,
  },
  pickerItemTextSelected: {
    color: colors.textLight,
    fontWeight: '700',
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayOfWeekCell: {
    width: (screenWidth * 0.9 - 40) / 7,
    alignItems: 'center',
    paddingVertical: 5,
  },
  dayOfWeekText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (screenWidth * 0.9 - 40) / 7,
    height: (screenWidth * 0.9 - 40) / 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDay: {
    backgroundColor: colors.primary,
    borderRadius: (screenWidth * 0.9 - 40) / 14,
  },
  dayText: {
    fontSize: 14,
    color: colors.textDark,
  },
  selectedDayText: {
    color: colors.textLight,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: colors.borderDivider,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  okText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

