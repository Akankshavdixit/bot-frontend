import React, { useState, useEffect } from "react";
import { FaPlus, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Chatbot from "./Chatbot";
import axios from "axios";
import "../styles.css";

export default function Forum() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/v1/categories")
      .then((res) => {
        const categoryArray = res.data?.data;
        if (Array.isArray(categoryArray)) {
          setCategories(categoryArray);
          if (categoryArray.length > 0) {
            setSelectedCategory(categoryArray[0].name);
          }
        } else {
          console.error("Unexpected categories response:", res.data);
          setCategories([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      axios
        .get(`http://localhost:3000/api/v1/questions/by-category/${selectedCategory}`)
        .then((res) => {
          const questionArray = res.data?.data;
          if (Array.isArray(questionArray)) {
            setQuestions(questionArray);
          } else {
            console.error("Unexpected questions response:", res.data);
            setQuestions([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching questions:", err);
          setQuestions([]);
        });
    }
  }, [selectedCategory]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const handleClickOutside = (event) => {
    if (!event.target.closest(".question") && !event.target.closest(".answers")) {
      setSelectedQuestion(null);
    }
  };

  const handleAddQuestionClick = () => {
    navigate("/add-question");
  };

  return (
    <div className="forum-container" onClick={handleClickOutside}>
      <nav className="navbar">
        <h1>Discussion Forum</h1>
        <div>
          <button>About</button>
          <button>My Profile</button>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Scrollable Tabs */}
      <div className="tabs-wrapper">
        <div className="tabs-scroll">
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((cat, index) => (
              <button
                key={index}
                className={selectedCategory === cat.name ? "active" : ""}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory(cat.name);
                  setSelectedQuestion(null);
                }}
              >
                {cat.name.replace(/_/g, " ")}
              </button>
            ))
          ) : (
            <p>Loading categories...</p>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="questions">
        {questions.length > 0 ? (
          questions.map((q) => (
            <div
              key={q.id}
              className={`question ${selectedQuestion?.id === q.id ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedQuestion(selectedQuestion?.id === q.id ? null : q);
              }}
            >
              <strong>{q.title}</strong>
              <p className="preview">{q.description?.slice(0, 50)}...</p>
            </div>
          ))
        ) : (
          <p>No questions available.</p>
        )}
      </div>

      {/* Answers Section */}
      {selectedQuestion && (
        <div className="answers" onClick={(e) => e.stopPropagation()}>
          <h3>{selectedQuestion.title}</h3>
          <p className="answer-box">{selectedQuestion.description}</p>
        </div>
      )}

      {/* Floating Buttons */}
      <button className="floating-button add-question" onClick={handleAddQuestionClick}>
        <FaPlus />
      </button>

      <button
        className="floating-button chatbot-button"
        onClick={(e) => {
          e.stopPropagation();
          setShowChatbot(!showChatbot);
        }}
      >
        <FaRobot />
      </button>

      {showChatbot && <Chatbot />}
    </div>
  );
}
