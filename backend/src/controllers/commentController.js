// controllers/commentController.js
import { 
  getCommentsByProduct, 
  createComment,
  deleteComment as deleteCommentModel,
  getCommentStats 
} from "../models/commentModel.js";

/**
 * Obtener comentarios de un producto
 */
export const getProductComments = async (req, res) => {
  try {
    const productId = req.params.productId;
    const comments = await getCommentsByProduct(productId);
    const stats = await getCommentStats(productId);

    res.json({
      comments,
      stats
    });
  } catch (err) {
    console.error("❌ Error en getProductComments:", err);
    res.status(500).json({ error: "Error al obtener comentarios: " + err.message });
  }
};

/**
 * Crear nuevo comentario
 */
export const addComment = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { comment_text, rating } = req.body;
    const userId = req.user?.id;
    const userName = req.user?.name;
    const userEmail = req.user?.email;

    console.log('📝 Intentando crear comentario:', {
      productId,
      userId,
      userName,
      rating
    });

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (!comment_text?.trim()) {
      return res.status(400).json({ error: "El comentario no puede estar vacío" });
    }

    const commentData = {
      product_id: productId,
      user_id: userId,
      user_name: userName || "Usuario",
      user_email: userEmail || "usuario@ejemplo.com",
      comment_text: comment_text.trim(),
      rating: rating || null
    };

    const newComment = await createComment(commentData);
    
    res.status(201).json({ 
      success: true, 
      message: "Comentario agregado", 
      comment: newComment 
    });
  } catch (err) {
    console.error("❌ Error en addComment:", err);
    res.status(500).json({ error: "Error al agregar comentario: " + err.message });
  }
};

/**
 * Eliminar comentario (solo el propietario)
 */
export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    console.log('🗑️ Intentando eliminar comentario:', {
      commentId,
      userId
    });

    const result = await deleteCommentModel(commentId, userId);

    if (!result) {
      return res.status(403).json({ error: "No tienes permisos para eliminar este comentario" });
    }

    res.json({ 
      success: true, 
      message: "Comentario eliminado correctamente" 
    });
  } catch (err) {
    console.error("❌ Error en deleteComment:", err);
    res.status(500).json({ error: "Error al eliminar comentario: " + err.message });
  }
};

// Solo exportamos las funciones básicas
export default {
  getProductComments,
  addComment,
  deleteComment
};