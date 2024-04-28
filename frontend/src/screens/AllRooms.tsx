import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useEffect, useState } from "react";
import { GET_ALL_ROOMS } from "../messages/Strings";
import { SocketData } from "../types/socketData";
import { Button } from "../components/Button";

export const AllRooms = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [rooms, setRooms] = useState<SocketData[]>();

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
        default:
          const rooms = messages.payload;
          setRooms(rooms);
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
        <div>AllRooms</div>Hello WebSocket
      </div>
      <Button
        onClick={() => {
          navigate("/");
        }}
      >
        HOME
      </Button>
      <div className="text-green-200">
        {rooms?.map((room: any) => (
          <div key={room.roomCode}>
            <br />
            <hr />
            <div>Room Code: {room.roomCode}</div>
            <div>Members ID: {room.memberId.join(" , ")}</div>
            <div>Player Count: {room.playerCount}</div>
            <div>Players: {room.players.join(" , ")}</div>
            <div>
              Song 1: {room.song1.song.id}, Votes: {room.song1.votes}
            </div>
            <div>
              Song 2: {room.song2.song.id}, Votes: {room.song2.votes}
            </div>
            <hr />
          </div>
        ))}
      </div>
    </>
  );
};
