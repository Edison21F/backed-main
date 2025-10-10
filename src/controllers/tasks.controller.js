import Task from '../models/task.model.js';
import { descifrarDatos } from '../libs/encrypDates.js';

/**
 * Obtener todas las tareas del usuario
 */
export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.user.id
        }).populate('user', 'username email'); // Solo traer campos necesarios del usuario

        // Descifrar datos del usuario en cada tarea
        tasks.forEach(task => {
            if (task.user) {
                try {
                    task.user.username = descifrarDatos(task.user.username);
                    task.user.email = descifrarDatos(task.user.email);
                } catch (error) {
                    console.error('Error al descifrar datos del usuario en tarea:', error);
                    // Mantener datos encriptados si falla
                }
            }
        }); 

        return res.status(200).json(tasks);
    } catch (error) {
        console.error('Error al obtener tareas:', error);
        return res.status(500).json({ message: 'Error del servidor al obtener tareas' });
    }
};
 
/**
 * Crear una nueva tarea
 */
export const createTask = async (req, res) => {
    try {
        const { title, description, date } = req.body;
        
        // Validaciones básicas
        if (!title) {
            return res.status(400).json({ message: 'El título es obligatorio' });
        }
        
        const newTask = new Task({
            title,
            description,
            date: date || Date.now(),
            user: req.user.id
        });
        
        const savedTask = await newTask.save();
        return res.status(201).json(savedTask);
    } catch (error) {
        console.error('Error al crear tarea:', error);
        return res.status(500).json({ message: 'Error del servidor al crear tarea' });
    }
};

/**
 * Obtener una tarea específica
 */
export const getTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findById(id).populate('user', 'username email');

        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        // Verificar que la tarea pertenece al usuario actual
        if (task.user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permiso para acceder a esta tarea' });
        }

        // Descifrar datos del usuario
        if (task.user) {
            try {
                task.user.username = descifrarDatos(task.user.username);
                task.user.email = descifrarDatos(task.user.email);
            } catch (error) {
                console.error('Error al descifrar datos del usuario:', error);
                // Mantener datos encriptados si falla
            }
        }

        return res.status(200).json(task);
    } catch (error) {
        console.error('Error al obtener tarea:', error);

        // Si es un error de formato de ID inválido
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de tarea inválido' });
        }

        return res.status(500).json({ message: 'Error del servidor al obtener tarea' });
    }
};

/**
 * Actualizar una tarea
 */
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Verificar primero que la tarea existe y pertenece al usuario
        const existingTask = await Task.findById(id);
        
        if (!existingTask) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }
        
        if (existingTask.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permiso para modificar esta tarea' });
        }
        
        // Validaciones opcionales
        if (updates.title === '') {
            return res.status(400).json({ message: 'El título no puede estar vacío' });
        }
        
        const updatedTask = await Task.findByIdAndUpdate(
            id, 
            updates, 
            { new: true, runValidators: true }
        );
        
        return res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de tarea inválido' });
        }
        
        return res.status(500).json({ message: 'Error del servidor al actualizar tarea' });
    }
};

/**
 * Eliminar una tarea
 */
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar primero que la tarea existe y pertenece al usuario
        const existingTask = await Task.findById(id);
        
        if (!existingTask) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }
        
        if (existingTask.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta tarea' });
        }
        
        await Task.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Tarea eliminada correctamente', taskId: id });
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de tarea inválido' });
        }
        
        return res.status(500).json({ message: 'Error del servidor al eliminar tarea' });
    }
};

/**
 * Marcar tarea como completada/pendiente
 */
export const toggleTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        const task = await Task.findById(id);
        
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }
        
        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permiso para modificar esta tarea' });
        }
        
        // Toggle el estado (asumiendo que hay un campo completed en el modelo)
        task.completed = !task.completed;
        await task.save();
        
        return res.status(200).json(task);
    } catch (error) {
        console.error('Error al cambiar estado de tarea:', error);
        return res.status(500).json({ message: 'Error del servidor al cambiar estado de tarea' });
    }
};