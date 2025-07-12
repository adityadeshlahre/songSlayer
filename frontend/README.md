# 🎵 Song Slayer Frontend

A minimal and functional React frontend for the Song Slayer music queue application.

## Features

- **Room-based Music Queues**: Join or create music rooms with FIFO song queues
- **Admin Controls**: Full music player controls for room administrators
- **Real-time Updates**: WebSocket integration for live queue and player updates
- **YouTube Support**: Add songs via YouTube URLs or song titles
- **Queue Management**: Add, remove, and reorder songs in the queue

## Tech Stack

- **React 18** with **TypeScript**
- **Vite** for fast development and building
- **Tailwind CSS** for minimal styling
- **React Router** for navigation
- **WebSocket** for real-time communication

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Make sure the backend is running on port 8080**

4. **Open browser at http://localhost:5173**

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Button.tsx      # Button component with variants
├── hooks/              # Custom React hooks
│   └── useSocket.ts    # WebSocket connection hook
├── messages/           # WebSocket message constants
│   └── Strings.ts      # Message type definitions
├── screens/            # Page components
│   ├── Landing.tsx     # Home page (create/join rooms)
│   ├── Join.tsx        # Join room page
│   ├── Room.tsx        # Main room interface
│   ├── AllRooms.tsx    # View all active rooms
│   └── Vote.tsx        # Legacy vote page (unused)
├── types/              # TypeScript interfaces
│   └── socketData.ts   # Data type definitions
├── App.tsx             # Main app component with routing
└── main.tsx            # App entry point
```

## Usage

### Creating a Room (Admin)

1. Enter an admin password on the home page
2. Click "Create Room"
3. You'll be redirected to the room page with full admin controls

### Joining a Room (User)

1. Enter a room code on the home page or join page
2. Choose "Join as User"
3. You can add songs and remove your own songs

### Joining as Admin

1. Enter room code and admin password
2. Choose "Join as Admin"
3. Full control over music playback and queue management

### Adding Songs

- Type a song title: `"Never Gonna Give You Up"`
- Or paste a YouTube URL: `"https://www.youtube.com/watch?v=dQw4w9WgXcQ"`

### Admin Powers

- **Play/Pause/Resume** current song
- **Skip** to next song
- **Play Instantly** - Jump any song to the front
- **Move to Top** - Change song priority
- **Remove Songs** - Delete any song from queue

## WebSocket Integration

The frontend connects to the backend WebSocket server on `ws://localhost:8080` and handles:

- Room creation and joining
- Real-time queue updates
- Music player state changes
- User join/leave notifications
- Error handling

## Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Design Philosophy

- **Minimal & Functional** - Clean UI without fancy styling
- **Tailwind CSS** - Used only for layout and spacing
- **Reusable Components** - Modular and maintainable code
- **Real-time First** - WebSocket integration for live updates
