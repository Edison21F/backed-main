import Matricula from '../models/matricula.model.js';
import Periodo from '../models/periodo.model.js';
import User from '../models/user.model.js';
import { matricularEstudiante } from '../services/matricula.service.js';

// Crear matricula
export const createMatricula = async (req, res) => {
  try {
    const matricula = await matricularEstudiante(req.body);
    res.status(201).json(matricula);
  } catch (error) {
    console.error('Error creating enrollment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener todas las matriculas
export const getMatriculas = async (req, res) => {
  try {
    const { estudianteId, periodoId, estado } = req.query;
    let filter = {};

    if (estudianteId) filter.estudianteId = estudianteId;
    if (periodoId) filter.periodoId = periodoId;
    if (estado) filter.estado = estado;

    const matriculas = await Matricula.find(filter)
      .populate({
        path: 'estudianteId',
        select: 'usuarioId',
        populate: { path: 'usuarioId', select: 'nombres apellidos email' }
      })
      .populate('periodoId', 'nombre codigo fechaInicio fechaFin')
      .populate('cursoId', 'nombre codigo precio')
      .sort({ fechaMatricula: -1 });
    res.json(matriculas);
  } catch (error) {
    console.error('Error getting enrollments:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener matricula por ID
export const getMatriculaById = async (req, res) => {
  try {
    const matricula = await Matricula.findById(req.params.id)
      .populate('estudianteId', 'usuarioId')
      .populate('periodoId')
      .populate('cursoId');
    if (!matricula) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.json(matricula);
  } catch (error) {
    console.error('Error getting enrollment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Actualizar matricula
export const updateMatricula = async (req, res) => {
  try {
    const updatedMatricula = await Matricula.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('estudianteId', 'usuarioId')
      .populate('periodoId')
      .populate('cursoId');

    if (!updatedMatricula) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.json(updatedMatricula);
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar matricula
export const deleteMatricula = async (req, res) => {
  try {
    const matricula = await Matricula.findById(req.params.id);
    if (!matricula) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Reducir cupos ocupados del periodo
    await Periodo.findByIdAndUpdate(
      matricula.periodoId,
      { $inc: { cuposOcupados: -1 } }
    );

    await Matricula.findByIdAndDelete(req.params.id);
    res.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener matriculas de un estudiante
export const getMatriculasByEstudiante = async (req, res) => {
  try {
    //funcion traer id del usuario logueado
    const userId = req.user.id;
    console.log('Fetching enrollments for user:', userId);
    const matriculas = await Matricula.find({ estudianteId: userId })
      .populate('periodoId', 'nombre codigo fechaInicio fechaFin horario')
      .populate('cursoId', 'nombre codigo precio')
      .sort({ fechaMatricula: -1 });
    console.log('Found enrollments:', matriculas);
    res.json(matriculas);
  } catch (error) {
    console.error('Error getting student enrollments:', error);
    res.status(500).json({ message: error.message });
  }
};

// Agregar pago al historial
export const agregarPago = async (req, res) => {
  try {
    const { monto, metodoPago } = req.body;
    const matriculaId = req.params.id;

    const matricula = await Matricula.findById(matriculaId);
    if (!matricula) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    const comprobanteUrl = req.file ? `/uploads/comprobantes/${req.file.filename}` : null;

    matricula.historialPagos.push({
      fecha: new Date(),
      monto,
      metodoPago,
      comprobante: comprobanteUrl
    });

    matricula.montoPagado += monto;
    matricula.montoPendiente = Math.max(0, matricula.montoPendiente - monto);

    await matricula.save();
    res.json({ message: 'Payment added successfully', matricula });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin matricula estudiante (solo administradores)
export const adminMatricularEstudiante = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { estudianteId, periodoId, metodoPago, descuento, observaciones } = req.body;

    // Verificar que el usuario actual es administrador
    const admin = await User.findById(adminId);
    if (!admin || admin.rol !== 'administrador') {
      return res.status(403).json({ message: 'Access denied. Admin required.' });
    }

    // Verificar que el periodo existe para obtener el precio
    const periodo = await Periodo.findById(periodoId).populate('cursoId');
    if (!periodo) {
      return res.status(404).json({ message: 'Period not found' });
    }

    // Calcular precios con descuento
    const precioOriginal = periodo.cursoId.precio;
    const descuentoAplicado = descuento || 0;
    const precioFinal = precioOriginal * (1 - descuentoAplicado / 100);

    const matricula = await matricularEstudiante({
      estudianteId,
      periodoId,
      cursoId: periodo.cursoId._id,
      metodoPago: metodoPago || 'efectivo',
      montoPagado: precioFinal,
      descuento: descuentoAplicado,
      observaciones: observaciones || 'Matriculado por administrador'
    });

    // Poblar datos para respuesta
    await matricula.populate('estudianteId', 'nombres apellidos email');
    await matricula.populate('periodoId', 'nombre codigo');
    await matricula.populate('cursoId', 'nombre codigo');

    res.status(201).json({
      message: 'Student enrolled successfully by admin',
      matricula
    });
  } catch (error) {
    console.error('Error enrolling student by admin:', error);
    res.status(500).json({ message: error.message });
  }
};
