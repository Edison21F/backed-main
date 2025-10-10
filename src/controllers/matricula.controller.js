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
    const { monto, metodoPago, comprobante } = req.body;
    const matriculaId = req.params.id;

    const matricula = await Matricula.findById(matriculaId);
    if (!matricula) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    matricula.historialPagos.push({
      monto,
      metodoPago,
      comprobante
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