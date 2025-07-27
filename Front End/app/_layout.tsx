import { UserContext, UserProvider } from '@/context/userContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Link} from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useContext, ComponentProps } from 'react';
import { Platform, View, StyleSheet, Image } from 'react-native';
import 'react-native-gesture-handler'
import { GestureHandlerRootView, Pressable } from 'react-native-gesture-handler';
import { Host } from 'react-native-portalize';

export default function RootLayout() {


  type FontAwesomeIconName = ComponentProps<typeof FontAwesome>['name'];
  const DrawerIcon = ({ name, size, color }: { name: FontAwesomeIconName; size: number; color: string }) => (
    <View style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <FontAwesome name={name} size={size * 0.9} color={color} />
    </View>
  );


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
                  <DrawerIcon name="home" size={size} color={color} />
                ),
                headerTitle: "NUSpots",
                headerRight: () => {
                  const { user } = useContext(UserContext)!
                  return (
                    <View 
                      style={{ marginTop: Platform.OS === 'ios' ? -10 : 0, paddingRight: 8 }}
                      testID='profileIcon'
                      >
                      <Link href={user.username ? '/profile' : '/login'} asChild style={styles.profileContainer}>
                        <Pressable>
                          <Image source={{ uri: user.profile_uri }} width={40} height={40} style={styles.profileIcon} />
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
                  <DrawerIcon name="money" size={size} color={color} />
                ),
                headerTitle: "Pricing Information",
                headerRight: () => {
                  const { user } = useContext(UserContext)!
                  return (
                    <View style={{ marginTop: Platform.OS === 'ios' ? -10 : 0, paddingRight: 8 }}>
                      <Link href={user.username ? '/profile' : '/login'} asChild style={styles.profileContainer}>
                        <Pressable>
                          <Image source={{ uri: user.profile_uri }} width={40} height={40} style={styles.profileIcon} />
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
                  <DrawerIcon name="calculator" size={size} color={color} />
                ),
                headerTitle: "Calculator",
                headerRight: () => {
                  const { user } = useContext(UserContext)!
                  return (
                    <View style={{ marginTop: Platform.OS === 'ios' ? -10 : 0, paddingRight: 8 }}>
                      <Link href={user.username ? '/profile' : '/login'} asChild style={styles.profileContainer}>
                        <Pressable>
                          <Image source={{ uri: user.profile_uri }} width={40} height={40} style={styles.profileIcon} />
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
                  <DrawerIcon name="id-card" size={size} color={color} />
                ),
                headerTitle: "Digital Permits",
                headerRight: () => {
                  const { user } = useContext(UserContext)!
                  return (
                    <View style={{ marginTop: Platform.OS === 'ios' ? -10 : 0, paddingRight: 8 }}>
                      <Link href={user.username ? '/profile' : '/login'} asChild style={styles.profileContainer}>
                        <Pressable>
                          <Image source={{ uri: user.profile_uri }} width={40} height={40} style={styles.profileIcon} />
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
                  <DrawerIcon name="line-chart" size={size} color={color} />
                ),
                headerTitle: "Parking Trends",
                headerRight: () => {
                  const { user } = useContext(UserContext)!
                  return (
                    <View style={{ marginTop: Platform.OS === 'ios' ? -10 : 0, paddingRight: 8 }}>
                      <Link href={user.username ? '/profile' : '/login'} asChild style={styles.profileContainer}>
                        <Pressable>
                          <Image source={{ uri: user.profile_uri }} width={40} height={40} style={styles.profileIcon} />
                        </Pressable>
                      </Link>
                    </View>

                  )
                }
              }}></Drawer.Screen>


              <Drawer.Screen
                name="approvalSelector"
                options={{
                  title: "Approval",
                  drawerIcon: ({ color, size }) => (
                    <DrawerIcon name="check" size={size} color={color} />
                  ),
                  headerShown: false,
                }} />

              {/* others + hidden drawers */}
              <Drawer.Screen
                name="login"
                options={{
                  drawerItemStyle: { display: 'none' },
                  headerShown: false
                }} />
              <Drawer.Screen
                name="profile"
                options={{
                  headerStyle: { height: 96 },
                  title: "Profile",
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
                name="registrationSuccess"
                options={{
                  drawerItemStyle: { display: 'none' }
                }} />
              <Drawer.Screen
                name="carparkTrend/[carparkId]"
                options={{
                  drawerItemStyle: { display: 'none' }
                }} />
              <Drawer.Screen
                name="approvalInfo"
                options={{
                  drawerItemStyle: { display: 'none' },
                  headerShown: false
                }} />
              <Drawer.Screen
                name="seasonPending"
                options={{
                  title: 'Pending Approval',
                  drawerItemStyle: { display: 'none' }
                }} />
              <Drawer.Screen
                name="cappedPending"
                options={{
                  title: 'Pending Approval',
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
    marginRight: 2.5
  },
  profileIcon: {
    borderRadius: 75
  }


})