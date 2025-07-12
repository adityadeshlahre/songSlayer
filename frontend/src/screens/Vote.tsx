import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { useSocket } from "../hooks/useSocket";
import { Song } from "../types/socketData";

export const Vote = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get("roomCode");
  const userId = searchParams.get("userId");

  const [songQueue, setSongQueue] = useState<Song[]>([]);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const socket = useSocket();

  useEffect(() => {
    if (!roomCode || !userId) {
      navigate("/");
      return;
    }

    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "ROOM_JOINED":
          setSongQueue(data.payload.room.songQueue || []);
          setLoading(false);
          break;
        case "QUEUE_UPDATED":
          setSongQueue(data.payload.queue || []);
          break;
        case "SONG_VOTED":
        case "SONG_UNVOTED":
          setSongQueue(data.payload.queue || []);
          break;
        case "ERROR":
          console.error("Error:", data.payload.message);
          break;
      }
    };

    socket.addEventListener("message", handleMessage);

    // Join room to get current queue
    socket.send(
      JSON.stringify({
        action: "JOIN_ROOM",
        roomCode,
        userId,
      })
    );

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, roomCode, userId, navigate]);

  const voteSong = (songId: string) => {
    if (!socket || !roomCode || !userId) return;

    socket.send(
      JSON.stringify({
        action: "VOTE_SONG",
        roomCode,
        songId,
        userId,
      })
    );

    setUserVotes((prev) => [...prev, songId]);
  };

  const unvoteSong = (songId: string) => {
    if (!socket || !roomCode || !userId) return;

    socket.send(
      JSON.stringify({
        action: "UNVOTE_SONG",
        roomCode,
        songId,
        userId,
      })
    );

    setUserVotes((prev) => prev.filter((id) => id !== songId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Vote for Songs</h1>
          <p className="text-gray-600">Room: {roomCode}</p>
        </div>

        {songQueue.length === 0 ? (
          <div className="text-center text-gray-500">
            No songs in queue to vote for
          </div>
        ) : (
          <div className="space-y-4">
            {songQueue.map((song, index) => {
              const hasVoted = userVotes.includes(song.id);

              return (
                <div
                  key={song.id}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      #{index + 1} {song.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      Added by: {song.addedBy}
                    </div>
                    {song.url && (
                      <div className="text-xs text-blue-600 truncate">
                        {song.url}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Votes: {song.votes || 0}
                    </span>

                    {hasVoted ? (
                      <Button
                        onClick={() => unvoteSong(song.id)}
                        variant="secondary"
                      >
                        Unvote
                      </Button>
                    ) : (
                      <Button
                        onClick={() => voteSong(song.id)}
                        variant="primary"
                      >
                        Vote
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center space-y-2">
          <Button
            onClick={() =>
              navigate(`/room?roomCode=${roomCode}&userId=${userId}`)
            }
            variant="secondary"
          >
            Back to Room
          </Button>
          <br />
          <Button onClick={() => navigate("/")} variant="primary">
            Leave Room
          </Button>
        </div>
      </div>
    </div>
  );
};
