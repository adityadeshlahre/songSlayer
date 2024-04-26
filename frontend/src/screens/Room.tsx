import { useLocation } from "react-router-dom";

export const Room = () => {
  const roomCodeFromUrl = useLocation().pathname.split("/").pop();
  return (
    <>
      <div className="text-white">{roomCodeFromUrl}</div>
      <div>Table</div>
    </>
  );
};
