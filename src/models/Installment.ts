import mongoose, { Schema, Document } from 'mongoose'

export enum InstallmentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  PARTIAL = 'PARTIAL',
}

export interface IInstallment extends Document {
  amount: number
  dueDate: Date
  status: InstallmentStatus
  loanId: mongoose.Types.ObjectId
  installmentNumber: number
  createdAt: Date
  updatedAt: Date
}

const InstallmentSchema = new Schema<IInstallment>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(InstallmentStatus),
      default: InstallmentStatus.PENDING,
    },
    loanId: {
      type: Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
    },
    installmentNumber: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
InstallmentSchema.index({ loanId: 1, installmentNumber: 1 })
InstallmentSchema.index({ dueDate: 1, status: 1 })
InstallmentSchema.index({ status: 1 })

export default mongoose.models.Installment || mongoose.model<IInstallment>('Installment', InstallmentSchema) 