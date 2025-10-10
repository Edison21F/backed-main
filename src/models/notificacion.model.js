import mongoose from "mongoose";

const notificacionSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['clase', 'matricula', 'recordatorio', 'general'],
    required: true
  },
  destinatarios: [{
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    telefono: {
      type: String,
      required: true
    },
    enviado: {
      type: Boolean,
      default: false
    },
    fechaEnvio: {
      type: Date
    },
    estadoWhatsApp: {
      type: String,
      enum: ['enviado', 'entregado', 'leido', 'fallido'],
      default: 'enviado'
    }
  }],
  mensaje: {
    type: String,
    required: true
  },
  claseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clase'
  },
  periodoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Periodo'
  },
  fechaProgramada: {
    type: Date,
    required: true
  },
  fechaEnvioReal: {
    type: Date
  },
  estado: {
    type: String,
    enum: ['pendiente', 'enviando', 'completado', 'fallido'],
    default: 'pendiente'
  },
  intentos: {
    type: Number,
    default: 0
  },
  errorLog: [{
    type: String
  }]
}, {
  timestamps: true
});

// Índices
notificacionSchema.index({ tipo: 1 });
notificacionSchema.index({ estado: 1 });
notificacionSchema.index({ fechaProgramada: 1 });
notificacionSchema.index({ claseId: 1 });

export default mongoose.model("Notificacion", notificacionSchema);