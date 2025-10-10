import Curso from '../models/curso.model.js';

// Crear curso
export const createCurso = async (req, res) => {
  try {
    const curso = new Curso(req.body);
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
    const updatedCurso = await Curso.findByIdAndUpdate(
      req.params.id,
      req.body,
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