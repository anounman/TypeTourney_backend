import { User } from './user';

export interface Room {
  id: string;
  name: string;
  users: User[];
  isActive: boolean; // Whether race is active
  word: string;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  totalTime: number;
}