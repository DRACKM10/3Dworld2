import { supabase } from "../config/supabase.js";
import bcrypt from "bcrypt";
import validator from "validator";

/**
 * Crear usuario
 */
export const createUser = async (user) => {
  const { username, email, password } = user;

  console.log('createUser llamado con:', { username, email, password: password ? '***' : 'NULL' });

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    throw new Error("username es requerido y debe tener al menos 3 caracteres");
  }
  if (!email || !validator.isEmail(email)) {
    throw new Error("email no válido");
  }

  let hashedPassword = null;
  if (password) {
    if (password.length < 6) {
      throw new Error("password debe tener al menos 6 caracteres");
    }
    hashedPassword = await bcrypt.hash(password, 10);
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password: hashedPassword
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        if (error.message.includes('email')) {
          throw new Error("El email ya está registrado");
        } else if (error.message.includes('username')) {
          throw new Error("El nombre de usuario ya existe");
        }
        throw new Error("El usuario o email ya existe");
      }
      throw error;
    }

    console.log('✅ Usuario insertado con ID:', data.id);
    return { id: data.id, username: data.username, email: data.email };
  } catch (error) {
    console.error('❌ Error en createUser:', error.message);
    throw error;
  }
};

/**
 * Obtener usuario por email
 */
export const getUserByEmail = async (email) => {
  if (!email || !validator.isEmail(email)) {
    throw new Error("email no válido");
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, password')
      .ilike('email', email.trim())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw error;
    }

    console.log('✅ Usuario encontrado:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error en getUserByEmail:', error.message);
    throw new Error(`Error al obtener usuario: ${error.message}`);
  }
};

/**
 * Crear usuario de Google
 */
export const createGoogleUser = async (userData) => {
  const { username, email } = userData;

  console.log('createGoogleUser llamado con:', { username, email });

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    throw new Error("username es requerido y debe tener al menos 3 caracteres");
  }
  if (!email || !validator.isEmail(email)) {
    throw new Error("email no válido");
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password: null
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        if (error.message.includes('email')) {
          throw new Error("El email ya está registrado");
        } else if (error.message.includes('username')) {
          throw new Error("El nombre de usuario ya existe");
        }
        throw new Error("El usuario o email ya existe");
      }
      throw error;
    }

    console.log('✅ Usuario Google insertado con ID:', data.id);
    return { id: data.id, username: data.username, email: data.email };
  } catch (error) {
    console.error('❌ Error en createGoogleUser:', error.message);
    throw error;
  }
};

/**
 * Actualizar contraseña
 */
export const updateUserPassword = async (userId, hashedPassword) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId);

    if (error) throw error;

    console.log('✅ Contraseña actualizada para user_id:', userId);
  } catch (error) {
    console.error('❌ Error al actualizar contraseña:', error.message);
    throw new Error(`Error al actualizar contraseña: ${error.message}`);
  }
};