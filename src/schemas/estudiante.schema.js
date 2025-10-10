import { z } from 'zod';

export const createEstudianteSchema = z.object({
  direccion: z.string().optional(),
  fechaNacimiento: z.string().datetime().optional(),
  contactoEmergencia: z.object({
    nombre: z.string().min(1, 'Nombre de contacto de emergencia es requerido'),
    telefono: z.string().min(1, 'Teléfono de contacto de emergencia es requerido'),
    relacion: z.string().min(1, 'Relación de contacto de emergencia es requerida')
  }).optional(),
  cursoActual: z.string().optional(), // ObjectId como string
  periodoActual: z.string().optional(), // ObjectId como string
  estado: z.enum(['activo', 'inactivo', 'graduado']).optional(),
  fechaMatricula: z.string().datetime().optional(),
  historialCursos: z.array(z.object({
    cursoId: z.string(),
    periodoId: z.string(),
    fechaInicio: z.string().datetime(),
    fechaFin: z.string().datetime().optional(),
    estado: z.enum(['completado', 'abandonado'])
  })).optional()
});

export const updateEstudianteSchema = z.object({
  direccion: z.string().optional(),
  fechaNacimiento: z.string().datetime().optional(),
  contactoEmergencia: z.object({
    nombre: z.string().min(1),
    telefono: z.string().min(1),
    relacion: z.string().min(1)
  }).optional(),
  cursoActual: z.string().optional(),
  periodoActual: z.string().optional(),
  estado: z.enum(['activo', 'inactivo', 'graduado']).optional(),
  fechaMatricula: z.string().datetime().optional(),
  historialCursos: z.array(z.object({
    cursoId: z.string(),
    periodoId: z.string(),
    fechaInicio: z.string().datetime(),
    fechaFin: z.string().datetime().optional(),
    estado: z.enum(['completado', 'abandonado'])
  })).optional()
});