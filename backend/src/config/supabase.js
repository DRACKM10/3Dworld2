// config/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eolugdmstfwvnsgamjnd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbHVnZG1zdGZ3dm5zZ2Ftam5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTg3NjYsImV4cCI6MjA3NzMzNDc2Nn0.tdCQHOe5MIOsIo3tMuTJaJHyfLtkWhGy3USUPNePikQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Nombre del bucket (debe existir en Supabase Storage)
export const BUCKET_NAME = 'Products';