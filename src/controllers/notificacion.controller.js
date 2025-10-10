import Notificacion from '../models/notificacion.model.js';

// Crear notificacion
export const createNotificacion = async (req, res) => {
  try {
    const notificacion = new Notificacion(req.body);
    const savedNotificacion = await notificacion.save();
    res.status(201).json(savedNotificacion);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener todas las notificaciones
export const getNotificaciones = async (req, res) => {
  try {
    const { tipo, estado } = req.query;
    let filter = {};

    if (tipo) filter.tipo = tipo;
    if (estado) filter.estado = estado;

    const notificaciones = await Notificacion.find(filter)
      .populate('destinatarios.usuarioId', 'nombres apellidos email')
      .sort({ fechaProgramada: -1 });
    res.json(notificaciones);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener notificacion por ID
export const getNotificacionById = async (req, res) => {
  try {
    const notificacion = await Notificacion.findById(req.params.id)
      .populate('destinatarios.usuarioId', 'nombres apellidos email');
    if (!notificacion) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notificacion);
  } catch (error) {
    console.error('Error getting notification:', error);
    res.status(500).json({ message: error.message });
  }
};

// Actualizar notificacion
export const updateNotificacion = async (req, res) => {
  try {
    const updatedNotificacion = await Notificacion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('destinatarios.usuarioId', 'nombres apellidos email');

    if (!updatedNotificacion) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(updatedNotificacion);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar notificacion
export const deleteNotificacion = async (req, res) => {
  try {
    const deletedNotificacion = await Notificacion.findByIdAndDelete(req.params.id);
    if (!deletedNotificacion) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: error.message });
  }
};

// Enviar notificacion (simular envío)
export const enviarNotificacion = async (req, res) => {
  try {
    const notificacion = await Notificacion.findById(req.params.id);
    if (!notificacion) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Aquí iría la lógica real de envío por WhatsApp
    // Por ahora solo simulamos el envío
    notificacion.estado = 'enviando';
    notificacion.fechaEnvioReal = new Date();

    // Marcar destinatarios como enviados
    notificacion.destinatarios.forEach(dest => {
      dest.enviado = true;
      dest.fechaEnvio = new Date();
      dest.estadoWhatsApp = 'enviado';
    });

    notificacion.estado = 'completado';
    await notificacion.save();

    res.json({ message: 'Notification sent successfully', notificacion });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: error.message });
  }
};