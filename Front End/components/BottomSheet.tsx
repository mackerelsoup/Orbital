import React, { useMemo, forwardRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import Button from './Button';

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
      >
        <BottomSheetView 
        style={styles.contentContainer}
        >
          <Button
            label="Distance"
            onPress={() => onSelect("distance")}
          />
          <Button
            label="Availibility"
            onPress={() => onSelect("availability")}
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
