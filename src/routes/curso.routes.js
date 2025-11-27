import { Router } from "express";
import {
  createCurso,
  getCursos,
  getCursoById,
  updateCurso,
  deleteCurso,
  getCursosActivos,
  getCursosPorEstudiante
} from "../controllers/curso.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { createCursoSchema, updateCursoSchema } from "../schemas/curso.schema.js";
import { uploadImagenCurso } from '../config/multer.js';

const router = Router();

// Rutas públicas para ver cursos activos
router.get('/activos', getCursosActivos);
// Detalle público
router.get('/:id', getCursoById);

// Todas las demás rutas requieren autenticación
router.use(authRequired);

// CRUD completo para administradores

router.post('/', uploadImagenCurso, validateSchema(createCursoSchema), createCurso);
router.get('/', getCursos);
router.put('/:id', uploadImagenCurso, validateSchema(updateCursoSchema), updateCurso);
router.delete('/:id', deleteCurso);

// Cursos por estudiante
router.get('/estudiante/:id', getCursosPorEstudiante);


export default router;
