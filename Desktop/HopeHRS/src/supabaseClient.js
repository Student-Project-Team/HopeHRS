import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fexobarsdmxseexcpmta.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZleG9iYXJzZG14c2VleGNwbXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzMyMDYsImV4cCI6MjA5MDc0OTIwNn0.ig2fCOWt6xKKYbFDtEmXgXP0shs4YljomtWkIGs3PlA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)