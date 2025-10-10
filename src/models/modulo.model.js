import mongoose from "mongoose";

const moduloSchema = new mongoose.Schema({
  cursoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  numeroModulo: {
    type: Number,
    required: true,
    min: 1
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  duracionHoras: {
    type: Number,
    required: true,
    min: 1
  },
  objetivos: [{
    type: String,
    trim: true
  }],
  temas: [{
    nombre: {
      type: String,
      required: true
    },
    duracion: {
      type: Number,
      required: true,
      min: 1
    },
    contenido: {
      type: String,
      trim: true
    }
  }],
  materialesNecesarios: [{
    type: String,
    trim: true
  }],
  activo: {
    type: Boolean,
    default: true
  },
  orden: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

// Índices
moduloSchema.index({ cursoId: 1 });
moduloSchema.index({ orden: 1 });

export default mongoose.model("Modulo", moduloSchema);