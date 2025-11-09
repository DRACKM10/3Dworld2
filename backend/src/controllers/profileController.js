import { supabase } from "../config/supabase.js";
import { getProfileByUserId, updateProfile, createDefaultProfile } from "../models/profileModel.js";
import multer from "multer";

// Configurar Multer para memoria
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

/**
 * 🔹 OBTENER PERFIL
 */
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("📋 Buscando perfil para userId:", userId);

    if (!userId) {
      return res.status(400).json({ error: "ID de usuario requerido" });
    }

    let profile = await getProfileByUserId(userId);

    // Si no existe, crear perfil por defecto
    if (!profile) {
      console.log("⚠️ Perfil no encontrado, creando perfil por defecto...");

      // Obtener datos del usuario desde Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, email')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error("❌ Usuario no encontrado:", userError);
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      profile = await createDefaultProfile(userId, userData.username, userData.email);
      console.log("✅ Perfil creado automáticamente");
    }

    console.log("✅ Perfil obtenido:", profile.id);

    res.json({ success: true, profile });

  } catch (err) {
    console.error("❌ Error en getProfile:", err);
    res.status(500).json({ error: "Error al obtener perfil: " + err.message });
  }
};

/**
 * 🔹 ACTUALIZAR PERFIL
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.body.userId;

    console.log("📝 Actualizando perfil para userId:", userId);

    if (!userId) {
      return res.status(400).json({ error: "ID de usuario requerido" });
    }

    const updates = {
      name: req.body.name,
      username: req.body.username,
      description: req.body.description,
      birthdate: req.body.birthdate,
      profile_pic: req.body.profile_pic,
      banner: req.body.banner
    };

    const profile = await updateProfile(userId, updates);

    console.log("✅ Perfil actualizado exitosamente");

    res.json({
      success: true,
      message: "Perfil actualizado",
      profile
    });
  } catch (err) {
    console.error("❌ Error al actualizar perfil:", err);
    res.status(500).json({ error: "Error al actualizar perfil: " + err.message });
  }
};

/**
 * 🔹 SUBIR IMAGEN DE PERFIL O BANNER
 */
export const uploadProfileImage = async (req, res) => {
  console.log("📤 Subiendo imagen de perfil...");

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    const { type, userId } = req.body;

    if (!userId || !type) {
      return res.status(400).json({ error: "userId y type son requeridos" });
    }

    const fileExt = req.file.originalname.split('.').pop();
    const filename = `${type}_${userId}_${Date.now()}.${fileExt}`;

    console.log("☁️ Subiendo a Supabase:", filename);

    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Error al subir imagen:", uploadError);
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from("profiles")
      .getPublicUrl(filename);

    const publicUrl = publicUrlData.publicUrl;

    console.log("✅ Imagen subida exitosamente:", publicUrl);

    res.json({
      success: true,
      imageUrl: publicUrl
    });

  } catch (err) {
    console.error("❌ Error al subir imagen:", err);
    res.status(500).json({ error: "Error al subir imagen: " + err.message });
  }
};