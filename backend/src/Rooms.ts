import { Vote } from "./Vote";

export interface Rooms {
  roomCode: string;
  memberId: string;
  playerCount: number;
  players: string[];
  song1: Vote;
  song2: Vote;
}
