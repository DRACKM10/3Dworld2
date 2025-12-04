import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';

export default function CommentsSection({ productId, currentUser }) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({ totalComments: 0, averageRating: 0 });

  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Obtener usuario del localStorage si no viene por props
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setLocalUser(currentUser);
      console.log('👤 Usuario de props:', currentUser);
    } else {
      // Intentar obtener del localStorage - primero intenta "user" completo
      let userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          setLocalUser(parsed);
          console.log('👤 Usuario del localStorage (objeto completo):', parsed);
          return;
        } catch (error) {
          console.error("❌ Error parsing user data:", error);
        }
      }
      
      // Si no hay objeto completo, construir desde datos dispersos
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("usuario");
      const userEmail = localStorage.getItem("userEmail");
      
      if (userId || userName) {
        const builtUser = {
          id: userId,
          username: userName,
          name: userName,
          email: userEmail || '',
          role: localStorage.getItem("userRole") || 'client'
        };
        setLocalUser(builtUser);
        console.log('👤 Usuario construido desde datos dispersos:', builtUser);
      }
    }
  }, [currentUser]);

  const showNotification = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    const fetchComments = async () => {
      if (!productId) return;
      try {
        const res = await fetch(`http://localhost:8000/api/comments/product/${productId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setComments((data.comments || []).map(c => ({
          id: c.id,
          author: c.user_name || 'Usuario',
          rating: c.rating || 0,
          comment: c.comment_text || c.comment || '',
          date: c.created_at || c.date || new Date().toISOString(),
          verified: !!c.user_id,
          user_id: c.user_id
        })));
        if (data.stats) setStats(data.stats);
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };

    fetchComments();
  }, [productId]);

  const handleSubmit = () => {
    // Verificar autenticación
    if (!localUser) {
      showNotification("Debes iniciar sesión para publicar un comentario", "warning");
      return;
    }

    if (newRating === 0) {
      showNotification("Por favor selecciona una calificación", "warning");
      return;
    }

    if (!newComment.trim()) {
      showNotification("Por favor escribe un comentario", "warning");
      return;
    }

    // Publicar comentario
    const publish = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showNotification('Error de autenticación. Vuelve a iniciar sesión.', 'warning');
          return;
        }

        const res = await fetch(`http://localhost:8000/api/comments/product/${productId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            comment_text: newComment.trim(), 
            rating: newRating 
          })
        });

        const data = await res.json();
        if (!res.ok) {
          const msg = data?.error || data?.message || 'Error al publicar comentario';
          showNotification(msg, 'warning');
          return;
        }

        const created = data.comment;
        const mapped = {
          id: created.id,
          author: created.user_name || localUser.name || localUser.email || 'Usuario',
          rating: created.rating || newRating,
          comment: created.comment_text || newComment,
          date: created.created_at || new Date().toISOString(),
          verified: !!created.user_id,
          user_id: created.user_id
        };

        setComments(prev => [mapped, ...prev]);
        setStats(prev => ({
          totalComments: prev.totalComments + 1,
          averageRating: Math.round(((prev.averageRating * prev.totalComments) + (mapped.rating || 0)) / (prev.totalComments + 1) * 10) / 10
        }));

        setNewComment("");
        setNewRating(0);
        showNotification("¡Comentario publicado! Gracias por tu opinión", "success");
      } catch (err) {
        console.error('Error publishing comment:', err);
        showNotification('Error al publicar comentario', 'warning');
      }
    };

    publish();
  };

  const averageRating = stats && stats.averageRating ? stats.averageRating : (comments.length > 0
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : 0);

  const StarRating = ({ rating, interactive = false, onRate }) => {
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => interactive && onRate(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            style={{
              fontSize: interactive ? '28px' : '20px',
              color: star <= (interactive ? (hoverRating || rating) : rating) ? '#FFD700' : '#D1D5DB',
              cursor: interactive ? 'pointer' : 'default',
              transition: 'all 0.2s',
              transform: interactive && hoverRating === star ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const getInitials = (name) => {
    if (!name) return 'US';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDeleteComment = async (commentId, commentUserId) => {
    // Verificar que el usuario actual sea el propietario del comentario
    console.log('🔍 Intentando eliminar comentario:', { 
      userId: localUser?.id, 
      commentUserId, 
      localUser 
    });
    
    if (!localUser?.id || localUser.id.toString() !== commentUserId?.toString()) {
      showNotification("No tienes permisos para eliminar este comentario", "warning");
      return;
    }

    if (!window.confirm("¿Estás seguro de que deseas eliminar este comentario?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification('Error de autenticación. Vuelve a iniciar sesión.', 'warning');
        return;
      }

      const res = await fetch(`http://localhost:8000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error || data?.message || 'Error al eliminar comentario';
        showNotification(msg, 'warning');
        return;
      }

      // Remover el comentario de la lista
      setComments(prev => prev.filter(c => c.id !== commentId));
      
      // Actualizar estadísticas
      setStats(prev => ({
        totalComments: prev.totalComments - 1,
        averageRating: prev.totalComments > 1 
          ? Math.round(prev.averageRating * (prev.totalComments / (prev.totalComments - 1)) * 10) / 10
          : 0
      }));

      showNotification("Comentario eliminado correctamente", "success");
    } catch (err) {
      console.error('Error deleting comment:', err);
      showNotification('Error al eliminar comentario', 'warning');
    }
  };

  return (
    <div style={{
      marginTop: '32px',
      padding: '32px',
      background: 'white',
      borderRadius: '16px',
      border: '3px solid #5c212b',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    }}>
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px 24px',
          background: toastType === 'success' ? '#48BB78' : '#ECC94B',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out',
        }}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#5c212b',
          marginBottom: '16px',
        }}>
          💬 Opiniones de clientes
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#5c212b',
            }}>
              {averageRating}
            </span>
            <div>
              <StarRating rating={Math.round(averageRating)} />
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                marginTop: '4px',
              }}>
                {comments.length} {comments.length === 1 ? 'opinión' : 'opiniones'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '2px solid #5c212b', marginBottom: '32px' }} />

      {/* Formulario */}
      <div style={{
        padding: '24px',
        background: '#f9f5f5',
        borderRadius: '12px',
        border: '2px solid #5c212b',
        marginBottom: '32px',
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#5c212b',
          marginBottom: '16px',
        }}>
          {localUser ? `✍️ Hola ${localUser.name || localUser.email}, deja tu opinión` : '✍️ Deja tu opinión'}
        </h3>

        {/* Información del usuario logueado */}
        {localUser && (
          <div style={{
            padding: '12px',
            background: '#E6FFFA',
            borderRadius: '8px',
            border: '1px solid #81E6D9',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#5c212b',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '12px',
            }}>
              {getInitials(localUser.name || localUser.email)}
            </div>
            <span style={{ fontSize: '14px', color: '#234E52' }}>
              Publicarás como: <strong>{localUser.name || localUser.email}</strong>
            </span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151',
            }}>
              Calificación
            </label>
            <StarRating
              rating={newRating}
              interactive={true}
              onRate={setNewRating}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151',
            }}>
              Tu comentario
            </label>
            <textarea
              placeholder="Comparte tu experiencia con este producto..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #5c212b',
                fontSize: '16px',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!localUser}
            style={{
              padding: '16px 32px',
              background: localUser ? '#5c212b' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: localUser ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              opacity: localUser ? 1 : 0.6,
            }}
            onMouseOver={(e) => {
              if (localUser) {
                e.target.style.background = '#7a2d3b';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (localUser) {
                e.target.style.background = '#5c212b';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {localUser ? '📤 Publicar comentario' : '🔒 Inicia sesión para comentar'}
          </button>

          {!localUser && (
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              textAlign: 'center',
              marginTop: '8px',
            }}>
              💡 Debes iniciar sesión para poder publicar comentarios
            </p>
          )}
        </div>
      </div>

      {/* Lista de comentarios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {comments.map((comment) => (
          <div
            key={comment.id}
            style={{
              padding: '24px',
              background: 'white',
              borderRadius: '12px',
              border: '2px solid #E5E7EB',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#5c212b';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#5c212b',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}>
                  {getInitials(comment.author)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontWeight: 'bold',
                      color: '#5c212b',
                      fontSize: '16px',
                    }}>
                      {comment.author}
                    </span>
                    {comment.verified && (
                      <span style={{
                        padding: '2px 8px',
                        background: '#10B981',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        ✓ Compra verificada
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    marginTop: '2px',
                  }}>
                    {formatDate(comment.date)}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <StarRating rating={comment.rating} />
              </div>
            </div>

            <p style={{
              color: '#374151',
              lineHeight: '1.7',
              fontSize: '16px',
              marginBottom: '16px',
            }}>
              {comment.comment}
            </p>

            {localUser && localUser.id && localUser.id.toString() === comment.user_id?.toString() && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleDeleteComment(comment.id, comment.user_id)}
                  style={{
                    padding: '6px 12px',
                    background: '#5c212b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#7e444dff';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#5c212b';
                    e.target.style.transform = 'scale(1)';
                  }}
                  title="Eliminar comentario"
                >
                  🗑️ Eliminar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ fontSize: '20px', color: '#9CA3AF' }}>
            🌟 Sé el primero en opinar sobre este producto
          </p>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}