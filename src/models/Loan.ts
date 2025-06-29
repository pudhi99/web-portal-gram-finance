import mongoose, { Schema, Document, Model } from 'mongoose'
import { IInstallment } from './Installment'
import { IBorrower } from './Borrower'
import { IUser } from './User'
import { LoanStatus } from '@/types/loan'

export interface ILoan extends Document {
  loanNumber: string
  principalAmount: number
  disbursedAmount: number
  termWeeks: number
  startDate: Date
  status: LoanStatus
  borrower: IBorrower['_id']
  createdBy: IUser['_id']
  installments: IInstallment['_id'][]
}

const LoanSchema = new Schema<ILoan>(
  {
    loanNumber: { type: String, required: true, unique: true },
    principalAmount: { type: Number, required: true },
    disbursedAmount: { type: Number, required: true },
    termWeeks: { type: Number, required: true },
    startDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(LoanStatus),
      default: LoanStatus.ACTIVE,
    },
    borrower: { type: Schema.Types.ObjectId, ref: 'Borrower', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    installments: [{ type: Schema.Types.ObjectId, ref: 'Installment' }],
  },
  { timestamps: true }
)

export const LoanModel: Model<ILoan> =
  mongoose.models.Loan || mongoose.model<ILoan>('Loan', LoanSchema) 