// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token }) {
      // token.sub is the User.id when using PrismaAdapter + JWT sessions
      if (!token?.sub) return token;

      // Only fetch if we don't already have it (keeps requests down)
      if ((token as any).handle === undefined) {
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { handle: true },
        });
        (token as any).handle = user?.handle ?? null;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token?.sub) {
        (session.user as any).id = token.sub;
        (session.user as any).handle = (token as any).handle ?? null;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
