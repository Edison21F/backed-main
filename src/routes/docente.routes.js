import { Router } from "express";
import {
  createDocenteProfile,
  getDocenteProfile,
  updateDocenteProfile,
  getAllDocentes,
  getDocentesActivos
} from "../controllers/docente.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { createDocenteSchema, updateDocenteSchema } from "../schemas/docente.schema.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

// Crear perfil de docente
router.post('/profile', validateSchema(createDocenteSchema), createDocenteProfile);

// Obtener perfil de docente
router.get('/profile', getDocenteProfile);

// Actualizar perfil de docente
router.put('/profile', validateSchema(updateDocenteSchema), updateDocenteProfile);

// Obtener todos los docentes (solo administradores)
router.get('/', getAllDocentes);

// Obtener docentes activos (público para estudiantes)
router.get('/activos', getDocentesActivos);

export default router;