// models/commentModel.js
import { supabase } from "../config/supabase.js";

/**
 * Obtener comentarios de un producto
 */
export const getCommentsByProduct = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('product_id', parseInt(productId))
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Error en getCommentsByProduct:', error);
    throw new Error(`Error al obtener comentarios: ${error.message}`);
  }
};

/**
 * Crear nuevo comentario
 */
export const createComment = async (commentData) => {
  const { product_id, user_id, user_name, user_email, comment_text, rating } = commentData;

  try {
    const productId = parseInt(product_id);
    if (isNaN(productId)) {
      throw new Error('ID de producto inválido');
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          product_id: productId,
          user_id: user_id.toString(),
          user_name: user_name || "Usuario",
          user_email: user_email || "usuario@ejemplo.com",
          comment_text: comment_text.trim(),
          rating: rating ? parseInt(rating) : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error en createComment:', error);
    throw new Error(`Error al crear comentario: ${error.message}`);
  }
};

/**
 * Eliminar comentario (solo si el usuario es el propietario)
 */
export const deleteComment = async (commentId, userId) => {
  try {
    // Primero obtener el comentario para verificar que pertenece al usuario
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('id, user_id')
      .eq('id', parseInt(commentId))
      .single();

    if (fetchError || !comment) {
      console.error('❌ Comentario no encontrado:', fetchError);
      return false;
    }

    // Verificar que el user_id coincida
    if (comment.user_id !== userId.toString()) {
      console.error('❌ Usuario no autorizado para eliminar este comentario');
      return false;
    }

    // Proceder a eliminar
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', parseInt(commentId));

    if (deleteError) throw deleteError;
    return true;
  } catch (error) {
    console.error('❌ Error en deleteComment:', error);
    throw new Error(`Error al eliminar comentario: ${error.message}`);
  }
};

/**
 * Obtener estadísticas de comentarios
 */
export const getCommentStats = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('rating')
      .eq('product_id', parseInt(productId));

    if (error) throw error;

    const ratings = data.filter(comment => comment.rating !== null).map(comment => comment.rating);
    const totalComments = data.length;
    const ratingCount = ratings.length;
    
    const averageRating = ratingCount > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratingCount 
      : 0;

    return {
      totalComments,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingCount
    };
  } catch (error) {
    console.error('❌ Error en getCommentStats:', error);
    throw new Error(`Error al obtener estadísticas: ${error.message}`);
  }
};

// Solo exportamos las funciones necesarias para comentarios básicos
export default {
  getCommentsByProduct,
  createComment,
  deleteComment,
  getCommentStats
};