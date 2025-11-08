import { supabase, BUCKET_NAME } from "../config/supabase.js";
import { getProfileByUserId, updateProfile } from "../models/profileModel.js";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

export const upload = multer({ storage: multer.memoryStorage() });

/** 🔹 Obtener perfil */
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await getProfileByUserId(userId);
    if (!profile) return res.status(404).json({ error: "Perfil no encontrado" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener perfil: " + err.message });
  }
};

/** 🔹 Actualizar perfil */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const profile = await updateProfile(userId, updates);
    res.json({ message: "Perfil actualizado", profile });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar perfil: " + err.message });
  }
};

/** 🔹 Subir imagen de perfil */
export const uploadProfileImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No se envió ninguna imagen" });

    const filename = `${uuidv4()}-${file.originalname}`;
    const { error } = await supabase.storage.from("profile").upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage.from("profile").getPublicUrl(filename);
    const publicUrl = publicUrlData.publicUrl;

    const userId = req.user.id;
    const updated = await updateProfile(userId, { profile_pic: publicUrl });

    res.json({ message: "Imagen subida", url: publicUrl, updated });
  } catch (err) {
    res.status(500).json({ error: "Error al subir imagen: " + err.message });
  }
};
