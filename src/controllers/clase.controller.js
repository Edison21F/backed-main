import Clase from '../models/clase.model.js';

// Crear clase
export const createClase = async (req, res) => {
  try {
    const clase = new Clase(req.body);
    const savedClase = await clase.save();
    res.status(201).json(savedClase);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener todas las clases
export const getClases = async (req, res) => {
  try {
    const { periodoId, docenteId, estado } = req.query;
    let filter = {};

    if (periodoId) filter.periodoId = periodoId;
    if (docenteId) filter.docenteId = docenteId;
    if (estado) filter.estado = estado;

    const clases = await Clase.find(filter)
      .populate('periodoId', 'nombre codigo')
      .populate('moduloId', 'nombre numeroModulo')
      .populate('docenteId', 'usuarioId')
      .populate('asistencia.estudianteId', 'usuarioId')
      .sort({ fecha: 1, horaInicio: 1 });
    res.json(clases);
  } catch (error) {
    console.error('Error getting classes:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener clase por ID
export const getClaseById = async (req, res) => {
  try {
    const clase = await Clase.findById(req.params.id)
      .populate('periodoId')
      .populate('moduloId')
      .populate('docenteId', 'usuarioId')
      .populate('asistencia.estudianteId', 'usuarioId');
    if (!clase) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(clase);
  } catch (error) {
    console.error('Error getting class:', error);
    res.status(500).json({ message: error.message });
  }
};

// Actualizar clase
export const updateClase = async (req, res) => {
  try {
    const updatedClase = await Clase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('periodoId')
    .populate('moduloId')
    .populate('docenteId', 'usuarioId')
    .populate('asistencia.estudianteId', 'usuarioId');

    if (!updatedClase) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(updatedClase);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar clase
export const deleteClase = async (req, res) => {
  try {
    const deletedClase = await Clase.findByIdAndDelete(req.params.id);
    if (!deletedClase) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: error.message });
  }
};

// Marcar asistencia
export const marcarAsistencia = async (req, res) => {
  try {
    const { estudianteId, presente, observaciones } = req.body;
    const claseId = req.params.id;

    const clase = await Clase.findById(claseId);
    if (!clase) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Buscar si ya existe asistencia para este estudiante
    const asistenciaIndex = clase.asistencia.findIndex(
      a => a.estudianteId.toString() === estudianteId
    );

    if (asistenciaIndex >= 0) {
      // Actualizar asistencia existente
      clase.asistencia[asistenciaIndex].presente = presente;
      clase.asistencia[asistenciaIndex].observaciones = observaciones;
    } else {
      // Agregar nueva asistencia
      clase.asistencia.push({
        estudianteId,
        presente,
        observaciones
      });
    }

    await clase.save();
    res.json({ message: 'Attendance marked successfully', clase });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: error.message });
  }
};