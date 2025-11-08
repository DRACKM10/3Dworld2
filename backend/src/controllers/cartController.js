import { supabase } from "../config/supabase.js";

// Obtener carrito del usuario
export const getCart = async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from("cart")
    .select("*")
    .eq("user_id", userId);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// Agregar producto al carrito
export const addCartItem = async (req, res) => {
  const { product_id, quantity } = req.body;
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("cart")
    .insert([{ user_id: userId, product_id, quantity }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
};

// Actualizar cantidad
export const updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const { data, error } = await supabase
    .from("cart")
    .update({ quantity })
    .eq("id", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
};

// Eliminar producto del carrito
export const deleteCartItem = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("cart").delete().eq("id", id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Producto eliminado del carrito" });
};
