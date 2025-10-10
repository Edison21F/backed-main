import mongoose from "mongoose";

const docenteSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  especialidad: {
    type: String,
    enum: ['Cortes Clásicos', 'Diseño de Barba', 'Color'],
    required: true
  },
  añosExperiencia: {
    type: Number,
    required: true,
    min: 0
  },
  certificaciones: [{
    nombre: {
      type: String,
      required: true
    },
    institucion: {
      type: String,
      required: true
    },
    fechaObtencion: {
      type: Date,
      required: true
    }
  }],
  horarioDisponible: [{
    diaSemana: {
      type: String,
      enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
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
    }
  }],
  activo: {
    type: Boolean,
    default: true
  },
  calificacionPromedio: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model("Docente", docenteSchema);