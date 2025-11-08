import { supabase } from "../config/supabase.js";

/**
 * Obtener todos los productos activos
 */
export const getAllProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('❌ Error en getAllProducts:', error);
    throw new Error(`Error al obtener productos: ${error.message}`);
  }
};

/**
 * Obtener producto por ID
 */
export const getProductById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Error en getProductById:', error);
    throw new Error(`Error al obtener producto: ${error.message}`);
  }
};

/**
 * Crear nuevo producto
 */
export const createProduct = async (product) => {
  const { name, description, price, image, category, stock } = product;

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          description,
          price,
          image,
          category,
          stock: stock || 0,
          is_active: true
        }
      ])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Producto creado en Supabase:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error en createProduct:', error);
    throw new Error(`Error al crear producto: ${error.message}`);
  }
};

/**
 * Actualizar producto por ID
 */
export const updateProductById = async (id, product) => {
  const { name, description, price, image, category, stock } = product;

  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price,
        image,
        category,
        stock,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Producto actualizado:', id);
    return data;
  } catch (error) {
    console.error('❌ Error en updateProductById:', error);
    throw new Error(`Error al actualizar producto: ${error.message}`);
  }
};

/**
 * Eliminar producto por ID (soft delete)
 */
export const deleteProductById = async (id) => {
  try {
    // Primero eliminar del carrito
    const { error: cartError } = await supabase
      .from('cart')
      .delete()
      .eq('product_id', id);

    if (cartError) {
      console.warn('⚠️ Error al eliminar del carrito:', cartError.message);
    }

    // Luego eliminar el producto
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log('✅ Producto eliminado:', id);
  } catch (error) {
    console.error('❌ Error en deleteProductById:', error);
    throw new Error(`Error al eliminar producto: ${error.message}`);
  }
};