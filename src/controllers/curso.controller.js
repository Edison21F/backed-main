import mongoose from 'mongoose';
import Curso from '../models/curso.model.js';

// Crear curso
export const createCurso = async (req, res) => {
  try {
    const cursoData = { ...req.body };

    // Si hay archivo de imagen, agregar la URL
    if (req.file) {
      cursoData.imagen = `/uploads/cursos/${req.file.filename}`;
    }

    const curso = new Curso(cursoData);
    const savedCurso = await curso.save();
    res.status(201).json(savedCurso);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los cursos
export const getCursos = async (req, res) => {
  try {
    const { activo, nivel } = req.query;
    let filter = {};

    if (activo !== undefined) {
      filter.activo = activo === 'true';
    }

    if (nivel) {
      filter.nivel = nivel;
    }

    const cursos = await Curso.find(filter).sort({ createdAt: -1 });
    res.json(cursos);
  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener curso por ID
export const getCursoById = async (req, res) => {
  try {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    const curso = await Curso.findById(req.params.id);
    if (!curso) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(curso);
  } catch (error) {
    console.error('Error getting course:', error);
    res.status(500).json({ message: error.message });
  }
};
// Actualizar curso
export const updateCurso = async (req, res) => {
  try {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    const updateData = { ...req.body };

    // Si hay archivo de imagen, agregar la URL
    if (req.file) {
      updateData.imagen = `/uploads/cursos/${req.file.filename}`;
    }

    const updatedCurso = await Curso.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCurso) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(updatedCurso);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar curso (soft delete)
export const deleteCurso = async (req, res) => {
  try {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    const updatedCurso = await Curso.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    if (!updatedCurso) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deactivated successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener cursos activos (para estudiantes)
export const getCursosActivos = async (req, res) => {
  try {
    const cursos = await Curso.find({ activo: true })
      .select('nombre codigo descripcion nivel precio duracionSemanas cupoMaximo imagen')
      .sort({ nombre: 1 });
    res.json(cursos);
  } catch (error) {
    console.error('Error getting active courses:', error);
    res.status(500).json({ message: error.message });
  }
};

// cursos por estudiante
export const getCursosPorEstudiante = async (req, res) => {
  try {
    const estudianteId = req.params.id;
    if (!estudianteId || !mongoose.Types.ObjectId.isValid(estudianteId)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const cursos = await Curso.find({ estudiantes: estudianteId })
      .select('nombre codigo descripcion nivel precio duracionSemanas cupoMaximo imagen')
      .sort({ nombre: 1 });
    res.json(cursos);
  } catch (error) {
    console.error('Error getting courses by student:', error);
    res.status(500).json({ message: error.message });
  }
};