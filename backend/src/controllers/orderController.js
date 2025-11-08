import { supabase } from "../config/supabase.js";

// Crear nueva orden
export const createOrder = async (req, res) => {
  const userId = req.user.id;
  const { items, total } = req.body;

  const { data, error } = await supabase
    .from("orders")
    .insert([{ user_id: userId, items, total }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
};

// Obtener órdenes del usuario
export const getOrders = async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// Obtener orden por ID
export const getOrderById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// Actualizar orden
export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
};

// Eliminar orden
export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("orders").delete().eq("id", id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Orden eliminada correctamente" });
};
