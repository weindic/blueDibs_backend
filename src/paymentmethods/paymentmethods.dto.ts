import { createZodDto } from "nestjs-zod";
import { z } from "nestjs-zod/z";

export class UpdatePaymentmethodDto extends createZodDto(z.object({upiId: z.string()})){}
