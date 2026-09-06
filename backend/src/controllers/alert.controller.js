import { Alert } from '../models/Alert.js';
import { z } from 'zod';

const alertSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  alertType: z.enum(['PRICE_MOVEMENT', 'VOLUME_SURGE', 'ATTENTION_SCORE']).default('PRICE_MOVEMENT'),
  threshold: z.number().positive('Threshold must be greater than zero'),
});

export const alertController = {
  async getAlerts(req, res, next) {
    try {
      const alerts = await Alert.find({ userId: req.user.userId }).sort({ createdAt: -1 });
      res.json({ success: true, data: alerts });
    } catch (err) {
      next(err);
    }
  },

  async createAlert(req, res, next) {
    try {
      const parsed = alertSchema.parse(req.body);
      const alert = await Alert.create({
        userId: req.user.userId,
        symbol: parsed.symbol.toUpperCase(),
        alertType: parsed.alertType,
        threshold: parsed.threshold,
      });
      res.status(201).json({ success: true, data: alert });
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.statusCode = 400;
        err.message = err.errors.map(e => e.message).join(', ');
      }
      next(err);
    }
  },

  async updateAlert(req, res, next) {
    try {
      const alert = await Alert.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        req.body,
        { new: true }
      );
      if (!alert) {
        const err = new Error('Alert not found');
        err.statusCode = 404;
        throw err;
      }
      res.json({ success: true, data: alert });
    } catch (err) {
      next(err);
    }
  },

  async deleteAlert(req, res, next) {
    try {
      const result = await Alert.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
      if (!result) {
        const err = new Error('Alert not found');
        err.statusCode = 404;
        throw err;
      }
      res.json({ success: true, message: 'Alert removed' });
    } catch (err) {
      next(err);
    }
  }
};
