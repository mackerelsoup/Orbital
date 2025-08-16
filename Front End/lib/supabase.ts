import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'


const supabaseUrl = "https://kyiakxhmxcawtllpfxdn.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aWFreGhteGNhd3RsbHBmeGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTMxOTIsImV4cCI6MjA2OTI4OTE5Mn0.CIcgnCAJQ-0EgsRwjYvfTCX4Ppi84h-yVd23ZR1KydU"
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})