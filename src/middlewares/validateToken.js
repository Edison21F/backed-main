import jwt from 'jsonwebtoken'
import { TOKEN_SECRET } from '../config.js'

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
    });
    next();
};