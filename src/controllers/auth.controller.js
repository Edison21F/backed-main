import User from '../models/user.model.js';
import Estudiante from '../models/estudiante.model.js';
import Docente from '../models/docente.model.js';
import Matricula from '../models/matricula.model.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';

const normalizeRole = (rol = '') => (rol === 'administrador' ? 'admin' : rol);

const buildUserResponse = (userData) => ({
    id: userData._id,
    nombres: userData.nombres,
    apellidos: userData.apellidos,
    email: userData.email,
    cedula: userData.cedula,
    telefono: userData.telefono,
    rol: normalizeRole(userData.rol),
    avatar: userData.avatar,
    activo: userData.activo,
    fechaRegistro: userData.fechaRegistro,
    ultimoAcceso: userData.ultimoAcceso,
});


export const register = async (req, res) => {
    const { nombres, apellidos, email, cedula, telefono, password, rol, avatar } = req.body;

    try {
        // Verificar si el email ya existe
        const userByEmail = await User.findOne({ email });
        if (userByEmail) {
            return res.status(400).json(["Email already exists"]);
        }

        // Verificar si la cédula ya existe
        const userByCedula = await User.findOne({ cedula });
        if (userByCedula) {
            return res.status(400).json(["Cédula already exists"]);
        }

        // Crear nuevo usuario
        const newUser = new User({
            nombres,
            apellidos,
            email,
            cedula,
            telefono,
            password, // Se hasheará en el pre-save hook
            rol: rol || 'estudiante', // Default a estudiante si no se proporciona
            avatar
        });

        // Guardar usuario
        const userSaved = await newUser.save();
        // Si el rol es estudiante, crear perfil de estudiante básico
        if (userSaved.rol === 'estudiante') {
            try {
                const estudiante = new Estudiante({
                    usuarioId: userSaved._id
                });
                await estudiante.save();
                console.log('Perfil de estudiante creado automáticamente');
            } catch (error) {
                console.error('Error creando perfil de estudiante:', error);
                // No fallar el registro por esto
            }
        }
        // Si el rol es docente, crear perfil de docente básico
        if (userSaved.rol === 'docente') {
            try {
                const docente = new Docente({
                    usuarioId: userSaved._id
                });
                await docente.save();
                console.log('Perfil de docente creado automáticamente');
            } catch (error) {
                console.error('Error creando perfil de docente:', error);
                // No fallar el registro por esto
            }
        }

        // Crear token
        const token = await createAccessToken({ id: userSaved._id });

        // Enviar cookie para web
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
        });

        // Convertir a JSON
        const userData = userSaved.toJSON();

        res.json({
            token,
            usuario: buildUserResponse(userData),
        });

    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ message: error.message });
    }
};


export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario por email
        const userFound = await User.findOne({ email });

        if (!userFound) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Verificar si el usuario está activo
        if (!userFound.activo) {
            return res.status(400).json({ message: 'User account is inactive' });
        }

        // Comparar password usando el método del modelo
        const isMatch = await userFound.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Actualizar último acceso
        await User.findByIdAndUpdate(userFound._id, { ultimoAcceso: new Date() });

        // Crear token
        const token = await createAccessToken({ id: userFound._id });

        // Enviar cookie para web
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
        });

        // Convertir a JSON
        const userData = userFound.toJSON();

        res.json({
            token,
            usuario: buildUserResponse(userData),
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: error.message });
    }
};


export const logout = (req, res) => {
    res.cookie('token', '', {
        expires: new Date(0),
    });
    return res.sendStatus(200);
};


export const profile = async (req, res) => {
    try {
        const userFound = await User.findById(req.user.id);

        if (!userFound) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = userFound.toJSON();
        const response = buildUserResponse(userData);

        if (userFound.rol === 'estudiante') {
            const matricula = await Matricula.findOne({
                estudianteId: userFound._id,
                estado: { $in: ['activa', 'pagada'] }
            }).sort({ createdAt: -1 });

            if (matricula) {
                response.cursoActual = matricula.cursoId;
                response.estado = 'activo';
            } else {
                response.estado = 'inactivo';
            }

            const completados = await Matricula.find({
                estudianteId: userFound._id,
                estado: 'completada'
            });

            response.historialCursos = completados.map(m => ({
                cursoId: m.cursoId,
                estado: 'completado',
                fechaFin: m.updatedAt
            }));
        }

        return res.json(response);
    } catch (error) {
        console.error('Error en profile:', error);
        res.status(500).json({ message: error.message });
    }
};


