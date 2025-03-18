import { Room } from '../types/room';
import { User } from '../types/user';
import { v4 as uuid } from 'uuid';

// In-memory store for rooms
const rooms: Map<string, Room> = new Map();



// Create a new room
export const createRoom = (room: Room): Room => {
    room.id = room?.id ?? uuid({

    });
    rooms.set(room.id, room);
    return room;
};

// Join a room
export const joinRoom = (roomId: string, user: User): Room | null => {
    const room = rooms.get(roomId);

    if (!room) {
        return null;
    }

    // Check if room is full (max 3 users)
    if (room.users.length >= 3) {
        return null;
    }

    // Check if user already exists
    const existingUserIndex = room.users.findIndex(u => u.id === user.id);

    if (existingUserIndex !== -1) {
        // Update existing user
        room.users[existingUserIndex] = {
            ...room.users[existingUserIndex],
            socketId: user.socketId,
        };
    } else {
        // Add new user
        room.users.push(user);
    }

    return room;
};

// Leave a room
export const leaveRoom = (roomId: string, userId: string): Room | null => {
    const room = rooms.get(roomId);

    if (!room) {
        return null;
    }

    room.users = room.users.filter(user => user.id !== userId);

    // If room is empty, delete it
    if (room.users.length === 0) {
        rooms.delete(roomId);
        return null;
    }

    return room;
};

// Get room by ID
export const getRoom = (roomId: string): Room | null => {
    return rooms.get(roomId) || null;
};

// Get all rooms
export const getAllRooms = (): Room[] => {
    return Array.from(rooms.values());
};

// Mark user as ready
export const setUserReady = (roomId: string, userId: string, isReady: boolean): Room | null => {
    const room = rooms.get(roomId);

    if (!room) {
        return null;
    }

    const userIndex = room.users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
        return null;
    }

    room.users[userIndex].isReady = isReady;

    // Check if all users are ready to start the race
    const allReady = room.users.length > 1 && room.users.every(user => user.isReady);

    if (allReady && !room.isActive) {
        room.isActive = true;
        room.startedAt = new Date();
    }

    return room;
};

// Update user progress
export const updateUserProgress = (
    roomId: string,
    userId: string,
    input: string,
    isDone: boolean = false,
    wpm: number = 0
): Room | null => {
    const room = rooms.get(roomId);

    if (!room) {
        return null;
    }

    const userIndex = room.users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
        return null;
    }

    room.users[userIndex].input = input;
    room.users[userIndex].isDone = isDone;
    room.users[userIndex].wpm = wpm;

    return room;
};


export const updateRoomText = (roomId: string, text: string): Room | null => {
    const room = rooms.get(roomId);
    if (!room) {
        return null;
    }
    room.word = text;
    return room;
}

export const updateRoom = (room: Room): Room | null => {
    if (!rooms.has(room.id)) {
        return null;
    }

    rooms.set(room.id, room);
    return room;
}