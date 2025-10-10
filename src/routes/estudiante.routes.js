import { Router } from "express";
import {
  createEstudianteProfile,
  getEstudianteProfile,
  updateEstudianteProfile,
  getAllEstudiantes
} from "../controllers/estudiante.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { createEstudianteSchema, updateEstudianteSchema } from "../schemas/estudiante.schema.js";
import { uploadDocumentos } from '../config/multer.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

// Crear perfil de estudiante
router.post('/profile', uploadDocumentos, validateSchema(createEstudianteSchema), createEstudianteProfile);

// Obtener perfil de estudiante
router.get('/profile', getEstudianteProfile);

// Actualizar perfil de estudiante
router.put('/profile', uploadDocumentos, validateSchema(updateEstudianteSchema), updateEstudianteProfile);

// Obtener todos los estudiantes (solo administradores)
router.get('/', getAllEstudiantes);

export default router;