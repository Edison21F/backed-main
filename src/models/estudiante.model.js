import mongoose from "mongoose";

const estudianteSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  direccion: {
    type: String,
    trim: true
  },
  fechaNacimiento: {
    type: Date
  },
  contactoEmergencia: {
    nombre: {
      type: String,
      trim: true
    },
    telefono: {
      type: String,
      trim: true
    },
    relacion: {
      type: String,
      trim: true
    }
  },
  cursoActual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    default: null
  },
  periodoActual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Periodo',
    default: null
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo', 'graduado'],
    default: 'activo'
  },
  fechaMatricula: {
    type: Date,
    default: Date.now
  },
  historialCursos: [{
    cursoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Curso'
    },
    periodoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Periodo'
    },
    fechaInicio: Date,
    fechaFin: Date,
    estado: {
      type: String,
      enum: ['completado', 'abandonado']
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model("Estudiante", estudianteSchema);