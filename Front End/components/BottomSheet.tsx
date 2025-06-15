import React, { useMemo, forwardRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import Button from './Button';

type CustomBottomSheetProps = {
  onSelect: (option: string) => void;
};

const CustomBottomSheet = forwardRef<BottomSheetModal, CustomBottomSheetProps>(
  ({ onSelect }, ref) => {
    const snapPoints = useMemo(() => ['50%'], []);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Button
            label="Distance"
            onPress={() => onSelect("distance")}
          />
          <Button
            label="Availibility"
            onPress={() => onSelect("availibility")}
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default CustomBottomSheet;

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    gap: 12,
  },
});
