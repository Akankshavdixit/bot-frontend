import React from "react";
import Chatbot from "./Chatbot";
import { useNavigate } from "react-router-dom";
import "../styles.css";

export default function ChatbotPage() {
  const navigate = useNavigate();

  return (
    <div className="chatbot-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <Chatbot />
    </div>
  );
}
