import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RadioButton } from 'react-native-paper';

/*
Parent file:
digitalpermits.tsx
*/

interface FormData {
  salutation?: string;
  name?: string;
  address?: string;
  email?: string;
  tel?: string;
  vehicleRegNo?: string;
  iuNo?: string;
  vehicleOwner?: string;
  relationship?: string;
}

const CappedParkingApplicationForm = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [engineCapacity, setEngineCapacity] = useState('');
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // fields that are required for the form to be valid
    const requiredFields: (keyof FormData)[] = [
      'salutation', 'name', 'address',
      'email', 'tel', 'vehicleRegNo', 'iuNo', 'vehicleOwner'
    ];
    

    // checks for valid form
    for (const field of requiredFields) {
      if (!formData[field]) {
        Alert.alert('Missing Information', `Missing ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    if (!engineCapacity) {
      Alert.alert('Missing Information', 'Select vehicle engine capacity');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    // if valid
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
      router.replace('/capped?signedUp=true');
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          {/* main header */}
          <View style={styles.header}>
            <FontAwesome name="file-text" size={36} color="#10B981" style={styles.headerIcon} />
            <Text style={styles.heading}>Register Vehicle</Text>
          </View>

          {/* card for the form itself */}
          <View style={styles.card}>
            {/* personal information section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <FontAwesome name="user" size={18} color="#10B981" />  Personal Information
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Salutation <Text style={styles.required}>*</Text></Text>
                <TextInput 
                  style={styles.input}
                  onChangeText={text => handleChange('salutation', text)}
                  placeholder="Mr./Ms./Mrs./Mdm./Dr."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name (as in NRIC) <Text style={styles.required}>*</Text></Text>
                <TextInput 
                  style={styles.input}
                  onChangeText={text => handleChange('name', text)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address <Text style={styles.required}>*</Text></Text>
                <TextInput 
                  style={[styles.input, styles.textArea]}
                  onChangeText={text => handleChange('address', text)}
                  placeholder="Enter your address"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
                <TextInput 
                  style={styles.input}
                  onChangeText={text => handleChange('email', text)}
                  placeholder="your.email@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tel No. / Mobile <Text style={styles.required}>*</Text></Text>
                <TextInput 
                  style={styles.input}
                  onChangeText={text => handleChange('tel', text)}
                  placeholder=""
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* vehicle info section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <FontAwesome name="car" size={18} color="#10B981" />  Vehicle Information
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Registration No. <Text style={styles.required}>*</Text></Text>
                <TextInput 
                  style={styles.input}
                  onChangeText={text => handleChange('vehicleRegNo', text)}
                  placeholder="SXX1234X"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>In-Vehicle Unit (IU) No. <Text style={styles.required}>*</Text></Text>
                <Text style={styles.helperText}>10 nos. below barcode, left hand side of unit</Text>
                <TextInput 
                  style={styles.input}
                  onChangeText={text => handleChange('iuNo', text)}
                  placeholder="XXXXXXXXXX"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Registered Vehicle Owner <Text style={styles.required}>*</Text></Text>
                <TextInput 
                  style={styles.input}
                  onChangeText={text => handleChange('vehicleOwner', text)}
                  placeholder="Vehicle owner's full name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship with Owner of Vehicle</Text>
                <TextInput 
                  style={styles.input}
                  onChangeText={text => handleChange('relationship', text)}
                  placeholder="e.g., Self, Parent, etc."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Engine Capacity <Text style={styles.required}>*</Text></Text>
                <View style={styles.radioContainer}>
                  <RadioButton.Group onValueChange={value => setEngineCapacity(value)} value={engineCapacity}>
                    <TouchableOpacity 
                      style={styles.radioItem}
                      onPress={() => setEngineCapacity('<1.4')}
                    >
                      <RadioButton value="<1.4" color="#10B981" />
                      <Text style={styles.radioLabel}>&lt; 1.4 L</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.radioItem}
                      onPress={() => setEngineCapacity('1.4-2.0')}
                    >
                      <RadioButton value="1.4-2.0" color="#10B981" />
                      <Text style={styles.radioLabel}>1.4 - 2.0 L</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.radioItem}
                      onPress={() => setEngineCapacity('>2.0')}
                    >
                      <RadioButton value=">2.0" color="#10B981" />
                      <Text style={styles.radioLabel}>&gt; 2.0 L</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.radioItem}
                      onPress={() => setEngineCapacity('EV')}
                    >
                      <RadioButton value="EV" color="#10B981" />
                      <Text style={styles.radioLabel}>Electric Vehicle</Text>
                    </TouchableOpacity>
                  </RadioButton.Group>
                </View>
              </View>
            </View>

            {/* submit button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <FontAwesome name="paper-plane" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.submitButtonText}>  Submit Application</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* success/confirmation modal */}
        <Modal visible={showModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <FontAwesome name="check-circle" size={48} color="#10B981" style={styles.modalIcon} />
              <Text style={styles.modalTitle}>Application Successful!</Text>
              <Text style={styles.modalText}>
                Your vehicle registration application has been submitted successfully. 
                You will receive a confirmation email shortly.
              </Text>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 10,
  },
  headerIcon: {
    marginRight: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  radioContainer: {
    marginTop: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  pricingInfo: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  pricingValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CappedParkingApplicationForm;