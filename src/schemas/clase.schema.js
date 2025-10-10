import { z } from 'zod';

export const createClaseSchema = z.object({
  periodoId: z.string().min(1, 'Periodo ID es requerido'),
  moduloId: z.string().min(1, 'Modulo ID es requerido'),
  docenteId: z.string().min(1, 'Docente ID es requerido'),
  titulo: z.string().min(1, 'Título es requerido'),
  descripcion: z.string().min(1, 'Descripción es requerida'),
  fecha: z.string().datetime('Fecha inválida'),
  horaInicio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  horaFin: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  ubicacion: z.string().min(1, 'Ubicación es requerida'),
  modalidad: z.enum(['presencial', 'virtual', 'hibrida']).optional(),
  enlaceVirtual: z.string().url().optional(),
  materialesClase: z.array(z.string()).optional(),
  observaciones: z.string().optional()
});

export const updateClaseSchema = z.object({
  titulo: z.string().min(1).optional(),
  descripcion: z.string().min(1).optional(),
  fecha: z.string().datetime().optional(),
  horaInicio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  horaFin: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  ubicacion: z.string().min(1).optional(),
  modalidad: z.enum(['presencial', 'virtual', 'hibrida']).optional(),
  enlaceVirtual: z.string().url().optional(),
  estado: z.enum(['programada', 'en_curso', 'finalizada', 'cancelada']).optional(),
  asistencia: z.array(z.object({
    estudianteId: z.string(),
    presente: z.boolean(),
    observaciones: z.string().optional()
  })).optional(),
  materialesClase: z.array(z.string()).optional(),
  observaciones: z.string().optional()
});