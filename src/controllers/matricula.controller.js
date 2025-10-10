import Matricula from '../models/matricula.model.js';
import Periodo from '../models/periodo.model.js';

// Crear matricula
export const createMatricula = async (req, res) => {
  try {
    const matricula = new Matricula(req.body);
    const savedMatricula = await matricula.save();

    // Actualizar cupos del periodo
    await Periodo.findByIdAndUpdate(
      req.body.periodoId,
      { $inc: { cuposOcupados: 1 } }
    );

    res.status(201).json(savedMatricula);
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
      .populate('estudianteId', 'usuarioId')
      .populate('periodoId', 'nombre codigo')
      .populate('cursoId', 'nombre codigo')
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
    const matriculas = await Matricula.find({ estudianteId: req.params.estudianteId })
      .populate('periodoId', 'nombre codigo fechaInicio fechaFin')
      .populate('cursoId', 'nombre codigo precio')
      .sort({ fechaMatricula: -1 });
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

    // Verificar que el estudiante existe y es estudiante
    const estudiante = await User.findById(estudianteId);
    if (!estudiante || estudiante.rol !== 'estudiante') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Verificar que el periodo existe
    const periodo = await Periodo.findById(periodoId).populate('cursoId');
    if (!periodo) {
      return res.status(404).json({ message: 'Period not found' });
    }

    if (periodo.estado !== 'en_curso') {
      return res.status(400).json({ message: 'Period is not available for enrollment' });
    }

    if (periodo.cuposDisponibles <= 0) {
      return res.status(400).json({ message: 'No available spots for this period' });
    }

    // Verificar que no esté ya matriculado
    const existingMatricula = await Matricula.findOne({
      estudianteId: estudianteId,
      periodoId: periodoId
    });

    if (existingMatricula) {
      return res.status(400).json({ message: 'Student is already enrolled in this period' });
    }

    // Calcular precios con descuento
    const precioOriginal = periodo.cursoId.precio;
    const descuentoAplicado = descuento || 0;
    const precioFinal = precioOriginal * (1 - descuentoAplicado / 100);

    // Crear matricula
    const matricula = new Matricula({
      estudianteId: estudianteId,
      periodoId: periodoId,
      cursoId: periodo.cursoId._id,
      metodoPago: metodoPago || 'efectivo',
      montoPagado: precioFinal,
      montoPendiente: 0,
      descuento: descuentoAplicado,
      observaciones: observaciones || 'Matriculado por administrador'
    });

    const savedMatricula = await matricula.save();

    // Actualizar cupos del periodo
    await Periodo.findByIdAndUpdate(
      periodoId,
      { $inc: { cuposOcupados: 1, cuposDisponibles: -1 } }
    );

    // Poblar datos para respuesta
    await savedMatricula.populate('estudianteId', 'nombres apellidos email');
    await savedMatricula.populate('periodoId', 'nombre codigo');
    await savedMatricula.populate('cursoId', 'nombre codigo');

    res.status(201).json({
      message: 'Student enrolled successfully by admin',
      matricula: savedMatricula
    });
  } catch (error) {
    console.error('Error enrolling student by admin:', error);
    res.status(500).json({ message: error.message });
  }
};