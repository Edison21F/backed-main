import mongoose from "mongoose";

const claseSchema = new mongoose.Schema({
  periodoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Periodo',
    required: true
  },
  moduloId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Modulo',
    required: true
  },
  docenteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  fecha: {
    type: Date,
    required: true
  },
  horaInicio: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  horaFin: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  duracion: {
    type: Number,
    required: true,
    min: 1
  },
  ubicacion: {
    type: String,
    required: true,
    trim: true
  },
  modalidad: {
    type: String,
    enum: ['presencial', 'virtual', 'hibrida'],
    default: 'presencial'
  },
  enlaceVirtual: {
    type: String,
    trim: true
  },
  estado: {
    type: String,
    enum: ['programada', 'en_curso', 'finalizada', 'cancelada'],
    default: 'programada'
  },
  asistencia: [{
    estudianteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estudiante',
      required: true
    },
    presente: {
      type: Boolean,
      default: false
    },
    observaciones: {
      type: String,
      trim: true
    }
  }],
  materialesClase: [{
    type: String,
    trim: true
  }],
  notificacionEnviada: {
    type: Boolean,
    default: false
  },
  fechaNotificacion: {
    type: Date
  },
  observaciones: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índices
claseSchema.index({ periodoId: 1 });
claseSchema.index({ moduloId: 1 });
claseSchema.index({ docenteId: 1 });
claseSchema.index({ fecha: 1 });
claseSchema.index({ estado: 1 });

export default mongoose.model("Clase", claseSchema);