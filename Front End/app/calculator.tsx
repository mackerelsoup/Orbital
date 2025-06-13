import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Button, Platform, StyleSheet, Switch, Text, View } from 'react-native';
import carparks from '../assets/carparks.json';

export default function CalculatorScreen() {
  const [carparkId, setCarparkId] = useState<number>(carparks[0].id);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [fee, setFee] = useState<number | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  const calculateFee = () => {
    const selected = carparks.find(cp => cp.id === carparkId);
    if (!selected || !selected.pricing || !selected.pricing.rate_per_minute) {
      setFee(null);
      return;
    }

    const rate = selected.pricing.rate_per_minute;
    const day = startTime.getDay(); // 1 = Monday, ..., 5 = Friday
    const isWeekday = day >= 1 && day <= 5;

    let charge = 0;
    const intervals: { start: number; end: number }[] = [];
    let cursor = new Date(startTime);

    while (cursor < endTime) {
      const next = new Date(cursor);
      next.setMinutes(cursor.getMinutes() + 1);
      if (next > endTime) break;

      const hour = cursor.getHours();
      const minute = cursor.getMinutes();
      const timeInt = hour * 100 + minute;

      if (
        isRegistered &&
        isWeekday &&
        (selected.name.includes("CP 3") || selected.name.includes("CP10B"))
      ) {
        // Cap zone: 0830 to 1800
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
      <Picker
        selectedValue={carparkId}
        onValueChange={(itemValue) => setCarparkId(itemValue)}>
        {carparks.map(cp => (
          <Picker.Item key={cp.id} label={cp.name} value={cp.id} />
        ))}
      </Picker>

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Registered Vehicle?</Text>
        <Switch value={isRegistered} onValueChange={setIsRegistered} />
      </View>

      <Text style={styles.label}>Start Time</Text>
      <Button title={startTime.toLocaleString()} onPress={() => setShowStart(true)} />
      {showStart && (
        <DateTimePicker
          value={startTime}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(e, date) => {
            setShowStart(false);
            if (date) setStartTime(date);
          }}
        />
      )}

      <Text style={styles.label}>End Time</Text>
      <Button title={endTime.toLocaleString()} onPress={() => setShowEnd(true)} />
      {showEnd && (
        <DateTimePicker
          value={endTime}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(e, date) => {
            setShowEnd(false);
            if (date) setEndTime(date);
          }}
        />
      )}

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
});