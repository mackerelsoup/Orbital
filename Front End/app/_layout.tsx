import { GestureHandlerRootView, Pressable } from 'react-native-gesture-handler';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Drawer } from 'expo-router/drawer';
import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { UserContext, UserProvider } from '@/context/userContext';
import { useContext } from 'react';

export default function RootLayout() {
  return (
    <UserProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer>
          <Drawer.Screen name="index" options={{
            title: "Home",
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

          <Drawer.Screen
            name="login"
            options={{
              headerShown: false,
              drawerItemStyle: {display: 'none'}
            }} />

          <Drawer.Screen
            name= "profile"
            options= {{
            drawerItemStyle : {display: 'none'}
          }}>
          </Drawer.Screen>

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
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
    </UserProvider>
  )

}

const styles = StyleSheet.create({
  profileContainer: {
    padding: 12.5
  }


})
