export interface Rooms {
  roomCode: string;
  memberId: string;
  playerCount: number;
  players: string[];
  song1: { image: string; ytUrl: string };
  song2: { image: string; ytUrl: string };
}
