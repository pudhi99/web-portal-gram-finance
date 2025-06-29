import { z } from 'zod'

export const borrowerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters."),
  village: z.string().min(2, "Village must be at least 2 characters."),
  gpsLat: z.number().optional(),
  gpsLng: z.number().optional(),
  photoUrl: z.string().url().optional(),
  idProofUrl: z.string().url().optional(),
  householdHead: z.string().optional(),
  isActive: z.boolean().optional(),
})

export type BorrowerFormValues = z.infer<typeof borrowerSchema> 