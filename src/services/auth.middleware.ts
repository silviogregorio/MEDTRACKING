import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { jwtService } from './jwt.service';
import { AccessLevel, UserRole } from '../types/auth';

// Extend Express Request to include user data
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    accessLevel: AccessLevel;
  };
}

// JWT Authentication Middleware
export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const token = jwtService.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwtService.verifyAccessToken(token);
    
    if (!decoded) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      accessLevel: decoded.accessLevel
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Role-Based Access Control Middleware
export const roleMiddleware = (requiredRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!requiredRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

// Access Level Middleware
export const accessLevelMiddleware = (requiredLevel: AccessLevel) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (req.user.accessLevel < requiredLevel) {
      res.status(403).json({ error: 'Insufficient access level' });
      return;
    }

    next();
  };
};

// Rate Limiter Class
export class RateLimiter {
  private loginAttempts: Map<string, { count: number; timestamp: number }> = new Map();
  private readonly maxAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes

  isLocked(identifier: string): boolean {
    const record = this.loginAttempts.get(identifier);
    
    if (!record) {
      return false;
    }

    const now = Date.now();
    const timeSinceLastAttempt = now - record.timestamp;

    // If lockout duration has passed, reset attempts
    if (timeSinceLastAttempt > this.lockoutDuration) {
      this.loginAttempts.delete(identifier);
      return false;
    }

    return record.count >= this.maxAttempts;
  }

  recordAttempt(identifier: string): void {
    const record = this.loginAttempts.get(identifier);
    const now = Date.now();

    if (!record) {
      this.loginAttempts.set(identifier, { count: 1, timestamp: now });
    } else {
      const timeSinceLastAttempt = now - record.timestamp;

      // Reset if lockout duration has passed
      if (timeSinceLastAttempt > this.lockoutDuration) {
        this.loginAttempts.set(identifier, { count: 1, timestamp: now });
      } else {
        record.count += 1;
        record.timestamp = now;
      }
    }
  }

  resetAttempts(identifier: string): void {
    this.loginAttempts.delete(identifier);
  }
}

// Global Rate Limiter Instance
export const rateLimiter = new RateLimiter();
