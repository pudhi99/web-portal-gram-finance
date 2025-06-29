import { z } from 'zod'
import { LoanStatus } from '@/types/loan'

export const loanSchema = z.object({
  principalAmount: z
    .number()
    .positive('Principal amount must be a positive number.'),
  disbursedAmount: z
    .number()
    .positive('Disbursed amount must be a positive number.'),
  termWeeks: z.number().int().min(1, 'Term must be at least 1 week.'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  borrowerId: z.string().min(1, 'Borrower is required.'),
})

export const updateLoanSchema = z.object({
  principalAmount: z
    .number()
    .positive('Principal amount must be a positive number.')
    .optional(),
  disbursedAmount: z
    .number()
    .positive('Disbursed amount must be a positive number.')
    .optional(),
  status: z.nativeEnum(LoanStatus).optional(),
})

export type LoanFormValues = z.infer<typeof loanSchema>
export type UpdateLoanFormValues = z.infer<typeof updateLoanSchema> 