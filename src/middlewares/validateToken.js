import jwt from 'jsonwebtoken'
import { TOKEN_SECRET } from '../config.js'
import User from '../models/user.model.js'

export const authRequired = (req, res, next) => {
    let token = req.cookies.token;

    // Si no hay token en cookies, buscar en Authorization header
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, TOKEN_SECRET, (err, user) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        req.user = user;
        return next();
    });
};

export const adminRequired = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findById(userId).select('rol');
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.rol !== 'administrador') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        return next();
    } catch (error) {
        console.error('Error in adminRequired:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
