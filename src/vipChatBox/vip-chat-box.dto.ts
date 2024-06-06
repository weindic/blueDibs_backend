export class CreateVipChatBoxDto {
    roomId: string;
    message: string;
    userId: string;
    replyId: string;
    type: string;  // Made this mandatory
    file: string;
  }
  
  export class UpdateSeenAllDto {
    roomId: string;
  }
  
  export class DeleteMessageDto {
    id: string;
    roomId:string;
  }
  
  export class CreateVipChatRoomDto {
    userOne: string;
    userTwo: string;
  }
  
  export class UpdateUnreadStatusDto {
    id: string;
  }
  