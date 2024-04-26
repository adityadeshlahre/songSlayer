import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useSocket } from "../hooks/useSocket";
import {
  RESET_VOTE,
  UP_VOTED,
  VOTE_FOR_SONG,
  VOTE_RESET,
} from "../messages/Strings";
import { useEffect } from "react";

export const Vote = () => {
  const navigate = useNavigate();

  const socket = useSocket();

  const location = useLocation();
  const url = new URLSearchParams(location.search);
  const roomCode = url.toString();

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = (event) => {
      const messages = JSON.parse(event.data);
      console.log(messages);
      switch (messages.action) {
        case VOTE_FOR_SONG:
          console.log(UP_VOTED);
          break;
        case RESET_VOTE:
          console.log(VOTE_RESET);
          break;
      }
    };
  }, []);

  if (!socket)
    return (
      <>
        <div>Connecting.......</div>
      </>
    );

  return (
    <>
      <div className="text-white">{roomCode}</div>
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
