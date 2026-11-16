import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserStore } from '../models/store';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin' | 'reviewer';
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    let token = req.cookies?.[config.cookieName];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ error: 'Authentication required. No token provided.' });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    const user = UserStore.findById(decoded.id);

    if (!user) {
      res.status(401).json({ error: 'Session expired or user not found.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      return;
    }

    next();
  };
}
