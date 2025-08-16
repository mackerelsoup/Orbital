import { FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Href, Link, useNavigation, useRouter } from 'expo-router';
import React, { useState, useContext, useEffect, useLayoutEffect } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { UserContext } from "@/context/userContext";
import ProfileAvatar from '@/components/ProfileAvatar';

/*
Parent file of:
capped.tsx
reservation.tsx
season.tsx
*/

export default function DigitalPermits() {
  const { loggedIn, userType, setUserType, user, setUser } = useContext(UserContext)!;
  const router = useRouter();
  const { logout } = useContext(UserContext)!;
  const [seasonRedirect, setSeasonRedirect] = useState<Href>('/')
  const [cappedRedirect, setCappedRedirect] = useState<Href>('/')
  const navigation = useNavigation()

  useEffect(() => {
    if (user.season_parking) {
      setSeasonRedirect('/season?signedUp=true')
    }
    else {
      if (user.season_application_status) {
        if (user.season_application_status === 'pending') {
          setSeasonRedirect('/seasonPending')
        }
        else if (user.season_application_status === 'rejected') {
          Alert.alert("Application rejected", "Apply again or contact support")
          setUser({
            ...user,
            season_application_status: undefined
          })
        }
      }
      else {
        setSeasonRedirect('/season')
      }
    }

    if (user.capped_pass) {
      setSeasonRedirect('/capped?signedUp=true')
    }
    else {
      if (user.capped_application_status) {
        if (user.capped_application_status === 'pending') {
          setSeasonRedirect('/cappedPending')
        }
        else if (user.capped_application_status === 'rejected') {
          Alert.alert("Application rejected", "Apply again or contact support")
          setUser({
            ...user,
            capped_application_status: undefined
          }
          )
        }
      }
      else {
        setCappedRedirect('/capped')
      }
    }

  }, [user.capped_application_status, user.season_application_status, user.capped_pass, user.season_parking])


  // redirects to log in page and ensures it redirects back upon success
  const handleLogin = (selectedUserType: 'Student' | 'Staff') => {
    if (selectedUserType === 'Student') {
      router.push({
        pathname: '/login',
        params: { from: '/digitalpermits' }
      });
      setUserType(selectedUserType);
    } else {
      Alert.alert('Feature is not yet available.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ],
      { cancelable: true }
    );
  };

  const handleHelpRedirect = () => {
    Alert.alert(
      'Open User Manual?',
      'You will be redirected to your browser to view the NPAS User Manual',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Manual',
          onPress: () => {
            WebBrowser.openBrowserAsync(
              'https://nusparking.resustainability.com.sg/pdf/NPASUserManual(StaffAndStudent).pdf'
            );
          },
        },
      ],
      { cancelable: true }
    );
  };


  // state of page if user is not logged in
  if (!loggedIn) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Page header */}
          <View style={styles.header}>
            <FontAwesome name="id-card" size={32} color="#6d62fe" style={styles.headerIcon} />
            <Text style={styles.heading}>Digital Permits</Text>
            <Text style={styles.subheading}>Access your NUS parking services</Text>
          </View>

          {/* Login Cards */}
          <View style={styles.card}>
            <View style={styles.loginHeader}>
              <FontAwesome name="sign-in" size={20} color="#374151" />
              <Text style={styles.cardTitle}>Choose Login Type</Text>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, styles.studentButton]}
              onPress={() => handleLogin('Student')}
            >
              <View style={styles.buttonContent}>
                <FontAwesome name="graduation-cap" size={22} color="#FFFFFF" />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.loginText}>NUS Student</Text>
                  <Text style={styles.loginSubtext}>Access student parking services</Text>
                </View>
                <FontAwesome name="chevron-right" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, styles.staffButton]}
              onPress={() => handleLogin('Staff')}
            >
              <View style={styles.buttonContent}>
                <FontAwesome name="briefcase" size={22} color="#FFFFFF" />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.loginText}>NUS Staff</Text>
                  <Text style={styles.loginSubtext}>Access staff parking services</Text>
                </View>
                <FontAwesome name="chevron-right" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <FontAwesome name="info-circle" size={16} color="#3B82F6" />
            <Text style={styles.infoText}>
              Login to manage your parking permits, reservations, vehicle registration, and more
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }


  // if user is logged in
  const FeatureButton = ({
    title,
    description,
    icon,
    href,
    color = '#10B981',
    iconColor = '#FFFFFF'
  }: {
    title: string;
    description: string;
    icon: any;
    href: Href;
    color?: string;
    iconColor?: string;
  }) => (
    <TouchableOpacity
      style={[styles.featureButton, { backgroundColor: color }]}
      onPress={() => router.push(href)}
    >
      <View style={styles.featureContent}>
        <View style={styles.featureIconContainer}>
          <FontAwesome name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.featureTextContainer}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDescription}>{description}</Text>
        </View>
        <FontAwesome name="chevron-right" size={16} color={iconColor} />
      </View>
    </TouchableOpacity>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <ProfileAvatar />
    })
  }, [navigation])


  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Header with Logout */}
        <View style={styles.welcomeHeader}>
          <View style={styles.welcomeContent}>
            <FontAwesome
              name={userType === 'Student' ? 'graduation-cap' : 'briefcase'}
              size={24}
              color="#6d62fe"
            />
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.userTypeText}>Logged in as NUS {userType}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FontAwesome name="sign-out" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Features Cards */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Available Services</Text>
          </View>

          <FeatureButton
            title="Manage Season Parking"
            description="View and manage your seasonal parking permits"
            icon="calendar"
            href={seasonRedirect}
            color="#6d62fe"
          />

          <FeatureButton
            title="Register Vehicle"
            description="Register for capped parking at selected locations"
            icon="car"
            href={cappedRedirect}
            color="#10B981"
          />

          <FeatureButton
            title="Car Park Reservations"
            description="Book parking spaces in advance"
            icon="ticket"
            href="/reservation"
            color="#F59E0B"
          />

        </View>

        {/* Help Card */}
        <View style={styles.helpCard}>
          <TouchableOpacity style={styles.helpButton} onPress={handleHelpRedirect}>
            <FontAwesome name="question-circle" size={20} color="#3B82F6" />
            <View style={styles.helpTextContainer}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpSubtext}>View the complete user manual</Text>
            </View>
            <FontAwesome name="external-link" size={14} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F9FAFB',
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  headerIcon: {
    marginBottom: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loginHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 4,
  },
  loginButton: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentButton: {
    backgroundColor: '#6d62fe',
  },
  staffButton: {
    backgroundColor: '#059669',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  buttonTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  loginSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  welcomeHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  welcomeTextContainer: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  userTypeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
  },
  featureButton: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  featureIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  helpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  helpTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  helpSubtext: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  profileContainer: {
    marginRight: 2.5
  },
  profileIcon: {
    borderRadius: 75
  }
});