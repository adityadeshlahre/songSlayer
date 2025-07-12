import { WebSocketServer, WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import { SongsManager } from "./SongsManager";
import { VotingManager } from "./VotingManager";
import {
  // Room Management
  CREATE_ROOM,
  ROOM_CREATED,
  JOIN_ROOM,
  ROOM_JOINED,
  LEAVE_ROOM,
  ROOM_LEFT,
  GET_ROOM_INFO,
  ROOM_INFO,
  GET_ALL_ROOMS,
  ALL_ROOMS,

  // Admin Authentication
  ADMIN_LOGIN,
  ADMIN_LOGIN_SUCCESS,
  ADMIN_LOGIN_FAILED,

  // Song Queue Management
  ADD_SONG_TO_QUEUE,
  SONG_ADDED_TO_QUEUE,
  REMOVE_SONG_FROM_QUEUE,
  SONG_REMOVED_FROM_QUEUE,
  GET_QUEUE,
  QUEUE_UPDATED,

  // Admin Music Controls
  PLAY_SONG,
  PAUSE_SONG,
  RESUME_SONG,
  SKIP_SONG,
  CHANGE_SONG_PRIORITY,
  PLAY_SONG_INSTANTLY,

  // Music Player State
  SONG_STARTED,
  SONG_PAUSED,
  SONG_RESUMED,
  SONG_ENDED,
  SONG_SKIPPED,
  PLAYER_STATE_UPDATED,

  // User Management
  USER_JOINED,
  USER_LEFT,
  GET_ROOM_USERS,
  ROOM_USERS,

  // Error Messages
  ERROR,
  UNAUTHORIZED,
  ROOM_NOT_FOUND,
  INVALID_SONG
} from "./Strings";

const wss = new WebSocketServer({ port: 8080 });

const roomManager = new RoomManager();
const votingManager = new VotingManager(roomManager);
const songsManager = new SongsManager(roomManager);

// Connect managers for cross-dependencies
songsManager.setVotingManager(votingManager);

export const actionHandlers: {
  [key: string]: (ws: WebSocket, data: any) => void;
} = {
  // Room Management
  [CREATE_ROOM]: (ws, data) => {
    try {
      const { password } = data;
      if (!password) {
        ws.send(JSON.stringify({
          type: ERROR,
          payload: { message: "Admin password is required" }
        }));
        return;
      }

      const { roomCode, adminId } = roomManager.createRoom(ws, password);
      ws.send(JSON.stringify({
        type: ROOM_CREATED,
        payload: { roomCode, adminId, isAdmin: true }
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: ERROR,
        payload: { message: (error as Error).message }
      }));
    }
  },

  [JOIN_ROOM]: (ws, data) => {
    try {
      const { roomCode } = data;
      if (!roomCode) {
        ws.send(JSON.stringify({
          type: ERROR,
          payload: { message: "Room code is required" }
        }));
        return;
      }

      const { userId } = roomManager.joinRoom(roomCode, ws);
      ws.send(JSON.stringify({
        type: ROOM_JOINED,
        payload: { roomCode, userId, isAdmin: false }
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: ERROR,
        payload: { message: (error as Error).message }
      }));
    }
  },

  [ADMIN_LOGIN]: (ws, data) => {
    try {
      const { roomCode, password } = data;
      if (!roomCode || !password) {
        ws.send(JSON.stringify({
          type: ADMIN_LOGIN_FAILED,
          payload: { message: "Room code and password are required" }
        }));
        return;
      }

      const { adminId } = roomManager.authenticateAdmin(roomCode, password, ws);
      ws.send(JSON.stringify({
        type: ADMIN_LOGIN_SUCCESS,
        payload: { roomCode, adminId, isAdmin: true }
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: ADMIN_LOGIN_FAILED,
        payload: { message: (error as Error).message }
      }));
    }
  },

  [GET_ROOM_INFO]: (ws, data) => {
    try {
      const { roomCode } = data;
      const room = roomManager.getRoomInfo(roomCode);
      if (!room) {
        ws.send(JSON.stringify({
          type: ROOM_NOT_FOUND,
          payload: { message: "Room not found" }
        }));
        return;
      }

      ws.send(JSON.stringify({
        type: ROOM_INFO,
        payload: {
          room: {
            roomCode: room.roomCode,
            userCount: room.users.length,
            currentSong: room.currentSong,
            isPlaying: room.isPlaying,
            isPaused: room.isPaused,
            queueLength: room.songQueue.length
          }
        }
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: ERROR,
        payload: { message: (error as Error).message }
      }));
    }
  },

  [GET_ALL_ROOMS]: (ws) => {
    try {
      const rooms = roomManager.getAllRooms().map(room => ({
        roomCode: room.roomCode,
        userCount: room.users.length,
        currentSong: room.currentSong,
        isPlaying: room.isPlaying,
        queueLength: room.songQueue.length,
        createdAt: room.createdAt
      }));

      ws.send(JSON.stringify({
        type: ALL_ROOMS,
        payload: { rooms }
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: ERROR,
        payload: { message: (error as Error).message }
      }));
    }
  },

  [GET_ROOM_USERS]: (ws, data) => {
    try {
      const { roomCode } = data;
      const users = roomManager.getRoomUsers(roomCode);

      ws.send(JSON.stringify({
        type: ROOM_USERS,
        payload: {
          users: users.map(user => ({
            id: user.id,
            isAdmin: user.isAdmin
          }))
        }
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: ERROR,
        payload: { message: (error as Error).message }
      }));
    }
  },

  // Song Queue Management
  [ADD_SONG_TO_QUEUE]: (ws, data) => {
    try {
      const { roomCode, song, userId } = data;
      if (!roomCode || !song || !userId) {
        ws.send(JSON.stringify({
          type: ERROR,
          payload: { message: "Room code, song, and user ID are required" }
        }));
        return;
      }

      const queue = songsManager.addSongToQueue(roomCode, song, userId);
      ws.send(JSON.stringify({
        type: SONG_ADDED_TO_QUEUE,
        payload: {
          queue,
          message: `Song added to queue successfully`
        }
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: ERROR,
        payload: { message: (error as Error).message }
      }));
    }
  },

  [REMOVE_SONG_FROM_QUEUE]: (ws, data) => {
    try {
      const { roomCode, songId, userId } = data;
      if (!roomCode || !songId || !userId) {
        ws.send(JSON.stringify({
          type: ERROR,
          payload: { message: "Room code, song ID, and user ID are required" }
        }));
        return;
      }

      const queue = songsManager.removeSongFromQueue(roomCode, songId, userId);
      ws.send(JSON.stringify({
        type: SONG_REMOVED_FROM_QUEUE,
        payload: { queue }
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: ERROR,
        payload: { message: (error as Error).message }
      }));
    }
  },

  [GET_QUEUE]: (ws, data) => {
    try {
      const { roomCode } = data;
      const queue = songsManager.getQueue(roomCode);

      ws.send(JSON.stringify({
        type: QUEUE_UPDATED,
        payload: { queue }
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: ERROR,
        payload: { message: (error as Error).message }
      }));
    }
  },

  [CHANGE_SONG_PRIORITY]: (ws, data) => {
    try {
      const { roomCode, songId, newPriority, adminId } = data;
      if (!roomCode || !songId || newPriority === undefined || !adminId) {
        ws.send(JSON.stringify({
          type: ERROR,
          payload: { message: "Room code, song ID, new priority, and admin ID are required" }
        }));
        return;
      }

      const queue = songsManager.changeSongPriority(roomCode, songId, newPriority, adminId);
      ws.send(JSON.stringify({
        type: QUEUE_UPDATED,
        payload: { queue }
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: UNAUTHORIZED,
        payload: { message: (error as Error).message }
      }));
    }
  },

  // Admin Music Controls
  [PLAY_SONG]: (ws, data) => {
    try {
      const { roomCode, adminId } = data;
      if (!roomCode || !adminId) {
        ws.send(JSON.stringify({
          type: ERROR,
          payload: { message: "Room code and admin ID are required" }
        }));
        return;
      }

      const playerState = votingManager.playSong(roomCode, adminId);

      // Broadcast to all users in room
      roomManager.broadcastToRoom(roomCode, {
        type: SONG_STARTED,
        payload: { playerState }
      });
    } catch (error) {
      ws.send(JSON.stringify({
        type: UNAUTHORIZED,
        payload: { message: (error as Error).message }
      }));
    }
  },

  [PAUSE_SONG]: (ws, data) => {
    try {
      const { roomCode, adminId } = data;
      if (!roomCode || !adminId) {
        ws.send(JSON.stringify({
          type: ERROR,
          payload: { message: "Room code and admin ID are required" }
        }));
        return;
      }

      const playerState = votingManager.pauseSong(roomCode, adminId);

      // Broadcast to all users in room
      roomManager.broadcastToRoom(roomCode, {
        type: SONG_PAUSED,
        payload: { playerState }
      });
    } catch (error) {
      ws.send(JSON.stringify({
        type: UNAUTHORIZED,
        payload: { message: (error as Error).message }
      }));
    }
  },

  [RESUME_SONG]: (ws, data) => {
    try {
      const { roomCode, adminId } = data;
      if (!roomCode || !adminId) {
        ws.send(JSON.stringify({
          type: ERROR,
          payload: { message: "Room code and admin ID are required" }
        }));
        return;
      }

      const playerState = votingManager.resumeSong(roomCode, adminId);

      // Broadcast to all users in room
      roomManager.broadcastToRoom(roomCode, {
        type: SONG_RESUMED,
        payload: { playerState }
      });
    } catch (error) {
      ws.send(JSON.stringify({
        type: UNAUTHORIZED,
        payload: { message: (error as Error).message }
      }));
    }
  },

  [SKIP_SONG]: (ws, data) => {
    try {
      const { roomCode, adminId } = data;
      if (!roomCode || !adminId) {
        ws.send(JSON.stringify({
          type: ERROR,
          payload: { message: "Room code and admin ID are required" }
        }));
        return;
      }

      const nextSong = votingManager.skipSong(roomCode, adminId);

      // Broadcast to all users in room  
      roomManager.broadcastToRoom(roomCode, {
        type: SONG_SKIPPED,
        payload: { nextSong }
      });
    } catch (error) {
      ws.send(JSON.stringify({
        type: UNAUTHORIZED,
        payload: { message: (error as Error).message }
      }));
    }
  },

  [PLAY_SONG_INSTANTLY]: (ws, data) => {
    try {
      const { roomCode, songId, adminId } = data;
      if (!roomCode || !songId || !adminId) {
        ws.send(JSON.stringify({
          type: ERROR,
          payload: { message: "Room code, song ID, and admin ID are required" }
        }));
        return;
      }

      const song = songsManager.playSongInstantly(roomCode, songId, adminId);

      // Broadcast to all users in room
      roomManager.broadcastToRoom(roomCode, {
        type: SONG_STARTED,
        payload: { song, instant: true }
      });
    } catch (error) {
      ws.send(JSON.stringify({
        type: UNAUTHORIZED,
        payload: { message: (error as Error).message }
      }));
    }
  },

  // Handle song ending (when frontend notifies that a song has finished)
  ['SONG_ENDED_CLIENT']: (ws, data) => {
    try {
      const { roomCode, adminId } = data;
      if (!roomCode || !adminId) {
        ws.send(JSON.stringify({
          type: ERROR,
          payload: { message: "Room code and admin ID are required" }
        }));
        return;
      }

      // Only admin can notify about song ending
      if (!roomManager.isAdmin(adminId)) {
        ws.send(JSON.stringify({
          type: UNAUTHORIZED,
          payload: { message: "Only admin can notify about song ending" }
        }));
        return;
      }

      const nextSong = votingManager.onSongEnd(roomCode);
      // Broadcast is handled inside onSongEnd method
    } catch (error) {
      ws.send(JSON.stringify({
        type: ERROR,
        payload: { message: (error as Error).message }
      }));
    }
  },

  // Clear entire queue (admin only)
  ['CLEAR_QUEUE']: (ws, data) => {
    try {
      const { roomCode, adminId } = data;
      if (!roomCode || !adminId) {
        ws.send(JSON.stringify({
          type: ERROR,
          payload: { message: "Room code and admin ID are required" }
        }));
        return;
      }

      songsManager.clearQueue(roomCode, adminId);

      // Broadcast to all users in room
      roomManager.broadcastToRoom(roomCode, {
        type: QUEUE_UPDATED,
        payload: {
          queue: [],
          message: "Queue cleared by admin"
        }
      });
    } catch (error) {
      ws.send(JSON.stringify({
        type: UNAUTHORIZED,
        payload: { message: (error as Error).message }
      }));
    }
  },

  // Voting System
  ['VOTE_SONG']: (ws, data) => {
    try {
      const { roomCode, songId, userId } = data;
      if (!roomCode || !songId || !userId) {
        ws.send(JSON.stringify({
          type: ERROR,
          payload: { message: "Room code, song ID, and user ID are required" }
        }));
        return;
      }

      const result = votingManager.voteSong(roomCode, songId, userId);
      // Broadcast is handled inside voteSong method
    } catch (error) {
      ws.send(JSON.stringify({
        type: ERROR,
        payload: { message: (error as Error).message }
      }));
    }
  },

  ['UNVOTE_SONG']: (ws, data) => {
    try {
      const { roomCode, songId, userId } = data;
      if (!roomCode || !songId || !userId) {
        ws.send(JSON.stringify({
          type: ERROR,
          payload: { message: "Room code, song ID, and user ID are required" }
        }));
        return;
      }

      const result = votingManager.unvoteSong(roomCode, songId, userId);
      // Broadcast is handled inside unvoteSong method
    } catch (error) {
      ws.send(JSON.stringify({
        type: ERROR,
        payload: { message: (error as Error).message }
      }));
    }
  },

  ['GET_SONG_VOTES']: (ws, data) => {
    try {
      const { roomCode, songId } = data;
      if (!roomCode || !songId) {
        ws.send(JSON.stringify({
          type: ERROR,
          payload: { message: "Room code and song ID are required" }
        }));
        return;
      }

      const votes = votingManager.getSongVotes(roomCode, songId);
      ws.send(JSON.stringify({
        type: 'SONG_VOTES',
        payload: { songId, votes }
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: ERROR,
        payload: { message: (error as Error).message }
      }));
    }
  }
};

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      const { action } = parsedData;
      const handler = actionHandlers[action];

      if (handler) {
        handler(ws, parsedData);
      } else {
        ws.send(JSON.stringify({
          type: ERROR,
          payload: { message: `Unknown action: ${action}` }
        }));
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: ERROR,
        payload: { message: "Invalid JSON data" }
      }));
    }
  });

  ws.on("close", () => {
    roomManager.disconnectUser(ws);
  });
});

console.log("🎵 Song Slayer WebSocket Server started on port 8080");
console.log("Features:");
console.log("- Room-based music queues (FIFO)");
console.log("- Admin authentication and controls");
console.log("- Real-time queue management");
console.log("- User and admin role management");
console.log("- YouTube URL support and string song inputs");
