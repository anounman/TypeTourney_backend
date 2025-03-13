import { Request, Response } from 'express';
import * as roomService from '../service/roomService';

// create a new room
export const createRoom = (req: Request, res: Response) => {
    const { room } = req.body;
    const newRoom = roomService.createRoom(room);
    res.status(201).json(newRoom);  
}

// get all rooms
export const getAllRooms = (_req: Request, res: Response) => {
    const rooms = roomService.getAllRooms();
    res.status(200).json(rooms);
}

//get room id 
export const getRoomById = (req: Request, res: Response) => {
    const { roomId } = req.params;
    const room = roomService.getRoom(roomId);
    if (!room) {
        res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(room);
}

