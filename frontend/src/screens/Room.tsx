import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useEffect, useState } from "react";
import {
  GET_ROOM_INFO,
  ROOM_INFO,
  GET_QUEUE,
  QUEUE_UPDATED,
  ADD_SONG_TO_QUEUE,
  SONG_ADDED_TO_QUEUE,
  REMOVE_SONG_FROM_QUEUE,
  SONG_REMOVED_FROM_QUEUE,
  PLAY_SONG,
  PAUSE_SONG,
  RESUME_SONG,
  SKIP_SONG,
  PLAY_SONG_INSTANTLY,
  CHANGE_SONG_PRIORITY,
  SONG_STARTED,
  SONG_PAUSED,
  SONG_RESUMED,
  SONG_SKIPPED,
  USER_JOINED,
  USER_LEFT,
  ERROR,
} from "../messages/Strings";
import {
  Room as RoomType,
  QueuedSong,
  MusicPlayerState,
} from "../types/socketData";
import { Button } from "../components/Button";

export const Room = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { roomCode } = useParams<{ roomCode: string }>();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [queue, setQueue] = useState<QueuedSong[]>([]);
  const [newSong, setNewSong] = useState("");
  const [playerState, setPlayerState] = useState<MusicPlayerState | null>(null);

  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const userId =
    localStorage.getItem("userId") || localStorage.getItem("adminId") || "";

  useEffect(() => {
    if (!socket || !roomCode) return;

    // Get initial room info and queue
    socket.send(JSON.stringify({ action: GET_ROOM_INFO, roomCode }));
    socket.send(JSON.stringify({ action: GET_QUEUE, roomCode }));

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case ROOM_INFO:
          setRoom(message.payload.room);
          break;

        case QUEUE_UPDATED:
          setQueue(message.payload.queue || []);
          break;

        case SONG_ADDED_TO_QUEUE:
          setQueue(message.payload.queue || []);
          setNewSong("");
          break;

        case SONG_REMOVED_FROM_QUEUE:
          setQueue(message.payload.queue || []);
          break;

        case SONG_STARTED:
        case SONG_PAUSED:
        case SONG_RESUMED:
          if (message.payload.playerState) {
            setPlayerState(message.payload.playerState);
          }
          // Refresh room info to get current song
          socket.send(JSON.stringify({ action: GET_ROOM_INFO, roomCode }));
          break;

        case SONG_SKIPPED:
          // Refresh room info and queue
          socket.send(JSON.stringify({ action: GET_ROOM_INFO, roomCode }));
          socket.send(JSON.stringify({ action: GET_QUEUE, roomCode }));
          break;

        case USER_JOINED:
        case USER_LEFT:
          // Refresh room info for user count
          socket.send(JSON.stringify({ action: GET_ROOM_INFO, roomCode }));
          break;

        case ERROR:
          alert(`Error: ${message.payload.message}`);
          break;
      }
    };
  }, [socket, roomCode]);

  const addSongToQueue = () => {
    if (!socket || !newSong.trim()) return;

    socket.send(
      JSON.stringify({
        action: ADD_SONG_TO_QUEUE,
        roomCode,
        song: newSong.trim(),
        userId,
      })
    );
  };

  const removeSong = (songId: string) => {
    if (!socket) return;

    socket.send(
      JSON.stringify({
        action: REMOVE_SONG_FROM_QUEUE,
        roomCode,
        songId,
        userId,
      })
    );
  };

  const playPauseResume = () => {
    if (!socket || !isAdmin) return;

    const action = room?.isPlaying
      ? PAUSE_SONG
      : room?.isPlaying
      ? RESUME_SONG
      : PLAY_SONG;

    socket.send(
      JSON.stringify({
        action,
        roomCode,
        adminId: userId,
      })
    );
  };

  const skipSong = () => {
    if (!socket || !isAdmin) return;

    socket.send(
      JSON.stringify({
        action: SKIP_SONG,
        roomCode,
        adminId: userId,
      })
    );
  };

  const playInstantly = (songId: string) => {
    if (!socket || !isAdmin) return;

    socket.send(
      JSON.stringify({
        action: PLAY_SONG_INSTANTLY,
        roomCode,
        songId,
        adminId: userId,
      })
    );
  };

  const changePriority = (songId: string, newPriority: number) => {
    if (!socket || !isAdmin) return;

    socket.send(
      JSON.stringify({
        action: CHANGE_SONG_PRIORITY,
        roomCode,
        songId,
        newPriority,
        adminId: userId,
      })
    );
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading room...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Room {roomCode}</h1>
            <p className="text-gray-600">
              {room.userCount} users • {isAdmin ? "Admin" : "User"}
            </p>
          </div>
          <Button onClick={() => navigate("/")} variant="secondary">
            Leave Room
          </Button>
        </div>

        {/* Current Song */}
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Now Playing</h2>
          {room.currentSong ? (
            <div className="space-y-2">
              <p className="font-medium">{room.currentSong.title}</p>
              <p className="text-sm text-gray-600">
                Added by: {room.currentSong.addedBy}
              </p>
              <div className="flex space-x-2">
                {isAdmin && (
                  <>
                    <Button onClick={playPauseResume}>
                      {room.isPlaying
                        ? "Pause"
                        : room.isPlaying
                        ? "Resume"
                        : "Play"}
                    </Button>
                    <Button onClick={skipSong} variant="secondary">
                      Skip
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No song currently playing</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Actions</h2>
          <div className="flex space-x-2">
            <Button
              onClick={() =>
                navigate(`/vote?roomCode=${roomCode}&userId=${userId}`)
              }
              variant="primary"
            >
              Vote on Songs
            </Button>
          </div>
        </div>

        {/* Add Song */}
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Add Song</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Song title or YouTube URL"
              value={newSong}
              onChange={(e) => setNewSong(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <Button onClick={addSongToQueue}>Add to Queue</Button>
          </div>
        </div>

        {/* Queue */}
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">
            Queue ({queue.length} songs)
          </h2>
          {queue.length === 0 ? (
            <p className="text-gray-500">No songs in queue</p>
          ) : (
            <div className="space-y-2">
              {queue.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {index + 1}. {song.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      Added by: {song.addedBy} • Priority: {song.priority}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {isAdmin && (
                      <>
                        <Button
                          onClick={() => playInstantly(song.id)}
                          variant="secondary"
                        >
                          Play Now
                        </Button>
                        <Button
                          onClick={() => changePriority(song.id, 0)}
                          variant="secondary"
                        >
                          Move to Top
                        </Button>
                      </>
                    )}
                    {(isAdmin || song.addedBy === userId) && (
                      <Button
                        onClick={() => removeSong(song.id)}
                        variant="danger"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
