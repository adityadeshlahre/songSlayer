export interface SocketData {
  payload: {
    roomCode: string;
    memberId: string;
    playerCount: number;
    players: string[];
    song1: {
      id: string;
      song: {
        id: string;
        image: string;
        ytUrl: string;
      };
      votes: number;
    };
    song2: {
      id: string;
      song: {
        id: string;
        image: string;
        ytUrl: string;
      };
      votes: number;
    };
  };
}
