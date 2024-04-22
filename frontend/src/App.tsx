import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing } from "./screens/Landing";
import { Join } from "./screens/Join";
import { Vote } from "./screens/vote";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/join" element={<Join />} />
          <Route path="/vote" element={<Vote />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
