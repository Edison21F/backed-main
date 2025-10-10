import { z } from 'zod';

export const createModuloSchema = z.object({
  cursoId: z.string().min(1, 'Curso ID es requerido'),
  nombre: z.string().min(1, 'Nombre es requerido'),
  numeroModulo: z.number().min(1, 'Número de módulo mínimo 1'),
  descripcion: z.string().min(1, 'Descripción es requerida'),
  duracionHoras: z.number().min(1, 'Duración mínima 1 hora'),
  objetivos: z.array(z.string()).optional(),
  temas: z.array(z.object({
    nombre: z.string().min(1, 'Nombre del tema requerido'),
    duracion: z.number().min(1, 'Duración mínima 1'),
    contenido: z.string().optional()
  })).optional(),
  materialesNecesarios: z.array(z.string()).optional(),
  orden: z.number().min(1, 'Orden mínimo 1')
});

export const updateModuloSchema = z.object({
  nombre: z.string().min(1).optional(),
  numeroModulo: z.number().min(1).optional(),
  descripcion: z.string().min(1).optional(),
  duracionHoras: z.number().min(1).optional(),
  objetivos: z.array(z.string()).optional(),
  temas: z.array(z.object({
    nombre: z.string().min(1),
    duracion: z.number().min(1),
    contenido: z.string().optional()
  })).optional(),
  materialesNecesarios: z.array(z.string()).optional(),
  activo: z.boolean().optional(),
  orden: z.number().min(1).optional()
});