import mongoose from "mongoose";
import { cifrarDatos, descifrarDatos } from '../libs/encrypDates.js';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
},
    {
        timestamps: true
    }
)

// Encriptar datos antes de guardar
taskSchema.pre('save', async function(next) {
    try {
        if (this.isModified('title') || this.isNew) {
            this.title = cifrarDatos(this.title);
        }
        if (this.isModified('description') || this.isNew) {
            this.description = cifrarDatos(this.description);
        }
        if (this.isModified('date') || this.isNew) {
            this.date = cifrarDatos(this.date.toISOString());
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Descifrar datos al convertir a JSON
taskSchema.methods.toJSON = function() {
    const task = this.toObject();
    try {
        task.title = descifrarDatos(task.title);
        task.description = descifrarDatos(task.description);
        task.date = new Date(descifrarDatos(task.date));
    } catch (error) {
        console.error('Error al descifrar datos de la tarea:', error);
    }
    return task;
};

export default mongoose.model('Task', taskSchema);