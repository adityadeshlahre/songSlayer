import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useEffect, useState } from "react";
import {
  CREATE_ROOM,
  GET_ALL_ROOMS,
  JOIN_RANDOM_ROOM,
  RANDOM_ROOM_JOINED,
  ROOM_CREATED,
} from "../messages/Strings";
import { SocketData } from "../types/socketData";

export const Landing = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [rooms, setRooms] = useState<SocketData[]>();
  const [totalPlayers, setTotalPlayers] = useState<number>(0);

  useEffect(() => {
    if (!socket) return;

    const intervalId = setInterval(() => {
      socket.send(
        JSON.stringify({
          action: GET_ALL_ROOMS,
        })
      );
    }, 2000);

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
          const rooms = messages.payload;
          setRooms(rooms);
          const total = rooms.reduce(
            (acc: any, room: any) => acc + room.players.length,
            0
          );
          setTotalPlayers(total);
          break;
      }
    };

    return () => {
      clearInterval(intervalId);
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
      <div className="text-green-200">
        {/* {rooms?.map((room: any) => (
          <div key={room.roomCode} className="text-green-200"></div>
        ))} */}
        <div>Total Rooms : {rooms ? rooms.length : 0}</div>
        <div>Total Players: {totalPlayers}</div>
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
