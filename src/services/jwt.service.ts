// ======================================
// SERVIÇO DE JWT - GERAÇÃO E VALIDAÇÃO DE TOKENS
// ======================================

import jwt from 'jsonwebtoken';
import { TokenPayload, User, UserRole } from '../types/auth';

export class JWTService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'secret-key-change-me';
  private readonly refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh-key-change-me';
  private readonly jwtExpire = process.env.JWT_EXPIRE || '24h';
  private readonly refreshExpire = process.env.REFRESH_TOKEN_EXPIRE || '7d';

  /**
   * Gera um Access Token JWT
   */
  generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.getExpirySeconds(this.jwtExpire)
    };

    return jwt.sign(payload, this.jwtSecret, {
      algorithm: 'HS256'
    });
  }

  /**
   * Gera um Refresh Token
   */
  generateRefreshToken(userId: string): string {
    const payload = {
      userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.getExpirySeconds(this.refreshExpire)
    };

    return jwt.sign(payload, this.refreshSecret, {
      algorithm: 'HS256'
    });
  }

  /**
   * Verifica e decodifica um Access Token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256']
      }) as TokenPayload;
      return payload;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return null;
    }
  }

  /**
   * Verifica e decodifica um Refresh Token
   */
  verifyRefreshToken(token: string): { userId: string } | null {
    try {
      const payload = jwt.verify(token, this.refreshSecret, {
        algorithms: ['HS256']
      }) as any;
      return { userId: payload.userId };
    } catch (error) {
      console.error('Erro ao verificar refresh token:', error);
      return null;
    }
  }

  /**
   * Extrai o token do header Authorization
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    return parts[1];
  }

  /**
   * Converte tempo em segundos
   */
  private getExpirySeconds(timeStr: string): number {
    const matches = timeStr.match(/(\d+)([dhms])/);
    if (!matches) return 86400; // default 24h

    const [, value, unit] = matches;
    const num = parseInt(value, 10);

    const multipliers: { [key: string]: number } = {
      's': 1,
      'm': 60,
      'h': 3600,
      'd': 86400
    };

    return num * (multipliers[unit] || 86400);
  }
}

// Singleton
export const jwtService = new JWTService();
