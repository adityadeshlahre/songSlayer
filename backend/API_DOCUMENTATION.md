# Song Slayer Backend API Documentation

## Overview

Song Slayer is a WebSocket-based music player backend with queue management system. The application supports room-based music queues with admin controls and real-time synchronization.

## Key Features

- **Room-based Architecture**: Each room has its own song queue and admin
- **Admin Authentication**: Password-protected admin access with enhanced permissions
- **FIFO Queue System**: First In, First Out song queue management
- **Real-time Updates**: All users in a room receive real-time updates
- **Admin Controls**: Play, pause, resume, skip, and priority management
- **User Management**: Track users and admins across rooms

## Architecture

### Core Components

1. **RoomManager**: Handles room creation, user management, and admin authentication
2. **SongsManager**: Manages song queue operations (add, remove, reorder)
3. **VotingManager**: Handles music playback controls and admin permissions

### Data Structures

#### Room

```typescript
{
  roomCode: string;      // Unique 6-character room identifier
  adminId: string;       // Admin's unique ID
  users: string[];       // Array of user IDs in the room
  songQueue: QueuedSong[]; // FIFO queue of songs
  currentSong: Song | null; // Currently playing song
  isPlaying: boolean;    // Playback state
  isPaused: boolean;     // Pause state
  createdAt: number;     // Room creation timestamp
}
```

#### Song

```typescript
{
  id: string; // Unique song identifier
  title: string; // Song title
  url: string; // YouTube URL or identifier
  addedBy: string; // User ID who added the song
  addedAt: number; // Timestamp when added
}
```

#### QueuedSong (extends Song)

```typescript
{
  ...Song,
  priority: number;     // Position in queue (admin can modify)
}
```

## WebSocket API

### Connection

```
ws://localhost:8080
```

### Message Format

All messages follow this structure:

```json
{
  "action": "ACTION_NAME",
  "payload": {
    /* action-specific data */
  }
}
```

## API Actions

### Room Management

#### CREATE_ROOM

Create a new room with admin credentials.

**Request:**

```json
{
  "action": "CREATE_ROOM",
  "password": "admin_password"
}
```

**Response:**

```json
{
  "type": "ROOM_CREATED",
  "payload": {
    "roomCode": "ABC123",
    "adminId": "admin_unique_id",
    "isAdmin": true
  }
}
```

#### JOIN_ROOM

Join an existing room as a regular user.

**Request:**

```json
{
  "action": "JOIN_ROOM",
  "roomCode": "ABC123"
}
```

**Response:**

```json
{
  "type": "ROOM_JOINED",
  "payload": {
    "roomCode": "ABC123",
    "userId": "user_unique_id",
    "isAdmin": false
  }
}
```

#### ADMIN_LOGIN

Authenticate as admin for an existing room.

**Request:**

```json
{
  "action": "ADMIN_LOGIN",
  "roomCode": "ABC123",
  "password": "admin_password"
}
```

**Success Response:**

```json
{
  "type": "ADMIN_LOGIN_SUCCESS",
  "payload": {
    "roomCode": "ABC123",
    "adminId": "admin_unique_id",
    "isAdmin": true
  }
}
```

**Failure Response:**

```json
{
  "type": "ADMIN_LOGIN_FAILED",
  "payload": {
    "message": "Invalid admin credentials"
  }
}
```

### Song Queue Management

#### ADD_SONG_TO_QUEUE

Add a song to the room's queue.

**Request:**

```json
{
  "action": "ADD_SONG_TO_QUEUE",
  "roomCode": "ABC123",
  "userId": "user_id",
  "song": {
    "title": "Song Title",
    "url": "https://youtube.com/watch?v=..."
  }
}
```

**Response:**

```json
{
  "type": "SONG_ADDED_TO_QUEUE",
  "payload": {
    "queue": [
      /* updated queue array */
    ]
  }
}
```

#### REMOVE_SONG_FROM_QUEUE

Remove a song from the queue (users can remove their own songs, admins can remove any).

**Request:**

```json
{
  "action": "REMOVE_SONG_FROM_QUEUE",
  "roomCode": "ABC123",
  "songId": "song_id",
  "userId": "user_id"
}
```

#### CHANGE_SONG_PRIORITY

Change a song's position in the queue (admin only).

