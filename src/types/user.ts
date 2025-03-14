export interface User {
  id: string;
  name: string;
  socketId: string;
  isReady: boolean; // Whether user is ready to start the race
  input?: string; // User input
  isDone?: boolean; // Whether user has completed
  wpm?: number; // Words per minute
  doneAt?: Date;
  isOwner: boolean;
  performanceData?: PerformancePoint[];
}


export interface PerformancePoint {
  timeRemaining: number;
  wpm: number;
  accuracy: number;
  error: number;
  wordCount: number;
  characterCount: number;
}