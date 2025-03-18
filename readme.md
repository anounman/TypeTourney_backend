# TypeTourney Backend: Real-Time Typing Race Application

## Project Overview

Typeo is a real-time competitive typing application where users can create virtual rooms, join existing ones, and compete against each other in typing races. This backend service manages room creation, user connections, real-time race state, and performance tracking.

## Technology Stack

- **Backend**: Node.js with Express and TypeScript
- **Real-time Communication**: Socket.IO
- **Data Storage**: In-memory (MongoDB integration planned for future)
- **Deployment**: Ready for Vercel and Render

## API Endpoints

### Health Check

- `GET /` - Server health and status check

### Room Management

- `POST /rooms` - Create a new typing race room
- `GET /rooms` - List all available rooms
- `GET /rooms/:roomId` - Get details for a specific room

## Socket.IO Events

### Connection Events

- `connection` - Triggered when a user connects
- `disconnect` - Triggered when a user disconnects

### Room Events

- **Client → Server:**

  - `room:join` - Join a room with user data
  - `room:leave` - Leave a room
  - `room:ready` - Mark user as ready to start race
  - `room:update` - Update room data
  - `room:update_word` - Update room's typing challenge text

- **Server → Client:**
  - `room:joined` - Confirmation after successfully joining a room
  - `room:user_joined` - Notification when another user joins
  - `room:left` - Confirmation after leaving a room
  - `room:user_left` - Notification when another user leaves
  - `room:user_ready` - Notification when a user is ready
  - `room:race_start` - Notification when race begins (all users ready)
  - `room:update_data` - Updated room data after changes
  - `room:update_word_data` - Updated typing challenge text
  - `room:join_error` - Error when joining a room
  - `room:leave_error` - Error when leaving a room
  - `room:ready_error` - Error when marking as ready
  - `room:update_error` - Error when updating room

### Typing Events

- **Client → Server:**

  - `typing:progress` - Send user's typing progress updates

- **Server → Client:**
  - `typing:user_progress` - Broadcast typing progress to room participants

## Data Models

### User

```typescript
interface User {
  id: string; // Unique user identifier
  name: string; // Display name
  socketId: string; // Socket connection ID
  isReady: boolean; // Ready state for race
  input?: string; // Current typing input
  isDone?: boolean; // Race completion status
  wpm?: number; // Words per minute speed
  doneAt?: Date; // Race completion timestamp
  isOwner: boolean; // Room ownership status
  performanceData?: PerformancePoint[]; // Detailed performance metrics
}

interface PerformancePoint {
  timeRemaining: number;
  wpm: number;
  accuracy: number;
  error: number;
  wordCount: number;
  characterCount: number;
}
```

### Room

```typescript
interface Room {
  id: string; // Unique room identifier
  name: string; // Room name
  users: User[]; // Participants
  isActive: boolean; // Race active status
  word: string; // Text to type
  createdAt: Date; // Room creation timestamp
  startedAt?: Date; // Race start timestamp
  finishedAt?: Date; // Race completion timestamp
  totalTime: number; // Race duration in seconds
}
```

## Frontend Integration Guide

### Setting up Socket.IO Client

```typescript
import { io, Socket } from "socket.io-client";

// Connect to the backend
const socket: Socket = io("http://localhost:3000");
```

### Room Interaction Example

```typescript
import React, { useState, useEffect } from "react";
import { Room, User } from "../types";

const RoomComponent: React.FC = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [raceActive, setRaceActive] = useState<boolean>(false);

  // Join a room
  const joinRoom = (roomId: string, user: User): void => {
    socket.emit("room:join", { roomId, user });
  };

  // Mark user as ready
  const markAsReady = (roomId: string, userId: string): void => {
    socket.emit("room:ready", { roomId, userId });
  };

  // Update room data
  const updateRoom = (roomData: Room): void => {
    socket.emit("room:update", { room: roomData });
  };

  useEffect(() => {
    // Set up event listeners
    socket.on("room:joined", ({ room }) => setRoom(room));
    socket.on("room:user_joined", ({ room }) => setRoom(room));
    socket.on("room:user_left", ({ room }) => setRoom(room));
    socket.on("room:race_start", ({ room }) => {
      setRoom(room);
      setRaceActive(true);
    });
    socket.on("room:update_data", ({ room }) => setRoom(room));

    // Cleanup on unmount
    return () => {
      socket.off("room:joined");
      socket.off("room:user_joined");
      socket.off("room:user_left");
      socket.off("room:race_start");
      socket.off("room:update_data");
    };
  }, []);

  // Component render...
};
```

### Typing Race Implementation

```typescript
const TypingComponent: React.FC<{ roomId: string; userId: string }> = ({
  roomId,
  userId,
}) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [input, setInput] = useState<string>("");
  const [wpm, setWpm] = useState<number>(0);

  // Send typing progress to server
  const updateProgress = (
    currentInput: string,
    currentWpm: number,
    isCompleted: boolean
  ): void => {
    socket.emit("typing:progress", {
      roomId,
      userId,
      input: currentInput,
      wpm: currentWpm,
      isDone: isCompleted,
    });
  };

  useEffect(() => {
    // Listen for other users' progress
    socket.on("typing:user_progress", ({ room }) => {
      setRoom(room);
    });

    return () => {
      socket.off("typing:user_progress");
    };
  }, []);

  // Handle typing input and calculate WPM...

  // Component render...
};
```

## Setup and Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Development server**

   ```bash
   npm run dev
   ```

4. **Production server**
   ```bash
   npm start
   ```

## Environment Configuration

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## Deployment

This project includes configuration for:

- **Vercel**: Using `vercel.json` for serverless deployment
- **Render**: Using `render.yaml` for web service deployment

## Implementation Notes

- Room data is currently stored in memory (lost on server restart)
- Maximum 3 users per room
- First user to join becomes room owner
- Race starts when all users mark themselves as ready
- Real-time performance tracking includes WPM and accuracy
- Race completes when all participants finish typing
- MongoDB integration planned for persistent storage