**Request:**

```json
{
  "action": "CHANGE_SONG_PRIORITY",
  "roomCode": "ABC123",
  "songId": "song_id",
  "newPriority": 0,
  "adminId": "admin_id"
}
```

#### GET_QUEUE

Get the current song queue for a room.

**Request:**

```json
{
  "action": "GET_QUEUE",
  "roomCode": "ABC123"
}
```

**Response:**

```json
{
  "type": "QUEUE_UPDATED",
  "payload": {
    "queue": [
      /* queue array */
    ]
  }
}
```

### Admin Music Controls

#### PLAY_SONG

Start playing the current song (admin only).

**Request:**

```json
{
  "action": "PLAY_SONG",
  "roomCode": "ABC123",
  "adminId": "admin_id"
}
```

#### PAUSE_SONG

Pause the current song (admin only).

**Request:**

```json
{
  "action": "PAUSE_SONG",
  "roomCode": "ABC123",
  "adminId": "admin_id"
}
```

#### RESUME_SONG

Resume the paused song (admin only).

**Request:**

```json
{
  "action": "RESUME_SONG",
  "roomCode": "ABC123",
  "adminId": "admin_id"
}
```

#### SKIP_SONG

Skip the current song and play the next one (admin only).

**Request:**

```json
{
  "action": "SKIP_SONG",
  "roomCode": "ABC123",
  "adminId": "admin_id"
}
```

#### PLAY_SONG_INSTANTLY

Play a specific song from the queue immediately (admin only).

**Request:**

```json
{
  "action": "PLAY_SONG_INSTANTLY",
  "roomCode": "ABC123",
  "songId": "song_id",
  "adminId": "admin_id"
}
```

### Information Queries

#### GET_ROOM_INFO

Get information about a specific room.

**Request:**

```json
{
  "action": "GET_ROOM_INFO",
  "roomCode": "ABC123"
}
```

**Response:**

```json
{
  "type": "ROOM_INFO",
  "payload": {
    "room": {
      "roomCode": "ABC123",
      "userCount": 5,
      "currentSong": {
        /* song object */
      },
      "isPlaying": true,
      "isPaused": false,
      "queueLength": 10
    }
  }
}
```

#### GET_ALL_ROOMS

Get a list of all active rooms.

**Request:**

```json
{
  "action": "GET_ALL_ROOMS"
}
```

#### GET_ROOM_USERS

Get all users in a specific room.

**Request:**

```json
{
  "action": "GET_ROOM_USERS",
  "roomCode": "ABC123"
}
```

## Real-time Events

The server broadcasts these events to all users in a room:

### QUEUE_UPDATED

Sent when the queue changes (add, remove, reorder).

### SONG_STARTED

Sent when a new song starts playing.

### SONG_PAUSED

Sent when the current song is paused.

### SONG_RESUMED

Sent when the paused song is resumed.

### SONG_SKIPPED

Sent when a song is skipped.

### SONG_ENDED

Sent when a song ends naturally or is stopped.

### USER_JOINED

Sent when a new user joins the room.

### USER_LEFT

Sent when a user leaves the room.

### PLAYER_STATE_UPDATED

Sent when the player state changes.

## Error Handling

All errors are returned in this format:

```json
{
  "type": "ERROR",
  "payload": {
    "message": "Error description"
  }
}
```

Common error types:

- `ERROR`: General errors
- `UNAUTHORIZED`: Permission denied
- `ROOM_NOT_FOUND`: Room doesn't exist
- `INVALID_SONG`: Invalid song data

## Queue Behavior

1. **FIFO (First In, First Out)**: Songs are played in the order they were added
2. **Priority Override**: Admins can change song priorities to reorder the queue
3. **Instant Play**: Admins can play any song immediately, removing it from the queue
4. **Auto-advance**: When a song ends, the next song in the queue automatically starts

## Admin Permissions

Admins have exclusive access to:

- Play/pause/resume/skip controls
- Queue reordering (change priorities)
- Instant song playback
- Remove any user's songs from queue
- Clear entire queue

Regular users can:

- Add songs to the queue
- Remove their own songs from the queue
- View queue and player state

## Running the Server

```bash
cd backend
npm install
npm run dev
```

The server will start on `ws://localhost:8080`.
