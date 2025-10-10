import { z } from 'zod';

export const registerSchema = z.object({
    nombres: z.string({
        required_error: 'Nombres is required',
    }).min(2).max(255),
    apellidos: z.string({
        required_error: 'Apellidos is required',
    }).min(2).max(255),
    email: z.string({
        required_error: 'Email is required',
    }).email({
        message: 'Invalid email',
    }),
    cedula: z.string({
        required_error: 'Cédula is required',
    }).min(10).max(13),
    telefono: z.string().optional(),
    password: z.string({
        required_error: 'Password is required',
    }).min(6, {
        message: 'Password must be at least 6 characters',
    }).max(255),
    rol: z.enum(['estudiante', 'docente', 'administrador']).optional(),
    avatar: z.string().url().optional()
})

export const loginSchema = z.object({
    email: z.string({
        required_error: 'Email is required',
    }).email({
        message: 'Invalid email',
    }),
    password: z.string({
        required_error: 'Password is required',
    }).min(6, {
        message: 'Password must be at least 6 characters',
    }).max(255),
})