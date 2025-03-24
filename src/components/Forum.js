import React, { useState } from "react";

import Chatbot from "./Chatbot";

const categories = ["GATE", "GRE", "CAT", "CP", "Development", "AI", "ML"];
const dummyQuestions = {
  GATE: [{ id: 1, question: "What is the best strategy for GATE preparation?", answers: ["Focus on past papers", "Revise daily"] }],
  GRE: [{ id: 2, question: "How to improve GRE vocabulary?", answers: ["Read daily", "Use flashcards"] }],
  // Add similar dummy data for other categories
};

export default function Forum() {
  const [selectedCategory, setSelectedCategory] = useState("GATE");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <div className="forum-container">
      <nav className="navbar">
        <h1>Discussion Forum</h1>
        <div>
          <button>About</button>
          <button>My Profile</button>
        </div>
      </nav>
      <div className="tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={selectedCategory === cat ? "active" : ""}
            onClick={() => { setSelectedCategory(cat); setSelectedQuestion(null); }}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="questions">
        {dummyQuestions[selectedCategory]?.map((q) => (
          <div key={q.id} className="question" onClick={() => setSelectedQuestion(q)}>
            {q.question}
          </div>
        ))}
      </div>
      {selectedQuestion && (
        <div className="answers">
          <h3>{selectedQuestion.question}</h3>
          {selectedQuestion.answers.map((ans, idx) => (
            <p key={idx}>{ans}</p>
          ))}
        </div>
      )}
      <button className="add-question">Add Question</button>
      <button className="chatbot-button" onClick={() => setShowChatbot(true)}>Resource Chatbot</button>
      {showChatbot && <Chatbot />}
    </div>
  );
}
