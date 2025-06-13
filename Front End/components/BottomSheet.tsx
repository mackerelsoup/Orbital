import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet"
import Button from './Button'

type bottomSheetProps = {
  ref: React.RefObject<ActionSheetRef|null>
  onSelect: (option : string) => void;
}

export default function BottomSheet({ref, onSelect}: bottomSheetProps) {
  return (
    <ActionSheet ref = {ref}>
      <Button
      label= "Season Parking"
      onPress={() => onSelect("season_parking")}
      />
      <Button
      label= "Can Park"
      onPress={() => onSelect("can_park")}
      />
    </ActionSheet>
  )
}

const styles = StyleSheet.create({})