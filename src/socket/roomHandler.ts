import { Server, Socket } from 'socket.io';
import * as roomService from '../service/roomService';
import { User } from '../types/user';
import { Room } from '../types/room';

export function setupRoomHandlers(io: Server, socket: Socket) {
  // Join room
  socket.on('room:join', async ({ roomId, user }: { roomId: string; user: User }) => {
    try {

      // Check if user already exists in the room
      const roomInstace = roomService.getRoom(roomId);
      // Update user's socket ID
      let updatedUser: User = {
        ...user,
        socketId: socket.id,
        input: '',
        isReady: false,
        isOwner: roomInstace?.users.length === 0,
      };

      const room = roomService.joinRoom(roomId, updatedUser);

      if (!room) {
        socket.emit('room:join_error', { message: "Room not found or full" });
        return;
      }

      // Join socket.io room
      socket.join(roomId);

      // Notify user of successful join
      socket.emit('room:joined', { room });

      // Notify other users in the room
      socket.to(roomId).emit('room:user_joined', { room, user: updatedUser });
    } catch (error) {
      socket.emit('room:join_error', { message: "Failed to join room" });
    }
  });

  // Leave room
  socket.on('room:leave', ({ roomId, userId }: { roomId: string; userId: string }) => {
    try {
      const room = roomService.leaveRoom(roomId, userId);

      // Leave socket.io room
      socket.leave(roomId);

      // Notify user of successful leave
      socket.emit('room:left', { roomId });
      // Notify other users in the room if room still exists
      if (room) {
        socket.to(roomId).emit('room:user_left', { room, userId });
      }
    } catch (error) {
      socket.emit('room:leave_error', { message: "Failed to leave room" });
    }
  });



  // Mark user as ready
  socket.on('room:ready', ({ roomId, userId }: { roomId: string; userId: string }) => {
    try {
      const room = roomService.setUserReady(roomId, userId, true);

      if (!room) {
        socket.emit('room:ready_error', { message: "Room not found" });
        return;
      }
      // If race is started, notify all users in the room
      if (room.isActive) {
        io.to(roomId).emit('room:user_ready', { room, userId });
        io.to(roomId).emit('room:race_start', { room });
      } else {
        // Otherwise, just notify that user is ready
        io.to(roomId).emit('room:user_ready', { room, userId });
      }
    } catch (error) {
      socket.emit('room:ready_error', { message: "Failed to update ready status" });
    }
  });


  socket.on('room:update', ({ room }: { room: Room }) => {
    try {
      const updatedRoom = roomService.updateRoom(room);
      if (!updatedRoom) {
        socket.emit('room:update_error', { message: "Room not found" });
        return;
      }
      io.to(room.id).emit('room:update_data', { room: updatedRoom });
    } catch (error) {
      socket.emit('room:update_error', { message: "Failed to update room" });
    }
  });
}