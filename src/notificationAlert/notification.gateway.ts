import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin:  ['http://localhost:8100', 'https://localhost'], // Adjust this to match the origin of your Ionic app
    methods: ['GET', 'POST', 'PUT']
  }
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  handleRegister(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    const { userId } = data;
    client.join(userId);
    console.log(`Client ${client.id} registered to userId: ${userId}`);
  }

  sendNotificationsToClient(userId: string, notifications: any[]) {
    console.log(`Sending notifications to user ${userId}:`, notifications); // Add this line for debugging
    this.server.to(userId).emit('notifications', notifications);
  }

  sendUpdateToClient(userId: string) {
    console.log(`Sending update to user ${userId}`); // Add this line for debugging
    this.server.to(userId).emit('update');
  }
}
