import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string;
    user: {
      id?: string | null; // Corresponds to token.id, which is String(user.userId) from authorize
      username?: string | null;
      role?: number | null; // Corresponds to token.role, which is user.role (number) from authorize
      phoneNumber?: string | null | number; // From token.phoneNumber
      // Default next-auth properties (image, email, name) might also be present or undefined
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession['user'];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    // These are the properties returned by the authorize callback
    id: string; // This is String(user.userId)
    username?: string | null;
    accessToken?: string | null;
    role?: number | null;
    phoneNumber?: string | null | number;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    accessToken?: string;
    id?: string; // String(user.userId)
    username?: string;
    role?: number; // user.role (number)
    phoneNumber?: string | null | number;
    // Default JWT properties might also be here
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    sub?: string;
  }
}
