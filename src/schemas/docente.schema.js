import { z } from 'zod';

export const createDocenteSchema = z.object({
  especialidad: z.enum(['Cortes Clásicos', 'Diseño de Barba', 'Color'], {
    required_error: 'Especialidad es requerida'
  }),
  añosExperiencia: z.number({
    required_error: 'Años de experiencia es requerido'
  }).min(0, 'Años de experiencia debe ser mayor o igual a 0'),
  certificaciones: z.array(z.object({
    nombre: z.string().min(1, 'Nombre de certificación es requerido'),
    institucion: z.string().min(1, 'Institución es requerida'),
    fechaObtencion: z.string().datetime('Fecha de obtención inválida')
  })).optional(),
  horarioDisponible: z.array(z.object({
    diaSemana: z.enum(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'], {
      required_error: 'Día de la semana es requerido'
    }),
    horaInicio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    horaFin: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
  })).optional(),
  activo: z.boolean().optional(),
  calificacionPromedio: z.number().min(0).max(5).optional()
});

export const updateDocenteSchema = z.object({
  especialidad: z.enum(['Cortes Clásicos', 'Diseño de Barba', 'Color']).optional(),
  añosExperiencia: z.number().min(0).optional(),
  certificaciones: z.array(z.object({
    nombre: z.string().min(1),
    institucion: z.string().min(1),
    fechaObtencion: z.string().datetime()
  })).optional(),
  horarioDisponible: z.array(z.object({
    diaSemana: z.enum(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']),
    horaInicio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    horaFin: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  })).optional(),
  activo: z.boolean().optional(),
  calificacionPromedio: z.number().min(0).max(5).optional()
});