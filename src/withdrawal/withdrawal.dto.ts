import { createZodDto } from "nestjs-zod";
import { z } from "nestjs-zod/z";

const withdrawalRequestSchema = z.object({
    amount: z.number(),
    type:z.number()
})

const updateWithdrawalRequestSchema = z.object({
    status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
    failedReason: z.string().optional()
})

export class WithdrawalReuestDTO extends createZodDto(withdrawalRequestSchema){}
export class WithdrawalReuestUpdateDTO extends createZodDto(updateWithdrawalRequestSchema){}
