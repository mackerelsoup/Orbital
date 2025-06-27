import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { router } from 'expo-router';
import { UserContext } from '@/context/userContext';

export default function profile() {
    const { logout } = useContext(UserContext)!;

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <View style = {{justifyContent: 'center', alignItems: 'center'}}>
      <Text style = {{fontSize: 50}}>PROFILE</Text>
      <Button title="Log Out" onPress={handleLogout} color="#FF3B30" />
    </View>
  )
}

const styles = StyleSheet.create({})