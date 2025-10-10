import Estudiante from '../models/estudiante.model.js';
import User from '../models/user.model.js';

// Crear perfil de estudiante (completar datos faltantes)
export const createEstudianteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar que el usuario existe y es estudiante
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.rol !== 'estudiante') {
      return res.status(403).json({ message: 'Only students can create student profile' });
    }

    // Verificar si ya existe un perfil de estudiante
    const existingProfile = await Estudiante.findOne({ usuarioId: userId });
    if (existingProfile) {
      return res.status(400).json({ message: 'Student profile already exists' });
    }

    // Crear perfil de estudiante
    const estudianteData = {
      usuarioId: userId,
      ...req.body
    };

    const newEstudiante = new Estudiante(estudianteData);
    const savedEstudiante = await newEstudiante.save();

    res.status(201).json({
      message: 'Student profile created successfully',
      estudiante: savedEstudiante
    });

  } catch (error) {
    console.error('Error creating student profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// Ver perfil de estudiante
export const getEstudianteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar que el usuario es estudiante
    const user = await User.findById(userId);
    if (!user || user.rol !== 'estudiante') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const estudiante = await Estudiante.findOne({ usuarioId: userId })
      .populate('usuarioId', 'nombres apellidos email')
      .populate('cursoActual')
      .populate('periodoActual')
      .populate('historialCursos.cursoId')
      .populate('historialCursos.periodoId');

    if (!estudiante) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json(estudiante);

  } catch (error) {
    console.error('Error getting student profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// Actualizar perfil de estudiante
export const updateEstudianteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar que el usuario es estudiante
    const user = await User.findById(userId);
    if (!user || user.rol !== 'estudiante') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedEstudiante = await Estudiante.findOneAndUpdate(
      { usuarioId: userId },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('usuarioId', 'nombres apellidos email')
    .populate('cursoActual')
    .populate('periodoActual')
    .populate('historialCursos.cursoId')
    .populate('historialCursos.periodoId');

    if (!updatedEstudiante) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json({
      message: 'Student profile updated successfully',
      estudiante: updatedEstudiante
    });

  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los estudiantes (para administradores)
export const getAllEstudiantes = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar que el usuario es administrador
    const user = await User.findById(userId);
    if (!user || user.rol !== 'administrador') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const estudiantes = await Estudiante.find()
      .populate('usuarioId', 'nombres apellidos email cedula telefono')
      .populate('cursoActual')
      .populate('periodoActual');

    res.json(estudiantes);

  } catch (error) {
    console.error('Error getting all students:', error);
    res.status(500).json({ message: error.message });
  }
};