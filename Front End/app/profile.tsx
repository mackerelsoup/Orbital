import { StyleSheet, Text, View, Image, Pressable, Alert, ScrollView } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import { router } from 'expo-router';
import Button from '@/components/Button';
import { UserContext } from '@/context/userContext';
import Modal from 'react-native-modal'
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

import * as ImagePicker from 'expo-image-picker'

type InfoCardProps = {
  icon: keyof typeof MaterialIcons.glyphMap; // restrict to MaterialIcons icon names
  label: string;
  value: string;
  iconColor?: string;
}


export default function Profile() {
  const { logout, user, setUser } = useContext(UserContext)!;
  const [imagePath, setImagePath] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.profile_uri)
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)


  useEffect(() => {
    console.log("avatar path", avatarUrl)
    console.log("user:", user)
    if (imagePath) {
        getImage(imagePath)
        updateUser(imagePath)
    } else if (avatarUrl === null) {
      setAvatarUrl("https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541")
      setUser(prev => ({
        ...prev,
        profile_uri: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
      }))

    }
  }, [imagePath, avatarUrl])

  const updateUser = async (path: string|null) => {
    try {
      if (!user?.username) {
        throw new Error("User not logged in")
      }

      const response = await fetch(`https://migrated-backend.onrender.com/updateProfilePic/${user.username}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imagePath: path }),
        }
      )
      
      if (!response.ok) {
        throw new Error(await response.text())
      }
      
      
    } catch (error: any) {
      console.error("Error updating profile picture:", error.message);
      Alert.alert("Error", "Unable to update user profile picture");
    }
  }

  const getImage = async (path: string) => {
    try {
      const response = await fetch('https://migrated-backend.onrender.com/getUserProfilePic', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify({ imagePath: path })
      })

      if (!response.ok) {
        throw new Error("Cant retrieve image")
      }

      const {publicUrl} = await response.json()
      setAvatarUrl(publicUrl)

      setUser(prev => ({
        ...prev,
        profile_uri: publicUrl
      }))


    } catch (error: any) {
      Alert.alert("Unable to retrieve user image")
    }
  }



  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {logout(); router.replace('/'); }
        },
      ],
      { cancelable: true }
    );
  };

  const onTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        exif: false
      })

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled camera.')
        toggleModal()
        return
      }

      const image = result.assets[0]
      if (!image.uri) {
        throw new Error('No image uri!') // Realistically, this should never happen, but just in case...
      }

      const formData = new FormData()
      formData.append("image", {
        uri: image.uri,
        name: image.fileName,
        type: image.mimeType ?? "image/jpeg"
      } as any)

      const response = await fetch('https://migrated-backend.onrender.com/storeImage', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error("tf")
      }

      const data = await response.json();
      setImagePath(data.path)
    } catch (error) {
      Alert.alert("Error, failed to store image")
    }
    finally {
      toggleModal()
    }
  }

  const onChoosePhoto = async () => {

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        exif: false,
        allowsMultipleSelection: false
      })

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled image picker.')
        toggleModal()
        return
      }

      const image = result.assets[0]
      if (!image.uri) {
        throw new Error('No image uri!') // Realistically, this should never happen, but just in case...
      }

      const formData = new FormData()
      formData.append("image", {
        uri: image.uri,
        name: image.fileName,
        type: image.mimeType ?? "image/jpeg"
      } as any)

      const response = await fetch('https://migrated-backend.onrender.com/storeImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error("tf")
      }

      const data = await response.json();
      setImagePath(data.path)

    } catch (error) {

    } finally {
      toggleModal()
    }

  }

  const onRemovePhoto = async () => {
    console.log("remove")
    updateUser(null)
    setImagePath(null)
    setAvatarUrl(null)
    setUser(prev => ({
      ...prev,
      profile_uri: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
    }))
    toggleModal()
  }


  const toggleModal = () => {
    setIsModalVisible(!isModalVisible)
  }

  const parseValue = (value: string) => {
    switch (value) {
      case "staff_covered":
        return "Staff (Covered)";
      case "staff_open":
        return "Staff (Open)";
      case "student_covered":
        return "Student (Covered)";
      case "student_open":
        return "Student (Open)";
      case "student_open_2A":
        return "Student (Open 2A)";
      case "student_open_10":
        return "Student (Open 10)";
      case "student_open_11":
        return "Student (Open 11)";
      default:
        return ""; // or null, or a fallback label
    }
  };

  const InfoCard = ({ icon, label, value, iconColor = '#6d62fe' }: InfoCardProps) => (
    <View style={styles.infoCard}>
      <View style={styles.infoIconContainer}>
        <MaterialIcons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: avatarUrl! }}
            style={styles.profilePicture}
          />
          <Pressable
            style={styles.editButton}
            onPress={toggleModal}
          >
            <Entypo name="camera" size={20} color="white" />
          </Pressable>
        </View>

        <Text style={styles.profileTitle}>My Profile</Text>
        <Text style={styles.welcomeText}>Welcome back!</Text>
      </View>

      {/* User Information Cards */}
      <View style={styles.infoSection}>
        {user.username && (
          <InfoCard
            icon="person"
            label="Username"
            value={user.username}
          />
        )}

        {user.email && (
          <InfoCard
            icon="email"
            label="Email"
            value={user.email}
            iconColor="#3B82F6"
          />
        )}

        <InfoCard
          icon={user.staff ? "badge" : "person-outline"}
          label="Staff Member"
          value={user.staff ? 'Yes' : 'No'}
          iconColor={user.staff ? "#10B981" : "#6B7280"}
        />

        <InfoCard
          icon={user.season_parking ? "local-parking" : "close"}
          label="Season Parking"
          value={user.season_parking ? 'Active' : 'Inactive'}
          iconColor={user.season_parking ? "#10B981" : "#EF4444"}
        />

        {user.season_parking_type && (
          <InfoCard
            icon="directions-car"
            label="Parking Type"
            value={parseValue(user.season_parking_type)}
            iconColor="#F59E0B"
          />
        )}
      </View>

      {/* Logout Button */}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </Pressable>
      </View>

      {/* Photo Selection Modal */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Profile Picture</Text>

          <Pressable style={styles.modalOption} onPress={onChoosePhoto}>
            <MaterialIcons name="photo-library" size={24} color="#6d62fe" />
            <Text style={styles.modalOptionText}>Choose from Gallery</Text>
          </Pressable>

          <Pressable style={styles.modalOption} onPress={onTakePhoto}>
            <MaterialIcons name="camera-alt" size={24} color="#6d62fe" />
            <Text style={styles.modalOptionText}>Take Photo</Text>
          </Pressable>

          <Pressable style={styles.modalOption} onPress={onRemovePhoto}>
            <MaterialIcons name="delete" size={24} color="#EF4444" />
            <Text style={[styles.modalOptionText, { color: '#EF4444' }]}>Remove Photo</Text>
          </Pressable>

          <Pressable style={styles.modalCancel} onPress={toggleModal}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#6d62fe',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#6d62fe',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profilePicture: {
    borderRadius: 80,
    borderWidth: 4,
    borderColor: 'white',
    width: 160,
    height: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  editButton: {
    borderRadius: 20,
    padding: 8,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: 'white',
    position: 'absolute',
    bottom: 10,
    right: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  profileTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoSection: {
    padding: 20,
    gap: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 10,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1E293B',
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 16,
    fontWeight: '500',
  },
  modalCancel: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
})