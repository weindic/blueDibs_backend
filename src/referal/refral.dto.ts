import { createZodDto } from 'nestjs-zod';
import { createReferralSchema, updateReferralSchema } from './referal.schemas';

export class CreateReferralDTO extends createZodDto(createReferralSchema) {}
export class UpdateReferralDTO extends createZodDto(updateReferralSchema) {}
