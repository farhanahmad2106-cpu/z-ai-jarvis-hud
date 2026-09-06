import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("MISSING_FIELDS");
        }

        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne({ 
          email: credentials.email.toLowerCase() 
        });

        // User not found — client will redirect to Signup
        if (!user) {
          throw new Error("NO_USER");
        }

        // User signed up via OAuth only (no password set)
        if (!user.password) {
          throw new Error("OAUTH_ACCOUNT");
        }

        // Validate password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("WRONG_PASSWORD");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || "Operator",
          image: user.image || "",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.name = token.name;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/", // OAuth Gate handles the UI, redirect to home
  },
  secret: process.env.NEXTAUTH_SECRET,
};
