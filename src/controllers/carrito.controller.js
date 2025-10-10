import Carrito from '../models/carrito.model.js';
import Matricula from '../models/matricula.model.js';
import Periodo from '../models/periodo.model.js';
import User from '../models/user.model.js';

// Obtener carrito del usuario
export const getCarrito = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar que es estudiante
    const user = await User.findById(userId);
    if (!user || user.rol !== 'estudiante') {
      return res.status(403).json({ message: 'Only students can access cart' });
    }

    let carrito = await Carrito.findOne({ usuarioId: userId })
      .populate('items.cursoId', 'nombre codigo precio imagen')
      .populate('items.periodoId', 'nombre codigo fechaInicio fechaFin');

    if (!carrito) {
      // Crear carrito vacío si no existe
      carrito = new Carrito({ usuarioId: userId });
      await carrito.save();
      carrito = await Carrito.findById(carrito._id)
        .populate('items.cursoId', 'nombre codigo precio imagen')
        .populate('items.periodoId', 'nombre codigo fechaInicio fechaFin');
    }

    res.json(carrito);
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ message: error.message });
  }
};

// Agregar item al carrito
export const addToCarrito = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cursoId, periodoId } = req.body;

    // Verificar que es estudiante
    const user = await User.findById(userId);
    if (!user || user.rol !== 'estudiante') {
      return res.status(403).json({ message: 'Only students can add to cart' });
    }

    // Verificar que el periodo existe y tiene cupos
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
      estudianteId: userId,
      periodoId: periodoId
    });

    if (existingMatricula) {
      return res.status(400).json({ message: 'Already enrolled in this period' });
    }

    // Buscar o crear carrito
    let carrito = await Carrito.findOne({ usuarioId: userId });
    if (!carrito) {
      carrito = new Carrito({ usuarioId: userId });
    }

    // Verificar si el item ya está en el carrito
    const existingItem = carrito.items.find(
      item => item.cursoId.toString() === cursoId && item.periodoId.toString() === periodoId
    );

    if (existingItem) {
      return res.status(400).json({ message: 'Item already in cart' });
    }

    // Agregar item
    carrito.items.push({
      cursoId,
      periodoId,
      precio: periodo.cursoId.precio
    });

    await carrito.save();
    await carrito.populate('items.cursoId', 'nombre codigo precio imagen');
    await carrito.populate('items.periodoId', 'nombre codigo fechaInicio fechaFin');

    res.json({ message: 'Item added to cart', carrito });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remover item del carrito
export const removeFromCarrito = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.itemId;

    const carrito = await Carrito.findOne({ usuarioId: userId });
    if (!carrito) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remover item
    carrito.items = carrito.items.filter(item => item._id.toString() !== itemId);

    await carrito.save();
    await carrito.populate('items.cursoId', 'nombre codigo precio imagen');
    await carrito.populate('items.periodoId', 'nombre codigo fechaInicio fechaFin');

    res.json({ message: 'Item removed from cart', carrito });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: error.message });
  }
};

// Vaciar carrito
export const clearCarrito = async (req, res) => {
  try {
    const userId = req.user.id;

    const carrito = await Carrito.findOneAndUpdate(
      { usuarioId: userId },
      { items: [], total: 0 },
      { new: true }
    );

    if (!carrito) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.json({ message: 'Cart cleared', carrito });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: error.message });
  }
};

// Checkout - Crear matriculas
export const checkoutCarrito = async (req, res) => {
  try {
    const userId = req.user.id;
    const { metodoPago } = req.body;

    // Verificar que es estudiante
    const user = await User.findById(userId);
    if (!user || user.rol !== 'estudiante') {
      return res.status(403).json({ message: 'Only students can checkout' });
    }

    const carrito = await Carrito.findOne({ usuarioId: userId })
      .populate('items.cursoId')
      .populate('items.periodoId');

    if (!carrito || carrito.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Crear matriculas para cada item
    const matriculasCreadas = [];
    for (const item of carrito.items) {
      // Verificar cupos disponibles
      if (item.periodoId.cuposDisponibles <= 0) {
        return res.status(400).json({
          message: `No available spots for period ${item.periodoId.nombre}`
        });
      }

      // Crear matricula
      const matricula = new Matricula({
        estudianteId: userId,
        periodoId: item.periodoId._id,
        cursoId: item.cursoId._id,
        metodoPago,
        montoPagado: item.precio,
        montoPendiente: 0
      });

      const savedMatricula = await matricula.save();

      // Actualizar cupos del periodo
      await Periodo.findByIdAndUpdate(
        item.periodoId._id,
        { $inc: { cuposOcupados: 1, cuposDisponibles: -1 } }
      );

      matriculasCreadas.push(savedMatricula);
    }

    // Marcar carrito como procesado
    carrito.estado = 'procesado';
    await carrito.save();

    res.json({
      message: 'Checkout completed successfully',
      matriculas: matriculasCreadas
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ message: error.message });
  }
};