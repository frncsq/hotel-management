import { Routes, Route } from "react-router-dom";
import Login from "./login.jsx";
import Register from "./pages/register.jsx";
import Home from "./pages/home.jsx";
import Bookings from "./pages/bookings.jsx";
import RoomDetail from "./pages/room-detail.jsx";
import Rooms from "./pages/rooms.jsx";
import Contact from "./pages/contact.jsx";
import Profile from "./pages/profile.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/room/:roomId" element={<RoomDetail />} />
      <Route path="/bookings" element={<Bookings />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
