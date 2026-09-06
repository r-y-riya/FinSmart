import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Watchlist } from '../models/Watchlist.js';
import { env } from '../config/env.js';

export const authService = {
  /**
   * Registers a new user and generates a JWT
   */
  async register({ name, email, password }) {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      const err = new Error('User already exists with this email address');
      err.statusCode = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      lastVisitedAt: new Date(Date.now() - (7 * 60 + 42) * 60 * 1000), // Default 7h 42m ago for demo
    });

    // Create initial default watchlist with sample bluechips
    await Watchlist.create({
      userId: user._id,
      name: 'My Watchlist',
      items: [
        { symbol: 'RELIANCE', companyName: 'Reliance Industries Ltd.', exchange: 'NSE' },
        { symbol: 'INFY', companyName: 'Infosys Limited', exchange: 'NSE' },
        { symbol: 'TCS', companyName: 'Tata Consultancy Services', exchange: 'NSE' },
        { symbol: 'HDFCBANK', companyName: 'HDFC Bank Limited', exchange: 'NSE' },
        { symbol: 'TATAMOTORS', companyName: 'Tata Motors Limited', exchange: 'NSE' },
      ],
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        lastVisitedAt: user.lastVisitedAt,
        preferences: user.preferences,
      },
      token,
    };
  },

  /**
   * Authenticates an existing user and returns JWT
   */
  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        lastVisitedAt: user.lastVisitedAt,
        preferences: user.preferences,
      },
      token,
    };
  },

  /**
   * Retrieves profile for current authenticated user
   */
  async getMe(userId) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return user;
  },

  /**
   * Updates user lastVisitedAt timestamp after successful dashboard load
   */
  async updateLastVisited(userId, timestamp = new Date()) {
    return User.findByIdAndUpdate(
      userId,
      { lastVisitedAt: timestamp },
      { new: true }
    ).select('-passwordHash');
  },

  /**
   * Updates user change significance thresholds
   */
  async updatePreferences(userId, preferences) {
    return User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true }
    ).select('-passwordHash');
  }
};
