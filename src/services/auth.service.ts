import { jwtService } from './jwt.service';
import { bcryptService } from './bcrypt.service';
import { rateLimiter } from './auth.middleware';
import { User, UserRole, AccessLevel } from '../types/auth';

// Mock database - will be replaced with real database
const users: Map<string, User & { password: string }> = new Map();

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    accessLevel: AccessLevel;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

// Authentication Service
export class AuthService {
  /**
   * Register a new user
   */
  async register(request: RegisterRequest): Promise<User> {
    // Validate input
    if (!request.email || !request.password || !request.name) {
      throw new Error('Email, password, and name are required');
    }

    // Check if user already exists
    if (users.has(request.email)) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcryptService.hashPassword(request.password);

    // Create user
    const user: User & { password: string } = {
      id: Math.random().toString(36).substr(2, 9),
      email: request.email,
      name: request.name,
      role: request.role || UserRole.USUÁRIO,
      accessLevel: AccessLevel.READ,
      createdAt: new Date(),
      password: hashedPassword
    };

    // Store user
    users.set(request.email, user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * Login user
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    // Validate input
    if (!request.email || !request.password) {
      throw new Error('Email and password are required');
    }

    // Check rate limiting
    if (rateLimiter.isLocked(request.email)) {
      throw new Error('Account locked due to too many failed login attempts. Try again in 15 minutes.');
    }

    // Find user
    const user = users.get(request.email);
    if (!user) {
      rateLimiter.recordAttempt(request.email);
      throw new Error('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await bcryptService.comparePassword(request.password, user.password);
    if (!isPasswordValid) {
      rateLimiter.recordAttempt(request.email);
      throw new Error('Invalid email or password');
    }

    // Reset rate limiter on successful login
    rateLimiter.resetAttempts(request.email);

    // Generate tokens
    const accessToken = jwtService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      accessLevel: user.accessLevel
    });

    const refreshToken = jwtService.generateRefreshToken({
      id: user.id,
      email: user.email
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        accessLevel: user.accessLevel
      }
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(request: RefreshTokenRequest): Promise<{ accessToken: string }> {
    const decoded = jwtService.verifyRefreshToken(request.refreshToken);
    if (!decoded) {
      throw new Error('Invalid refresh token');
    }

    const user = users.get(decoded.email);
    if (!user) {
      throw new Error('User not found');
    }

    const accessToken = jwtService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      accessLevel: user.accessLevel
    });

    return { accessToken };
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): User | undefined {
    for (const user of users.values()) {
      if (user.id === userId) {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      }
    }
    return undefined;
  }

  /**
   * Update user access level
   */
  async updateUserAccessLevel(userId: string, accessLevel: AccessLevel): Promise<User> {
    for (const [email, user] of users.entries()) {
      if (user.id === userId) {
        user.accessLevel = accessLevel;
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      }
    }
    throw new Error('User not found');
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    for (const [email, user] of users.entries()) {
      if (user.id === userId) {
        user.role = role;
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      }
    }
    throw new Error('User not found');
  }
}

// Global Auth Service Instance
export const authService = new AuthService();
