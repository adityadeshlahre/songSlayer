import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useEffect, useState } from "react";
import { GET_ALL_ROOMS, ALL_ROOMS } from "../messages/Strings";
import { Room } from "../types/socketData";
import { Button } from "../components/Button";

export const AllRooms = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Get all rooms on load
    socket.send(JSON.stringify({ action: GET_ALL_ROOMS }));

    // Poll for room updates every 3 seconds
    const intervalId = setInterval(() => {
      socket.send(JSON.stringify({ action: GET_ALL_ROOMS }));
    }, 3000);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === ALL_ROOMS) {
        setRooms(message.payload.rooms || []);
      }
    };

    return () => clearInterval(intervalId);
  }, [socket]);

  const totalUsers = rooms.reduce((sum, room) => sum + room.userCount, 0);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">All Rooms</h1>
            <p className="text-gray-600">
              {rooms.length} active rooms • {totalUsers} users online
            </p>
          </div>
          <Button onClick={() => navigate("/")} variant="secondary">
            Back to Home
          </Button>
        </div>

        {/* Rooms List */}
        {rooms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No active rooms found</p>
            <Button
              onClick={() => navigate("/")}
              // className="mt-4"
            >
              Create a Room
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div key={room.roomCode} className="border rounded p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">{room.roomCode}</h3>
                  <p className="text-sm text-gray-600">
                    Created: {new Date(room.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm">👥 {room.userCount} users</p>
                  <p className="text-sm">🎵 {room.queueLength} songs queued</p>
                  <p className="text-sm">
                    {room.isPlaying ? "▶️ Playing" : "⏸️ Paused/Stopped"}
                  </p>
                </div>

                {room.currentSong && (
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs text-gray-600">Now Playing:</p>
                    <p className="text-sm font-medium truncate">
                      {room.currentSong.title}
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => navigate(`/join?roomCode=${room.roomCode}`)}
                  variant="primary"
                >
                  Join Room
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
