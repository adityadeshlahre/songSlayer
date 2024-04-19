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
} from "./Strings";
import { VotingManager } from "./VotingManager";
import { Vote } from "./Voting";

const wss = new WebSocketServer({ port: 8080 });

const partyManager = new PartyManager();
const votingManager = new VotingManager();

const songIds = ["song1", "song2", "song3"];
votingManager.initializeSongVotes(songIds);

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
        const songs: Vote[] = votingManager.getSongVotes();
        ws.send(JSON.stringify({ type: ALL_SONGS, payload: { songs } }));
      } catch (error) {
        console.error("Error", error);
      }
    } else if (action === UP_VOTE) {
      try {
        const songs: Vote[] = votingManager.voteForSong(songId);
        ws.send(JSON.stringify({ type: UP_VOTE, payload: { songs } }));
      } catch (error) {
        console.error("Error", error);
      }
    }
  });

  ws.on("close", () => {
    partyManager.disconnectUser(ws);
  });
});
