import { WebSocket } from "ws";

export interface Users {
  roomCode: string;
  memberId: string;
  socket: WebSocket;
}

export interface Song {
  id: string;
  image: string;
  ytUrl: string;
}

export interface Vote {
  id: string;
  song: Song;
  votes: number;
}

export interface Rooms {
  roomCode: string;
  memberId: string[];
  playerCount: number;
  song1: Vote;
  song2: Vote;
}
