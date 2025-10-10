import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';
import { hashParaBusqueda } from '../libs/encrypDates.js';


export const register = async (req, res) => {
    const { email, password, username } = req.body;

    try {
        // Crear hash del email para buscar si ya existe
        const emailHash = hashParaBusqueda(email);
        console.log('Email hash generado:', emailHash);
        
        const userFound = await User.findOne({ emailHash });
        
        if (userFound) {
            return res.status(400).json(["Email already exists"]);
        }

        // Hashear el password con bcrypt
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear nuevo usuario con emailHash
        // El hook pre('save') cifrará email y username
        const newUser = new User({
            email,           // Se cifrará en el hook
            emailHash,       // Hash para búsquedas (ya calculado)
            password: passwordHash,
            username
        });

        console.log('Usuario antes de guardar - emailHash:', newUser.emailHash);

        // Guardar usuario
        const userSaved = await newUser.save();
        
        console.log('Usuario guardado exitosamente');
        
        // Crear token
        const token = await createAccessToken({ id: userSaved._id });
        
        // Enviar cookie para web
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
        });
        
        // Convertir a JSON (descifra los datos)
        const userData = userSaved.toJSON();
        
        res.json({
            token,
            user: {
                id: userData._id,
                username: userData.username,
                email: userData.email,
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt,
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
        // Crear hash del email para buscar (siempre da el mismo resultado)
        const emailHash = hashParaBusqueda(email);
        console.log('Buscando usuario con emailHash:', emailHash);
        
        // Buscar usuario por el hash del email
        const userFound = await User.findOne({ emailHash });

        if (!userFound) {
            console.log('Usuario no encontrado');
            return res.status(400).json({ message: 'User not found' });
        }

        console.log('Usuario encontrado:', userFound._id);

        // Comparar password con bcrypt
        const isMatch = await bcrypt.compare(password, userFound.password);

        if (!isMatch) {
            console.log('Password incorrecto');
            return res.status(400).json({ message: 'Invalid credentials' });
        }
  
        console.log('Login exitoso');
        
        // Crear token
        const token = await createAccessToken({ id: userFound._id });
  
        // Enviar cookie para web
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
        });
  
        // Convertir a JSON (descifra los datos)
        const userData = userFound.toJSON();
        
        res.json({
            token,
            user: {
                id: userData._id,
                username: userData.username,
                email: userData.email,
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt,
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
            username: userData.username,
            email: userData.email,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
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
            username: userData.username,
            email: userData.email,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
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
            username: userData.username,
            email: userData.email,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
        });
    } catch (error) {
        console.error('Error en getUserProfile:', error);
        res.status(500).json({ message: error.message });
    }
};