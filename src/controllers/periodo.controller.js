import Periodo from '../models/periodo.model.js';
import Curso from '../models/curso.model.js';

// Crear periodo
export const createPeriodo = async (req, res) => {
  try {
    const periodo = new Periodo(req.body);
    const savedPeriodo = await periodo.save();
    res.status(201).json(savedPeriodo);
  } catch (error) {
    console.error('Error creating period:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los periodos
export const getPeriodos = async (req, res) => {
  try {
    const { cursoId, estado } = req.query;
    let filter = {};

    if (cursoId) filter.cursoId = cursoId;
    if (estado) filter.estado = estado;

    const periodos = await Periodo.find(filter)
      .populate('cursoId', 'nombre codigo')
      .populate('docentesPrincipales', 'usuarioId')
      .sort({ fechaInicio: -1 });
    res.json(periodos);
  } catch (error) {
    console.error('Error getting periods:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener periodo por ID
export const getPeriodoById = async (req, res) => {
  try {
    const periodo = await Periodo.findById(req.params.id)
      .populate('cursoId')
      .populate('docentesPrincipales', 'usuarioId');
    if (!periodo) {
      return res.status(404).json({ message: 'Period not found' });
    }
    res.json(periodo);
  } catch (error) {
    console.error('Error getting period:', error);
    res.status(500).json({ message: error.message });
  }
};

// Actualizar periodo
export const updatePeriodo = async (req, res) => {
  try {
    const updatedPeriodo = await Periodo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('cursoId')
    .populate('docentesPrincipales', 'usuarioId');

    if (!updatedPeriodo) {
      return res.status(404).json({ message: 'Period not found' });
    }
    res.json(updatedPeriodo);
  } catch (error) {
    console.error('Error updating period:', error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar periodo
export const deletePeriodo = async (req, res) => {
  try {
    const deletedPeriodo = await Periodo.findByIdAndDelete(req.params.id);
    if (!deletedPeriodo) {
      return res.status(404).json({ message: 'Period not found' });
    }
    res.json({ message: 'Period deleted successfully' });
  } catch (error) {
    console.error('Error deleting period:', error);
    res.status(500).json({ message: error.message });
  }
};