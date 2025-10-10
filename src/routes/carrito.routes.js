import { Router } from "express";
import {
  getCarrito,
  addToCarrito,
  removeFromCarrito,
  clearCarrito,
  checkoutCarrito
} from "../controllers/carrito.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { addToCarritoSchema, checkoutCarritoSchema } from "../schemas/carrito.schema.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

// Rutas del carrito
router.get('/', getCarrito);
router.post('/items', validateSchema(addToCarritoSchema), addToCarrito);
router.delete('/items/:itemId', removeFromCarrito);
router.delete('/clear', clearCarrito);
router.post('/checkout', validateSchema(checkoutCarritoSchema), checkoutCarrito);

export default router;