export const verifyToken = async (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, TOKEN_SECRET);
        const userFound = await User.findById(decoded.id);

        if (!userFound) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = userFound.toJSON();

        return res.json(buildUserResponse(userData));

    } catch (error) {
        console.error('Error en verifyToken:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};


export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = user.toJSON();

        res.json(buildUserResponse(userData));
    } catch (error) {
        console.error('Error en getUserProfile:', error);
        res.status(500).json({ message: error.message });
    }
};

//actualizar perfil
export const updateUserProfile = async (req, res) => {
    try {
        const { nombres, apellidos, telefono, password, avatar } = req.body;

        const updateData = {
            nombres,
            apellidos,
            telefono,
            avatar
        };

        // Si se proporciona una nueva contraseña, hashearla
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = updatedUser.toJSON();

        res.json(buildUserResponse(userData));
    } catch (error) {
        console.error('Error en updateUserProfile:', error);
        res.status(500).json({ message: error.message });
    }
};

//crear profesores
export const createProfesor = async (req, res) => {
    const { nombres, apellidos, email, cedula, telefono, password } = req.body;
    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    try {
        // Verificar si el email ya existe
        const userByEmail = await User.findOne({ email });

        if (userByEmail) {
            return res.status(400).json({ message: 'El email ya está en uso' });
        }

        // Crear nuevo usuario
        const newUser = new User({
            nombres,
            apellidos,
            email,
            cedula,
            telefono,
            password,
            avatar,
            rol: 'docente'
        });

        await newUser.save();

        res.status(201).json({ message: 'Profesor creado exitosamente' });
    } catch (error) {
        console.error('Error en createProfesor:', error);
        res.status(500).json({ message: error.message });
    }
};

// Actualizar avatar del usuario
export const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { avatar: avatarUrl },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = updatedUser.toJSON();

        res.json({
            message: 'Avatar updated successfully',
            user: {
                id: userData._id,
                nombres: userData.nombres,
                apellidos: userData.apellidos,
                email: userData.email,
                avatar: userData.avatar
            }
        });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ message: error.message });
    }
};

//traer solo los profesores
export const getProfesores = async (req, res) => {
    try {
        const profesores = await User.find({ rol: 'docente' }).select('-password');

        res.json(profesores);
    } catch (error) {
        console.error('Error en getProfesores:', error);
        res.status(500).json({ message: error.message });
    }
};

// ADMIN: listar usuarios con filtro opcional por rol
export const getUsuarios = async (req, res) => {
    try {
        const { rol } = req.query;
        const filter = {};
        if (rol) filter.rol = rol;
        const usuarios = await User.find(filter).select('-password');
        res.json(usuarios);
    } catch (error) {
        console.error('Error en getUsuarios:', error);
        res.status(500).json({ message: error.message });
    }
};

// ADMIN: crear usuario (docente/estudiante/administrador) sin alterar sesión
export const adminCreateUser = async (req, res) => {
    const { nombres, apellidos, email, cedula, telefono, password, rol } = req.body;
    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;
    try {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ message: 'Email already exists' });
        const existingCedula = await User.findOne({ cedula });
        if (existingCedula) return res.status(400).json({ message: 'Cedula already exists' });

        const newUser = new User({ nombres, apellidos, email, cedula, telefono, password, rol: rol || 'estudiante', avatar });
        const saved = await newUser.save();

        // crear perfiles básicos según rol
        if (saved.rol === 'estudiante') {
            try { await new Estudiante({ usuarioId: saved._id }).save(); } catch (e) { console.error('Perfil estudiante auto:', e); }
        }
        if (saved.rol === 'docente') {
            try { await new Docente({ usuarioId: saved._id }).save(); } catch (e) { console.error('Perfil docente auto:', e); }
        }

        const data = saved.toJSON();
        return res.status(201).json({ user: data });
    } catch (error) {
        console.error('Error en adminCreateUser:', error);
        res.status(500).json({ message: error.message });
    }
};

// ADMIN: actualizar usuario por id
export const updateUserByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombres, apellidos, email, cedula, telefono, password, rol, activo, avatar } = req.body;
        const updateData = { nombres, apellidos, email, cedula, telefono, rol, activo, avatar };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }
        const updated = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) return res.status(404).json({ message: 'User not found' });
        return res.json(updated.toJSON());
    } catch (error) {
        console.error('Error en updateUserByAdmin:', error);
        res.status(500).json({ message: error.message });
    }
};

// ADMIN: eliminar (desactivar) usuario
export const deleteUserByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await User.findByIdAndUpdate(id, { activo: false }, { new: true });
        if (!updated) return res.status(404).json({ message: 'User not found' });
        return res.json({ message: 'User deactivated' });
    } catch (error) {
        console.error('Error en deleteUserByAdmin:', error);
        res.status(500).json({ message: error.message });
    }
};
