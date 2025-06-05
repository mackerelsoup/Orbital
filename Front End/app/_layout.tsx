import { GestureHandlerRootView, Pressable } from 'react-native-gesture-handler';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Drawer } from 'expo-router/drawer';
import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <Drawer>
      <Drawer.Screen name="index" options={{
        title: "Home",
        headerTitle: "NUSpots",
        headerRight: () => (
          <Link href='/login' asChild style={styles.profileContainer}>
            <Pressable>
              <FontAwesome name="user-circle-o" size={28} />
            </Pressable>
          </Link>

        )
      }}></Drawer.Screen>

      <Drawer.Screen 
        name="login" 
        options={{
          headerShown: false,
      }} />


    </Drawer>
  </GestureHandlerRootView>
  )

}

const styles = StyleSheet.create({
  profileContainer: {
    paddingRight: 16.2,
    paddingTop: 8,
  }


})
