import { supabase } from "../config/supabase.js";

export const createResetToken = async (userId, token, expiresAt) => {
  try {
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .insert([
        {
          user_id: userId,
          token,
          expires_at: expiresAt.toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return data.id;
  } catch (error) {
    console.error('❌ Error en createResetToken:', error);
    throw new Error(`Error al crear token: ${error.message}`);
  }
};

export const findTokenByValue = async (token) => {
  try {
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Error en findTokenByValue:', error);
    throw new Error(`Error al buscar token: ${error.message}`);
  }
};

export const markTokenAsUsed = async (token) => {
  try {
    const { error } = await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token);

    if (error) throw error;
  } catch (error) {
    console.error('❌ Error en markTokenAsUsed:', error);
    throw new Error(`Error al marcar token como usado: ${error.message}`);
  }
};