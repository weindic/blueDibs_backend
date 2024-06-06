import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const createReferralWalletSchema = z.object({
  userId: z.string(),
  balance: z.number(),
  status: z.number(),
  createdAt: z.date().default(new Date()),
}).strict();

export class CreateReferralWalletDTO extends createZodDto(createReferralWalletSchema) {}
