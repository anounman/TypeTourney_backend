import { Server } from 'socket.io';
import { setupRoomHandlers } from './roomHandler';
import { setupTypingHandlers } from '../service/typingService';


export const socketSetup = (io: Server) => {

    io.on('connection', (socket) => {
        console.log(`User connected with socket id: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`user disconnected ${socket.id}`);
        });
        socket.on('typing:progress', (data) => {
            console.log('typing:user_progress', data);
        })
        socket.on('room:update', (data) => {
            console.log('room:update', data.id);
        })
        socket.on('room:race_start', (data) => {
            console.log(`race started at ${data.id}`);

        })

        // socker event handlers 
        setupRoomHandlers(io, socket);
        setupTypingHandlers(socket);



        socket.on('disconnect', () => {
            console.log('user disconnected');
        }
        );
    });


} 