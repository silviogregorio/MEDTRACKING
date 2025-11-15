import { Request, Response } from 'express';
import { authService, LoginRequest, RegisterRequest } from '../services/auth.service';
import { bcryptService } from '../services/bcrypt.service';
import { validateEmail, validateName, validateRequired } from '../utils/validators';

/**
 * Authentication Controller
 */
export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const { email, password, name } = req.body;

      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        res.status(400).json({ error: emailValidation.error });
        return;
      }

      const nameValidation = validateName(name);
      if (!nameValidation.valid) {
        res.status(400).json({ error: nameValidation.error });
        return;
      }

      const passwordValidation = bcryptService.validatePassword(password);
      if (!passwordValidation.valid) {
        res.status(400).json({ errors: passwordValidation.errors });
        return;
      }

      // Register user
      const user = await authService.register({
        email,
        password,
        name,
        role: req.body.role
      });

      res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      const emailValidation = validateRequired(email, 'Email');
      if (!emailValidation.valid) {
        res.status(400).json({ error: emailValidation.error });
        return;
      }

      const passwordValidation = validateRequired(password, 'Password');
      if (!passwordValidation.valid) {
        res.status(400).json({ error: passwordValidation.error });
        return;
      }

      // Login
      const response = await authService.login({ email, password });

      res.status(200).json({
        message: 'Login successful',
        ...response
      });
    } catch (error: any) {
      if (error.message.includes('locked')) {
        res.status(429).json({ error: error.message });
      } else {
        res.status(401).json({ error: error.message });
      }
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const validation = validateRequired(refreshToken, 'Refresh token');
      if (!validation.valid) {
        res.status(400).json({ error: validation.error });
        return;
      }

      const response = await authService.refreshAccessToken({ refreshToken });

      res.status(200).json({
        message: 'Token refreshed successfully',
        accessToken: response.accessToken
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // This assumes authMiddleware has attached user to request
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const userProfile = authService.getUserById(user.id);
      if (!userProfile) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({
        message: 'Profile retrieved successfully',
        user: userProfile
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

// Global Auth Controller Instance
export const authController = new AuthController();
