import { WebSocketServer } from "ws";
import { RoomManager } from "./RoomManager";
import {
  CREATE_ROOM,
  GET_ROOM_MEMBERS,
  JOIN_ROOM,
  ROOM_CREATED,
  ROOM_JOINED,
  ALL_SONGS,
  GET_SONGS,
  UP_VOTE,
  ROOM_MEMBERS,
  ADD_SONGS,
  SONGS_ADDED,
  SUBMIT_SONGS_FOR_VOTE,
  SUBMITED_SONGS_FOR_VOTE_ADDED,
  UP_VOTED,
  REMOVE_SONG,
  SONG_REMOVED,
  SONG_WON,
  SONG_WON_URL,
  VOTE_RESET,
  RESET_VOTE,
  GET_SONGS_VOTE,
  ALL_SONGS_VOTE,
  JOIN_RANDOM_ROOM,
  RANDOM_ROOM_JOINED,
  GET_ALL_ROOMS,
  ALL_ROOMS,
  GET_ONE_ROOM,
  ONE_ROOM,
  SUBMIT_SONGS_TO_VOTE,
  SUBMIT_SONGS_TO_VOTE_ADDED,
} from "./Strings";
import { VotingManager } from "./VotingManager";
import { Vote } from "./Vote";
import { Song } from "./Song";
import { SongsManager } from "./SongsManager";
import { Rooms } from "./Rooms";

const wss = new WebSocketServer({ port: 8080 });

const votingManager = new VotingManager();
const roomManager = new RoomManager(votingManager);
const songsManager = new SongsManager(votingManager);

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);
  ws.send("WS Connected");

  ws.on("message", (data: string) => {
    const { action, roomCode, songId } = JSON.parse(data);
    if (action === CREATE_ROOM && roomCode === undefined) {
      const { roomCode, memberId } = roomManager.createRoom(ws);
      ws.send(
        JSON.stringify({
          type: ROOM_CREATED,
          payload: { roomCode, memberId },
        })
      );
    } else if (action === JOIN_ROOM && roomCode !== undefined) {
      const { memberId } = roomManager.joinRoom(roomCode, ws);
      ws.send(
        JSON.stringify({ type: ROOM_JOINED, payload: { roomCode, memberId } })
      );
    } else if (action === JOIN_RANDOM_ROOM && roomCode === undefined) {
      const { roomCode, memberId } = roomManager.joinRandomRoom(ws);
      ws.send(
        JSON.stringify({
          type: RANDOM_ROOM_JOINED,
          payload: { roomCode, memberId },
        })
      );
    } else if (action === GET_ROOM_MEMBERS) {
      try {
        const members = roomManager.getRoomMembers(roomCode, ws);
        ws.send(JSON.stringify({ type: ROOM_MEMBERS, payload: members }));
      } catch (error) {
        console.error("Error:", error);
      }
    } else if (action === GET_ALL_ROOMS) {
      try {
        const allRoom = roomManager.allRoomDetails();
        ws.send(JSON.stringify({ type: ALL_ROOMS, payload: allRoom }));
      } catch (error) {
        console.error("Error:", error);
      }
    } else if (action === GET_ONE_ROOM) {
      try {
        const oneRoom = roomManager.getRoomDetails(roomCode);
        ws.send(JSON.stringify({ type: ONE_ROOM, payload: oneRoom }));
      } catch (error) {
        console.error("Error:", error);
      }
    } else if (action === GET_SONGS) {
      try {
        const songs: Song[] = songsManager.getAllSongs();
        ws.send(JSON.stringify({ type: ALL_SONGS, payload: { songs } }));
      } catch (error) {
        console.error("Error", error);
      }
    } else if (action === GET_SONGS_VOTE) {
      try {
        const songs: Vote[] = votingManager.getSongVotes();
        ws.send(JSON.stringify({ type: ALL_SONGS_VOTE, payload: { songs } }));
      } catch (error) {
        console.error("Error", error);
      }
    } else if (action === UP_VOTE) {
      try {
        const songs: Vote[] = votingManager.voteForSong(songId);
        ws.send(JSON.stringify({ type: UP_VOTED, payload: { songs } }));
      } catch (error) {
        console.error("Error", error);
      }
    } else if (action === ADD_SONGS) {
      try {
        const songs: Song[] = songsManager.addSong(songId);
        ws.send(JSON.stringify({ type: SONGS_ADDED, payload: { songs } }));
      } catch (error) {
        console.error("Error:", error);
      }
    } else if (action === SUBMIT_SONGS_TO_VOTE) {
      try {
        const songs: Vote[] = songsManager.submitSong(songId);
        ws.send(
          JSON.stringify({
            type: SUBMIT_SONGS_TO_VOTE_ADDED,
            payload: { songs },
          })
        );
      } catch (error) {
        console.error("Error:", error);
      }
    } else if (action === SUBMIT_SONGS_FOR_VOTE) {
      try {
        const roomSongs: Rooms[] = roomManager.pushSongsToRoom(roomCode);
        ws.send(
          JSON.stringify({
            type: SUBMITED_SONGS_FOR_VOTE_ADDED,
            payload: { roomSongs },
          })
        );
      } catch (error) {
        console.error("Error:", error);
      }
    } else if (action === REMOVE_SONG) {
      try {
        const songs: Song[] = songsManager.removeSongs(songId);
        ws.send(JSON.stringify({ type: SONG_REMOVED, payload: { songs } }));
      } catch (error) {
        console.error("Error:", error);
      }
    } else if (action === SONG_WON) {
      try {
        const winningSongs: string[] = votingManager.getWinningSongs();
        ws.send(
          JSON.stringify({ type: SONG_WON_URL, payload: { winningSongs } })
        );
      } catch (error) {
        console.error("Error:", error);
      }
    } else if (action === RESET_VOTE) {
      try {
        votingManager.resetVotes();
        ws.send(JSON.stringify({ type: VOTE_RESET }));
      } catch (error) {
        console.error("Error:", error);
      }
    }
  });

  ws.on("close", () => {
    roomManager.disconnectUser(ws);
  });
});

// async function pollWinningSongs() {
//   try {
//     const winningSongs = votingManager.getWinningSongs();
//     if (winningSongs.length > 0) {
//       console.log("Winning songs:", winningSongs);
//       // Perform actions such as playing the winning songs, etc.
//     } else {
//       console.log("No winning songs yet.");
//     }
//   } catch (error) {
//     console.error("Error polling for winning songs:", error);
//   }
// }

// const pollingInterval = 5000; // 5 seconds
// const pollingTimer = setInterval(pollWinningSongs, pollingInterval);

// process.on("SIGINT", () => {
//   clearInterval(pollingTimer);
//   wss.close();
//   console.log("Server stopped.");
// });

// write now maintaining 2 arrays needed fix
