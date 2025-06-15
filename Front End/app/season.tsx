import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function TestScreen() {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = ['25%', '50%'];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Pressable
          onPress={() => {
            console.log('Button pressed - attempting to open sheet');
            sheetRef.current?.present();
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Show Bottom Sheet</Text>
        </Pressable>

        <BottomSheetModal
          ref={sheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={styles.sheetHandle}
        >
          <View style={styles.sheetContent}>
            <Text style={styles.sheetText}>Bottom Sheet Content</Text>
            <Pressable
              onPress={() => sheetRef.current?.dismiss()}
              style={[styles.button, { marginTop: 20 }]}
            >
              <Text style={styles.buttonText}>Close Sheet</Text>
            </Pressable>
          </View>
        </BottomSheetModal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  button: {
    padding: 20,
    backgroundColor: 'blue',
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  sheetBackground: {
    backgroundColor: 'white',
    borderRadius: 20,
  },
  sheetHandle: {
    backgroundColor: 'gray',
    width: 40,
    height: 6,
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 3,
  },
  sheetContent: {
    padding: 20,
    alignItems: 'center',
  },
  sheetText: {
    fontSize: 18,
    marginBottom: 20,
  },
});