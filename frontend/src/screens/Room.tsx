import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import {
  UP_VOTED,
  RESET_VOTE,
  VOTE_RESET,
  ADD_SONGS,
  SUBMIT_SONGS_FOR_VOTE,
  SONGS_ADDED,
  UP_VOTE,
  GET_ONE_ROOM,
} from "../messages/Strings";
import { SocketData } from "../types/socketData";

export const Room = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState<string>("");
  const [songId, setSongId] = useState<string>("");
  const [songImage, setSongImage] = useState<string>("");
  const [songYtUrl, setSongYtUrl] = useState<string>("");
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
        JSON.stringify({
          action: GET_ONE_ROOM,
          roomCode: roomCodeFromUrl,
        })
      );
    }, 5000);

    socket.onmessage = (event) => {
      try {
        const messages = JSON.parse(event.data);
        switch (messages.type) {
          // case UP_VOTED:
          //   socket.send(
          //     JSON.stringify({ action: UP_VOTE, songId: songIdToUpVote })
          //   );
          //   break;
          case RESET_VOTE:
            console.log(VOTE_RESET);
            break;
          case SONGS_ADDED:
            JSON.stringify({
              action: ADD_SONGS,
              songId: { id: songId, image: songImage, ytUrl: songYtUrl },
            });
            break;
          default:
            // const roomSongs = messages.payload.roomSongs;
            // if (roomSongs.length > 0) {
            //   const song1 = roomSongs[0].song1;
            //   const song2 = roomSongs[0].song2;
            //   setData(roomSongs);
            //   setSong1Vote(song1.votes);
            //   setSong2Vote(song2.votes);
            //   setSong1Id(song1.id);
            //   setSong2Id(song2.id);
            // }
            const room = messages.payload;
            setData(room);
            setSong1Vote(room.song1.votes);
            setSong2Vote(room.song2.votes);
            setSong1Id(room.song1.id);
            setSong2Id(room.song2.id);
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
      <br />
      <center>
        <div className="flex justify-center items-center box-border h-32 w-32 p-4 border-4 bg-violet-200 text-green-800">
          <div>
            {JSON.stringify(song1Id)} : {JSON.stringify(song1Vote)}
            <br />
            {JSON.stringify(song2Id)} : {JSON.stringify(song2Vote)}
          </div>
        </div>
      </center>
      <br />
      <br />
      <div>
        <Button
          onClick={() => {
            socket.send(JSON.stringify({ action: RESET_VOTE }));
          }}
        >
          Reset Vote
        </Button>
      </div>
      <br />
      <div>
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
