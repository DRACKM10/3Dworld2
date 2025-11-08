import { supabase } from "../config/supabase.js";

/**
 * Obtener perfil por user_id
 */
export const getProfileByUserId = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Error en getProfileByUserId:', error);
    throw new Error(`Error al obtener perfil: ${error.message}`);
  }
};

/**
 * Crear perfil por defecto
 */
export const createDefaultProfile = async (userId, username, email) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: userId,
          name: username,
          username: username,
          description: "¡Bienvenido a mi perfil! Estoy emocionado de ser parte de esta comunidad.",
          profile_pic: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=7D00FF&color=fff&size=128`,
          banner: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0b2b33&color=7D00FF&size=1200&bold=true`
        }
      ])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Perfil creado para user_id:', userId);
    return data;
  } catch (error) {
    console.error('❌ Error en createDefaultProfile:', error);
    throw new Error(`Error al crear perfil: ${error.message}`);
  }
};

/**
 * Actualizar perfil
 */
export const updateProfile = async (userId, profileData) => {
  const { name, username, description, birthdate, profile_pic, banner } = profileData;

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        name,
        username,
        description,
        birthdate: birthdate || null,
        profile_pic,
        banner,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Perfil actualizado para user_id:', userId);
    return data;
  } catch (error) {
    console.error('❌ Error en updateProfile:', error);
    throw new Error(`Error al actualizar perfil: ${error.message}`);
  }
};