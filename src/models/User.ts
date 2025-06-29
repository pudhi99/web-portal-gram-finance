import mongoose, { Schema, Document, Model } from 'mongoose'

export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'COLLECTOR'

export interface IUser extends Document {
  email: string
  username: string
  password: string
  name: string
  phone?: string
  assignedArea?: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    assignedArea: { type: String },
    role: { type: String, enum: ['ADMIN', 'SUPERVISOR', 'COLLECTOR'], default: 'COLLECTOR' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema) 