import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type TimeRange = 'Hour' | '6hr' | 'Day' | 'Month' | 'Year';

type Props = {
  selected: TimeRange;
  onSelect: (range: TimeRange) => void;
};

const ranges: TimeRange[] = ['Hour', '6hr', 'Day', 'Month', 'Year'];

export default function TimeRangeSelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {ranges.map((range) => (
        <Pressable
          key={range}
          onPress={() => onSelect(range)}
          style={[
            styles.button,
            selected === range && styles.selectedButton
          ]}
        >
          <Text
            style={[
              styles.text,
              selected === range && styles.selectedText
            ]}
          >
            {range}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    justifyContent:'center'
  },
  button: {
    paddingVertical: 8,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedButton: {
    backgroundColor: '#007bff',
  },
  text: {
    color: '#333',
    fontWeight: '500',
    
  },
  selectedText: {
    color: 'white',
  },
});
