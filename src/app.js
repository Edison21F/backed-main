import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import hpp from "hpp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import winston from "winston";

import authRouter from "./routes/auth.routes.js";
import tasksRouter from "./routes/tasks.routes.js";
import estudianteRouter from "./routes/estudiante.routes.js";
import docenteRouter from "./routes/docente.routes.js";
import cursoRouter from "./routes/curso.routes.js";
import periodoRouter from "./routes/periodo.routes.js";
import moduloRouter from "./routes/modulo.routes.js";
import claseRouter from "./routes/clase.routes.js";
import notificacionRouter from "./routes/notificacion.routes.js";
import matriculaRouter from "./routes/matricula.routes.js";
import carritoRouter from "./routes/carrito.routes.js";

// Configuración para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ==================== CONFIGURACIÓN DE LOGS ====================
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => {
            return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
        })
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'app.log'),
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// ==================== CONFIGURACIÓN DE CORS ====================
const allowedOrigins = [
  "http://localhost:5173",
  "https://home-task-vite.vercel.app",
  "http://localhost:19006",
  "http://localhost:8081",  
  "exp://192.168.100.32:8081",
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (como Postman, apps móviles)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("No autorizado por CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ==================== SEGURIDAD ====================
// Helmet para headers de seguridad
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false
}));

// Protección contra HTTP Parameter Pollution
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: { error: 'Demasiadas peticiones, intenta más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Rate limit excedido para IP: ${req.ip}`);
        res.status(429).json({
            error: 'Demasiadas peticiones, intenta más tarde.'
        });
    }
});

// Aplicar rate limiting a rutas de autenticación
app.use('/api/login', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // solo 5 intentos de login cada 15 minutos
    message: { error: 'Demasiados intentos de inicio de sesión.' }
}));

app.use('/api/register', rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3, // solo 3 registros por hora
    message: { error: 'Demasiados intentos de registro.' }
}));

app.use(limiter);

// ==================== SERVIR ARCHIVOS ESTÁTICOS ====================
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==================== MIDDLEWARE BÁSICO ====================
// Logging con Morgan usando Winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// Limitar tamaño de payload
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser con secreto
app.use(cookieParser(process.env.COOKIE_SECRET || 'tu-secreto-cookie-seguro'));

// Compresión de respuestas
app.use(compression());

// ==================== HEADERS DE SEGURIDAD ADICIONALES ====================
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// ==================== MIDDLEWARE DE RESPUESTAS ESTANDARIZADAS ====================
app.use((req, res, next) => {
    // Helper para respuestas exitosas
    res.apiSuccess = (data, message = 'Success', status = 200) => {
        return res.status(status).json({
            success: true,
            message,
            data
        });
    };

    // Helper para respuestas de error
    res.apiError = (message, status = 400, errors = null) => {
        return res.status(status).json({
            success: false,
            message,
            errors
        });
    };

    next();
});

// ==================== RUTAS ====================
app.use("/api", authRouter);
app.use("/api/estudiantes", estudianteRouter);
app.use("/api/docentes", docenteRouter);
app.use("/api/cursos", cursoRouter);
app.use("/api/periodos", periodoRouter);
app.use("/api/modulos", moduloRouter);
app.use("/api/clases", claseRouter);
app.use("/api/notificaciones", notificacionRouter);
app.use("/api/matriculas", matriculaRouter);
app.use("/api/carrito", carritoRouter);

// Ruta de health check
app.get('/health', (req, res) => {
    res.apiSuccess({ status: 'OK', timestamp: new Date() }, 'Server is running');
});

// ==================== MANEJO DE ERRORES ====================
// Middleware para rutas no encontradas
app.use((req, res) => {
    logger.warn(`404 - Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    res.apiError('Ruta no encontrada', 404);
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    // Si ya se enviaron los headers, delegar al manejador por defecto
    if (res.headersSent) {
        return next(err);
    }

    logger.error(`Error: ${err.message}\nStack: ${err.stack}`);

    // Errores de validación
    if (err.name === 'ValidationError') {
        return res.apiError('Error de validación', 400, err.errors);
    }

    // Errores de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.apiError('Token inválido', 401);
    }

    if (err.name === 'TokenExpiredError') {
        return res.apiError('Token expirado', 401);
    }

    // Errores de MongoDB
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        if (err.code === 11000) {
            return res.apiError('Registro duplicado', 409);
        }
    }

    // Error de CORS
    if (err.message === 'No autorizado por CORS') {
        return res.apiError('Acceso denegado por CORS', 403);
    }

    // Error genérico
    const statusCode = err.statusCode || 500;
    const errorResponse = {
        message: statusCode === 500 ? 'Error interno del servidor' : err.message
    };

    // Solo mostrar detalles en desarrollo
    if (process.env.NODE_ENV === 'development') {
        errorResponse.error = err.message;
        errorResponse.stack = err.stack;
    }

    res.status(statusCode).json({
        success: false,
        ...errorResponse
    });
});

// Exportar logger para uso en otros módulos
export { logger };
export default app;