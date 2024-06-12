export class CreateVipChatRoomDto {
    userOne: string;
    userTwo: string;
  }

  export class UpdateUnreadStatusDto {
    id: string;
  }

  export class EndChatDto {

    fromId: string;
  

    toId: string;

    amount: number;
  
  
    duration: number;
  
   
    roomId: string;
  }