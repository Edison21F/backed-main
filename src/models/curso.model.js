import mongoose from "mongoose";

const cursoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  codigo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  duracionSemanas: {
    type: Number,
    required: true,
    min: 1
  },
  nivel: {
    type: String,
    required: true,
    enum: ['basico', 'intermedio', 'avanzado']
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  requisitos: [{
    type: String,
    trim: true
  }],
  objetivos: [{
    type: String,
    trim: true
  }],
  imagen: {
    type: String,
    trim: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  cupoMaximo: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

// Índices
cursoSchema.index({ nivel: 1 });
cursoSchema.index({ activo: 1 });

export default mongoose.model("Curso", cursoSchema);