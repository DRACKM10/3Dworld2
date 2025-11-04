import { getProfileByUserId, createDefaultProfile, updateProfile } from "../models/profileModel.js";
import { supabase } from "../config/supabase.js";
import multer from "multer";

// Configurar Multer
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

/**
 * Obtener perfil del usuario
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: "ID de usuario requerido" });
    }

    let profile = await getProfileByUserId(userId);

    // Si no existe, crear perfil por defecto
    if (!profile) {
      const username = req.user?.username || `user_${userId}`;
      const email = req.user?.email || "";
      profile = await createDefaultProfile(userId, username, email);
    }

    res.json({ success: true, profile });

  } catch (error) {
    console.error("❌ Error en getProfile:", error);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};

/**
 * Actualizar perfil
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: "ID de usuario requerido" });
    }

    const profileData = {
      name: req.body.name,
      username: req.body.username,
      description: req.body.description,
      birthdate: req.body.birthdate,
      profile_pic: req.body.profile_pic,
      banner: req.body.banner,
    };

    const updatedProfile = await updateProfile(userId, profileData);

    res.json({ 
      success: true, 
      message: "Perfil actualizado exitosamente",
      profile: updatedProfile 
    });

  } catch (error) {
    console.error("❌ Error en updateUserProfile:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
};

/**
 * Subir imagen de perfil o banner
 */
export const uploadProfileImage = async (req, res) => {
  console.log('📤 Subiendo imagen de perfil...');
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "La imagen es requerida" });
    }

    const { type, userId } = req.body;

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${type}_${userId}_${Date.now()}.${fileExt}`;

    console.log('☁️ Subiendo a Supabase:', fileName);

    const BUCKET_NAME = 'profiles';

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Error al subir imagen:', uploadError);
      return res.status(500).json({ error: "Error al subir la imagen" });
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;
    console.log('✅ Imagen subida:', imageUrl);

    res.json({ success: true, imageUrl });

  } catch (err) {
    console.error("❌ Error en uploadProfileImage:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};