import { useNavigate, useSearchParams } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useEffect, useState } from "react";
import {
  JOIN_ROOM,
  ROOM_JOINED,
  ADMIN_LOGIN,
  ADMIN_LOGIN_SUCCESS,
  ADMIN_LOGIN_FAILED,
  ERROR,
} from "../messages/Strings";
import { Button } from "../components/Button";

export const Join = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [searchParams] = useSearchParams();
  const [roomCode, setRoomCode] = useState(searchParams.get("roomCode") || "");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case ROOM_JOINED:
          localStorage.setItem("roomCode", message.payload.roomCode);
          localStorage.setItem("userId", message.payload.userId);
          localStorage.setItem("isAdmin", "false");
          navigate(`/room/${message.payload.roomCode}`);
          break;

        case ADMIN_LOGIN_SUCCESS:
          localStorage.setItem("roomCode", message.payload.roomCode);
          localStorage.setItem("adminId", message.payload.adminId);
          localStorage.setItem("isAdmin", "true");
          navigate(`/room/${message.payload.roomCode}`);
          break;

        case ADMIN_LOGIN_FAILED:
        case ERROR:
          alert(`Error: ${message.payload.message}`);
          setLoading(false);
          break;
      }
    };
  }, [socket, navigate]);

  const joinAsUser = () => {
    if (!socket || !roomCode.trim()) {
      alert("Please enter a room code");
      return;
    }

    setLoading(true);
    socket.send(
      JSON.stringify({
        action: JOIN_ROOM,
        roomCode: roomCode.toUpperCase(),
      })
    );
  };

  const joinAsAdmin = () => {
    if (!socket || !roomCode.trim() || !adminPassword.trim()) {
      alert("Please enter room code and admin password");
      return;
    }

    setLoading(true);
    socket.send(
      JSON.stringify({
        action: ADMIN_LOGIN,
        roomCode: roomCode.toUpperCase(),
        password: adminPassword,
      })
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Join Room</h1>
          <p className="text-gray-600">Enter room details to join</p>
        </div>

        {/* Room Code Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">Room Code</label>
          <input
            type="text"
            placeholder="Enter room code (e.g., ABC123)"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="w-full p-2 border rounded"
            maxLength={6}
          />
        </div>

        {/* Join Type Selection */}
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Button
              onClick={() => setIsAdminMode(false)}
              variant={!isAdminMode ? "primary" : "secondary"}
            >
              Join as User
            </Button>
            <Button
              onClick={() => setIsAdminMode(true)}
              variant={isAdminMode ? "primary" : "secondary"}
            >
              Join as Admin
            </Button>
          </div>
        </div>

        {/* Admin Password (if admin mode) */}
        {isAdminMode && (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Admin Password</label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        )}

        {/* Join Button */}
        <div className="space-y-3">
          <Button
            onClick={isAdminMode ? joinAsAdmin : joinAsUser}
            disabled={loading}
          >
            {loading
              ? "Joining..."
              : `Join as ${isAdminMode ? "Admin" : "User"}`}
          </Button>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button onClick={() => navigate("/")} variant="secondary">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};
