import { WebSocket } from "ws";
import { ROOM_CREATED } from "./Strings";
import { Rooms } from "./Rooms";
import { PlayerCountManager } from "./PlayerCountManager";
import { Users } from "./Users";
import { VotingManager } from "./VotingManager";
import { Vote } from "./Vote";

export class RoomManager {
  private rooms: Rooms[];
  private PlayerCountManager: PlayerCountManager;
  private users: Users[];
  private votingManager: VotingManager;

  constructor(votingManager: VotingManager) {
    this.rooms = [];
    this.PlayerCountManager = new PlayerCountManager();
    this.users = [];
    this.votingManager = votingManager;
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
      song1: { id: "", song: { id: "", image: "", ytUrl: "" }, votes: 0 },
      song2: { id: "", song: { id: "", image: "", ytUrl: "" }, votes: 0 },
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

  joinRandomRoom(socket: WebSocket): { roomCode: string; memberId: string } {
    if (this.rooms.length === 0) {
      throw new Error("No available rooms to join");
    }

    const randomIndex = Math.floor(Math.random() * this.rooms.length);
    const randomRoom = this.rooms[randomIndex];

    const memberId = this.generateMemberId();
    const { roomCode } = randomRoom;

    randomRoom.playerCount++;
    randomRoom.players.push(memberId);
    randomRoom.memberId = memberId;
    this.PlayerCountManager.incrementPlayerCount();
    this.users.push({ roomCode, memberId, socket });

    return { roomCode, memberId };
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

  getRoomDetails(roomCode: string): Rooms | undefined {
    return this.rooms.find((room) => room.roomCode === roomCode);
  } // this method is not returning the updates values

  allRoomDetails(): Rooms[] {
    return this.rooms;
  }

  pushSongsToRoom(roomCode: string): Rooms[] {
    const songs: Vote[] = this.votingManager.getSongVotes();

    if (songs.length < 2) {
      throw new Error("Not enough songs available for voting");
    }

    const shuffledSongs = songs.sort(() => 0.5 - Math.random());
    const selectedSongs = shuffledSongs.slice(0, 2);

    const roomIndex = this.rooms.findIndex(
      (room) => room.roomCode === roomCode
    );
    if (roomIndex === -1) {
      throw new Error("Room does not exist");
    }

    this.rooms[roomIndex].song1 = {
      id: selectedSongs[0].id,
      song: selectedSongs[0].song,
      votes: selectedSongs[0].votes,
    };

    this.rooms[roomIndex].song2 = {
      id: selectedSongs[1].id,
      song: selectedSongs[1].song,
      votes: selectedSongs[1].votes,
    };

    return this.rooms;
  }
}
