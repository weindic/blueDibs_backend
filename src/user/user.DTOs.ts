import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const addUserSchema = z
  .object({
    firebaseId: z.string(),
    email: z.string().transform((email) => email.toLocaleLowerCase()),
    username: z.string(),
  })
  .strict();

const updateUserSchema = addUserSchema
  .partial()
  .omit({ firebaseId: true, email: true })
  .extend({
    id:z.string().optional(),
    bio: z.string().optional(),
    avatar: z.any().optional(),
    avatarPath: z.string().optional(), // Add avatarPath as optional
    mobile: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    dob: z.string().optional(), // Use string since you'll convert it in the service
  })
  .strict();

export const multipleProfileDTO = z.array(z.string());

const usrSetupSchema = z.object({
  shares_dilute: z.number(),
  equity_shares: z.number(),
});

const sellOwnEquitySchema = z.object({
  percentage: z.number().max(10).min(0),
});

const selfSellValidations = z.object({
  percentage: z.number().max(10).min(0),
});

const otpValidate = z.object({
  email: z
    .string()
    .email()
    .transform((email) => email.toLocaleLowerCase()),
  otp: z.string(),
});

const otpSend = z.object({
  email: z
    .string()
    .email()
    .transform((email) => email.toLocaleLowerCase()),
});

const addFundRequest = z.object({
  txnId: z.string(),
  amount: z.string(),
});

const updateFundRequest = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
});

const updateUserPersonalInfo = z.object({
  pan: z.string().optional(),
});

export class UserSetupDTO extends createZodDto(usrSetupSchema) {}
export class AddUserDTO extends createZodDto(addUserSchema) {}
export class UpdateUserDTO extends createZodDto(updateUserSchema) {}
export class MultipleProfilesDTO extends createZodDto(multipleProfileDTO) {}
export class SellOwnEquity extends createZodDto(sellOwnEquitySchema) {}
export class ValidatePlatformEquitySell extends createZodDto(
  selfSellValidations,
) {}
export class OtpVerifyDRO extends createZodDto(otpValidate) {}
export class OtpSendDTO extends createZodDto(otpSend) {}
export class AddFundDTO extends createZodDto(addFundRequest) {}
export class UpdateFundDTO extends createZodDto(updateFundRequest) {}
export class UpdateUserPersonalInfoDTO extends createZodDto(
  updateUserPersonalInfo,
) {}
