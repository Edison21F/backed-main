import { z } from 'zod';

export const createCursoSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido'),
  codigo: z.string().min(1, 'Código es requerido').max(20, 'Código máximo 20 caracteres'),
  descripcion: z.string().min(1, 'Descripción es requerida'),
  duracionSemanas: z.number().min(1, 'Duración mínima 1 semana'),
  nivel: z.enum(['basico', 'intermedio', 'avanzado'], {
    required_error: 'Nivel es requerido'
  }),
  precio: z.number().min(0, 'Precio debe ser mayor o igual a 0'),
  requisitos: z.array(z.string()).optional(),
  objetivos: z.array(z.string()).optional(),
  imagen: z.string().url().optional(),
  activo: z.boolean().optional(),
  cupoMaximo: z.number().min(1, 'Cupo máximo mínimo 1')
});

export const updateCursoSchema = z.object({
  nombre: z.string().min(1).optional(),
  codigo: z.string().min(1).max(20).optional(),
  descripcion: z.string().min(1).optional(),
  duracionSemanas: z.number().min(1).optional(),
  nivel: z.enum(['basico', 'intermedio', 'avanzado']).optional(),
  precio: z.number().min(0).optional(),
  requisitos: z.array(z.string()).optional(),
  objetivos: z.array(z.string()).optional(),
  imagen: z.string().url().optional(),
  activo: z.boolean().optional(),
  cupoMaximo: z.number().min(1).optional()
});