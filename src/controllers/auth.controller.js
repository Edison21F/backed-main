import User from '../models/user.model.js';
import Estudiante from '../models/estudiante.model.js';
import Docente from '../models/docente.model.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';


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
            user: {
                id: userData._id,
                nombres: userData.nombres,
                apellidos: userData.apellidos,
                email: userData.email,
                cedula: userData.cedula,
                telefono: userData.telefono,
                rol: userData.rol,
                avatar: userData.avatar,
                activo: userData.activo,
                fechaRegistro: userData.fechaRegistro,
                ultimoAcceso: userData.ultimoAcceso,
            },
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
            user: {
                id: userData._id,
                nombres: userData.nombres,
                apellidos: userData.apellidos,
                email: userData.email,
                cedula: userData.cedula,
                telefono: userData.telefono,
                rol: userData.rol,
                avatar: userData.avatar,
                activo: userData.activo,
                fechaRegistro: userData.fechaRegistro,
                ultimoAcceso: userData.ultimoAcceso,
            },
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

        return res.json({
            id: userData._id,
            nombres: userData.nombres,
            apellidos: userData.apellidos,
            email: userData.email,
            cedula: userData.cedula,
            telefono: userData.telefono,
            rol: userData.rol,
            avatar: userData.avatar,
            activo: userData.activo,
            fechaRegistro: userData.fechaRegistro,
            ultimoAcceso: userData.ultimoAcceso,
        });
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

        return res.json({
            id: userData._id,
            nombres: userData.nombres,
            apellidos: userData.apellidos,
            email: userData.email,
            cedula: userData.cedula,
            telefono: userData.telefono,
            rol: userData.rol,
            avatar: userData.avatar,
            activo: userData.activo,
            fechaRegistro: userData.fechaRegistro,
            ultimoAcceso: userData.ultimoAcceso,
        });

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

        res.json({
            id: userData._id,
            nombres: userData.nombres,
            apellidos: userData.apellidos,
            email: userData.email,
            cedula: userData.cedula,
            telefono: userData.telefono,
            rol: userData.rol,
            avatar: userData.avatar,
            activo: userData.activo,
            fechaRegistro: userData.fechaRegistro,
            ultimoAcceso: userData.ultimoAcceso,
        });
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

        res.json({
            id: userData._id,
            nombres: userData.nombres,
            apellidos: userData.apellidos,
            email: userData.email,
            cedula: userData.cedula,
            telefono: userData.telefono,
            rol: userData.rol,
            avatar: userData.avatar,
            activo: userData.activo,
            fechaRegistro: userData.fechaRegistro,
            ultimoAcceso: userData.ultimoAcceso,
        });
    } catch (error) {
        console.error('Error en updateUserProfile:', error);
        res.status(500).json({ message: error.message });
    }
};

//crear profesores
export const createProfesor = async (req, res) => {
    const { nombres, apellidos, email, cedula, telefono, password, avatar } = req.body;

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