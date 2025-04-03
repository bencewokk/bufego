import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const DashboardPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const url = "http://localhost:3000/api/dashboard";
        const headers = { Authorization: `Bearer ${token}`};
        if (!token) {
          navigate("/");
        }
        axios
          .get(url, { headers })
          .then((response) => {
            setUsername(response.data.user.username);
            setUserId(response.data.user.id);
          })
          .catch((err) => console.log(err));
      });

      const handleLogout = () => {
        localStorage.removeItem("accessToken");
        navigate("/");
      };
    
  return (
    <div>
      <h1>Welcome back, {username}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}