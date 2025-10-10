import { z } from 'zod';

export const addToCarritoSchema = z.object({
  cursoId: z.string().min(1, 'Curso ID es requerido'),
  periodoId: z.string().min(1, 'Periodo ID es requerido')
});

export const updateCarritoItemSchema = z.object({
  precio: z.number().min(0, 'Precio debe ser mayor o igual a 0').optional()
});

export const checkoutCarritoSchema = z.object({
  metodoPago: z.enum(['efectivo', 'transferencia', 'tarjeta'], {
    required_error: 'Método de pago es requerido'
  })
});