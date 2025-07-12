export interface Song {
  id: string;
  title: string;
  url: string;
  addedBy: string;
  addedAt: number;
  duration?: number;
  thumbnail?: string;
  votes?: number;
}

export interface QueuedSong extends Song {
  priority: number;
}

export interface Room {
  roomCode: string;
  userCount: number;
  currentSong: Song | null;
  isPlaying: boolean;
  queueLength: number;
  createdAt: number;
}

export interface User {
  id: string;
  isAdmin: boolean;
}

export interface MusicPlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
}

export interface SocketData {
  type: string;
  payload: any;
}
