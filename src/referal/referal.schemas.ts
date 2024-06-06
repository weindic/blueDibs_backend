import { z } from 'nestjs-zod/z';

const createReferralSchema = z.object({
  referralCode: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
  status: z.number(),
  createdAt: z.date().default(new Date()),
}).strict();

const updateReferralSchema = createReferralSchema.partial().extend({
  id: z.string().optional(),
}).strict();

export { createReferralSchema, updateReferralSchema };
