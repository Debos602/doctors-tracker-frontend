import type { DefaultSession } from 'next-auth';
import type { Role } from './api';

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: Role } & DefaultSession['user'];
    accessToken: string;
    accessTokenExpires: number;
    error?: 'RefreshTokenError';
  }

  /** What `authorize()` returns and the jwt callback receives on sign-in. */
  interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    accessToken: string;
    accessTokenExpires: number;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: { id: string; name: string; email: string; role: Role };
    accessToken: string;
    accessTokenExpires: number;
    refreshToken: string;
    error?: 'RefreshTokenError';
  }
}
