import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required. No token provided.', code: 'UNAUTHORIZED' }
    });
  }

  jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: { message: 'Invalid or expired session token.', code: 'TOKEN_EXPIRED' }
      });
    }
    req.user = decoded;
    next();
  });
}
