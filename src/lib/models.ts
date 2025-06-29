// This file ensures all Mongoose models are registered
// Import all models here to prevent "MissingSchemaError" in production

import { BorrowerModel } from '@/models/Borrower'
import { LoanModel } from '@/models/Loan'
import Collection from '@/models/Collection'
import Installment from '@/models/Installment'
import { UserModel } from '@/models/User'
import Notification from '@/models/Notification'

// Export all models for convenience
export {
  BorrowerModel,
  LoanModel,
  Collection,
  Installment,
  UserModel,
  Notification,
} 