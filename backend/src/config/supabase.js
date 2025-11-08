import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://eolugdmstfwvnsgamjnd.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbHVnZG1zdGZ3dm5zZ2Ftam5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTg3NjYsImV4cCI6MjA3NzMzNDc2Nn0.tdCQHOe5MIOsIo3tMuTJaJHyfLtkWhGy3USUPNePikQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Nombres de buckets
export const BUCKET_NAME = 'Products'; // ← Bucket de productos
export const PROFILES_BUCKET = 'profiles'; // ← Bucket de perfiles
export const MODELS_BUCKET = 'stl-files'; // ← Bucket de archivos 3D (opcional)