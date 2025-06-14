import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Alert, Button, Keyboard, Platform, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import carparks from '../assets/carparks.json';

export default function CalculatorScreen() {
  const [carparkId, setCarparkId] = useState<number>(carparks[0].id);
  const [carparkLabel, setCarparkLabel] = useState<string>(carparks[0].name);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [duration, setDuration] = useState<number>(60);
  const [showStart, setShowStart] = useState(false);
  const [fee, setFee] = useState<number | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  const formatTime = (date: Date) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[date.getMonth()]} ${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const calculateFee = () => {
    if (duration <= 0) {
      Alert.alert("Invalid Duration", "Duration must be greater than 0.");
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

    let charge = 0;
    const intervals = [];
    let cursor = new Date(start);

    while (cursor < end) {
      const next = new Date(cursor);
      next.setMinutes(cursor.getMinutes() + 1);
      if (next > end) break;

      const hour = cursor.getHours();
      const minute = cursor.getMinutes();
      const timeInt = hour * 100 + minute;

      if (isWeekday && timeInt > 1930) {
        cursor = next;
        continue;
      }

      if (
        isRegistered &&
        isWeekday &&
        (selected.name.includes("CP3: University") || selected.name.includes("CP10B"))
      ) {
        if (timeInt >= 830 && timeInt <= 1800) {
          intervals.push({ start: cursor.getTime(), end: next.getTime() });
        } else if (timeInt > 1800 && timeInt <= 1930) {
          charge += rate;
        }
      } else {
        charge += rate;
      }

      cursor = next;
    }

    if (intervals.length > 0) {
      const cappedMinutes = intervals.length;
      const cappedCharge = Math.min(rate * cappedMinutes, 2.568);
      charge += cappedCharge;
    }

    setFee(+charge.toFixed(4));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Parking Fee Calculator</Text>

      <Text style={styles.label}>Select Carpark</Text>
      <ModalSelector
        data={carparks.map(cp => ({ key: cp.id, label: cp.name }))}
        initValue={carparkLabel}
        onChange={(option) => {
          setCarparkId(option.key);
          setCarparkLabel(option.label);
        }}
        style={styles.modal}
        optionTextStyle={styles.modalOption}
        initValueTextStyle={styles.modalText}
        selectTextStyle={styles.modalText}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Registered Vehicle?</Text>
        <View style={{ marginLeft: 10 }}>
          <Switch value={isRegistered} onValueChange={setIsRegistered} />
        </View>
      </View>

      <Text style={styles.label}>Start Time</Text>
      <View style={styles.rowBetween}>
        <Button title={formatTime(startTime)} onPress={() => setShowStart(true)} />
        {showStart && (
          <TouchableOpacity onPress={() => setShowStart(false)}>
            <FontAwesome name="times-circle" size={24} color="gray" />
          </TouchableOpacity>
        )}
      </View>
      {showStart && (
        <DateTimePicker
          value={startTime}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(e, date) => {
            if (date) setStartTime(date);
          }}
        />
      )}

      <Text style={styles.label}>Duration (minutes)</Text>
      <View style={styles.rowBetween}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          returnKeyType="done"
          blurOnSubmit={true}
          value={duration.toString()}
          onChangeText={(text) => setDuration(Number(text))}
          onSubmitEditing={() => Keyboard.dismiss()}
        />
      </View>

      <View style={{ marginVertical: 10 }}>
        <Button title="Calculate Fee" onPress={calculateFee} />
      </View>

      {fee !== null && (
        <Text style={styles.result}>Estimated Fee: ${fee.toFixed(4)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label: { marginTop: 10, marginBottom: 4, fontWeight: '600' },
  result: { marginTop: 20, fontSize: 18, fontWeight: 'bold', color: 'green' },
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 10, borderRadius: 5, flex: 1 },
  modal: { marginBottom: 10 },
  modalText: { fontSize: 18, fontWeight: '500', color: '#007AFF' },
  modalOption: { fontSize: 20 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }
});
