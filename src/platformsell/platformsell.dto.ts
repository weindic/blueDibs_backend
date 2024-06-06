import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const platformSellSchema = z.object({
  percentage: z.number(),
});

export class PlatformSellDTO extends createZodDto(platformSellSchema) {}

const platformSellUpdateSchema = z.object({
  status: z.enum(['ACCEPTED', 'PENDING', 'REJECTED']),
});

export class PlatformSellUpdateDTO extends createZodDto(
  platformSellUpdateSchema,
) {}
