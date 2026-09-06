import { authService } from '../services/auth.service.js';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const authController = {
  async register(req, res, next) {
    try {
      const parsed = registerSchema.parse(req.body);
      const result = await authService.register(parsed);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.statusCode = 400;
        err.message = err.errors.map(e => e.message).join(', ');
      }
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const parsed = loginSchema.parse(req.body);
      const result = await authService.login(parsed);
      res.json({ success: true, data: result });
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.statusCode = 400;
        err.message = err.errors.map(e => e.message).join(', ');
      }
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.userId);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  async updateLastVisited(req, res, next) {
    try {
      const user = await authService.updateLastVisited(req.user.userId, req.body.timestamp || new Date());
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  async updatePreferences(req, res, next) {
    try {
      const user = await authService.updatePreferences(req.user.userId, req.body.preferences);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
};
