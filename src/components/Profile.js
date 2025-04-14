import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles.css";

export default function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated");
        return;
      }

      try {
        const response = await axios.get("http://localhost:3001/api/v1/user", {
          headers: { "x-access-token": token },
        });
        if (response.data?.success) {
          setUserInfo(response.data.data);
        } else {
          setError("Failed to fetch user information");
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
        setError("An error occurred while fetching user information");
      }
    };

    fetchUserInfo();
  }, []);

  if (error) {
    return <div className="profile-container"><p className="error-message">{error}</p></div>;
  }

  if (!userInfo) {
    return <div className="profile-container"><p>Loading...</p></div>;
  }

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      <div className="profile-details">
        <p><strong>Username:</strong> {userInfo.username}</p>
        <p><strong>Email:</strong> {userInfo.email}</p>
        <p><strong>User ID:</strong> {userInfo.id}</p>
        <p><strong>Level ID:</strong> {userInfo.level_id}</p>
        <p><strong>Last Login:</strong> {new Date(userInfo.last_login_at).toLocaleString()}</p>
        <p><strong>Created At:</strong> {new Date(userInfo.createdAt).toLocaleString()}</p>
        <p><strong>Updated At:</strong> {new Date(userInfo.updatedAt).toLocaleString()}</p>
        <p><strong>About:</strong> {userInfo.about || "N/A"}</p>
      </div>
    </div>
  );
}
