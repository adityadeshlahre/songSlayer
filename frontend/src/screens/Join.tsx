import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";

export const Join = () => {
  const navigate = useNavigate();
  return (
    <>
      <Button
        onClick={() => {
          navigate("/");
        }}
        text="There"
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

        <button className="bg-yellow-300 border-4 border-white">
          Join Room
        </button>
        <br />
        <br />
        <button className="bg-green-300 border-4 border-white">
          Join Random Room
        </button>
      </div>
    </>
  );
};
