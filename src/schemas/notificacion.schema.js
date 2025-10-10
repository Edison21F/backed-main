import { z } from 'zod';

export const createNotificacionSchema = z.object({
  tipo: z.enum(['clase', 'matricula', 'recordatorio', 'general'], {
    required_error: 'Tipo es requerido'
  }),
  destinatarios: z.array(z.object({
    usuarioId: z.string().min(1, 'Usuario ID requerido'),
    telefono: z.string().min(1, 'Teléfono requerido')
  })).min(1, 'Al menos un destinatario requerido'),
  mensaje: z.string().min(1, 'Mensaje es requerido'),
  claseId: z.string().optional(),
  periodoId: z.string().optional(),
  fechaProgramada: z.string().datetime('Fecha programada inválida')
});

export const updateNotificacionSchema = z.object({
  estado: z.enum(['pendiente', 'enviando', 'completado', 'fallido']).optional(),
  intentos: z.number().min(0).optional(),
  errorLog: z.array(z.string()).optional()
});