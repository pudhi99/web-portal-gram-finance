import NextAuth, { type AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import dbConnect from '@/lib/dbConnect'
import bcrypt from 'bcryptjs'
import { UserModel, IUser } from '@/models/User'
import mongoose from 'mongoose'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await dbConnect()
        if (!credentials?.username || !credentials?.password) {
          return null
        }
        const user = await UserModel.findOne({ username: credentials.username, isActive: true })
        if (!user) return null
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) return null
        const typedUser = user as IUser
        const userId = (typedUser._id as mongoose.Types.ObjectId).toString()
        return {
          id: userId,
          name: typedUser.name,
          email: typedUser.email,
          role: typedUser.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.name = token.name
        session.user.email = token.email
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 