export interface Rooms {
  roomCode: string;
  memberId: string;
  playerCount: number;
  players: string[];
  song1: { id: string; image: string; ytUrl: string };
  song2: { id: string; image: string; ytUrl: string };
}
