import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useEffect, useState } from "react";
import {
  CREATE_ROOM,
  ROOM_CREATED,
  GET_ALL_ROOMS,
  ALL_ROOMS,
  ERROR,
} from "../messages/Strings";
import { Room } from "../types/socketData";
import { Button } from "../components/Button";

export const Landing = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [adminPassword, setAdminPassword] = useState("");
  const [roomCodeToJoin, setRoomCodeToJoin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Get all rooms on load
    socket.send(JSON.stringify({ action: GET_ALL_ROOMS }));

    // Poll for room updates every 5 seconds
    const intervalId = setInterval(() => {
      socket.send(JSON.stringify({ action: GET_ALL_ROOMS }));
    }, 5000);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case ROOM_CREATED:
          localStorage.setItem("roomCode", message.payload.roomCode);
          localStorage.setItem("adminId", message.payload.adminId);
          localStorage.setItem("isAdmin", "true");
          navigate(`/room/${message.payload.roomCode}`);
          break;

        case ALL_ROOMS:
          setRooms(message.payload.rooms || []);
          break;

        case ERROR:
          alert(`Error: ${message.payload.message}`);
          setLoading(false);
          break;
      }
    };

    return () => clearInterval(intervalId);
  }, [socket, navigate]);

  const createRoom = () => {
    if (!socket || !adminPassword.trim()) {
      alert("Please enter an admin password");
      return;
    }

    setLoading(true);
    socket.send(
      JSON.stringify({
        action: CREATE_ROOM,
        password: adminPassword,
      })
    );
  };

  const joinRoom = () => {
    if (!socket || !roomCodeToJoin.trim()) {
      alert("Please enter a room code");
      return;
    }

    navigate(`/join?roomCode=${roomCodeToJoin.toUpperCase()}`);
  };

  const totalUsers = rooms.reduce((sum, room) => sum + room.userCount, 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🎵 Song Slayer</h1>
          <p className="text-gray-600">Create or join a music room</p>
        </div>

        {/* Stats */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {rooms.length} active rooms • {totalUsers} users online
          </p>
        </div>

        {/* Create Room */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Create Room (Admin)</h2>
          <input
            type="password"
            placeholder="Admin password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <Button onClick={createRoom} disabled={loading}>
            {loading ? "Creating..." : "Create Room"}
          </Button>
        </div>

        {/* Join Room */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Join Room</h2>
          <input
            type="text"
            placeholder="Room Code (e.g., ABC123)"
            value={roomCodeToJoin}
            onChange={(e) => setRoomCodeToJoin(e.target.value.toUpperCase())}
            className="w-full p-2 border rounded"
            maxLength={6}
          />
          <Button onClick={joinRoom} variant="secondary">
            Join Room
          </Button>
        </div>

        {/* Active Rooms */}
        {rooms.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Active Rooms</h2>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {rooms.map((room) => (
                <div
                  key={room.roomCode}
                  className="p-3 border rounded bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{room.roomCode}</p>
                      <p className="text-sm text-gray-600">
                        {room.userCount} users • {room.queueLength} songs queued
                      </p>
                      {room.currentSong && (
                        <p className="text-xs text-blue-600">
                          Now: {room.currentSong.title}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() =>
                        navigate(`/join?roomCode=${room.roomCode}`)
                      }
                      variant="secondary"
                    >
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
