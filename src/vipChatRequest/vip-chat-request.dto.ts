// src/vip-chat-request/dto/vip-chat-request.dto.ts

export class CreateVipChatRequestDto {
    fromId: string;
    toId: string;
    type: string;
    duration: string;
    seenStatus: string;
    status: number;
  }
  
  export class UpdateStatusDto {
    id: string;
    status: number;
    
  }
  
  export class UpdateSeenStatusDto {
    id: string;
    seenStatus: string;
  }
  
  export class GetByIdDto {
    id: string;
  }
  
  export class GetByFromIdDto {
    fromId: string;
  }
  
  export class GetByToIdDto {
    toId: string;
  }
  