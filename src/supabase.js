import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://onnrxixllhnpbjxpunzh.supabase.co';
// Tempelkan anon key legacy (eyJhbGci...) di bawah ini
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubnJ4aXhsbGhucGJqeHB1bnpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxODgyMzYsImV4cCI6MjEwOTc2NDIzNn0.-zvNHMdxm5yXwbQGvDHsxmjp5gExDiMOHHeWwEzAyls'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);