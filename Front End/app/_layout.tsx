import { UserContext, UserProvider } from '@/context/userContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Link, router, Stack } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useContext } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import 'react-native-gesture-handler'
import { GestureHandlerRootView, Pressable } from 'react-native-gesture-handler';
import { Host } from 'react-native-portalize';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  return (
    <UserProvider>
      <Host>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <Drawer>
              <Drawer.Screen name="index" options={{
                headerStyle: { height: 96 },
                title: "Home",
                drawerIcon: ({ color, size }) => (
                  <FontAwesome name="home" size={size} color={color} />
                ),
                headerTitle: "NUSpots",
                headerRight: () => {
                  const { user } = useContext(UserContext)!
                  return (
                    <View style={{ marginTop: Platform.OS === 'ios' ? -10 : 0, paddingRight: 8 }}>
                      <Link href={user.username ? '/profile' : '/login'} asChild style={styles.profileContainer}>
                        <Pressable>
                          <FontAwesome name="user-circle-o" size={32} testID="user-icon" />
                        </Pressable>
                      </Link>
                    </View>

                  )
                }
              }}></Drawer.Screen>

              <Drawer.Screen name="pricing" options={{
                headerStyle: { height: 96 },
                title: "Pricing Information",
                drawerIcon: ({ color, size }) => (
                  <FontAwesome name="money" size={size} color={color} />
                ),
                headerTitle: "Pricing Information",
                headerRight: () => {
                  const { user } = useContext(UserContext)!
                  return (
                    <View style={{ marginTop: Platform.OS === 'ios' ? -10 : 0, paddingRight: 8 }}>
                      <Link href={user.username ? '/profile' : '/login'} asChild style={styles.profileContainer}>
                        <Pressable>
                          <FontAwesome name="user-circle-o" size={32} />
                        </Pressable>
                      </Link>
                    </View>

                  )
                }
              }}></Drawer.Screen>

              <Drawer.Screen name="calculator" options={{
                headerStyle: { height: 96 },
                title: "Fee Calculator",
                drawerIcon: ({ color, size }) => (
                  <FontAwesome name="calculator" size={size} color={color} />
                ),
                headerTitle: "Calculator",
                headerRight: () => {
                  const { user } = useContext(UserContext)!
                  return (
                    <View style={{ marginTop: Platform.OS === 'ios' ? -10 : 0, paddingRight: 8 }}>
                      <Link href={user.username ? '/profile' : '/login'} asChild style={styles.profileContainer}>
                        <Pressable>
                          <FontAwesome name="user-circle-o" size={32} />
                        </Pressable>
                      </Link>
                    </View>

                  )
                }
              }}></Drawer.Screen>

              <Drawer.Screen name="digitalpermits" options={{
                headerStyle: { height: 96 },
                title: "Digital Permits",
                drawerIcon: ({ color, size }) => (
                  <FontAwesome name="id-card" size={size} color={color} />
                ),
                headerTitle: "Digital Permits",
                headerRight: () => {
                  const { user } = useContext(UserContext)!
                  return (
                    <View style={{ marginTop: Platform.OS === 'ios' ? -10 : 0, paddingRight: 8 }}>
                      <Link href={user.username ? '/profile' : '/login'} asChild style={styles.profileContainer}>
                        <Pressable>
                          <FontAwesome name="user-circle-o" size={32} />
                        </Pressable>
                      </Link>
                    </View>

                  )
                }
              }}></Drawer.Screen>

              <Drawer.Screen name="carparkTrendSelect" options={{
                headerStyle: { height: 96 },
                title: "Parking Trends",
                drawerIcon: ({ color, size }) => (
                  <FontAwesome name="line-chart" size={size} color={color} />
                ),
                headerTitle: "Parking Trends",
                headerRight: () => {
                  const { user } = useContext(UserContext)!
                  return (
                    <View style={{ marginTop: Platform.OS === 'ios' ? -10 : 0, paddingRight: 8 }}>
                      <Link href={user.username ? '/profile' : '/login'} asChild style={styles.profileContainer}>
                        <Pressable>
                          <FontAwesome name="user-circle-o" size={32} />
                        </Pressable>
                      </Link>
                    </View>

                  )
                }
              }}></Drawer.Screen>

              {/* others + hidden drawers */}
              <Drawer.Screen
                name="login"
                options={{
                  drawerItemStyle: { display: 'none' }
                }} />
              <Drawer.Screen
                name="profile"
                options={{
                  drawerItemStyle: { display: 'none' }
                }} />
              <Drawer.Screen
                name="capped"
                options={{
                  drawerItemStyle: { display: 'none' },
                  headerShown: false
                }} />
              <Drawer.Screen
                name="season"
                options={{
                  drawerItemStyle: { display: 'none' },
                  headerShown: false
                }} />
              <Drawer.Screen
                name="cappedForm"
                options={{
                  drawerItemStyle: { display: 'none' },
                  headerShown: false
                }} />
              <Drawer.Screen
                name="seasonForm"
                options={{
                  drawerItemStyle: { display: 'none' },
                  headerShown: false
                }} />
              <Drawer.Screen
                name="reservation"
                options={{
                  drawerItemStyle: { display: 'none' }
                }} />
              <Drawer.Screen
                name="registration"
                options={{
                  drawerItemStyle: { display: 'none' },
                  headerShown: false
                }} />
              <Drawer.Screen
                name="carparkTrend"
                options={{
                  drawerItemStyle: { display: 'none' },
                  title: "Carpark Trend"
                }} />
              <Drawer.Screen
                name="registrationSuccess"
                options={{
                  drawerItemStyle: { display: 'none' }
                }} />
              <Drawer.Screen
                name="carparkTrend/[carparkId]"
                options={{
                  drawerItemStyle: { display: 'none' }
                }} />

            </Drawer>
          </BottomSheetModalProvider>

        </GestureHandlerRootView>
      </Host>
    </UserProvider>
  )

}

const styles = StyleSheet.create({
  profileContainer: {
    padding: 12.5
  }


})