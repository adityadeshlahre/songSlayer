import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import {
  JOIN_RANDOM_ROOM,
  JOIN_ROOM,
  RANDOM_ROOM_JOINED,
  ROOM_JOINED,
} from "../messages/Strings";

export const Join = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState<string>("");
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const messages = JSON.parse(event.data);
      switch (messages.type) {
        case ROOM_JOINED:
          if (roomCode === messages.payload.roomCode) {
            localStorage.setItem("roomCode", messages.payload.roomCode);
            localStorage.setItem("memberId", messages.payload.memberId);
            navigate(`/vote/${roomCode}`);
          }
          break;
        case RANDOM_ROOM_JOINED:
          localStorage.setItem("roomCode", messages.payload.roomCode);
          localStorage.setItem("memberId", messages.payload.memberId);
          navigate(`/vote/${messages.payload.roomCode}`);
          break;
        default:
          break;
      }
    };
  }, [socket]);

  if (!socket)
    return (
      <>
        <div className="text-white">Connecting.......</div>
      </>
    );

  return (
    <>
      <Button
        onClick={() => {
          navigate("/");
        }}
      >
        HOME
      </Button>
      <div className="text-white">
        <div>Join</div>Hello WebSocket
      </div>

      <br />
      <div>
        <input
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="w-40 h-8"
          placeholder="Enter Room Code"
        ></input>
        <br />
        <br />
        <button
          onClick={() => {
            socket.send(
              JSON.stringify({ action: JOIN_ROOM, roomCode: roomCode })
            );
          }}
          className="bg-yellow-300 border-4 border-white"
        >
          Join Room
        </button>
        <br />
        <br />
        <button
          onClick={() => {
            socket.send(JSON.stringify({ action: JOIN_RANDOM_ROOM }));
          }}
          className="bg-green-300 border-4 border-white"
        >
          Join Random Room
        </button>
      </div>
    </>
  );
};
