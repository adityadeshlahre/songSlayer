import { Song, Room, MusicPlayerState } from "./types";
import { RoomManager } from "./RoomManager";

export class VotingManager {
  private roomManager: RoomManager;

  constructor(roomManager: RoomManager) {
    this.roomManager = roomManager;
  }

  public playSong(roomCode: string, adminId: string): MusicPlayerState {
    if (!this.roomManager.isAdmin(adminId)) {
      throw new Error("Unauthorized: Only admins can control playback");
    }

    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      throw new Error("Room does not exist");
    }

    if (!room.currentSong) {
      throw new Error("No song currently selected");
    }

    this.roomManager.updateRoom(roomCode, {
      isPlaying: true,
      isPaused: false
    });

    const playerState: MusicPlayerState = {
      currentSong: room.currentSong,
      isPlaying: true,
      isPaused: false,
      currentTime: 0,
      duration: 0
    };

    return playerState;
  }

  public pauseSong(roomCode: string, adminId: string): MusicPlayerState {
    if (!this.roomManager.isAdmin(adminId)) {
      throw new Error("Unauthorized: Only admins can control playback");
    }

    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      throw new Error("Room does not exist");
    }

    if (!room.currentSong) {
      throw new Error("No song currently playing");
    }

    this.roomManager.updateRoom(roomCode, {
      isPlaying: false,
      isPaused: true
    });

    const playerState: MusicPlayerState = {
      currentSong: room.currentSong,
      isPlaying: false,
      isPaused: true,
      currentTime: 0, // In a real app, you'd track actual time
      duration: 0
    };

    return playerState;
  }

  public resumeSong(roomCode: string, adminId: string): MusicPlayerState {
    if (!this.roomManager.isAdmin(adminId)) {
      throw new Error("Unauthorized: Only admins can control playback");
    }

    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      throw new Error("Room does not exist");
    }

    if (!room.currentSong || !room.isPaused) {
      throw new Error("No song to resume");
    }

    this.roomManager.updateRoom(roomCode, {
      isPlaying: true,
      isPaused: false
    });

    const playerState: MusicPlayerState = {
      currentSong: room.currentSong,
      isPlaying: true,
      isPaused: false,
      currentTime: 0,
      duration: 0
    };

    return playerState;
  }

  public skipSong(roomCode: string, adminId: string): Song | null {
    if (!this.roomManager.isAdmin(adminId)) {
      throw new Error("Unauthorized: Only admins can control playback");
    }

    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      throw new Error("Room does not exist");
    }

    // Check if there are more songs in queue
    if (room.songQueue.length === 0) {
      this.roomManager.updateRoom(roomCode, {
        currentSong: null,
        isPlaying: false,
        isPaused: false
      });

      return null;
    }

    // Play next song from queue
    const nextSong = room.songQueue.shift();
    if (!nextSong) return null;

    // Update priorities for remaining songs
    room.songQueue.forEach((song, index) => {
      song.priority = index;
    });

    this.roomManager.updateRoom(roomCode, {
      songQueue: room.songQueue,
      currentSong: nextSong,
      isPlaying: true,
      isPaused: false
    });

    return nextSong;
  }

  public stopSong(roomCode: string, adminId: string): void {
    if (!this.roomManager.isAdmin(adminId)) {
      throw new Error("Unauthorized: Only admins can control playback");
    }

    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      throw new Error("Room does not exist");
    }

    this.roomManager.updateRoom(roomCode, {
      currentSong: null,
      isPlaying: false,
      isPaused: false
    });

    // Notify all users about playback stop
    this.roomManager.broadcastToRoom(roomCode, {
      type: "SONG_ENDED",
      payload: { stopped: true }
    });
  }

  public getPlayerState(roomCode: string): MusicPlayerState | null {
    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      return null;
    }

    return {
      currentSong: room.currentSong,
      isPlaying: room.isPlaying,
      isPaused: room.isPaused,
      currentTime: 0, // In a real app, you'd track actual playback time
      duration: 0
    };
  }

  public updatePlayerState(roomCode: string, adminId: string, state: Partial<MusicPlayerState>): MusicPlayerState {
    if (!this.roomManager.isAdmin(adminId)) {
      throw new Error("Unauthorized: Only admins can update player state");
    }

    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      throw new Error("Room does not exist");
    }

    const updates: Partial<Room> = {};
    if (state.currentSong !== undefined) updates.currentSong = state.currentSong;
    if (state.isPlaying !== undefined) updates.isPlaying = state.isPlaying;
    if (state.isPaused !== undefined) updates.isPaused = state.isPaused;

    this.roomManager.updateRoom(roomCode, updates);

    const updatedRoom = this.roomManager.getRoom(roomCode)!;
    const playerState: MusicPlayerState = {
      currentSong: updatedRoom.currentSong,
      isPlaying: updatedRoom.isPlaying,
      isPaused: updatedRoom.isPaused,
      currentTime: state.currentTime || 0,
      duration: state.duration || 0
    };

    // Notify all users about player state update
    this.roomManager.broadcastToRoom(roomCode, {
      type: "PLAYER_STATE_UPDATED",
      payload: playerState
    });

    return playerState;
  }

  // Method to automatically play next song when current song ends
  public onSongEnd(roomCode: string): Song | null {
    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      return null;
    }

    // Notify about song ending
    if (room.currentSong) {
      this.roomManager.broadcastToRoom(roomCode, {
        type: "SONG_ENDED",
        payload: { endedSong: room.currentSong }
      });
    }

    // Check if there are more songs in queue
    if (room.songQueue.length === 0) {
      this.roomManager.updateRoom(roomCode, {
        currentSong: null,
        isPlaying: false,
        isPaused: false
      });

      this.roomManager.broadcastToRoom(roomCode, {
        type: "QUEUE_EMPTY",
        payload: { message: "No more songs in queue" }
      });

      return null;
    }

    // Automatically play next song
    const nextSong = room.songQueue.shift();
    if (!nextSong) return null;

    // Update priorities for remaining songs
    room.songQueue.forEach((song, index) => {
      song.priority = index;
    });

    this.roomManager.updateRoom(roomCode, {
      songQueue: room.songQueue,
      currentSong: nextSong,
      isPlaying: true,
      isPaused: false
    });

    // Notify all users about new song
    this.roomManager.broadcastToRoom(roomCode, {
      type: "SONG_STARTED",
      payload: {
        song: nextSong,
        queue: room.songQueue,
        autoPlay: true
      }
    });

    return nextSong;
  }

  // Song Voting System
  private songVotes: Map<string, Map<string, string[]>> = new Map(); // roomCode -> songId -> userIds[]

  public voteSong(roomCode: string, songId: string, userId: string): { votes: number; newPosition?: number } {
    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      throw new Error("Room does not exist");
    }

    // Check if user is in the room
    const isAdmin = this.roomManager.isAdmin(userId);
    const isUserInRoom = this.roomManager.isUserInRoom(userId, roomCode);

    if (!isAdmin && !isUserInRoom) {
      throw new Error("User not in room");
    }

    // Check if song exists in queue
    const song = room.songQueue.find(s => s.id === songId);
    if (!song) {
      throw new Error("Song not found in queue");
    }

    // Initialize room votes if not exists
    if (!this.songVotes.has(roomCode)) {
      this.songVotes.set(roomCode, new Map());
    }

    const roomVotes = this.songVotes.get(roomCode)!;

    // Initialize song votes if not exists
    if (!roomVotes.has(songId)) {
      roomVotes.set(songId, []);
    }

    const songVoters = roomVotes.get(songId)!;

    // Check if user already voted
    if (songVoters.includes(userId)) {
      throw new Error("User already voted for this song");
    }

    // Add vote
    songVoters.push(userId);
    const voteCount = songVoters.length;

    // Reorder queue based on votes
    const newPosition = this.reorderQueueByVotes(roomCode);

    // Broadcast vote update
    this.roomManager.broadcastToRoom(roomCode, {
      type: "SONG_VOTED",
      payload: {
        songId,
        votes: voteCount,
        votedBy: userId,
        newPosition: newPosition,
        queue: room.songQueue
      }
    });

    return { votes: voteCount, newPosition };
  }

  public unvoteSong(roomCode: string, songId: string, userId: string): { votes: number; newPosition?: number } {
    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      throw new Error("Room does not exist");
    }

    const roomVotes = this.songVotes.get(roomCode);
    if (!roomVotes || !roomVotes.has(songId)) {
      throw new Error("No votes found for this song");
    }

    const songVoters = roomVotes.get(songId)!;
    const voterIndex = songVoters.indexOf(userId);

    if (voterIndex === -1) {
      throw new Error("User has not voted for this song");
    }

    // Remove vote
    songVoters.splice(voterIndex, 1);
    const voteCount = songVoters.length;

    // Reorder queue based on votes
    const newPosition = this.reorderQueueByVotes(roomCode);

    // Broadcast vote update
    this.roomManager.broadcastToRoom(roomCode, {
      type: "SONG_UNVOTED",
      payload: {
        songId,
        votes: voteCount,
        unvotedBy: userId,
        newPosition: newPosition,
        queue: room.songQueue
      }
    });

    return { votes: voteCount, newPosition };
  }

  public getSongVotes(roomCode: string, songId: string): number {
    const roomVotes = this.songVotes.get(roomCode);
    if (!roomVotes || !roomVotes.has(songId)) {
      return 0;
    }
    return roomVotes.get(songId)!.length;
  }

  public getUserVotedSongs(roomCode: string, userId: string): string[] {
    const roomVotes = this.songVotes.get(roomCode);
    if (!roomVotes) return [];

    const votedSongs: string[] = [];
    for (const [songId, voters] of roomVotes.entries()) {
      if (voters.includes(userId)) {
        votedSongs.push(songId);
      }
    }
    return votedSongs;
  }

  private reorderQueueByVotes(roomCode: string): number {
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return -1;

    const roomVotes = this.songVotes.get(roomCode);
    if (!roomVotes) return -1;

    // Sort queue by votes (descending) then by original priority (ascending)
    room.songQueue.sort((a, b) => {
      const aVotes = roomVotes.get(a.id)?.length || 0;
      const bVotes = roomVotes.get(b.id)?.length || 0;

      if (aVotes !== bVotes) {
        return bVotes - aVotes; // Higher votes first
      }

      return a.priority - b.priority; // Original order as tiebreaker
    });

    // Update priorities to match new order
    room.songQueue.forEach((song, index) => {
      song.priority = index;
    });

    this.roomManager.updateRoom(roomCode, { songQueue: room.songQueue });

    return 0; // Return new position (could be calculated if needed)
  }

  public clearRoomVotes(roomCode: string): void {
    this.songVotes.delete(roomCode);
  }

  public removeSongVotes(roomCode: string, songId: string): void {
    const roomVotes = this.songVotes.get(roomCode);
    if (roomVotes) {
      roomVotes.delete(songId);
    }
  }
}
