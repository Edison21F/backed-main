import { Router } from "express";
import {
  createModulo,
  getModulos,
  getModuloById,
  updateModulo,
  deleteModulo
} from "../controllers/modulo.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { createModuloSchema, updateModuloSchema } from "../schemas/modulo.schema.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

// CRUD completo
router.post('/', validateSchema(createModuloSchema), createModulo);
router.get('/', getModulos);
router.get('/:id', getModuloById);
router.put('/:id', validateSchema(updateModuloSchema), updateModulo);
router.delete('/:id', deleteModulo);

export default router;