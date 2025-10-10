import { Router } from "express";
import {
  createPeriodo,
  getPeriodos,
  getPeriodoById,
  updatePeriodo,
  deletePeriodo
} from "../controllers/periodo.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { createPeriodoSchema, updatePeriodoSchema } from "../schemas/periodo.schema.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

// CRUD completo
router.post('/', validateSchema(createPeriodoSchema), createPeriodo);
router.get('/', getPeriodos);
router.get('/:id', getPeriodoById);
router.put('/:id', validateSchema(updatePeriodoSchema), updatePeriodo);
router.delete('/:id', deletePeriodo);

export default router;