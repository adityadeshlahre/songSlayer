import { useNavigate } from "react-router-dom";

export const Landing = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="text-white">
        <div>Landing</div>Hello WebSocket
      </div>
      <div>
        <br />
        <button className="bg-red-300 border-4 border-white">
          Create Room
        </button>
        <br />
        <br />
        <button
          onClick={() => {
            navigate("/join");
          }}
          className="bg-blue-300 border-4 border-white"
        >
          I Have A Code
        </button>
      </div>
    </>
  );
};
