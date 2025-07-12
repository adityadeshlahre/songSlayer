import { actionHandlers } from "../index";
import {
  CREATE_ROOM,
  ROOM_CREATED,
  JOIN_ROOM,
  ROOM_JOINED,
} from "../Strings";

// Mock WebSocket for testing
class MockWebSocket {
  public readyState = 1; // WebSocket.OPEN
  public sentMessages: string[] = [];

  send(data: string) {
    this.sentMessages.push(data);
  }
}

describe("Action Handlers", () => {
  let mockWs: MockWebSocket;

  beforeEach(() => {
    mockWs = new MockWebSocket();
  });

  test("CREATE_ROOM action should work", () => {
    const data = { action: CREATE_ROOM, password: "test123" };

    actionHandlers[CREATE_ROOM](mockWs as any, data);

    expect(mockWs.sentMessages.length).toBe(1);
    const response = JSON.parse(mockWs.sentMessages[0]);
    expect(response.type).toBe(ROOM_CREATED);
    expect(response.payload).toHaveProperty("roomCode");
    expect(response.payload).toHaveProperty("adminId");
    expect(response.payload.isAdmin).toBe(true);
  });

  test("JOIN_ROOM action should work", () => {
    // Create separate mock WebSockets for admin and user
    const adminWs = new MockWebSocket();
    const userWs = new MockWebSocket();

    // First create a room with admin WebSocket
    const createData = { action: CREATE_ROOM, password: "test123" };
    actionHandlers[CREATE_ROOM](adminWs as any, createData);

    const createResponse = JSON.parse(adminWs.sentMessages[0]);
    const roomCode = createResponse.payload.roomCode;

    // Now join the room with user WebSocket
    const joinData = { action: JOIN_ROOM, roomCode };
    actionHandlers[JOIN_ROOM](userWs as any, joinData);

    // User WebSocket should receive ROOM_JOINED message
    expect(userWs.sentMessages.length).toBe(1);
    const response = JSON.parse(userWs.sentMessages[0]);
    expect(response.type).toBe(ROOM_JOINED);
    expect(response.payload).toHaveProperty("userId");
    expect(response.payload.isAdmin).toBe(false);

    // Admin WebSocket should receive USER_JOINED broadcast
    expect(adminWs.sentMessages.length).toBe(2); // CREATE_ROOM response + USER_JOINED broadcast
    const broadcastResponse = JSON.parse(adminWs.sentMessages[1]);
    expect(broadcastResponse.type).toBe("USER_JOINED");
    expect(broadcastResponse.payload).toHaveProperty("userId");
    expect(broadcastResponse.payload).toHaveProperty("totalUsers");
  });

  test("should handle missing room code error", () => {
    const data = { action: JOIN_ROOM }; // Missing roomCode

    actionHandlers[JOIN_ROOM](mockWs as any, data);

    expect(mockWs.sentMessages.length).toBe(1);
    const response = JSON.parse(mockWs.sentMessages[0]);
    expect(response.type).toBe("ERROR");
    expect(response.payload.message).toBe("Room code is required");
  });

  test("should handle non-existent room error", () => {
    const data = { action: JOIN_ROOM, roomCode: "NONEXISTENT" };

    actionHandlers[JOIN_ROOM](mockWs as any, data);

    expect(mockWs.sentMessages.length).toBe(1);
    const response = JSON.parse(mockWs.sentMessages[0]);
    expect(response.type).toBe("ERROR");
    expect(response.payload.message).toBe("Room does not exist");
  });
});
