import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import carparks from '../assets/carparks.json';
import { UserContext } from '@/context/userContext';

const { width } = Dimensions.get('window');

interface seasonApplication {
  id: number;
  salutation: string;
  name: string;
  address: string;
  student_no: string;
  faculty: string;
  email: string;
  tel: string;
  vehicle_reg_no: string;
  iu_no: string;
  vehicle_owner: string;
  relationship: string;
  engine_capacity: string;
  parking_type: string;
  submitted_at: Date
}

interface cappedApplication {
  id: number;
  salutation: string;
  name: string;
  address: string;
  email: string;
  tel: string;
  vehicle_reg_no: string;
  iu_no: string;
  vehicle_owner: string;
  relationship: string;
  engine_capacity: string;
  submitted_at: Date;
}

export default function approvalSelector() {
  const { user } = useContext(UserContext)!
  const [activeTab, setActiveTab] = useState<'Season' | 'Capped'>('Season');
  const [seasonApplicationData, setSeasonApplicationData] = useState<seasonApplication[]>([])
  const [cappedApplicationData, setCappedApplicationData] = useState<cappedApplication[]>([])

  const isSeasonApplication = (application: seasonApplication | cappedApplication): application is seasonApplication => {
    return (application as seasonApplication).faculty !== undefined
  }

  const handleSelect = (application: seasonApplication | cappedApplication) => {
    const type = isSeasonApplication(application) ? 'season' : 'capped'
    console.log(type)
    router.navigate({
      pathname: "./approvalInfo",
      params: {
        formData: JSON.stringify(application),
        type: type
      }
    })
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    console.log(activeTab)
    if (activeTab === 'Season') {
      const getSeasonParking = async () => {
        try {
          const response = await fetch('http://192.168.68.58:3000/getSeasonApplication')
          if (!response.ok) {
            if (response.status === 500) {
              Alert.alert("Failed to retrieve parking information")
              console.log("Season parking error 500")
            }
            else {
              Alert.alert("Unknown error, contact support")
              console.log("Season parking some other error")
            }
            throw new Error("Placeholder, season parking retrieval error")
          }

          const rawData = await response.json();
          const parsedData = rawData.map((item: any): seasonApplication => ({
            ...item,
            submitted_at: new Date(item.submitted_at),
          }));

          setSeasonApplicationData(parsedData);
          console.log(parsedData);
        } catch (error) {
          console.log("error", error)
        }
      }

      getSeasonParking()
    }
    else {
      const getCappedParking = async () => {
        try {
          const response = await fetch('http://192.168.68.58:3000/getCappedApplication')
          if (!response.ok) {
            if (response.status === 500) {
              Alert.alert("Failed to retrieve parking information")
              console.log("Season parking error 500")
            }
            else {
              Alert.alert("Unknown error, contact support")
              console.log("Capped parking some other error")
            }
            throw new Error("Placeholder, capped parking retrieval error")
          }

          const rawData = await response.json();
          const parsedData = rawData.map((item: any): cappedApplication => ({
            ...item,
            submitted_at: new Date(item.submitted_at),
          }));

          setCappedApplicationData(parsedData);
          console.log(parsedData);
        } catch (error) {
          console.log("error", error)
        }
      }

      getCappedParking()
    }

  }, [activeTab])

  const renderApplicationItem = ({ item }: { item: seasonApplication | cappedApplication }) => (
    <Pressable
      style={[styles.item, styles.shadowEffect]}
      onPress={() => handleSelect(item)}
      android_ripple={{ color: '#6d62fe20' }}
    >
      <View style={styles.itemHeader}>
        <View style={styles.nameContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>
            {isSeasonApplication(item) ? `${item.faculty} • ${item.student_no}` : item.email}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>PENDING</Text>
        </View>
      </View>

      <View style={styles.itemDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Vehicle:</Text>
          <Text style={styles.detailValue}>{item.vehicle_reg_no}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Engine:</Text>
          <Text style={styles.detailValue}>{item.engine_capacity}cc</Text>
        </View>
        {isSeasonApplication(item) && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pass Type:</Text>
            <Text style={styles.detailValue}>{item.parking_type}</Text>
          </View>
        )}
      </View>

      <View style={styles.itemFooter}>
        <Text style={styles.submitDate}>
          Submitted: {formatDate(item.submitted_at)} at {formatTime(item.submitted_at)}
        </Text>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>
    </Pressable>
  );

  const EmptyState = ({ type }: { type: string }) => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No {type} Applications</Text>
      <Text style={styles.emptyStateText}>
        There are currently no pending {type.toLowerCase()} parking applications to review.
      </Text>
    </View>
  );

  if (user.username === 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Application Reviews</Text>
          <Text style={styles.headerSubtitle}>Review and approve parking applications</Text>
        </View>

        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'Season' && styles.activeTab]}
            onPress={() => setActiveTab('Season')}
          >
            <Text style={[styles.tabText, activeTab === 'Season' && styles.activeText]}>
              Season Parking
            </Text>
            {activeTab === 'Season' && <View style={styles.activeIndicator} />}
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'Capped' && styles.activeTab]}
            onPress={() => setActiveTab('Capped')}
          >
            <Text style={[styles.tabText, activeTab === 'Capped' && styles.activeText]}>
              Capped Parking
            </Text>
            {activeTab === 'Capped' && <View style={styles.activeIndicator} />}
          </Pressable>
        </View>

        <View style={styles.content}>
          <FlatList
            data={activeTab === 'Season' ? seasonApplicationData : cappedApplicationData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderApplicationItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<EmptyState type={activeTab} />}
          />
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.noAccessContainer}>
        <View style={styles.noAccessContent}>
          {/* Icon representation */}
          <View style={styles.iconContainer}>
            <View style={styles.lockIcon}>
              <Text style={styles.lockSymbol}>🔒</Text>
            </View>
          </View>

          {/* Main message */}
          <Text style={styles.noAccessTitle}>Access Restricted</Text>
          <Text style={styles.noAccessSubtitle}>
            You don't have permission to view application reviews
          </Text>

          {/* Additional info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Only administrators can access parking application reviews.
              Please contact your system administrator if you believe this is an error.
            </Text>
          </View>

          {/* Back button */}
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            android_ripple={{ color: '#6d62fe20' }}
          >
            <Text style={styles.backButtonText}>← Go Back</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '400',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#6d62fe',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  activeText: {
    color: '#ffffff',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  item: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  shadowEffect: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  nameContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: 0.5,
  },
  itemDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  submitDate: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noAccessContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    marginBottom: 32,
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  lockSymbol: {
    fontSize: 32,
  },
  noAccessTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  noAccessSubtitle: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 26,
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#6d62fe',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});