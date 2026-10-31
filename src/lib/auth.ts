import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SECURE_COOKIES, SESSION_MAX_AGE, callAuthApi, refreshAccessToken, toUser } from './auth-api';

/**
 * NextAuth (Credentials) in front of the Express API.
 *
 * - The API issues a 15-min access token and a 7-day, single-use refresh token.
 * - Both live inside NextAuth's encrypted, httpOnly session cookie.
 * - Only the access token is exposed to the browser (via the session);
 *   the refresh token never leaves the server.
 * - Near expiry the token is rotated on the server: in proxy.ts for page
 *   loads and server actions, and in the `jwt` callback for client session reads.
 */

/** Refresh this long before expiry so in-flight requests never carry a stale token. */
const REFRESH_MARGIN_MS = 60_000;

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: SESSION_MAX_AGE },
  // Same rule proxy.ts and the DAL use to find the cookie.
  useSecureCookies: SECURE_COOKIES,
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) throw new Error('INVALID_CREDENTIALS');

        const result = await callAuthApi('/auth/login', {
          email: credentials.email,
          password: credentials.password,
        });

        // The message becomes `error` in signIn()'s result; the login form maps it to copy.
        if (!result.ok) throw new Error(result.code ?? 'LOGIN_FAILED');
        return toUser(result.data);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
          accessToken: user.accessToken,
          accessTokenExpires: user.accessTokenExpires,
          refreshToken: user.refreshToken,
        };
      }

      if (token.error) return token;
      if (Date.now() < token.accessTokenExpires - REFRESH_MARGIN_MS) return token;
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.user = { ...session.user, ...token.user };
      session.accessToken = token.accessToken;
      session.accessTokenExpires = token.accessTokenExpires;
      session.error = token.error;
      return session;
    },
  },
  events: {
    // Revoke the refresh token on the API too, not just the local cookie.
    async signOut({ token }) {
      if (token?.refreshToken) await callAuthApi('/auth/logout', { refreshToken: token.refreshToken });
    },
  },
};
