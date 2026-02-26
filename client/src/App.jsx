import { Routes, Route } from "react-router-dom";
import Login from "./login.jsx";
import Register from "./pages/register.jsx";
import Home from "./pages/home.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;
