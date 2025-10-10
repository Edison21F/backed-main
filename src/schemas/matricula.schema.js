import { z } from 'zod';

export const createMatriculaSchema = z.object({
  estudianteId: z.string().min(1, 'Estudiante ID es requerido'),
  periodoId: z.string().min(1, 'Periodo ID es requerido'),
  metodoPago: z.enum(['efectivo', 'transferencia', 'tarjeta'], {
    required_error: 'Método de pago es requerido'
  }),
  montoPagado: z.number().min(0, 'Monto pagado mínimo 0'),
  descuento: z.number().min(0).max(100).optional(),
  observaciones: z.string().optional(),
  documentos: z.array(z.object({
    tipo: z.enum(['cedula', 'certificado_secundaria']),
    url: z.string().url('URL inválida')
  })).optional(),
  historialPagos: z.array(z.object({
    monto: z.number().min(0, 'Monto mínimo 0'),
    metodoPago: z.enum(['efectivo', 'transferencia', 'tarjeta']),
    comprobante: z.string().optional()
  })).optional()
});

export const updateMatriculaSchema = z.object({
  estado: z.enum(['activa', 'suspendida', 'completada', 'retirada']).optional(),
  metodoPago: z.enum(['efectivo', 'transferencia', 'tarjeta']).optional(),
  montoPagado: z.number().min(0).optional(),
  montoPendiente: z.number().min(0).optional(),
  descuento: z.number().min(0).max(100).optional(),
  observaciones: z.string().optional(),
  documentos: z.array(z.object({
    tipo: z.enum(['cedula', 'certificado_secundaria']),
    url: z.string().url()
  })).optional(),
  historialPagos: z.array(z.object({
    fecha: z.string().datetime().optional(),
    monto: z.number().min(0),
    metodoPago: z.enum(['efectivo', 'transferencia', 'tarjeta']),
    comprobante: z.string().optional()
  })).optional()
});