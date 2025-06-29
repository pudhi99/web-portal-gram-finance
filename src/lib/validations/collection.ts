import { z } from 'zod';

export const createCollectionSchema = z.object({
  amount: z.union([
    z.string().transform((val) => parseFloat(val) || 0),
    z.number().min(0, 'Amount must be positive')
  ]).refine((val) => val > 0, 'Amount must be positive'),
  paymentDate: z.union([
    z.string().transform((val) => new Date(val)),
    z.date()
  ]),
  gpsLat: z.number().min(-90).max(90).optional(),
  gpsLng: z.number().min(-180).max(180).optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  installmentId: z.string().min(1, 'Installment ID is required'),
  collectorId: z.string().min(1, 'Collector ID is required'),
});

export const updateCollectionSchema = z.object({
  amount: z.number({ invalid_type_error: 'Amount must be a number' })
    .min(0, 'Amount must be positive')
    .optional(),
  paymentDate: z.date({ invalid_type_error: 'Invalid date format' }).optional(),
  gpsLat: z.number({ invalid_type_error: 'Latitude must be a number' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional(),
  gpsLng: z.number({ invalid_type_error: 'Longitude must be a number' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export const collectionQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  collectorId: z.string().optional(),
  installmentId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['pending', 'paid', 'overdue']).optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type CollectionQueryInput = z.infer<typeof collectionQuerySchema>; 