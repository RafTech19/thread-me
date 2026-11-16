import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const OWNER_EMAIL = (
  process.env.OWNER_EMAIL || "rafli.bim05@gmail.com"
).toLowerCase().trim();

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari sesuai PRD
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false;
      const userEmail = user.email.toLowerCase().trim();
      const isOwner = userEmail === OWNER_EMAIL;

      // Tolak jika bukan email owner resmi
      if (!isOwner) {
        console.warn(
          `Percobaan login ditolak: ${userEmail} bukan owner (${OWNER_EMAIL})`
        );
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email.toLowerCase().trim();
        token.isOwner = token.email === OWNER_EMAIL;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string) || session.user.email;
        (session.user as { isOwner?: boolean }).isOwner = Boolean(token.isOwner);
      }
      return session;
    },
  },
});

