import Matricula from '../models/matricula.model.js';
import Periodo from '../models/periodo.model.js';
import User from '../models/user.model.js';

export const matricularEstudiante = async ({
  estudianteId,
  periodoId,
  cursoId,
  metodoPago,
  montoPagado,
  descuento = 0,
  observaciones = '',
  documentos = []
}) => {
  // 1. Verificar que el estudiante existe y es estudiante
  const estudiante = await User.findById(estudianteId);
  if (!estudiante || estudiante.rol !== 'estudiante') {
    throw new Error('Student not found or invalid role');
  }

  // 2. Verificar que el periodo existe
  const periodo = await Periodo.findById(periodoId).populate('cursoId');
  if (!periodo) {
    throw new Error('Period not found');
  }

  // 3. Validaciones del periodo
  if (periodo.estado !== 'en_curso' && periodo.estado !== 'planificado') {
    throw new Error('Period is not available for enrollment');
  }

  if (periodo.cuposDisponibles <= 0) {
    throw new Error('No available spots for this period');
  }

  // 4. Verificar que no esté ya matriculado
  const existingMatricula = await Matricula.findOne({
    estudianteId: estudianteId,
    periodoId: periodoId
  });

  if (existingMatricula) {
    throw new Error('Student is already enrolled in this period');
  }

  // 5. Crear matricula
  const matricula = new Matricula({
    estudianteId,
    periodoId,
    cursoId: cursoId || periodo.cursoId._id, // Usar el del periodo si no se pasa explícitamente
    metodoPago,
    montoPagado,
    montoPendiente: 0, // Asumimos pago completo o manejo externo del pendiente por ahora
    descuento,
    observaciones,
    documentos
  });

  const savedMatricula = await matricula.save();

  // 6. Actualizar cupos del periodo
  await Periodo.findByIdAndUpdate(
    periodoId,
    { $inc: { cuposOcupados: 1, cuposDisponibles: -1 } }
  );

  return savedMatricula;
};
