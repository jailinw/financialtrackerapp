import jwt from 'jsonwebtoken';
export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }
    const token = authHeader.slice('Bearer '.length);
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ error: 'JWT_SECRET is not configured' });
        }
        const decoded = jwt.verify(token, secret);
        const userId = decoded.id ?? decoded.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Invalid token payload' });
        }
        req.user = {
            id: userId,
            email: decoded.email,
        };
        return next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}
