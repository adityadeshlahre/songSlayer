import { WebSocket } from "ws";

export interface User {
  id: string;
  roomCode: string;
  socket: WebSocket;
  isAdmin: boolean;
}

export interface Admin {
  id: string;
  roomCode: string;
  socket: WebSocket;
  password: string;
}

export interface Song {
  id: string;
  title: string;
  url: string; // YouTube URL or any other URL
  addedBy: string; // User ID who added the song
  addedAt: number; // Timestamp
  duration?: number; // Optional song duration in seconds
  thumbnail?: string; // Optional thumbnail URL for YouTube videos
}

export interface QueuedSong extends Song {
  priority: number; // For admin to change priority
}

export interface Room {
  roomCode: string;
  adminId: string;
  users: string[]; // User IDs
  songQueue: QueuedSong[]; // FIFO queue
  currentSong: Song | null;
  isPlaying: boolean;
  isPaused: boolean;
  createdAt: number;
}

export interface Vote {
  id: string;
  song: Song;
  votes: number;
}

export interface MusicPlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
}
