// chat-box.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin:  ['http://localhost:8100', 'https://localhost:8100'], // Adjust this to match the origin of your Ionic app
    methods: ['GET', 'POST', 'PUT']
  }
})


export class VIPChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly prisma: PrismaService) {}

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  async handleRegister(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    const { userId } = data;
    const chatRooms = await this.prisma.vipChatRoom.findMany({
      where: {
        OR: [
          { userOne: userId },
          { userTwo: userId },
        ],
      },
    });

    chatRooms.forEach(room => {
      client.join(room.id);
      console.log(`Client ${client.id} registered to roomId: ${room.id}`);
    });
  }

  sendMessageToClient(roomId: string, message: any) {
    console.log(`Sending message to room ${roomId}:`, message);
    this.server.to(roomId).emit('message', message);
  }

  sendUpdateToClient(roomId: string) {
    console.log(`Sending update to room ${roomId}`);
    this.server.to(roomId).emit('update');
  }



  
}
