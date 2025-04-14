import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Auth from "./components/Auth";
import Forum from "./components/Forum";
import AddQuestion from "./components/AddQuestion"; // Import AddQuestion component
import ChatbotPage from "./components/ChatbotPage"; // Import the new ChatbotPage component
import Profile from "./components/Profile"; // Import Profile component

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setUser(token);
  }, []);

  return (
    <Router>
      <div>
        {user ? (
          <Routes>
            <Route path="/" element={<Forum />} />
            <Route path="/add-question" element={<AddQuestion />} /> {/* Add route for AddQuestion */}
            <Route path="/chatbot" element={<ChatbotPage />} /> {/* Add route for ChatbotPage */}
            <Route path="/profile" element={<Profile />} /> {/* Add route for Profile */}
          </Routes>
        ) : (
          <Auth setUser={setUser} />
        )}
      </div>
    </Router>
  );
};

export default App;
