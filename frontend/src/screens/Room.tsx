import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";

export const Room = () => {
  const location = useLocation();
  const url = new URLSearchParams(location.search);
  const roomCode = url.toString();
  return (
    <>
      <div className="text-white">{roomCode}</div>
    </>
  );
};
