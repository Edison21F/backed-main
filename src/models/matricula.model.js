import mongoose from "mongoose";

const matriculaSchema = new mongoose.Schema({
  estudianteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Estudiante',
    required: true
  },
  periodoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Periodo',
    required: true
  },
  cursoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: true
  },
  fechaMatricula: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['activa', 'suspendida', 'completada', 'retirada'],
    default: 'activa'
  },
  metodoPago: {
    type: String,
    enum: ['efectivo', 'transferencia', 'tarjeta'],
    required: true
  },
  montoPagado: {
    type: Number,
    required: true,
    min: 0
  },
  montoPendiente: {
    type: Number,
    default: 0,
    min: 0
  },
  descuento: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  observaciones: {
    type: String,
    trim: true
  },
  documentos: [{
    tipo: {
      type: String,
      enum: ['cedula', 'certificado_secundaria'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    fechaSubida: {
      type: Date,
      default: Date.now
    }
  }],
  historialPagos: [{
    fecha: {
      type: Date,
      default: Date.now
    },
    monto: {
      type: Number,
      required: true,
      min: 0
    },
    metodoPago: {
      type: String,
      enum: ['efectivo', 'transferencia', 'tarjeta'],
      required: true
    },
    comprobante: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true
});

// Índices
matriculaSchema.index({ estudianteId: 1 });
matriculaSchema.index({ periodoId: 1 });
matriculaSchema.index({ estado: 1 });
matriculaSchema.index({ estudianteId: 1, periodoId: 1 }, { unique: true });

export default mongoose.model("Matricula", matriculaSchema);