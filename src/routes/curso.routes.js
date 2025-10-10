import { Router } from "express";
import {
  createCurso,
  getCursos,
  getCursoById,
  updateCurso,
  deleteCurso,
  getCursosActivos
} from "../controllers/curso.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { createCursoSchema, updateCursoSchema } from "../schemas/curso.schema.js";

const router = Router();

// Rutas públicas para ver cursos activos
router.get('/activos', getCursosActivos);

// Todas las demás rutas requieren autenticación
router.use(authRequired);

// CRUD completo para administradores
router.post('/', validateSchema(createCursoSchema), createCurso);
router.get('/', getCursos);
router.get('/:id', getCursoById);
router.put('/:id', validateSchema(updateCursoSchema), updateCurso);
router.delete('/:id', deleteCurso);

export default router;