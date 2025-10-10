import Modulo from '../models/modulo.model.js';

// Crear modulo
export const createModulo = async (req, res) => {
  try {
    const modulo = new Modulo(req.body);
    const savedModulo = await modulo.save();
    res.status(201).json(savedModulo);
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los modulos
export const getModulos = async (req, res) => {
  try {
    const { cursoId, activo } = req.query;
    let filter = {};

    if (cursoId) filter.cursoId = cursoId;
    if (activo !== undefined) filter.activo = activo === 'true';

    const modulos = await Modulo.find(filter)
      .populate('cursoId', 'nombre codigo')
      .sort({ orden: 1 });
    res.json(modulos);
  } catch (error) {
    console.error('Error getting modules:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener modulo por ID
export const getModuloById = async (req, res) => {
  try {
    const modulo = await Modulo.findById(req.params.id)
      .populate('cursoId');
    if (!modulo) {
      return res.status(404).json({ message: 'Module not found' });
    }
    res.json(modulo);
  } catch (error) {
    console.error('Error getting module:', error);
    res.status(500).json({ message: error.message });
  }
};

// Actualizar modulo
export const updateModulo = async (req, res) => {
  try {
    const updatedModulo = await Modulo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('cursoId');

    if (!updatedModulo) {
      return res.status(404).json({ message: 'Module not found' });
    }
    res.json(updatedModulo);
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar modulo (soft delete)
export const deleteModulo = async (req, res) => {
  try {
    const updatedModulo = await Modulo.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    if (!updatedModulo) {
      return res.status(404).json({ message: 'Module not found' });
    }
    res.json({ message: 'Module deactivated successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ message: error.message });
  }
};