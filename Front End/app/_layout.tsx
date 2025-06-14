import { UserContext, UserProvider } from '@/context/userContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Link } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useContext } from 'react';
import { StyleSheet } from 'react-native';
import 'react-native-gesture-handler'
import { GestureHandlerRootView, Pressable } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <UserProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <Drawer>
            <Drawer.Screen name="index" options={{
              title: "Home",
              drawerIcon: ({ color, size }) => (
                <FontAwesome name="home" size={size} color={color} />
              ),
              headerTitle: "NUSpots",
              headerRight: () => {
                const { user } = useContext(UserContext)!
                return (
                  <Link href={user.username ? '/profile' : '/login'} asChild style={styles.profileContainer}>
                    <Pressable>
                      <FontAwesome name="user-circle-o" size={35} />
                    </Pressable>
                  </Link>

                )
              }
            }}></Drawer.Screen>

            <Drawer.Screen name="pricing" options={{
              title: "Pricing Information",
              drawerIcon: ({ color, size }) => (
                <FontAwesome name="money" size={size} color={color} />
              ),
              headerTitle: "Pricing",
              headerRight: () => {
                const { user } = useContext(UserContext)!
                return (
                  <Link href={user.username ? '/profile' : '/login'} asChild style={styles.profileContainer}>
                    <Pressable>
                      <FontAwesome name="user-circle-o" size={28} />
                    </Pressable>
                  </Link>

                )
              }
            }}></Drawer.Screen>

            <Drawer.Screen name="calculator" options={{
              title: "Fee Calculator",
              drawerIcon: ({ color, size }) => (
                <FontAwesome name="calculator" size={size} color={color} />
              ),
              headerTitle: "Calculator",
              headerRight: () => {
                const { user } = useContext(UserContext)!
                return (
                  <Link href={user.username ? '/profile' : '/login'} asChild style={styles.profileContainer}>
                    <Pressable>
                      <FontAwesome name="user-circle-o" size={28} />
                    </Pressable>
                  </Link>

                )
              }
            }}></Drawer.Screen>

            <Drawer.Screen name="digitalpermits" options={{
              title: "Digital Permits",
              drawerIcon: ({ color, size }) => (
                <FontAwesome name="id-card" size={size} color={color} />
              ),
              headerTitle: "Digital Permits",
              headerRight: () => {
                const { user } = useContext(UserContext)!
                return (
                  <Link href={user.username ? '/profile' : '/login'} asChild style={styles.profileContainer}>
                    <Pressable>
                      <FontAwesome name="user-circle-o" size={28} />
                    </Pressable>
                  </Link>

                )
              }
            }}></Drawer.Screen>


            <Drawer.Screen
              name="login"
              options={{
                headerShown: false,
                drawerItemStyle: { display: 'none' }
              }} />

            <Drawer.Screen
              name="profile"
              options={{
                drawerItemStyle: { display: 'none' }
              }}>
            </Drawer.Screen>
          </Drawer>
        </BottomSheetModalProvider>

      </GestureHandlerRootView>
    </UserProvider>
  )

}

const styles = StyleSheet.create({
  profileContainer: {
    padding: 12.5
  }


})