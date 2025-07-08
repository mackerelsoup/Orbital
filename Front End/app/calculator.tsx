import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import carparks from '../assets/carparks.json';

export default function CalculatorScreen() {
  const [carparkId, setCarparkId] = useState<number>(carparks[0].id);
  const [carparkLabel, setCarparkLabel] = useState<string>(carparks[0].name);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [duration, setDuration] = useState<number | null>(60);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fee, setFee] = useState<number | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const selectorRef = React.useRef<any>(null);


  const formatTime = (date: Date) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[date.getMonth()]} ${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // android
  const showAndroidDatePicker = () => {
    DateTimePickerAndroid.open({
      value: startTime,
      mode: 'date',
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
          const updatedDate = new Date(selectedDate);
          DateTimePickerAndroid.open({ 
            value: updatedDate,
            mode: 'time',
            is24Hour: true,
            onChange: (event2, selectedTime) => {
              if (event2.type === 'set' && selectedTime) {
                updatedDate.setHours(selectedTime.getHours());
                updatedDate.setMinutes(selectedTime.getMinutes());
                setStartTime(updatedDate);
              }
            },
          });
        }
      },
    });
  };

  // ios
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };


  const calculateFee = () => {
    if (duration === null || isNaN(duration)) {
      Alert.alert("No Duration", "Please enter a duration");
      return;
    }

    if (duration <= 0) {
      Alert.alert("Invalid Duration", "Duration must be greater than 10 minutes");
      return;
    }

    if (duration <= 10){
      Alert.alert("All carparks have a grace period of 10 minutes")
      setFee(0);
      return;
    }

    const selected = carparks.find(cp => cp.id === carparkId);
    if (!selected || !selected.pricing || !selected.pricing.rate_per_minute) {
      setFee(null);
      return;
    }

    const rate = selected.pricing.rate_per_minute;
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);
    const day = start.getDay();
    const isWeekday = day >= 1 && day <= 5;
    const isSaturday = day === 6;
    const isSunday = day === 0;
    const isSpecialLot = selected.name.includes("CP3:") || selected.name.includes("CP10B");
    const isVacationLot = selected.name.includes("CP4/4A:") || selected.name.includes("CP5:") || selected.name.includes("Stephen");

    let charge = 0;
    let cappedMinutes = 0;

    let cursor = new Date(start);
    // loop to calculate fees minute by minute based on existing conditions
    while (cursor < end) {
      const hour = cursor.getHours();
      const minute = cursor.getMinutes();
      const timeInt = hour * 100 + minute;
      const currentDay = cursor.getDay();
      const isCurrentWeekday = currentDay >= 1 && currentDay <= 5;
      const isCurrentSaturday = currentDay === 6;
      const isCurrentSunday = currentDay === 0;
      const isVacationMonth = cursor.getMonth() + 1 === 6 || cursor.getMonth() + 1 === 7 || cursor.getMonth() + 1 === 12;
      const isVacationTime = cursor.getHours() == 12 || cursor.getHours() == 13;

      if (isCurrentSunday) {
        // nothing since parking is free on sundays
      } else if (isCurrentSaturday) {
        if (isVacationLot && isVacationMonth && isVacationTime) {
          // nothing since vacation period
        } else if (timeInt >= 830 && timeInt < 1700) {
          charge += rate;
        }
      } else if (isCurrentWeekday) {
        const isFreeTime = timeInt < 830 || timeInt >= 1930;
        if (isFreeTime) {
          // nothing since it is outside parking charge hours
        } else if (isVacationLot && isVacationMonth && isVacationTime) {
          // nothing since vacation period
        } else if (isRegistered && isSpecialLot) {
          if (timeInt > 1800 && timeInt < 1930) {
            charge += rate;
          } else if (timeInt >= 831 && timeInt < 1800) {
            cappedMinutes += 1;
          }
        } else {
          charge += rate;
        }
      }

      cursor = new Date(cursor.getTime() + 60000);
    }

    if (cappedMinutes > 0) {
      charge += Math.min(rate * cappedMinutes, 2.568);
    }

    setFee(Math.floor(charge * 100) / 100);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <FontAwesome name="calculator" size={28} color="#6366F1" style={styles.headerIcon} />
            <Text style={styles.heading}>Parking Calculator</Text>
          </View>

          {/* Main Content Card */}
          <View style={styles.card}>
            {/* Carpark Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <FontAwesome name="map-marker" size={14} color="#6B7280" />  Carpark Location
              </Text>
              <ModalSelector
                ref={selectorRef}
                data={carparks.map(cp => ({ key: cp.id, label: cp.name }))}
                onChange={(option) => {
                  setCarparkId(option.key);
                  setCarparkLabel(option.label);
                }}
                style={styles.selectorContainer}
                selectStyle={styles.selector}
                optionTextStyle={styles.modalOption}
                cancelStyle={styles.cancelButton}
                cancelTextStyle={styles.cancelText}
                customSelector={
                  <TouchableOpacity
                    style={styles.selector}
                    onPress={() => selectorRef.current.open()}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        { color: carparkLabel ? '#2563EB' : '#9CA3AF' }
                      ]}
                    >
                      {carparkLabel || 'Select a carpark'}
                    </Text>
                  </TouchableOpacity>
                }
              />
            </View>

            {/* Registered or not Switch */}
            <View style={styles.inputGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>
                  <FontAwesome name="id-card" size={14} color="#6B7280" />  Registered Vehicle
                </Text>
                <Switch 
                  value={isRegistered} 
                  onValueChange={setIsRegistered}
                  trackColor={{ false: '#E5E7EB', true: '#A78BFA' }}
                  thumbColor={isRegistered ? '#6366F1' : '#F3F4F6'}
                />
              </View>
            </View>

            {/* Start Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <FontAwesome name="clock-o" size={14} color="#6B7280" />  Start Time
              </Text>
              <TouchableOpacity 
                style={styles.timeButton} 
                onPress={Platform.OS === 'ios' ? toggleDatePicker : showAndroidDatePicker} // Use platform-specific handler
              >
                <Text style={styles.timeButtonText}>{formatTime(startTime)}</Text>
                <FontAwesome name="calendar" size={16} color="#6366F1" />
              </TouchableOpacity>
              
              {showDatePicker && Platform.OS === 'ios' && ( // Only render for iOS when showDatePicker is true
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.datePickerTitle}>Select Date & Time</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={toggleDatePicker}
                    >
                      <FontAwesome name="times" size={18} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.datePickerWrapper}>
                    <DateTimePicker
                      value={startTime}
                      mode="datetime"
                      display="compact" 
                      onChange={(e, date) => {
                        if (e.type === 'dismissed' ) {
                          setShowDatePicker(false);
                          return;
                        }
                        if (date) {
                          setStartTime(date);
                        }
                      }}
                      style={styles.datePicker}
                    />
                  </View>
                  <TouchableOpacity 
                    style={styles.doneButton}
                    onPress={toggleDatePicker}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Duration */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <FontAwesome name="hourglass-half" size={14} color="#6B7280" />  Duration (minutes)
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                returnKeyType="done"
                blurOnSubmit={true}
                value={duration?.toString() ?? ''}
                onChangeText={(text) => setDuration(text === '' ? null : Number(text))}
                onSubmitEditing={() => Keyboard.dismiss()}
                placeholder="Enter duration"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Calculate Button */}
            <TouchableOpacity style={styles.calculateButton} onPress={calculateFee}>
              <FontAwesome name="calculator" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.calculateButtonText}>Calculate Fee</Text>
            </TouchableOpacity>

            {/* Result */}
            {fee !== null && (
              <View style={styles.resultCard}>
                <FontAwesome name="dollar" size={20} color="#10B981" style={styles.resultIcon} />
                <Text style={styles.resultText}>Estimated Fee: ${fee.toFixed(2)}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 10,
  },
  headerIcon: {
    marginRight: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  selectorContainer: {
    marginBottom: 0,
  },
  selector: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  selectorText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    lineHeight: 20,
    flexShrink: 1,
    textAlign: 'left',
  },
  modalOption: {
    fontSize: 16,
    paddingVertical: 12,
    color: '#374151',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  cancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeButton: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  datePickerContainer: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    width: '100%',
    alignSelf: 'center',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  closeButton: {
    padding: 4,
  },
  datePickerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  datePicker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 200 : 'auto',
  },
  doneButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: 12,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
  },
  calculateButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultIcon: {
    marginRight: 8,
  },
  resultText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
  },
});