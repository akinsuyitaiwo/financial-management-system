import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true }) // Enable CORS if needed
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  // Handle connection event
  handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Handle disconnection event
  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Join a room based on transaction ID
  @SubscribeMessage('joinTransactionRoom')
  async handleJoinRoom(
    @MessageBody() groupId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(groupId); // Join the room named after the transaction ID
    console.log(`Client joined transaction room: ${groupId}`);
    return {
      event: 'joinedTransactionRoom',
      data: `Joined transaction room: ${groupId}`,
    };
  }

  // Leave a room based on transaction ID
  @SubscribeMessage('leaveTransactionRoom')
  async handleLeaveRoom(
    @MessageBody() groupId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(groupId); // Leave the room
    console.log(`Client left transaction room: ${groupId}`);
    return {
      event: 'leftTransactionRoom',
      data: `Left transaction room: ${groupId}`,
    };
  }

  // Broadcast a message to everyone in a transaction room
  broadcastToTransactionRoom(groupId: string, event: string, data: any) {
    const a = this.server.to(groupId).emit(event, data); // Broadcast to the room
    console.log(a);
    console.log(`Emitted to room ${groupId}: ${data}`);
    return { event: 'emittedToRoom', data: `Emitted to room: ${groupId} ` };
  }
}
