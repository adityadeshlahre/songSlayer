import { Song, QueuedSong, Room } from "./types";
import { RoomManager } from "./RoomManager";
import { generateRandomId, parseYouTubeUrl } from "./utils";

export class SongsManager {
  private roomManager: RoomManager;
  private votingManager?: any; // Will be set by dependency injection

  constructor(roomManager: RoomManager) {
    this.roomManager = roomManager;
  }

  public setVotingManager(votingManager: any): void {
    this.votingManager = votingManager;
  }

  public addSongToQueue(roomCode: string, songInput: string | Partial<Song>, addedBy: string): QueuedSong[] {
    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      throw new Error("Room does not exist");
    }

    // Check if user is in the room (admin is always considered in the room)
    const isAdmin = this.roomManager.isAdmin(addedBy);
    const isUserInRoom = this.roomManager.isUserInRoom(addedBy, roomCode);

    if (!isAdmin && !isUserInRoom) {
      throw new Error("User not in room");
    }

    let songData: { title: string; url: string };

    // Handle string input (YouTube URL or song title)
    if (typeof songInput === 'string') {
      if (!songInput.trim()) {
        throw new Error("Song input cannot be empty");
      }
      songData = parseYouTubeUrl(songInput);
    } else {
      // Handle partial song object
      if (!songInput.url || !songInput.title) {
        throw new Error("Song URL and title are required");
      }
      songData = {
        title: songInput.title,
        url: songInput.url
      };
    }

    const song: Song = {
      id: generateRandomId(),
      title: songData.title,
      url: songData.url,
      addedBy,
      addedAt: Date.now()
    };

    const queuedSong: QueuedSong = {
      ...song,
      priority: room.songQueue.length // FIFO: new songs go to the end
    };

    room.songQueue.push(queuedSong);
    this.roomManager.updateRoom(roomCode, { songQueue: room.songQueue });

    // Notify all users in room about queue update
    this.roomManager.broadcastToRoom(roomCode, {
      type: "QUEUE_UPDATED",
      payload: {
        queue: room.songQueue,
        addedSong: queuedSong,
        message: `Song "${song.title}" added to queue`
      }
    });

    return room.songQueue;
  }

  public removeSongFromQueue(roomCode: string, songId: string, requesterId: string): QueuedSong[] {
    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      throw new Error("Room does not exist");
    }

    // Check if requester is admin or the person who added the song
    const songToRemove = room.songQueue.find(song => song.id === songId);
    if (!songToRemove) {
      throw new Error("Song not found in queue");
    }

    const isAdmin = this.roomManager.isAdmin(requesterId);
    if (!isAdmin && songToRemove.addedBy !== requesterId) {
      throw new Error("Unauthorized: Can only remove your own songs or be an admin");
    }

    room.songQueue = room.songQueue.filter(song => song.id !== songId);
    this.roomManager.updateRoom(roomCode, { songQueue: room.songQueue });

    // Clear votes for the removed song
    if (this.votingManager) {
      this.votingManager.removeSongVotes(roomCode, songId);
    }

    // Notify all users in room about queue update
    this.roomManager.broadcastToRoom(roomCode, {
      type: "QUEUE_UPDATED",
      payload: { queue: room.songQueue }
    });

    return room.songQueue;
  }

  public changeSongPriority(roomCode: string, songId: string, newPriority: number, adminId: string): QueuedSong[] {
    if (!this.roomManager.isAdmin(adminId)) {
      throw new Error("Unauthorized: Only admins can change song priority");
    }

    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      throw new Error("Room does not exist");
    }

    const songIndex = room.songQueue.findIndex(song => song.id === songId);
    if (songIndex === -1) {
      throw new Error("Song not found in queue");
    }

    // Remove song from current position
    const [song] = room.songQueue.splice(songIndex, 1);

    // Update priority and insert at new position
    song.priority = newPriority;
    const insertIndex = Math.min(newPriority, room.songQueue.length);
    room.songQueue.splice(insertIndex, 0, song);

    // Update all priorities to maintain order
    room.songQueue.forEach((song, index) => {
      song.priority = index;
    });

    this.roomManager.updateRoom(roomCode, { songQueue: room.songQueue });

    // Notify all users in room about queue update
    this.roomManager.broadcastToRoom(roomCode, {
      type: "QUEUE_UPDATED",
      payload: { queue: room.songQueue }
    });

    return room.songQueue;
  }

  public getNextSong(roomCode: string): QueuedSong | null {
    const room = this.roomManager.getRoom(roomCode);
    if (!room || room.songQueue.length === 0) {
      return null;
    }

    // FIFO - get first song in queue
    return room.songQueue[0];
  }

  public playNextSong(roomCode: string): QueuedSong | null {
    const room = this.roomManager.getRoom(roomCode);
    if (!room || room.songQueue.length === 0) {
      return null;
    }

    // Remove first song from queue (FIFO)
    const nextSong = room.songQueue.shift();
    if (!nextSong) return null;

    // Update priorities for remaining songs
    room.songQueue.forEach((song, index) => {
      song.priority = index;
    });

    // Update room state
    this.roomManager.updateRoom(roomCode, {
      songQueue: room.songQueue,
      currentSong: nextSong,
      isPlaying: true,
      isPaused: false
    });

    // Notify all users about song change and queue update
    this.roomManager.broadcastToRoom(roomCode, {
      type: "SONG_STARTED",
      payload: { song: nextSong, queue: room.songQueue }
    });

    return nextSong;
  }

  public playSongInstantly(roomCode: string, songId: string, adminId: string): QueuedSong {
    if (!this.roomManager.isAdmin(adminId)) {
      throw new Error("Unauthorized: Only admins can play songs instantly");
    }

    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      throw new Error("Room does not exist");
    }

    const songIndex = room.songQueue.findIndex(song => song.id === songId);
    if (songIndex === -1) {
      throw new Error("Song not found in queue");
    }

    // Remove song from queue
    const [song] = room.songQueue.splice(songIndex, 1);

    // Update priorities for remaining songs
    room.songQueue.forEach((song, index) => {
      song.priority = index;
    });

    // Set as current song
    this.roomManager.updateRoom(roomCode, {
      songQueue: room.songQueue,
      currentSong: song,
      isPlaying: true,
      isPaused: false
    });

    // Notify all users about instant song play
    this.roomManager.broadcastToRoom(roomCode, {
      type: "SONG_STARTED",
      payload: { song, queue: room.songQueue, instant: true }
    });

    return song;
  }

  public getQueue(roomCode: string): QueuedSong[] {
    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      throw new Error("Room does not exist");
    }
    return room.songQueue;
  }

  public clearQueue(roomCode: string, adminId: string): void {
    if (!this.roomManager.isAdmin(adminId)) {
      throw new Error("Unauthorized: Only admins can clear the queue");
    }

    const room = this.roomManager.getRoom(roomCode);
    if (!room) {
      throw new Error("Room does not exist");
    }

    this.roomManager.updateRoom(roomCode, { songQueue: [] });

    // Notify all users about queue clear
    this.roomManager.broadcastToRoom(roomCode, {
      type: "QUEUE_UPDATED",
      payload: { queue: [] }
    });
  }
}
