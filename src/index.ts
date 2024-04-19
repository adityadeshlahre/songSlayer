import { WebSocketServer } from "ws";
import { PartyManager } from "./PartyManager";
import { CREATE_ROOM, JOIN_ROOM, ROOM_CREATED, ROOM_JOINED } from "./Strings";

const wss = new WebSocketServer({ port: 8080 });

const partyManager = new PartyManager();

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  ws.on("message", (data: string) => {
    const { action, roomCode } = JSON.parse(data);
    console.log(roomCode, action);
    if (action === CREATE_ROOM) {
      const { roomCode, memberId } = partyManager.createRoom(ws);
      ws.send(
        JSON.stringify({
          type: ROOM_CREATED,
          payload: { roomCode, memberId },
        })
      );
    } else if (action === JOIN_ROOM) {
      const { memberId } = partyManager.addMemberToRoom(roomCode, ws);
      ws.send(
        JSON.stringify({ type: ROOM_JOINED, payload: { roomCode, memberId } })
      );
    }
  });

  ws.send("WS Connected");
  ws.on("close", () => {
    partyManager.disconnectUser(ws);
  });
});
