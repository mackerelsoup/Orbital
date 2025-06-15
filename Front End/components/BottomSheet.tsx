import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet"
import Button from './Button'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

type bottomSheetProps = {
  ref: React.RefObject<ActionSheetRef|null>
  onSelect: (option : string) => void;
}

export default function sheet({ref, onSelect}: bottomSheetProps) {
  return (
    <ActionSheet ref = {ref}>
      <Button
      label= "Distance"
      onPress={() => onSelect("distance")}
      />
      <Button
      label= "Availibility"
      onPress={() => onSelect("availibility")}
      />
      
      
    </ActionSheet>
  )
}

const styles = StyleSheet.create({})