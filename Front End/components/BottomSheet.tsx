import React, { forwardRef } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';

type CustomBottomSheetProps = {
  onSelect: (option: string) => void;
};

const CustomBottomSheet = forwardRef<BottomSheetModal, CustomBottomSheetProps>(
  ({ onSelect }, ref) => {
    return (
      <BottomSheetModal
        ref={ref}
        index={1}
        snapPoints={[250, 500]}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Pressable
            onPress={() => onSelect("Distance")}
            style={({ pressed }) => [
              styles.optionButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.optionText}>Distance</Text>
          </Pressable>
          <Pressable
            onPress={() => onSelect("Availability")}
            style={({ pressed }) => [
              styles.optionButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.optionText}>Availability</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default CustomBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#fff',
  },
  handleIndicator: {
    backgroundColor: '#ccc',
    width: 40,
  },
  contentContainer: {
    padding: 20,
    gap: 16,
  },
  optionButton: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pressed: {
    backgroundColor: '#e0e0e0',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
