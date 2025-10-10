import Docente from '../models/docente.model.js';
import User from '../models/user.model.js';

// Crear perfil de docente (completar datos faltantes)
export const createDocenteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar que el usuario existe y es docente
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.rol !== 'docente') {
      return res.status(403).json({ message: 'Only teachers can create teacher profile' });
    }

    // Verificar si ya existe un perfil de docente
    const existingProfile = await Docente.findOne({ usuarioId: userId });
    if (existingProfile) {
      return res.status(400).json({ message: 'Teacher profile already exists' });
    }

    // Crear perfil de docente
    const docenteData = {
      usuarioId: userId,
      ...req.body
    };

    const newDocente = new Docente(docenteData);
    const savedDocente = await newDocente.save();

    res.status(201).json({
      message: 'Teacher profile created successfully',
      docente: savedDocente
    });

  } catch (error) {
    console.error('Error creating teacher profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// Ver perfil de docente
export const getDocenteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar que el usuario es docente
    const user = await User.findById(userId);
    if (!user || user.rol !== 'docente') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const docente = await Docente.findOne({ usuarioId: userId })
      .populate('usuarioId', 'nombres apellidos email');

    if (!docente) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    res.json(docente);

  } catch (error) {
    console.error('Error getting teacher profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// Actualizar perfil de docente
export const updateDocenteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar que el usuario es docente
    const user = await User.findById(userId);
    if (!user || user.rol !== 'docente') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedDocente = await Docente.findOneAndUpdate(
      { usuarioId: userId },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('usuarioId', 'nombres apellidos email');

    if (!updatedDocente) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    res.json({
      message: 'Teacher profile updated successfully',
      docente: updatedDocente
    });

  } catch (error) {
    console.error('Error updating teacher profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los docentes (para administradores)
export const getAllDocentes = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar que el usuario es administrador
    const user = await User.findById(userId);
    if (!user || user.rol !== 'administrador') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const docentes = await Docente.find()
      .populate('usuarioId', 'nombres apellidos email cedula telefono');

    res.json(docentes);

  } catch (error) {
    console.error('Error getting all teachers:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener docentes activos (para estudiantes ver disponibilidad)
export const getDocentesActivos = async (req, res) => {
  try {
    const docentes = await Docente.find({ activo: true })
      .populate('usuarioId', 'nombres apellidos email')
      .select('especialidad añosExperiencia horarioDisponible calificacionPromedio');

    res.json(docentes);

  } catch (error) {
    console.error('Error getting active teachers:', error);
    res.status(500).json({ message: error.message });
  }
};