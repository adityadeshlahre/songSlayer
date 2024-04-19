import { WebSocket } from "ws";
import { ROOM_CREATED } from "./Strings";
import { Rooms } from "./Rooms";
import { PlayerCountManager } from "./PlayerManager";

export class PartyManager {
  private rooms: Map<string, Rooms>;
  private PlayerCountManager: PlayerCountManager;
  private users: Map<string, WebSocket>;

  constructor() {
    this.rooms = new Map();
    this.PlayerCountManager = new PlayerCountManager();
    this.users = new Map();
  }

  private generateRoomCode(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let roomCode = "";
    for (let i = 0; i < 6; i++) {
      roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (this.rooms.has(roomCode)) {
      return this.generateRoomCode();
    }
    return roomCode;
  }

  private generateMemberId(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let memberId = "";
    for (let i = 0; i < 8; i++) {
      memberId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return memberId;
  }

  createRoom(socket: WebSocket): { roomCode: string; memberId: string } {
    const roomCode = this.generateRoomCode();
    const memberId = this.generateMemberId();
    const room: Rooms = {
      roomCode,
      memberId,
      playerCount: 1,
      players: [memberId],
      song1: { image: "", ytUrl: "" },
      song2: { image: "", ytUrl: "" },
    };
    this.rooms.set(roomCode, room);
    this.PlayerCountManager.incrementPlayerCount();
    socket.send(JSON.stringify({ type: ROOM_CREATED, payload: { roomCode } }));
    return { roomCode: roomCode, memberId: memberId };
  }

  addMemberToRoom(roomCode: string, socket: WebSocket): { memberId: string } {
    if (this.rooms.has(roomCode)) {
      const room = this.rooms.get(roomCode)!;
      const memberId = this.generateMemberId();
      room.playerCount++;
      room.players.push(memberId);
      room.memberId = memberId;
      this.PlayerCountManager.incrementPlayerCount();
      this.users.set(memberId, socket);
      return { memberId: memberId };
    } else {
      throw new Error("Room does not exist");
    }
  }

  removeMemberFromRoom(
    roomCode: string,
    memberId: string,
    socket: WebSocket
  ): void {
    if (this.rooms.has(roomCode)) {
      const room = this.rooms.get(roomCode)!;
      room.playerCount--;
      const index = room.players.indexOf(memberId);
      if (index !== -1) {
        room.players.splice(index, 1);
      }
      if (room.playerCount === 0) {
        this.rooms.delete(roomCode);
      }
      this.PlayerCountManager.decrementPlayerCount();
      this.users.delete(memberId);
    } else {
      throw new Error("Room does not exist");
    }
  }

  getRoomMembers(roomCode: string, socket: WebSocket): string[] {
    if (this.rooms.has(roomCode)) {
      const room = this.rooms.get(roomCode)!;
      return room.players;
    } else {
      throw new Error("Room does not exist");
    }
  }

  getGlobalPlayerCount(): number {
    return this.PlayerCountManager.getPlayerCount();
  }
}
