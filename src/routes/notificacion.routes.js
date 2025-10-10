import { Router } from "express";
import {
  createNotificacion,
  getNotificaciones,
  getNotificacionById,
  updateNotificacion,
  deleteNotificacion,
  enviarNotificacion
} from "../controllers/notificacion.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { createNotificacionSchema, updateNotificacionSchema } from "../schemas/notificacion.schema.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

// CRUD completo
router.post('/', validateSchema(createNotificacionSchema), createNotificacion);
router.get('/', getNotificaciones);
router.get('/:id', getNotificacionById);
router.put('/:id', validateSchema(updateNotificacionSchema), updateNotificacion);
router.delete('/:id', deleteNotificacion);

// Enviar notificación
router.post('/:id/enviar', enviarNotificacion);

export default router;