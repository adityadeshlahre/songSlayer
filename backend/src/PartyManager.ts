import { WebSocket } from "ws";
import { ROOM_CREATED } from "./Strings";
import { Rooms } from "./Rooms";
import { PlayerCountManager } from "./PlayerCountManager";
import { Users } from "./Users";

export class PartyManager {
  private rooms: Rooms[];
  private PlayerCountManager: PlayerCountManager;
  private users: Users[];

  constructor() {
    this.rooms = [];
    this.PlayerCountManager = new PlayerCountManager();
    this.users = [];
  }

  private generateRoomCode(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let roomCode = "";
    for (let i = 0; i < 6; i++) {
      roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (this.rooms.find((room) => room.roomCode === roomCode)) {
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
      song1: "",
      song2: "",
    };
    this.rooms.push(room);
    this.PlayerCountManager.incrementPlayerCount();
    socket.send(
      JSON.stringify({ type: ROOM_CREATED, payload: { roomCode, memberId } })
    );
    return { roomCode, memberId };
  }

  joinRoom(roomCode: string, socket: WebSocket): { memberId: string } {
    const room = this.rooms.find((room) => room.roomCode === roomCode);
    if (room) {
      const memberId = this.generateMemberId();
      room.playerCount++;
      room.players.push(memberId);
      room.memberId = memberId;
      this.PlayerCountManager.incrementPlayerCount();
      this.users.push({ roomCode, memberId, socket });
      return { memberId: memberId };
    } else {
      throw new Error("Room does not exist");
    }
  }

  removeMemberFromRoom(
    roomCode: string,
    memberId: string,
    socket: WebSocket
  ): { roomCode: string; memberId: string } {
    const roomIndex = this.rooms.findIndex(
      (room) => room.roomCode === roomCode
    );
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex];
      room.playerCount--;
      const memberIndex = room.players.indexOf(memberId);
      if (memberIndex !== -1) {
        room.players.splice(memberIndex, 1);
      }
      if (room.playerCount === 0) {
        this.rooms.splice(roomIndex, 1);
      }
      this.PlayerCountManager.decrementPlayerCount();
      const userIndex = this.users.findIndex(
        (user) => user.roomCode === roomCode && user.memberId === memberId
      );
      if (userIndex !== -1) {
        this.users.splice(userIndex, 1);
      }
      return { roomCode: roomCode, memberId: memberId };
    } else {
      throw new Error("Room does not exist");
    }
  }

  getRoomMembers(roomCode: string, socket: WebSocket): string[] {
    const room = this.rooms.find((room) => room.roomCode === roomCode);
    if (room) {
      return room.players;
    } else {
      throw new Error("Room does not exist");
    }
  }

  disconnectUser(socket: WebSocket): void {
    const userIndex = this.users.findIndex((user) => user.socket === socket);
    if (userIndex !== -1) {
      const { roomCode, memberId } = this.users[userIndex];
      this.removeMemberFromRoom(roomCode, memberId, socket);
    }
  }

  getGlobalPlayerCount(): number {
    return this.PlayerCountManager.getPlayerCount();
  }
}
