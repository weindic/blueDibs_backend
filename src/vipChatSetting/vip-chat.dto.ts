export class EnableVIPChatDto {
    userId: string;
    audio: string;
    video: string;
    text: string;
  }
  
  export class DisableVIPChatDto {
    userId: string;
  }
  
  export class CheckUserVIPDto {
    userId: string;
  }
  export class GetVIPChatDataDto {
    userId: string;
  }
  