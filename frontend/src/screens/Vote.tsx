import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useSocket } from "../hooks/useSocket";
import {
  GET_ONE_ROOM,
  RESET_VOTE,
  UP_VOTE,
  UP_VOTED,
  VOTE_RESET,
} from "../messages/Strings";
import { useEffect, useState } from "react";
import { SocketData } from "../types/socketData";

export const Vote = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState<string>("");
  const [data, setData] = useState<SocketData>();
  const [song1Vote, setSong1Vote] = useState<number>(0);
  const [song2Vote, setSong2Vote] = useState<number>(0);
  const [song1Id, setSong1Id] = useState<string>("");
  const [song2Id, setSong2Id] = useState<string>("");

  const socket = useSocket();

  const roomCodeFromUrl = useLocation().pathname.split("/").pop();

  useEffect(() => {
    if (!socket) {
      return;
    }

    if (roomCodeFromUrl) {
      setRoomCode(roomCodeFromUrl);
    }

    const intervalId = setInterval(() => {
      socket.send(
        JSON.stringify({ action: GET_ONE_ROOM, roomCode: roomCodeFromUrl })
      );
    }, 5000);

    // socket.send(
    //   JSON.stringify({ action: GET_ONE_ROOM, roomCode: roomCodeFromUrl })
    // );

    socket.onmessage = (event) => {
      try {
        const messages = JSON.parse(event.data);
        switch (messages.type) {
          case UP_VOTED:
            socket.send(JSON.stringify({ action: UP_VOTE, songId: song1Id }));
            socket.send(JSON.stringify({ action: UP_VOTE, songId: song2Id }));
            break;
          case RESET_VOTE:
            console.log(VOTE_RESET);
            break;
          default:
            setData(messages.payload);
            setSong1Vote(messages.payload.song1.votes);
            setSong2Vote(messages.payload.song2.votes);
            setSong1Id(messages.payload.song1.id);
            setSong2Id(messages.payload.song2.id);
            break;
        }
      } catch (error) {
        console.error("Error parsing message data:", error);
      }
    };

    return () => {
      clearInterval(intervalId);
    };
  }, [socket, roomCodeFromUrl]);

  useEffect(() => {
    if (!socket) {
      const timeoutId = setTimeout(() => {
        window.location.reload();
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [socket]);

  if (!socket)
    return (
      <>
        <div>Connecting.......</div>
      </>
    );

  return (
    <>
      <div className="text-white">{roomCode}</div>
      <div className="text-yellow-200">{JSON.stringify(data)}</div>
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
        <input className="w-40 h-8" placeholder="Enter Room Code"></input>
        <br />
        <br />
        <div className="flex justify-center box-border h-32 w-32 p-4 border-4 bg-violet-200 text-green-800">
          {JSON.stringify(song1Id)} : {JSON.stringify(song1Vote)}
          <br />
          {JSON.stringify(song2Id)} : {JSON.stringify(song2Vote)}
        </div>
        <br />
        <br />
        <div>
          <Button
            onClick={() => {
              socket.send(JSON.stringify({ action: UP_VOTE, songId: song1Id }));
            }}
          >
            Vote Song 1
          </Button>
          <Button
            onClick={() => {
              socket.send(JSON.stringify({ action: UP_VOTE, songId: song2Id }));
            }}
          >
            Vote Song 2
          </Button>
          <button
            onClick={() => {
              socket.send(
                JSON.stringify({
                  action: GET_ONE_ROOM,
                  roomCode: roomCodeFromUrl,
                })
              );
            }}
          >
            skdf
          </button>
        </div>
      </div>
    </>
  );
};
