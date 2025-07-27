import { StyleProp, StyleSheet, Text, View } from 'react-native'
import React, {useState} from 'react'
import { Dropdown } from 'react-native-element-dropdown'
import { DropdownProps } from 'react-native-element-dropdown/lib/typescript/components/Dropdown/model'

type dropdownData = {
  label: any;
  value: any;
}

type customDropdownProps = {
  data: dropdownData[]
  handleChange: (item: dropdownData) => void
}

export default function CustomDropdown( {data, handleChange} : customDropdownProps) {
  const [isFocus, setIsFocus] = useState(false)
  const [placeholderText, setPlaceholderText] = useState<string>("Select Item")
  return (
    <View>
      <Dropdown
        testID='custom-dropdown'
        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
        containerStyle= {{padding: 10}}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? placeholderText : '...'}
        searchPlaceholder="Search..."
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item : dropdownData) => {
          handleChange(item)
          setPlaceholderText(String(item.value))
          console.log(item.value)
          setIsFocus(false);
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  labelT: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 10,
    top: -10,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#F9FAFB'
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#9CA3AF'
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
})