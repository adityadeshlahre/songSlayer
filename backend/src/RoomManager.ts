import { WebSocket } from "ws";
import { Rooms, Users, Vote } from "./types";
import { VotingManager } from "./VotingManager";
import { ROOM_CREATED } from "./Strings";

export class RoomManager {
  private rooms: Rooms[];
  private users: Users[];
  private votingManager: VotingManager;

  constructor(votingManager: VotingManager) {
    this.rooms = [];
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
    const playerCount = this.getGlobalPlayerCount();
    const room: Rooms = {
      roomCode: roomCode,
      memberId: [memberId],
      playerCount: playerCount + 1,
      song1: { id: "", song: { id: "", image: "", ytUrl: "" }, votes: 0 },
      song2: { id: "", song: { id: "", image: "", ytUrl: "" }, votes: 0 },
    };
    this.rooms.push(room);
    return { roomCode, memberId };
  }

  joinRoom(roomCode: string, socket: WebSocket): { memberId: string } {
    const room = this.rooms.find((room) => room.roomCode === roomCode);
    if (room) {
      const memberId = this.generateMemberId();
      room.playerCount++;
      room.memberId.push(memberId);
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
      const memberIndex = room.memberId.indexOf(memberId);
      if (memberIndex !== -1) {
        room.memberId.splice(memberIndex, 1);
      }
      if (room.playerCount === 0) {
        this.rooms.splice(roomIndex, 1);
      }
      const userIndex = this.users.findIndex(
        (user) => user.roomCode === roomCode && user.memberId === memberId
      );
      if (userIndex !== -1) {
        this.users.splice(userIndex, 1);
      }
      // this.users.push({ roomCode, memberId, socket });
      return { roomCode: roomCode, memberId: memberId };
    } else {
      throw new Error("Room does not exist");
    }
  }

  getRoomMembers(roomCode: string, socket: WebSocket): string[] {
    const room = this.rooms.find((room) => room.roomCode === roomCode);
    if (room) {
      return room.memberId;
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
    this.users.push({ roomCode, memberId, socket });
    randomRoom.memberId.push(memberId);

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
    const totalPlayers = this.users.length;
    return totalPlayers;
  }

  getRoomDetails(roomCode: string): Rooms | undefined {
    const room = this.rooms.find((room) => room.roomCode === roomCode);

    if (room) {
      const updatedSongs = this.votingManager.getSongVotes();
      if (room.song1.id) {
        const updatedSong1 = updatedSongs.find(
          (song) => song.id === room.song1.id
        );
        if (updatedSong1) {
          room.song1.song = updatedSong1.song;
          room.song1.votes = updatedSong1.votes;
        }
      }

      if (room.song2.id) {
        const updatedSong2 = updatedSongs.find(
          (song) => song.id === room.song2.id
        );
        if (updatedSong2) {
          room.song2.song = updatedSong2.song;
          room.song2.votes = updatedSong2.votes;
        }
      }

      return room;
    }

    return undefined;
  } // this method is not returning the updates values
  // this methos need some types fixes

  allRoomDetails(): Rooms[] {
    return this.rooms;
  }

  pushSongsToRoom(roomCode: string): Rooms[] {
    const roomIndex = this.rooms.findIndex(
      (room) => room.roomCode === roomCode
    );
    if (roomIndex === -1) {
      throw new Error("Room does not exist");
    }

    const room = this.rooms[roomIndex];
    if (room.song1.id && room.song2.id) {
      return this.rooms;
    }

    const songs: Vote[] = this.votingManager.getSongVotes();

    if (songs.length < 2) {
      throw new Error("Not enough songs available for voting");
    }

    const shuffledSongs = songs.sort(() => 0.5 - Math.random());
    const selectedSongs = shuffledSongs.slice(0, 2);

    if (!room.song1.id) {
      this.rooms[roomIndex].song1 = {
        id: selectedSongs[0].id,
        song: selectedSongs[0].song,
        votes: selectedSongs[0].votes,
      };
    }

    if (!room.song2.id) {
      this.rooms[roomIndex].song2 = {
        id: selectedSongs[1].id,
        song: selectedSongs[1].song,
        votes: selectedSongs[1].votes,
      };
    }

    return this.rooms;
  }
}
