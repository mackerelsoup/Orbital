import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Animated, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomDropdown from '@/components/CustomDropdown';

/*
Parent file:
capped.tsx
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
  const scrollY = useRef(new Animated.Value(0)).current;

  const titleOpacity = scrollY.interpolate({
    inputRange: [50, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [50, 100],
    outputRange: [10, 0],
    extrapolate: 'clamp',
  });

  const clearField = (field: keyof FormData) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  const resetForm = () => {
    setFormData({});
    setEngineCapacity('');
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLeavePress = () => {
    Alert.alert(
      "Leave Page",
      "Are you sure you want to leave? All details will be lost.",
      [
        {
          text: "Stay",
          style: "cancel"
        },
        {
          text: "Leave",
          onPress: () => {
            resetForm(); 
            router.push('/capped')
          },
          style: "destructive"
        }
      ],
      { cancelable: false }
    );
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

    // email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email!)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      clearField('email');
      return false;
    }

    // phone number format check
    const phoneRegex = /^[689]\d{7}$/;
    if (!phoneRegex.test(formData.tel!)) {
      Alert.alert('Invalid Phone Number', 'Enter a valid 8-digit phone number.');
      clearField('tel');
      return false;
    }

    // IU no. check 10 digits
    const iuRegex = /^\d{10}$/;
    if (!iuRegex.test(formData.iuNo!)) {
      Alert.alert('Invalid IU Number', 'In-Vehicle Unit (IU) No. must be exactly 10 digits.');
      clearField('iuNo');
      return false;
    }

    // vehicle registration number (common format)
    const vehRegRegex = /^[SFTG][A-Z]{2}\d{1,4}[A-Z]$/;
    if (!vehRegRegex.test(formData.vehicleRegNo!)) {
      Alert.alert('Invalid Vehicle Registration No.', 'Please enter a valid format, e.g., SXX1234X.');
      clearField('vehicleRegNo');
      return false;
    }
    
    // engine capacity check
    if (!engineCapacity) {
      Alert.alert('Missing Information', 'Select vehicle engine capacity');
      return false;
    }

    return true;
  };

  // handle submit and store info to database by communicating with backend first
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      ...formData, // ... to include all user input key-value pairs  
      engineCapacity,
    };

    try {
      const response = await fetch('https://back-end-o2lr.onrender.com/applyCappedParking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // get response and decode whether it is successful or not
      const result = await response.json();
      if (result.success) {
        await fetch("https://back-end-o2lr.onrender.com/sendConfirmationEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, username: formData.name }),
        });
        console.log("vehicle registered")
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          router.replace('/cappedPending');
        }, 2000);
      } else {
        Alert.alert('Submission failed', result.error);
      }
    } catch (err) {
      // if no response, likely network error
      Alert.alert('Network error', 'Unable to connect to server');
    }
  };

  // checkbox
  const CheckBox = ({ selected, onPress, label }: { selected: boolean; onPress: () => void; label: string }) => (
    <TouchableOpacity style={styles.checkboxItem} onPress={onPress}>
      <View style={[styles.checkboxCircle, selected && styles.checkboxCircleSelected]}>
        {selected && <View style={styles.checkboxDot} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // dropdown logic
  const salutationDate = [
    { label: 'Mr.', value: 'Mr' },
    { label: 'Ms.', value: 'Ms' },
    { label: 'Mrs.', value: 'Mrs' },
    { label: 'Mdm.', value: 'Mdm' },
    { label: 'Dr.', value: 'Dr' }
  ]

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      keyboardVerticalOffset={90}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 100,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          zIndex: 10,
          justifyContent: 'center',
        }}
      >
        {/* back arrow */}
        <TouchableOpacity
          onPress={() => {handleLeavePress()}}
          style={{
            position: 'absolute',
            left: 16,
            marginRight: 12,
            marginTop: 46,
          }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#d1d5db',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name='arrow-back' size={20} color='#6d62fe' />
          </View>
        </TouchableOpacity>


        {/* title */}
        <View style={{ alignItems: 'center', justifyContent: 'center'}}>
          <Animated.Text
            style={{
              position: 'absolute',
              alignSelf: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: '600',
              color: '#1F2937',
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
              marginTop: 46,
            }}
          >
          Register Vehicle
          </Animated.Text>
        </View>

        {/* line that appears alongside title */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: '#E5E7EB',
            opacity: titleOpacity,
          }}
        />
      </View>

      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        keyboardShouldPersistTaps="handled"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.container}>

          {/* card for the form itself */}
          <View style={styles.card}>
            <Text style={styles.heading}>Register Vehicle</Text>
            {/* personal information section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <FontAwesome name="user" size={18} color="#6d62fe" />  Personal Information
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Salutation <Text style={styles.required}>*</Text></Text>
                <CustomDropdown data={salutationDate} handleChange={(item) => handleChange('salutation', item.value)}>
                </CustomDropdown>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name (as in NRIC) <Text style={styles.required}>*</Text></Text>
                <TextInput 
                  style={styles.input}
                  value={formData.name || ''}
                  onChangeText={text => handleChange('name', text)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address <Text style={styles.required}>*</Text></Text>
                <TextInput 
                  style={[styles.input, styles.textArea]}
                  value={formData.address || ''}
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
                  value={formData.email || ''}
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
                  value={formData.tel || ''}
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
                <FontAwesome name="car" size={18} color="#6d62fe" />  Vehicle Information
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Registration No. <Text style={styles.required}>*</Text></Text>
                <TextInput 
                  style={styles.input}
                  value={formData.vehicleRegNo || ''}
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
                  value={formData.iuNo || ''}
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
                  value={formData.vehicleOwner || ''}
                  onChangeText={text => handleChange('vehicleOwner', text)}
                  placeholder="Vehicle owner's full name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship with Owner of Vehicle</Text>
                <TextInput 
                  style={styles.input}
                  value={formData.relationship || ''}
                  onChangeText={text => handleChange('relationship', text)}
                  placeholder="e.g., Self, Parent, etc."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Engine Capacity <Text style={styles.required}>*</Text></Text>
                <View style={styles.checkboxContainer}>
                  <CheckBox
                    selected={engineCapacity === '<1.4'}
                    onPress={() => setEngineCapacity('<1.4')}
                    label="< 1.4 L"
                  />
                  <CheckBox
                    selected={engineCapacity === '1.4-2.0'}
                    onPress={() => setEngineCapacity('1.4-2.0')}
                    label="1.4 - 2.0 L"
                  />
                  <CheckBox
                    selected={engineCapacity === '>2.0'}
                    onPress={() => setEngineCapacity('>2.0')}
                    label="> 2.0 L"
                  />
                  <CheckBox
                    selected={engineCapacity === 'EV'}
                    onPress={() => setEngineCapacity('EV')}
                    label="Electric Vehicle"
                  />
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
      </Animated.ScrollView>
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
  },
  heading: {
    fontSize: 34,
    fontWeight: 500,
    color: '#1F2937',
    marginBottom: 36,
    marginTop: 84,
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
    fontWeight: '400',
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
  checkboxContainer: {
    marginTop: -8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxCircleSelected: {
    borderColor: '#6d62fe',
    backgroundColor: '#6d62fe',
  },
  checkboxDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
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
    backgroundColor: '#6d62fe',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6d62fe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: -24,
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