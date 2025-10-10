import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorios si no existen
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../../uploads'),
    path.join(__dirname, '../../uploads/avatars'),
    path.join(__dirname, '../../uploads/cursos'),
    path.join(__dirname, '../../uploads/documentos'),
    path.join(__dirname, '../../uploads/comprobantes')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '../../uploads');

    // Determinar directorio según el campo
    if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadPath, 'avatars');
    } else if (file.fieldname === 'imagen') {
      uploadPath = path.join(uploadPath, 'cursos');
    } else if (file.fieldname === 'documento' || file.fieldname === 'documentos') {
      uploadPath = path.join(uploadPath, 'documentos');
    } else if (file.fieldname === 'comprobante') {
      uploadPath = path.join(uploadPath, 'comprobantes');
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único con timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    cb(null, `${basename}-${uniqueSuffix}${extension}`);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Tipos MIME permitidos
  const allowedMimes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    all: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  let allowedTypes = allowedMimes.all;

  // Determinar tipos permitidos según el campo
  if (file.fieldname === 'avatar' || file.fieldname === 'imagen') {
    allowedTypes = allowedMimes.image;
  } else if (file.fieldname === 'documento' || file.fieldname === 'documentos' || file.fieldname === 'comprobante') {
    allowedTypes = allowedMimes.all; // Documentos pueden ser imágenes o PDFs
  }

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido. Solo se permiten: ${allowedTypes.join(', ')}`), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
    files: 5 // Máximo 5 archivos por request
  }
});

// Middlewares específicos
export const uploadAvatar = upload.single('avatar');
export const uploadImagenCurso = upload.single('imagen');
export const uploadDocumento = upload.single('documento');
export const uploadDocumentos = upload.array('documentos', 5);
export const uploadComprobante = upload.single('comprobante');

// Middleware general
export const uploadFiles = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'imagen', maxCount: 1 },
  { name: 'documento', maxCount: 1 },
  { name: 'documentos', maxCount: 5 },
  { name: 'comprobante', maxCount: 1 }
]);

export default upload;