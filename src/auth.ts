import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/zod";
import { verifyPassword } from "@/lib/password";
import { ZodError } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt", // Use JWT for edge compatibility
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const { email, password } = await signInSchema.parseAsync(credentials);

                    const user = await prisma.user.findUnique({
                        where: { email },
                    });

                    if (!user || !user.password) {
                        throw new Error("Invalid credentials");
                    }

                    const isValidPassword = await verifyPassword(password, user.password);

                    if (!isValidPassword) {
                        throw new Error("Invalid credentials");
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                    };
                } catch (error) {
                    if (error instanceof ZodError) {
                        return null;
                    }
                    throw error;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ account, profile }) {
            try {
                if (account?.provider === "github" && profile?.email) {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: profile.email as string },
                    });

                    if (existingUser) {
                        const linkedAccount = await prisma.account.findFirst({
                            where: {
                                provider: account.provider,
                                providerAccountId: account.providerAccountId?.toString(),
                            },
                        });

                        if (!linkedAccount) {
                            await prisma.account.create({
                                data: {
                                    userId: existingUser.id,
                                    type: account.type ?? "oauth",
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId?.toString() ?? "",
                                    access_token: account.access_token ?? null,
                                    refresh_token: account.refresh_token ?? null,
                                    expires_at: account.expires_at ? Number(account.expires_at) : null,
                                    token_type: account.token_type ?? null,
                                    scope: account.scope ?? null,
                                },
                            });
                        }

                        return true;
                    }
                }
            } catch (err) {
                console.error("Error linking OAuth account:", err);
                return false;
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
});
