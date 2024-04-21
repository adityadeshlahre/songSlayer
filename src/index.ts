import { WebSocketServer } from "ws";
import { PartyManager } from "./PartyManager";
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
  SUBMIT_SONGS,
  SUBMITED_SONGS_ADDED,
  UP_VOTED,
} from "./Strings";
import { VotingManager } from "./VotingManager";
import { Vote } from "./Voting";
import { Songs } from "./Songs";
import { SongsManager } from "./SongsManager";

const wss = new WebSocketServer({ port: 8080 });

const partyManager = new PartyManager();
const votingManager = new VotingManager();
const songsManager = new SongsManager();

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);
  ws.send("WS Connected");

  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  ws.on("message", (data: string) => {
    const { action, roomCode, songId } = JSON.parse(data);
    if (action === CREATE_ROOM && roomCode === undefined) {
      const { roomCode, memberId } = partyManager.createRoom(ws);
      ws.send(
        JSON.stringify({
          type: ROOM_CREATED,
          payload: { roomCode, memberId },
        })
      );
    } else if (action === JOIN_ROOM && roomCode !== undefined) {
      const { memberId } = partyManager.joinRoom(roomCode, ws);
      ws.send(
        JSON.stringify({ type: ROOM_JOINED, payload: { roomCode, memberId } })
      );
    } else if (action === GET_ROOM_MEMBERS) {
      try {
        const members = partyManager.getRoomMembers(roomCode, ws);
        ws.send(JSON.stringify({ type: ROOM_MEMBERS, payload: members }));
      } catch (error) {
        console.error("Error:", error);
      }
    } else if (action === GET_SONGS) {
      try {
        const songs: Songs[] = songsManager.getAllSongs();
        ws.send(JSON.stringify({ type: ALL_SONGS, payload: { songs } }));
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
        const songs: Songs[] = songsManager.addSong(songId);
        ws.send(JSON.stringify({ type: SONGS_ADDED, payload: { songs } }));
      } catch (error) {
        console.error(error);
      }
    } else if (action === SUBMIT_SONGS) {
      try {
        const songs: Songs[] = songsManager.addSong(songId);
        ws.send(
          JSON.stringify({ type: SUBMITED_SONGS_ADDED, payload: { songs } })
        );
      } catch (error) {
        console.error(error);
      }
    } else if (action === SUBMIT_SONGS) {
      try {
        const songs: Songs[] = songsManager.addSong(songId);
        ws.send(
          JSON.stringify({ type: SUBMITED_SONGS_ADDED, payload: { songs } })
        );
      } catch (error) {
        console.error(error);
      }
    }
  });

  ws.on("close", () => {
    partyManager.disconnectUser(ws);
  });
});
