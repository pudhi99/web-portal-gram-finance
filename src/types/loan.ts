import { ILoan as LoanInterface } from '@/models/Loan'

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DEFAULTED = 'DEFAULTED',
}

// Re-exporting the ILoan interface from the model
export type ILoan = LoanInterface

export type PopulatedLoan = ILoan & {
  _id: string
  borrower: {
    _id: string
    name: string
  }
  outstandingAmount: number
  status: LoanStatus
} 