import { Router } from "express";
import {
  createMatricula,
  getMatriculas,
  getMatriculaById,
  updateMatricula,
  deleteMatricula,
  getMatriculasByEstudiante,
  agregarPago,
  adminMatricularEstudiante
} from "../controllers/matricula.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { createMatriculaSchema, updateMatriculaSchema } from "../schemas/matricula.schema.js";
import { uploadComprobante } from '../config/multer.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

// CRUD completo
router.post('/', validateSchema(createMatriculaSchema), createMatricula);
router.get('/', getMatriculas);

// Rutas específicas
router.get('/estudiante', getMatriculasByEstudiante);

router.get('/:id', getMatriculaById);
router.put('/:id', validateSchema(updateMatriculaSchema), updateMatricula);
router.delete('/:id', deleteMatricula);
router.post('/:id/pago', uploadComprobante, agregarPago);

// Ruta admin para matricular estudiantes
router.post('/admin/matricular', adminMatricularEstudiante);

export default router;