import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useEffect } from "react";
import {
  CREATE_ROOM,
  JOIN_RANDOM_ROOM,
  RANDOM_ROOM_JOINED,
  ROOM_CREATED,
} from "../messages/Strings";

export const Landing = () => {
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const messages = JSON.parse(event.data);
      switch (messages.type) {
        case ROOM_CREATED:
          localStorage.setItem("roomCode", messages.payload.roomCode);
          localStorage.setItem("memberId", messages.payload.memberId);
          navigate(`/room/${messages.payload.roomCode}`);
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
      <div className="text-white">
        <div>Landing</div>Hello WebSocket
      </div>
      <div>
        <br />
        <button
          onClick={() => {
            socket.send(JSON.stringify({ action: CREATE_ROOM }));
          }}
          className="bg-red-300 border-4 border-white"
        >
          Create Room
        </button>
        <br />
        <br />
        <button
          onClick={() => {
            navigate("/join");
          }}
          className="bg-blue-300 border-4 border-white"
        >
          I Have A Code
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
