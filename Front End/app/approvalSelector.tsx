import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import carparks from '../assets/carparks.json';

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
  const [activeTab, setActiveTab] = useState<'Season' | 'Capped'>('Capped');
  const [seasonApplicationData, setSeasonApplicationData] = useState<seasonApplication[]>([])
  const [cappedApplicationData, setCappedApplicationData] = useState<cappedApplication[]> ([])

  const isSeasonApplication = (application: seasonApplication | cappedApplication) : application is seasonApplication => {
    return (application as seasonApplication).faculty !== undefined
  }

  const handleSelect = (application: seasonApplication | cappedApplication) => {
    const type = isSeasonApplication(application)? 'season' : 'capped'
    console.log(type)
    router.navigate({
      pathname: "./approvalInfo",
      params: {
        formData: JSON.stringify(application),
        type: type
      }
    })
  };

  useEffect(() => {
    console.log(activeTab)
    if (activeTab === 'Season') {
      const getSeasonParking = async () => {
        try {
          const response = await fetch('http://192.168.68.60:3000/getSeasonApplication')
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
          const response = await fetch('http://192.168.68.60:3000/getCappedApplication')
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

  return (
    <SafeAreaView style={styles.container}>


      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'Season' && styles.activeTab]}
          onPress={() => setActiveTab('Season')}
        >
          <Text style={[styles.tabText, activeTab === 'Season' && styles.activeText]}>Season Parking</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'Capped' && styles.activeTab]}
          onPress={() => setActiveTab('Capped')}
        >
          <Text style={[styles.tabText, activeTab === 'Capped' && styles.activeText]}>Capped Parking</Text>
        </Pressable>
      </View>

      {activeTab === 'Season' ? (
        <View>
          <Text style={styles.title}>Pending Season Parking Approval</Text>
          <FlatList
            data={seasonApplicationData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={styles.item}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.itemText}>{item.name}</Text>
              </Pressable>
            )}
          />
        </View>

      )

        : (
          <View>
            <Text style={styles.title}>Pending Capped Parking Approval</Text>
            <FlatList
              data={cappedApplicationData}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.item}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.itemText}>{item.name}</Text>
                </Pressable>
              )}
            />
          </View>
        )
      }

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    padding: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 12,
  },
  itemText: {
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
});
