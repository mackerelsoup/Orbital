import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import React, { useContext, useLayoutEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import carparks from '../assets/carparks.json';
import { PUBLIC_HOLIDAYS } from '../assets/publicHolidays';
import { UserContext } from '@/context/userContext';
import { Link, useNavigation } from 'expo-router';
import ProfileAvatar from '@/components/ProfileAvatar';

interface FeeBreakdownItem {
  period: string;
  minutes: number;
  rate: number;
  amount: number;
  description: string;
}

interface FeeBreakdown {
  items: FeeBreakdownItem[];
  totalMinutes: number;
  totalAmount: number;
  cappedAmount?: number;
  freeMinutes: number;
  chargedMinutes: number;
}

export default function CalculatorScreen() {
  const [carparkId, setCarparkId] = useState<number>(carparks[0].id);
  const [carparkLabel, setCarparkLabel] = useState<string>(carparks[0].name);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [duration, setDuration] = useState<number | null>(60);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fee, setFee] = useState<number | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdown | null>(null);
  const selectorRef = React.useRef<any>(null);
  const navigation = useNavigation()
  const { user } = useContext(UserContext)!

  const formatTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  };

  const formatTimeOnly = (date: Date) => {
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  };

  const getDayName = (dayNum: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayNum];
  };

  // android
  const showAndroidDatePicker = () => {
    DateTimePickerAndroid.open({
      value: startTime,
      mode: "date",
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          const updatedDate = new Date(selectedDate);
          DateTimePickerAndroid.open({
            value: updatedDate,
            mode: "time",
            is24Hour: true,
            onChange: (event2, selectedTime) => {
              if (event2.type === "set" && selectedTime) {
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

    if (duration <= 10) {
      Alert.alert("All carparks have a grace period of 10 minutes")
      setFee(0);
      setFeeBreakdown({
        items: [],
        totalMinutes: duration,
        totalAmount: 0,
        freeMinutes: duration,
        chargedMinutes: 0
      });
      return;
    }

    if (duration > 99999999) {
      Alert.alert("Duration too large", "Please enter a smaller number");
      return;
    }

    const selected = carparks.find(cp => cp.id === carparkId);
    if (!selected || !selected.pricing || !selected.pricing.rate_per_minute) {
      setFee(null);
      setFeeBreakdown(null);
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
    let freeMinutes = 0;
    let chargedMinutes = 0;
    const breakdownItems: FeeBreakdownItem[] = [];

    // track periods for breakdown
    let currentPeriod = {
      start: new Date(start),
      minutes: 0,
      rate: rate,
      amount: 0,
      description: "",
      isFree: false,
      isCapped: false
    };

    const addBreakdownItem = () => {
      if (currentPeriod.minutes > 0) {
        breakdownItems.push({
          period: `${formatTimeOnly(currentPeriod.start)} - ${formatTimeOnly(new Date(currentPeriod.start.getTime() + currentPeriod.minutes * 60000))} (${getDayName(currentPeriod.start.getDay())})`,
          minutes: currentPeriod.minutes,
          rate: currentPeriod.isFree ? 0 : currentPeriod.rate,
          amount: currentPeriod.isFree ? 0 : (currentPeriod.isCapped ? Math.min(currentPeriod.amount, 2.568) : currentPeriod.amount),
          description: currentPeriod.description
        });
      }
    };

    let cursor = new Date(start);
    let lastDescription = "";

    // grace period
    let graceMinutes = 0;
    if (duration <= 10) {
      graceMinutes = duration;
    }

    // loop to calculate fees minute by minute based on existing conditions
    while (cursor < end) {
      const hour = cursor.getHours();
      const minute = cursor.getMinutes();
      const timeInt = hour * 100 + minute;
      const currentDay = cursor.getDay();
      const currentMonth = cursor.getMonth() + 1;
      const isCurrentWeekday = currentDay >= 1 && currentDay <= 5;
      const isCurrentSaturday = currentDay === 6;
      const isCurrentSunday = currentDay === 0;
      const isVacationMonth = currentMonth === 6 || currentMonth === 7 || currentMonth === 12;
      const isVacationTime = cursor.getHours() == 12 || cursor.getHours() == 13;
      const fullDate = cursor.getFullYear().toString() + "-" + currentMonth + "-" + cursor.getDate().toString();
      const isHoliday = PUBLIC_HOLIDAYS.includes(fullDate);

      let currentDescription = "";
      let isFree = false;
      let isCapped = false;
      let shouldCharge = false;

      if (charge >= 1000) {
        break;
      }

      if (isCurrentSunday || isHoliday) {
        currentDescription = isHoliday ? "Public Holiday" : "Sunday";
        isFree = true;
        freeMinutes++;
      } else if (isCurrentSaturday) {
        if (isVacationLot && isVacationMonth && isVacationTime) {
          currentDescription = "Vacation Period";
          isFree = true;
          freeMinutes++;
        } else if (timeInt >= 830 && timeInt < 1700) {
          currentDescription = "Saturday Charged Hours (08:30-17:00)";
          shouldCharge = true;
          chargedMinutes++;
        } else {
          currentDescription = "Saturday Off-Peak";
          isFree = true;
          freeMinutes++;
        }
      } else if (isCurrentWeekday) {
        const isFreeTime = timeInt < 830 || timeInt >= 1930;
        if (isFreeTime) {
          currentDescription = timeInt < 830 ? "Weekday Early Hours" : "Weekday Evening";
          isFree = true;
          freeMinutes++;
        } else if (isVacationLot && isVacationMonth && isVacationTime) {
          currentDescription = "Vacation Period";
          isFree = true;
          freeMinutes++;
        } else if (isRegistered && isSpecialLot) {
          if (timeInt > 1800 && timeInt < 1930) {
            currentDescription = "Weekday Evening Peak (Registered)";
            shouldCharge = true;
            chargedMinutes++;
          } else if (timeInt >= 831 && timeInt < 1800) {
            currentDescription = "Weekday Capped Hours (Registered)";
            isCapped = true;
            cappedMinutes++;
          }
        } else {
          currentDescription = "Weekday Charged Hours (08:30-19:30)";
          shouldCharge = true;
          chargedMinutes++;
        }
      }

      // check if we need to start a new period
      if (currentDescription !== lastDescription) {
        addBreakdownItem();
        currentPeriod = {
          start: new Date(cursor),
          minutes: 0,
          rate: rate,
          amount: 0,
          description: currentDescription,
          isFree: isFree,
          isCapped: isCapped
        };
        lastDescription = currentDescription;
      }

      // Add to current period
      currentPeriod.minutes++;
      if (shouldCharge) {
        charge += rate;
        currentPeriod.amount += rate;
      }

      cursor = new Date(cursor.getTime() + 60000);
    }

    // Add final period
    addBreakdownItem();

    // Add capped amount
    let cappedAmount = 0;
    if (cappedMinutes > 0) {
      cappedAmount = Math.min(rate * cappedMinutes, 2.568);
      charge += cappedAmount;

      // Add capped period to breakdown
      breakdownItems.push({
        period: "Capped Period Total",
        minutes: cappedMinutes,
        rate: rate,
        amount: cappedAmount,
        description: "Registered Vehicle Capped Rate (Max $2.568)"
      });
    }

    const finalFee = charge >= 1000 ? 999.99 : Math.floor(charge * 100) / 100;

    setFee(finalFee);
    setFeeBreakdown({
      items: breakdownItems,
      totalMinutes: duration,
      totalAmount: finalFee,
      cappedAmount: cappedAmount > 0 ? cappedAmount : undefined,
      freeMinutes: freeMinutes,
      chargedMinutes: chargedMinutes
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <ProfileAvatar />
    })
  }, [navigation])

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Main Content Card */}
          <View style={styles.card}>
            {/* Carpark Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Carpark Location
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
                        { color: carparkLabel ? "#1F2937" : "#9CA3AF" }
                      ]}
                    >
                      {carparkLabel || "Select a carpark"}
                    </Text>
                    <FontAwesome name="chevron-down" size={14} color="#6d62fe" />
                  </TouchableOpacity>
                }
              />
            </View>

            {/* Registered or not Switch */}
            <View style={styles.inputGroup}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabelContainer}>
                  <Text style={styles.label}>
                    Registered Vehicle?
                  </Text>
                </View>
                <Switch
                  value={isRegistered}
                  onValueChange={setIsRegistered}
                  trackColor={{ false: "#E5E7EB", true: "#B8B3FF" }}
                  thumbColor={isRegistered ? "#6d62fe" : "#F9FAFB"}
                  ios_backgroundColor="#E5E7EB"
                />
              </View>
            </View>

            {/* Start Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Start Time
              </Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={Platform.OS === "ios" ? toggleDatePicker : showAndroidDatePicker}
              >
                <Text style={styles.timeButtonText}>{formatTime(startTime)}</Text>
                <FontAwesome name="calendar" size={18} color="#6d62fe" />
              </TouchableOpacity>

              {showDatePicker && Platform.OS === "ios" && (
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
                        if (e.type === "dismissed") {
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
                Duration (minutes)
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                returnKeyType="done"
                blurOnSubmit={true}
                value={duration?.toString() ?? ""}
                onChangeText={(text) => {
                  if (text === "") {
                    setDuration(null);
                  } else {
                    const numValue = Number(text);
                    if (!isNaN(numValue)) {
                      setDuration(numValue);
                    }
                  }
                }}
                onSubmitEditing={() => Keyboard.dismiss()}
                placeholder="Enter duration in minutes"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Calculate Button */}
            <TouchableOpacity style={styles.calculateButton} onPress={calculateFee}>
              <View style={styles.buttonGradient}>
                <Text style={styles.calculateButtonText}>Calculate Fee</Text>
              </View>
            </TouchableOpacity>

            {/* Result */}
            {fee !== null && (
              <View style={styles.resultCard}>
                <FontAwesome name="dollar" size={20} color="#10B981" style={styles.resultIcon} />
                <Text style={styles.resultText}>Estimated Fee: ${fee.toFixed(2)}</Text>
              </View>
            )}

            {/* Breakdown Toggle */}
            {fee !== null && feeBreakdown && (
              <TouchableOpacity
                style={styles.breakdownToggle}
                onPress={() => setShowBreakdown(!showBreakdown)}
              >
                <Text style={styles.breakdownToggleText}>
                  {showBreakdown ? "Hide" : "Show"} Fee Breakdown
                </Text>
                <FontAwesome
                  name={showBreakdown ? "chevron-up" : "chevron-down"}
                  size={14}
                  color="#6d62fe"
                />
              </TouchableOpacity>
            )}

            {/* Fee Breakdown */}
            {fee !== null && feeBreakdown && showBreakdown && (
              <View style={styles.breakdownCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Duration:</Text>
                  <Text style={styles.summaryValue}>{feeBreakdown.totalMinutes} minutes</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Free Minutes:</Text>
                  <Text style={[styles.summaryValue, { color: "#10B981" }]}>
                    {feeBreakdown.freeMinutes} minutes
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Charged Minutes:</Text>
                  <Text style={[styles.summaryValue, { color: "#F59E0B" }]}>
                    {feeBreakdown.chargedMinutes} minutes
                  </Text>
                </View>

                {/* Detailed Breakdown */}
                <Text style={styles.breakdownSubtitle}>Detailed Breakdown:</Text>
                {feeBreakdown.items.map((item, index) => (
                  <View key={index} style={styles.breakdownItem}>
                    <View style={styles.breakdownItemHeader}>
                      <Text style={styles.breakdownPeriod}>{item.period}</Text>
                      {item.amount !== 0 && (
                        <Text style={styles.breakdownAmount}>${item.amount.toFixed(2)}</Text>
                      )}
                      {item.amount === 0 && (
                        <Text style={styles.freeLabel}>FREE</Text>
                      )}
                    </View>
                    <Text style={styles.breakdownDescription}>{item.description}</Text>
                    <View style={styles.breakdownDetails}>
                      <Text style={styles.breakdownDetailText}>
                        {item.minutes} min × ${item.rate.toFixed(4)}/min
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Total Fee */}
                <View style={styles.breakdownTotal}>
                  <Text style={styles.breakdownTotalLabel}>Total Fee:</Text>
                  <Text style={styles.breakdownTotalAmount}>
                    ${feeBreakdown.totalAmount.toFixed(2)}
                  </Text>
                </View>
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
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputGroup: {
    marginBottom: 28,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  selectorContainer: {
    marginBottom: 0,
  },
  selector: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#6d62fe',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectorText: {
    fontSize: 16,
    lineHeight: 20,
    flex: 1,
  },
  modalOption: {
    fontSize: 18,
    paddingVertical: 14,
    color: '#000000',
    fontWeight: '400',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  cancelText: {
    color: '#6B7280',
    fontSize: 20,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
    marginBottom: -10,
  },
  timeButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#6d62fe',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  datePickerContainer: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderColor: '#E2E8F0',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  closeButton: {
    padding: 6,
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
    backgroundColor: '#6d62fe',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginTop: 16,
    shadowColor: '#6d62fe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: '#374151',
    shadowColor: '#6d62fe',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  calculateButton: {
    borderRadius: 18,
    marginTop: 12,
    shadowColor: '#6d62fe',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonGradient: {
    backgroundColor: '#6d62fe',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.5,
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
  breakdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  breakdownToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6d62fe',
    marginRight: 8,
  },
  breakdownCard: {
    backgroundColor: '#FAFBFC',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  breakdownSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginTop: 24,
  },
  breakdownItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  breakdownItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownPeriod: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  breakdownDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  breakdownDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownDetailText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  freeLabel: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  breakdownTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#E2E8F0',
  },
  breakdownTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  breakdownTotalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
  },
  profileContainer: {
    marginRight: 2.5
  },
  profileIcon: {
    borderRadius: 75
  }
})