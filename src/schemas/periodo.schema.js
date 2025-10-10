import { z } from 'zod';

export const createPeriodoSchema = z.object({
  cursoId: z.string().min(1, 'Curso ID es requerido'),
  nombre: z.string().min(1, 'Nombre es requerido'),
  codigo: z.string().min(1, 'Código es requerido'),
  fechaInicio: z.string().datetime('Fecha de inicio inválida'),
  fechaFin: z.string().datetime('Fecha de fin inválida'),
  cuposDisponibles: z.number().min(0, 'Cupos disponibles mínimo 0'),
  docentesPrincipales: z.array(z.string()).optional(),
  horario: z.string().min(1, 'Horario es requerido'),
  observaciones: z.string().optional()
});

export const updatePeriodoSchema = z.object({
  nombre: z.string().min(1).optional(),
  codigo: z.string().min(1).optional(),
  fechaInicio: z.string().datetime().optional(),
  fechaFin: z.string().datetime().optional(),
  estado: z.enum(['planificado', 'en_curso', 'finalizado', 'cancelado']).optional(),
  cuposDisponibles: z.number().min(0).optional(),
  docentesPrincipales: z.array(z.string()).optional(),
  horario: z.string().min(1).optional(),
  observaciones: z.string().optional()
});