import { WebSocket } from "ws";
import { Room, User, Admin } from "./types";
import { generateRoomCode, generateMemberId } from "./utils";

export class RoomManager {
  private rooms: Map<string, Room>;
  private users: Map<string, User>;
  private admins: Map<string, Admin>;

  constructor() {
    this.rooms = new Map();
    this.users = new Map();
    this.admins = new Map();
  }

  public createRoom(socket: WebSocket, password: string): { roomCode: string; adminId: string } {
    const roomCode = generateRoomCode();
    const adminId = generateMemberId();

    const admin: Admin = {
      id: adminId,
      roomCode,
      socket,
      password
    };

    const room: Room = {
      roomCode,
      adminId,
      users: [],
      songQueue: [],
      currentSong: null,
      isPlaying: false,
      isPaused: false,
      createdAt: Date.now()
    };

    this.rooms.set(roomCode, room);
    this.admins.set(adminId, admin);

    return { roomCode, adminId };
  }

  public joinRoom(roomCode: string, socket: WebSocket): { userId: string } {
    console.log(roomCode);
    const room = this.rooms.get(roomCode);
    console.log(room);
    if (!room) {
      throw new Error("Room does not exist");
    }

    const userId = generateMemberId();
    const user: User = {
      id: userId,
      roomCode,
      socket,
      isAdmin: false
    };

    this.users.set(userId, user);
    room.users.push(userId);

    // Notify all users in the room about new user (except the user who just joined)
    this.broadcastToRoom(roomCode, {
      type: "USER_JOINED",
      payload: { userId, totalUsers: room.users.length }
    }, userId);

    return { userId };
  }

  public authenticateAdmin(roomCode: string, password: string, socket: WebSocket): { adminId: string } {
    const room = this.rooms.get(roomCode);
    if (!room) {
      throw new Error("Room does not exist");
    }

    const admin = this.admins.get(room.adminId);
    if (!admin || admin.password !== password) {
      throw new Error("Invalid admin credentials");
    }

    // Update admin socket if reconnecting
    admin.socket = socket;
    this.admins.set(admin.id, admin);

    return { adminId: admin.id };
  } public leaveRoom(userId: string): void {
    const user = this.users.get(userId);
    if (!user) return;

    const room = this.rooms.get(user.roomCode);
    if (room) {
      room.users = room.users.filter(id => id !== userId);

      // Notify remaining users
      this.broadcastToRoom(user.roomCode, {
        type: "USER_LEFT",
        payload: { userId, totalUsers: room.users.length }
      });

      // If no users left and admin disconnected, delete room
      if (room.users.length === 0 && !this.isAdminConnected(room.adminId)) {
        this.rooms.delete(user.roomCode);
        this.admins.delete(room.adminId);
      }
    }

    this.users.delete(userId);
  }

  public disconnectUser(socket: WebSocket): void {
    // Find and disconnect user
    for (const [userId, user] of this.users.entries()) {
      if (user.socket === socket) {
        this.leaveRoom(userId);
        return;
      }
    }

    // Find and disconnect admin
    for (const [adminId, admin] of this.admins.entries()) {
      if (admin.socket === socket) {
        const room = this.rooms.get(admin.roomCode);
        if (room) {
          // If no users left, delete the room
          if (room.users.length === 0) {
            this.rooms.delete(admin.roomCode);
            this.admins.delete(adminId);
          } else {
            // Just mark admin as disconnected by setting socket to null
            admin.socket = null as any;
            this.admins.set(adminId, admin);
          }
        }
        return;
      }
    }
  }

  public getRoomInfo(roomCode: string): Room | null {
    return this.rooms.get(roomCode) || null;
  }

  public getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  public getRoomUsers(roomCode: string): User[] {
    const room = this.rooms.get(roomCode);
    if (!room) return [];

    return room.users.map(userId => this.users.get(userId)).filter(Boolean) as User[];
  }

  public isUserInRoom(userId: string, roomCode: string): boolean {
    const user = this.users.get(userId);
    return user?.roomCode === roomCode;
  }

  public isAdmin(userId: string): boolean {
    return this.admins.has(userId);
  }

  public isAdminConnected(adminId: string): boolean {
    const admin = this.admins.get(adminId);
    return !!(admin && admin.socket !== null);
  }

  public broadcastToRoom(roomCode: string, message: any, excludeUserId?: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    // Send to all users in room (except excluded user)
    room.users.forEach(userId => {
      if (excludeUserId && userId === excludeUserId) return;
      const user = this.users.get(userId);
      if (user && user.socket.readyState === WebSocket.OPEN) {
        user.socket.send(JSON.stringify(message));
      }
    });

    // Send to admin if connected (and not excluded)
    const admin = this.admins.get(room.adminId);
    if (admin && admin.socket && admin.socket.readyState === WebSocket.OPEN) {
      if (!excludeUserId || room.adminId !== excludeUserId) {
        admin.socket.send(JSON.stringify(message));
      }
    }
  }

  public getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode);
  }

  public updateRoom(roomCode: string, updates: Partial<Room>): void {
    const room = this.rooms.get(roomCode);
    if (room) {
      Object.assign(room, updates);
      this.rooms.set(roomCode, room);
    }
  }
}
