import { z } from 'zod';
import { paginationQuerySchema } from '@utils/pagination';

export const earningsQuerySchema = paginationQuerySchema.extend({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
}).refine((v) => !(v.from && v.to) || v.from <= v.to, {
  message: '`from` must be on or before `to`',
});
export type EarningsQuery = z.infer<typeof earningsQuerySchema>;

export const salesQuerySchema = paginationQuerySchema.extend({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
}).refine((v) => !(v.from && v.to) || v.from <= v.to, {
  message: '`from` must be on or before `to`',
});
export type SalesQuery = z.infer<typeof salesQuerySchema>;
