import { supabase } from "../config/supabase.js";
import sendEmail from "../utils/sendEmail.js";

/**
 * 🔹 CREAR PEDIDO Y ENVIAR EMAIL
 */
export const createOrder = async (req, res) => {
  try {
    console.log("📦 === INICIANDO CREACIÓN DE PEDIDO ===");
    console.log("📋 Body recibido:", JSON.stringify(req.body, null, 2));

    const { 
      userId, 
      email,
      nombre, 
      direccion, 
      telefono, 
      tipoPago, 
      tarjeta, 
      expiracion,
      items,
      total 
    } = req.body;

    // Validaciones
    if (!nombre || !direccion || !telefono || !tipoPago) {
      console.log("❌ Faltan datos obligatorios");
      return res.status(400).json({ 
        error: "Faltan datos obligatorios",
        missing: {
          nombre: !nombre,
          direccion: !direccion,
          telefono: !telefono,
          tipoPago: !tipoPago
        }
      });
    }

    if (!items || items.length === 0) {
      console.log("❌ Carrito vacío");
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    if (!total || total <= 0) {
      console.log("❌ Total inválido:", total);
      return res.status(400).json({ error: "Total inválido" });
    }

    console.log("✅ Validaciones pasadas");
    console.log("👤 Usuario ID:", userId || "sin ID");
    console.log("📧 Email:", email || "sin email");
    console.log("🛒 Items:", items.length);
    console.log("💰 Total:", total);

    // 1. Crear el pedido en la BD
    console.log("💾 Insertando orden en Supabase...");

    const orderData = {
      user_id: userId || null,
      total: parseFloat(total),
      status: 'pending',
      shipping_address: direccion,
      billing_address: direccion,
      payment_method: tipoPago,
      payment_status: tipoPago === 'contraEntrega' ? 'pending' : 'paid'
    };

    console.log("📝 Datos de la orden:", orderData);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error("❌ Error al crear orden:", orderError);
      return res.status(500).json({ 
        error: "Error al crear orden en la base de datos",
        details: orderError.message 
      });
    }

    console.log("✅ Orden creada con ID:", order.id);

    // 2. Crear items del pedido
    console.log("📦 Insertando items de la orden...");

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity || 1,
      price: parseFloat(item.price)
    }));

    console.log("📋 Items a insertar:", orderItems);

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error("❌ Error al crear items:", itemsError);
      // Eliminar la orden si falló la inserción de items
      await supabase.from('orders').delete().eq('id', order.id);
      return res.status(500).json({ 
        error: "Error al guardar los productos del pedido",
        details: itemsError.message 
      });
    }

    console.log("✅ Items insertados correctamente");

    // 3. Obtener email del usuario
    let userEmail = email;
    
    if (!userEmail && userId) {
      console.log("📧 Buscando email del usuario...");
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (userData) {
        userEmail = userData.email;
        console.log("✅ Email encontrado:", userEmail);
      }
    }

    if (!userEmail) {
      console.log("⚠️ No se encontró email, no se enviará correo");
    }

    // 4. Generar HTML del email
    console.log("📧 Generando email...");

    const productosHTML = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.name}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity || 1}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          $${parseFloat(item.price).toFixed(2)}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          $${(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background: linear-gradient(135deg, #5c212b 0%, #7a2d3b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">3Dworld</h1>
          <p style="color: #fff; margin: 10px 0 0 0;">Tu tienda de impresiones 3D</p>
        </div>

        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #5c212b; margin-top: 0;">¡Gracias por tu compra!</h2>
          
          <p style="color: #333; line-height: 1.6;">
            Hola <strong>${nombre}</strong>,
          </p>
          
          <p style="color: #333; line-height: 1.6;">
            Hemos recibido tu pedido correctamente. A continuación encontrarás los detalles:
          </p>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Número de orden:</strong> #${order.id}</p>
            <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            })}</p>
            <p style="margin: 5px 0;"><strong>Estado:</strong> Pendiente</p>
          </div>

          <h3 style="color: #5c212b; margin-top: 25px;">📍 Dirección de Envío</h3>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 5px 0;">${nombre}</p>
            <p style="margin: 5px 0;">${direccion}</p>
            <p style="margin: 5px 0;">📞 ${telefono}</p>
          </div>

          <h3 style="color: #5c212b; margin-top: 25px;">💳 Método de Pago</h3>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 5px 0;">
              ${tipoPago === 'tarjeta' 
                ? `Tarjeta de crédito/débito${tarjeta ? ' terminada en ' + tarjeta.slice(-4) : ''}` 
                : tipoPago === 'transferencia' 
                ? 'Transferencia bancaria' 
                : 'Pago contra entrega'}
            </p>
          </div>

          <h3 style="color: #5c212b; margin-top: 25px;">🛒 Productos</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <thead>
              <tr style="background-color: #5c212b; color: white;">
                <th style="padding: 12px; text-align: left;">Producto</th>
                <th style="padding: 12px; text-align: center;">Cantidad</th>
                <th style="padding: 12px; text-align: right;">Precio</th>
                <th style="padding: 12px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${productosHTML}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">
                  Total:
                </td>
                <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #5c212b;">
                  $${parseFloat(total).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 25px 0; border-radius: 4px;">
            <p style="margin: 0; color: #2e7d32;">
              <strong>📦 ¿Qué sigue?</strong><br>
              Procesaremos tu pedido en las próximas 24-48 horas. Te enviaremos otro email cuando tu pedido sea enviado.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; line-height: 1.5;">
            Si tienes alguna pregunta, contáctanos respondiendo a este email.<br>
            <strong>3Dworld</strong> - Tu tienda de impresiones 3D<br>
            © ${new Date().getFullYear()} Todos los derechos reservados
          </p>
        </div>
      </div>
    `;

    // 5. Enviar email
    if (userEmail) {
      console.log("📧 Enviando email a:", userEmail);
      
      try {
        await sendEmail({
          to: userEmail,
          subject: `✅ Confirmación de Pedido #${order.id} - 3Dworld`,
          html: emailHTML,
        });

        console.log("✅ Email enviado exitosamente");
      } catch (emailError) {
        console.error("❌ Error al enviar email:", emailError);
        // No fallar la orden si el email falla
      }
    } else {
      console.log("⚠️ No se pudo enviar email (falta dirección)");
    }

    console.log("🎉 Pedido completado exitosamente");

    res.status(201).json({
      success: true,
      message: "Pedido creado exitosamente",
      order: {
        id: order.id,
        total: order.total,
        status: order.status
      }
    });

  } catch (err) {
    console.error("❌ ERROR GENERAL en createOrder:", err);
    console.error("Stack trace:", err.stack);
    res.status(500).json({ 
      error: "Error al procesar el pedido", 
      details: err.message 
    });
  }
};