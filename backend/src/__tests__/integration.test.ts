import { RoomManager } from '../RoomManager';
import { SongsManager } from '../SongsManager';
import { VotingManager } from '../VotingManager';
import { WebSocket } from 'ws';

// Mock WebSocket for testing
class MockWebSocket {
  public readyState = WebSocket.OPEN;
  public sentMessages: string[] = [];
  
  send(data: string) {
    this.sentMessages.push(data);
  }
}

describe('Song Slayer Backend Tests', () => {
  let roomManager: RoomManager;
  let songsManager: SongsManager;
  let votingManager: VotingManager;
  let mockWs1: MockWebSocket;
  let mockWs2: MockWebSocket;

  beforeEach(() => {
    roomManager = new RoomManager();
    votingManager = new VotingManager(roomManager);
    songsManager = new SongsManager(roomManager);
    mockWs1 = new MockWebSocket();
    mockWs2 = new MockWebSocket();
  });

  test('should create a room with admin', () => {
    const result = roomManager.createRoom(mockWs1 as any, 'admin123');
    
    expect(result.roomCode).toBeDefined();
    expect(result.roomCode.length).toBe(6);
    expect(result.adminId).toBeDefined();
    
    const room = roomManager.getRoomInfo(result.roomCode);
    expect(room).toBeDefined();
    expect(room?.adminId).toBe(result.adminId);
    expect(room?.songQueue).toEqual([]);
    expect(room?.users).toEqual([]);
  });

  test('should allow users to join room', () => {
    const { roomCode } = roomManager.createRoom(mockWs1 as any, 'admin123');
    const result = roomManager.joinRoom(roomCode, mockWs2 as any);
    
    expect(result.userId).toBeDefined();
    
    const room = roomManager.getRoomInfo(roomCode);
    expect(room?.users).toContain(result.userId);
    expect(room?.users.length).toBe(1);
  });

  test('should authenticate admin with correct password', () => {
    const { roomCode } = roomManager.createRoom(mockWs1 as any, 'admin123');
    
    const result = roomManager.authenticateAdmin(roomCode, 'admin123', mockWs1 as any);
    expect(result.adminId).toBeDefined();
  });

  test('should reject admin authentication with wrong password', () => {
    const { roomCode } = roomManager.createRoom(mockWs1 as any, 'admin123');
    
    expect(() => {
      roomManager.authenticateAdmin(roomCode, 'wrongpassword', mockWs1 as any);
    }).toThrow('Invalid admin credentials');
  });

  test('should add songs to queue', () => {
    const { roomCode } = roomManager.createRoom(mockWs1 as any, 'admin123');
    const { userId } = roomManager.joinRoom(roomCode, mockWs2 as any);
    
    const song = {
      title: 'Test Song',
      url: 'https://youtube.com/watch?v=test'
    };
    
    const queue = songsManager.addSongToQueue(roomCode, song, userId);
    
    expect(queue.length).toBe(1);
    expect(queue[0].title).toBe('Test Song');
    expect(queue[0].addedBy).toBe(userId);
    expect(queue[0].priority).toBe(0);
  });

  test('should maintain FIFO order in queue', () => {
    const { roomCode } = roomManager.createRoom(mockWs1 as any, 'admin123');
    const { userId } = roomManager.joinRoom(roomCode, mockWs2 as any);
    
    // Add first song
    songsManager.addSongToQueue(roomCode, {
      title: 'Song 1',
      url: 'https://youtube.com/watch?v=1'
    }, userId);
    
    // Add second song
    songsManager.addSongToQueue(roomCode, {
      title: 'Song 2',
      url: 'https://youtube.com/watch?v=2'
    }, userId);
    
    const queue = songsManager.getQueue(roomCode);
    expect(queue[0].title).toBe('Song 1');
    expect(queue[1].title).toBe('Song 2');
    expect(queue[0].priority).toBe(0);
    expect(queue[1].priority).toBe(1);
  });

  test('should allow users to remove their own songs', () => {
    const { roomCode } = roomManager.createRoom(mockWs1 as any, 'admin123');
    const { userId } = roomManager.joinRoom(roomCode, mockWs2 as any);
    
    const queue = songsManager.addSongToQueue(roomCode, {
      title: 'Test Song',
      url: 'https://youtube.com/watch?v=test'
    }, userId);
    
    const songId = queue[0].id;
    const updatedQueue = songsManager.removeSongFromQueue(roomCode, songId, userId);
    
    expect(updatedQueue.length).toBe(0);
  });

  test('should prevent users from removing others songs', () => {
    const { roomCode, adminId } = roomManager.createRoom(mockWs1 as any, 'admin123');
    const { userId: user1 } = roomManager.joinRoom(roomCode, mockWs2 as any);
    
    // User 1 adds a song
    const queue = songsManager.addSongToQueue(roomCode, {
      title: 'Test Song',
      url: 'https://youtube.com/watch?v=test'
    }, user1);
    
    const songId = queue[0].id;
    
    // Different user tries to remove it
    expect(() => {
      songsManager.removeSongFromQueue(roomCode, songId, 'different_user');
    }).toThrow('Unauthorized');
  });

  test('should allow admin to change song priority', () => {
    const { roomCode, adminId } = roomManager.createRoom(mockWs1 as any, 'admin123');
    const { userId } = roomManager.joinRoom(roomCode, mockWs2 as any);
    
    // Add two songs
    songsManager.addSongToQueue(roomCode, {
      title: 'Song 1',
      url: 'https://youtube.com/watch?v=1'
    }, userId);
    
    songsManager.addSongToQueue(roomCode, {
      title: 'Song 2',
      url: 'https://youtube.com/watch?v=2'
    }, userId);
    
    let queue = songsManager.getQueue(roomCode);
    const song2Id = queue[1].id;
    
    // Move song 2 to priority 0 (first position)
    queue = songsManager.changeSongPriority(roomCode, song2Id, 0, adminId);
    
    expect(queue[0].title).toBe('Song 2');
    expect(queue[1].title).toBe('Song 1');
  });

  test('should allow admin to play song instantly', () => {
    const { roomCode, adminId } = roomManager.createRoom(mockWs1 as any, 'admin123');
    const { userId } = roomManager.joinRoom(roomCode, mockWs2 as any);
    
    // Add songs to queue
    songsManager.addSongToQueue(roomCode, {
      title: 'Song 1',
      url: 'https://youtube.com/watch?v=1'
    }, userId);
    
    songsManager.addSongToQueue(roomCode, {
      title: 'Song 2',
      url: 'https://youtube.com/watch?v=2'
    }, userId);
    
    let queue = songsManager.getQueue(roomCode);
    const song2Id = queue[1].id;
    
    // Play song 2 instantly
    const playedSong = songsManager.playSongInstantly(roomCode, song2Id, adminId);
    
    expect(playedSong.title).toBe('Song 2');
    
    // Check that song was removed from queue
    queue = songsManager.getQueue(roomCode);
    expect(queue.length).toBe(1);
    expect(queue[0].title).toBe('Song 1');
    
    // Check room state
    const room = roomManager.getRoomInfo(roomCode);
    expect(room?.currentSong?.title).toBe('Song 2');
    expect(room?.isPlaying).toBe(true);
  });

  test('should handle room cleanup when users disconnect', () => {
    const { roomCode } = roomManager.createRoom(mockWs1 as any, 'admin123');
    const { userId } = roomManager.joinRoom(roomCode, mockWs2 as any);
    
    // Verify room exists and has users
    let room = roomManager.getRoomInfo(roomCode);
    expect(room?.users.length).toBe(1);
    
    // Simulate user disconnect
    roomManager.disconnectUser(mockWs2 as any);
    
    // Room should still exist (admin is connected)
    room = roomManager.getRoomInfo(roomCode);
    expect(room?.users.length).toBe(0);
    
    // Simulate admin disconnect
    roomManager.disconnectUser(mockWs1 as any);
    
    // Room should be cleaned up
    room = roomManager.getRoomInfo(roomCode);
    expect(room).toBeNull();
  });
});
