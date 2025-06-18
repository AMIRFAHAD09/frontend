import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Welcome from "./UI/Welcome"
import Register from "./UI/Register"
import Login from "./UI/Login"
import ChatDashboard from "./UI/ChatDash"
import { useAuth } from "./store/auth";
import './index.css';
function App() {
  const{isLoggedIn}=useAuth();
  return (
    <>
    <div className="bg-gray-100 min-h-screen">
      <BrowserRouter>
        <Routes>
        <Route path="/" element={isLoggedIn() ? <Navigate to="/chatds" /> : <Welcome />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chatds" element={isLoggedIn() ? <ChatDashboard /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
      </div>
    </>
  )
}

export default App
