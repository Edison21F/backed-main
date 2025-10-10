import { Router } from "express";
import {
  createClase,
  getClases,
  getClaseById,
  updateClase,
  deleteClase,
  marcarAsistencia
} from "../controllers/clase.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { createClaseSchema, updateClaseSchema } from "../schemas/clase.schema.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

// CRUD completo
router.post('/', validateSchema(createClaseSchema), createClase);
router.get('/', getClases);
router.get('/:id', getClaseById);
router.put('/:id', validateSchema(updateClaseSchema), updateClase);
router.delete('/:id', deleteClase);

// Marcar asistencia
router.post('/:id/asistencia', marcarAsistencia);

export default router;