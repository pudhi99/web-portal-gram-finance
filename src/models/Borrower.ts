import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBorrower extends Document {
  name: string
  phone?: string
  address: string
  village: string
  gpsLat?: number
  gpsLng?: number
  photoUrl?: string
  idProofUrl?: string
  householdHead?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const BorrowerSchema = new Schema<IBorrower>(
  {
    name: { type: String, required: true },
    phone: { type: String },
    address: { type: String, required: true },
    village: { type: String, required: true },
    gpsLat: { type: Number },
    gpsLng: { type: Number },
    photoUrl: { type: String },
    idProofUrl: { type: String },
    householdHead: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const BorrowerModel: Model<IBorrower> =
  mongoose.models.Borrower || mongoose.model<IBorrower>('Borrower', BorrowerSchema) 