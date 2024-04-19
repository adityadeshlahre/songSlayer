import { WebSocket } from "ws";

export interface Users {
  roomCode: string;
  memberId: string;
  socket: WebSocket;
}
