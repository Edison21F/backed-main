import mongoose from "mongoose";

const periodoSchema = new mongoose.Schema({
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
  codigo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaFin: {
    type: Date,
    required: true
  },
  estado: {
    type: String,
    enum: ['planificado', 'en_curso', 'finalizado', 'cancelado'],
    default: 'planificado'
  },
  cuposDisponibles: {
    type: Number,
    required: true,
    min: 0
  },
  cuposOcupados: {
    type: Number,
    default: 0,
    min: 0
  },
  docentesPrincipales: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Docente'
  }],
  horario: {
    type: String,
    required: true,
    trim: true
  },
  observaciones: {
    type: String,
    trim: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
periodoSchema.index({ codigo: 1 }, { unique: true });
periodoSchema.index({ cursoId: 1 });
periodoSchema.index({ estado: 1 });
periodoSchema.index({ fechaInicio: 1, fechaFin: 1 });

export default mongoose.model("Periodo", periodoSchema);