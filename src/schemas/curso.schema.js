import { z } from 'zod'

// Accept single string or array, normalize to array
const stringOrArrayToArray = (val) => {
  if (Array.isArray(val)) return val
  if (typeof val === 'string') return val.length ? [val] : []
  return []
}

export const createCursoSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido'),
  codigo: z.string().min(1, 'Codigo es requerido').max(20, 'Codigo maximo 20 caracteres'),
  descripcion: z.string().min(1, 'Descripcion es requerida'),
  // Coerce numbers/booleans because multipart/form-data sends strings
  duracionSemanas: z.coerce.number().min(1, 'Duracion minima 1 semana'),
  nivel: z.enum(['basico', 'intermedio', 'avanzado'], {
    required_error: 'Nivel es requerido',
  }),
  precio: z.coerce.number().min(0, 'Precio debe ser mayor o igual a 0'),
  requisitos: z.preprocess(stringOrArrayToArray, z.array(z.string())).optional(),
  objetivos: z.preprocess(stringOrArrayToArray, z.array(z.string())).optional(),
  imagen: z.string().url().optional(),
  activo: z.coerce.boolean().optional(),
  cupoMaximo: z.coerce.number().min(1, 'Cupo maximo minimo 1'),
})

export const updateCursoSchema = z.object({
  nombre: z.string().min(1).optional(),
  codigo: z.string().min(1).max(20).optional(),
  descripcion: z.string().min(1).optional(),
  duracionSemanas: z.coerce.number().min(1).optional(),
  nivel: z.enum(['basico', 'intermedio', 'avanzado']).optional(),
  precio: z.coerce.number().min(0).optional(),
  requisitos: z.preprocess(stringOrArrayToArray, z.array(z.string())).optional(),
  objetivos: z.preprocess(stringOrArrayToArray, z.array(z.string())).optional(),
  imagen: z.string().url().optional(),
  activo: z.coerce.boolean().optional(),
  cupoMaximo: z.coerce.number().min(1).optional(),
})

