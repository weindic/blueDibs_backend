// chat-box.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../Prisma.service';

@Injectable()
@WebSocketGateway()
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
  handleRegister(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
    const { roomId } = data;
    client.join(roomId);
    console.log(`Client ${client.id} registered to roomId: ${roomId}`);
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
