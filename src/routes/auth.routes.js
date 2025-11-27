import { Router } from "express";
import { createProfesor, login, logout, profile, register, updateUserProfile, verifyToken, updateAvatar, getProfesores, getUsuarios, adminCreateUser, updateUserByAdmin, deleteUserByAdmin } from "../controllers/auth.controller.js";
import { authRequired, adminRequired } from "../middlewares/validateToken.js";
import { validateSchema } from '../middlewares/validator.middlewares.js'
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { uploadAvatar } from '../config/multer.js';
const router = Router();

router.post('/register', validateSchema(registerSchema), register)
router.post('/login', validateSchema(loginSchema), login)
router.post('/logout', logout)
router.post('/verify', verifyToken)
router.get('/profile', authRequired, profile)
router.put('/profile', authRequired, updateUserProfile)
router.post('/avatar', authRequired, uploadAvatar, updateAvatar)
router.post('/profesores', authRequired, adminRequired, uploadAvatar, createProfesor)
router.get('/profesores', authRequired, adminRequired, getProfesores)
// Admin usuarios management
router.get('/usuarios', authRequired, adminRequired, getUsuarios)
router.post('/usuarios', authRequired, adminRequired, uploadAvatar, adminCreateUser)
router.put('/usuarios/:id', authRequired, adminRequired, updateUserByAdmin)
router.delete('/usuarios/:id', authRequired, adminRequired, deleteUserByAdmin)

export default router;
