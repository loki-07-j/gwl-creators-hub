import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface AuthUser {
      id: string;
      role: UserRole;
      email: string;
      name: string;
    }
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
