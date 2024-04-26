import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import {
  GET_ONE_ROOM,
  VOTE_FOR_SONG,
  UP_VOTED,
  RESET_VOTE,
  VOTE_RESET,
  ADD_SONGS,
  SUBMIT_SONGS_FOR_VOTE,
  SONGS_ADDED,
  SUBMITED_SONGS_FOR_VOTE_ADDED,
} from "../messages/Strings";
import { SocketData } from "../types/socketData";

export const Room = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState<string>("");
  const [songId, setSongId] = useState<string>("");
  const [songImage, setSongImage] = useState<string>("");
  const [songYtUrl, setSongYtUrl] = useState<string>("");
  const [data, setData] = useState<SocketData>();

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
          case SONGS_ADDED:
            console.log(SONGS_ADDED);
            break;
          case SUBMITED_SONGS_FOR_VOTE_ADDED:
            console.log(SUBMITED_SONGS_FOR_VOTE_ADDED);
            break;
          default:
            setData(messages.payload);
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
        <div>
          {/* this button need to be fixed */}
          <Button
            onClick={() => {
              socket.send(JSON.stringify({ action: VOTE_FOR_SONG }));
            }}
          >
            Vote Song 1
          </Button>
          <Button
            onClick={() => {
              socket.send(JSON.stringify({ action: VOTE_FOR_SONG })); //songId needed
            }}
          >
            Vote Song 2
          </Button>
        </div>

        <br />
        <br />
        <div className="text-white">Input Song To Add In Qeueu</div>
        <br />
        <br />
        <input
          value={songImage}
          onChange={(e) => setSongImage(e.target.value)}
          className="w-40 h-8"
          placeholder="Enter Song Image"
        ></input>
        <br />
        <br />
        <input
          value={songYtUrl}
          onChange={(e) => setSongYtUrl(e.target.value)}
          className="w-40 h-8"
          placeholder="Enter Song YTurl"
        ></input>
        <br />
        <br />
        <div>
          {/* this button need to be fixed */}
          <Button
            onClick={() => {
              console.log(roomCode);
              socket.send(
                JSON.stringify({
                  action: ADD_SONGS,
                  songId: { id: songId, image: songImage, ytUrl: songYtUrl },
                })
              );
              socket.send(
                JSON.stringify({
                  action: SUBMIT_SONGS_FOR_VOTE,
                  roomCode: roomCode,
                })
              );
            }}
          >
            Add Songs
          </Button>
        </div>
      </div>
    </>
  );
};
