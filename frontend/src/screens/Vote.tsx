import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useSocket } from "../hooks/useSocket";
import {
  GET_ONE_ROOM,
  RESET_VOTE,
  UP_VOTED,
  VOTE_FOR_SONG,
  VOTE_RESET,
} from "../messages/Strings";
import { useEffect, useState } from "react";

interface SocketData {
  payload: {
    roomCode: string;
    memberId: string;
    playerCount: number;
    players: string[];
    song1: {
      id: string;
      song: {
        id: string;
        image: string;
        ytUrl: string;
      };
      votes: number;
    };
    song2: {
      id: string;
      song: {
        id: string;
        image: string;
        ytUrl: string;
      };
      votes: number;
    };
  };
}

export const Vote = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState<string>("");
  const [data, setData] = useState<SocketData>();

  const socket = useSocket();

  const roomCodeFromUrl = useLocation().pathname.split("/").pop();

  useEffect(() => {
    if (!socket) {
      return;
    }

    if (roomCodeFromUrl) {
      setRoomCode(roomCodeFromUrl);
      return;
    }

    socket.send(JSON.stringify({ action: GET_ONE_ROOM, roomCode: roomCode }));
    socket.onmessage = (event) => {
      try {
        const messages = JSON.parse(event.data);
        switch (messages.type) {
          case VOTE_FOR_SONG:
            console.log(UP_VOTED);
            break;
          case RESET_VOTE:
            console.log(VOTE_RESET);
            break;
          default:
            setData(messages.payload);
            break;
        }
      } catch (error) {
        console.error("Error parsing message data:", error);
      }
    };
  }, [socket, roomCode]);

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
        text="!"
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

        <div>
          {/* this button need to be fixed */}
          <button
            onClick={() => {
              socket.send(JSON.stringify({ action: VOTE_FOR_SONG }));
            }}
            className="bg-green-300 border-4 border-white"
          >
            Vote Song 1
            <Button
              onClick={() => {
                socket.send(JSON.stringify({ action: VOTE_FOR_SONG }));
              }}
              text="UP"
            >
              ^
            </Button>
          </button>
          <button
            onClick={() => {
              socket.send(JSON.stringify({ action: VOTE_FOR_SONG })); //songId needed
            }}
            className="bg-green-300 border-4 border-white"
          >
            Vote Song 2
            <Button
              onClick={() => {
                socket.send(JSON.stringify({ action: VOTE_FOR_SONG })); //songId needed
              }}
              text="UP"
            >
              ^
            </Button>
          </button>
        </div>
      </div>
    </>
  );
};
