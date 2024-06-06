
export class SendOtpDto {
 
  email: string;
}

export class VerifyOtpDto {

  email: string;
  otp: string;
}
