import { z } from 'zod';

// Schema for creating a new collector
export const createCollectorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  assignedArea: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Schema for updating an existing collector
export const updateCollectorSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  phone: z.string().optional().nullable(),
  assignedArea: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  // Password updates should be handled separately for security
});

export type CreateCollectorInput = z.infer<typeof createCollectorSchema>;
export type UpdateCollectorInput = z.infer<typeof updateCollectorSchema>; 