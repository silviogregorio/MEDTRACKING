// ======================================
// TIPOS DE AUTENTICAÇÃO E SEGURANÇA
// ======================================

export enum UserRole {
  ADMIN = 'ADMIN',
  FARMACÊUTICO = 'FARMACEUTICO',
  OPERADOR = 'OPERADOR',
  VISUALIZADOR = 'VISUALIZADOR',
  USUÁRIO = 'USUARIO'
}

export enum AccessLevel {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  DELETE = 3,
  ADMIN = 4
}

export interface User {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  accessLevel: AccessLevel;
  ativo: boolean;
  tentativasLogin: number;
  bloqueadoAte?: Date;
  ultimoLogin?: Date;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

export interface AuthCredentials {
  email: string;
  senha: string;
}

export interface PermissionChecker {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canAdmin: boolean;
}
