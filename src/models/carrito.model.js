import mongoose from "mongoose";

const carritoSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    cursoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Curso',
      required: true
    },
    periodoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Periodo',
      required: true
    },
    precio: {
      type: Number,
      required: true,
      min: 0
    },
    fechaAgregado: {
      type: Date,
      default: Date.now
    }
  }],
  total: {
    type: Number,
    default: 0,
    min: 0
  },
  estado: {
    type: String,
    enum: ['activo', 'procesado', 'abandonado'],
    default: 'activo'
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
carritoSchema.index({ usuarioId: 1 }, { unique: true });
carritoSchema.index({ estado: 1 });

// Middleware para calcular total automáticamente
carritoSchema.pre('save', function(next) {
  this.total = this.items.reduce((sum, item) => sum + item.precio, 0);
  this.fechaActualizacion = new Date();
  next();
});

export default mongoose.model("Carrito", carritoSchema);