import { UserContext } from "@/context/userContext"
import { Link } from "expo-router"
import { useContext } from "react"
import { View, Platform, Pressable, Image, StyleSheet } from "react-native"

const ProfileAvatar = () => {
  const { user } = useContext(UserContext)!
  return (
    <View style={{ marginTop: Platform.OS === 'ios' ? -10 : 0, paddingRight: 8 }}>
      <Link href={user.username ? '/profile' : '/login'} asChild style={styles.profileContainer}>
        <Pressable>
          <Image
            source={{ uri: user.profile_uri ?? 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' }}
            width={40} height={40} style={styles.profileIcon}
          />
        </Pressable>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  profileContainer: {
    marginRight: 2.5
  },
  profileIcon: {
    borderRadius: 75
  }
}
)


export default ProfileAvatar
