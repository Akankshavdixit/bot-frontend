import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Auth from "./components/Auth";
import Forum from "./components/Forum";
import AddQuestion from "./components/AddQuestion"; // Import AddQuestion component

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
          </Routes>
        ) : (
          <Auth setUser={setUser} />
        )}
      </div>
    </Router>
  );
};

export default App;
