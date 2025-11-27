import Clase from '../models/clase.model.js';
import Matricula from '../models/matricula.model.js';

// Crear clase
export const createClase = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.duracion && payload.horaInicio && payload.horaFin) {
      // Calcular duración en horas a partir de horaInicio y horaFin (HH:MM)
      const [hiH, hiM] = String(payload.horaInicio).split(':').map(Number);
      const [hfH, hfM] = String(payload.horaFin).split(':').map(Number);
      if (!Number.isNaN(hiH) && !Number.isNaN(hiM) && !Number.isNaN(hfH) && !Number.isNaN(hfM)) {
        let start = hiH * 60 + hiM;
        let end = hfH * 60 + hfM;
        // Si fin es menor que inicio, asumir que cruza medianoche
        if (end <= start) end += 24 * 60;
        const minutes = end - start;
        const hours = Math.max(1, Math.round((minutes / 60) * 100) / 100);
        payload.duracion = hours;
      }
    }

    const clase = new Clase(payload);
    const savedClase = await clase.save();
    res.status(201).json(savedClase);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener todas las clases
// Obtener todas las clases
export const getClases = async (req, res) => {
  try {
    const { periodoId, docenteId, estado } = req.query;
    let filter = {};

    if (periodoId) filter.periodoId = periodoId;
    if (docenteId) filter.docenteId = docenteId;
    if (estado) filter.estado = estado;

    console.log('User in request:', req.user);

    // Si el rol no está en el token, buscarlo en la BD
    if (!req.user.rol) {
      const User = (await import('../models/user.model.js')).default;
      const user = await User.findById(req.user.id);
      if (user) {
        req.user.rol = user.rol;
        console.log('Rol recuperado de BD:', req.user.rol);
      }
    }

    if (req.user.rol === 'docente') {
      // Si es docente, forzar filtro por su ID
      filter.docenteId = req.user.id;
    }

    if (req.user.rol === 'estudiante') {
      console.log('Filtrando clases para estudiante:', req.user.id);
      const matriculas = await Matricula.find({
        estudianteId: req.user.id,
        estado: { $in: ['activa', 'pagada', 'completada'] }
      });
      console.log('Matrículas encontradas:', matriculas.length);
      const periodosIds = matriculas.map(m => m.periodoId);
      console.log('Periodos IDs:', periodosIds);

      // Si ya había un filtro de periodo, asegurarse que esté entre los permitidos
      if (filter.periodoId) {
        if (!periodosIds.some(id => id.toString() === filter.periodoId)) {
          console.log('El estudiante no está matriculado en el periodo solicitado');
          return res.json([]); // No tiene acceso a este periodo
        }
      } else {
        filter.periodoId = { $in: periodosIds };
      }
    }

    const clases = await Clase.find(filter)
      .populate('periodoId', 'nombre codigo')
      .populate('moduloId', 'nombre numeroModulo')
      .populate('docenteId', 'nombres apellidos email')
      .populate('asistencia.estudianteId', 'usuarioId')
      .sort({ fecha: 1, horaInicio: 1 });

    console.log('Clases encontradas:', clases.length);
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
      .populate('docenteId', 'nombres apellidos email')
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
      .populate('docenteId', 'nombres apellidos email')
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
