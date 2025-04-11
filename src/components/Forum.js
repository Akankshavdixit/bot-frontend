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
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [questionDetails, setQuestionDetails] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerTitle, setAnswerTitle] = useState("");
  const [answerDescription, setAnswerDescription] = useState("");
  const [answerFile, setAnswerFile] = useState(null);
  const [message, setMessage] = useState("");
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
          setCategories([]);
        }
      })
      .catch(() => setCategories([]));
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
            setQuestions([]);
          }
        })
        .catch(() => setQuestions([]));
    }
  }, [selectedCategory]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const handleClickOutside = (event) => {
    if (
      !event.target.closest(".question") &&
      !event.target.closest(".answers")
    ) {
      setSelectedQuestionId(null);
      setQuestionDetails(null);
      setShowAnswerForm(false);
    }
  };

  const handleAddQuestionClick = () => {
    navigate("/add-question");
  };

  const handleQuestionClick = async (questionId) => {
    setSelectedQuestionId(questionId);
    try {
      const res = await axios.get(`http://localhost:3000/api/v1/questions/${questionId}`);
      if (res.data?.success) {
        setQuestionDetails(res.data.data);
        setShowAnswerForm(false);
      }
    } catch (err) {
      console.error("Error fetching question details:", err);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("User not authenticated");
      setTimeout(() => setMessage(""), 4000);
      return;
    }
    if (!questionDetails?.question?.id) return;

    const formData = new FormData();
    formData.append("questionId", questionDetails.question.id);
    formData.append("title", answerTitle);
    formData.append("description", answerDescription);
    if (answerFile) {
      formData.append("quesFiles", answerFile);
    }

    try {
      await axios.post("http://localhost:3000/api/v1/answers", formData, {
        headers: {
          "x-access-token": token,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Question answered successfully");
      setTimeout(() => setMessage(""), 4000);
      setAnswerTitle("");
      setAnswerDescription("");
      setAnswerFile(null);
      setShowAnswerForm(false);
      handleQuestionClick(questionDetails.question.id); // Refresh
    } catch (err) {
      setMessage("Failed to submit answer");
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleVote = async (voteType) => {
    const token = localStorage.getItem("token");
    if (!token || !questionDetails?.question?.id) return;

    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/questions/${questionDetails.question.id}/vote`,
        { voteType },
        { headers: { "x-access-token": token } }
      );
      if (res.data?.data) {
        setQuestionDetails(res.data.data);
      }
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  return (
    <div className="forum-container" onClick={handleClickOutside}>
      <nav className="navbar">
        <h1>Discussion Forum</h1>
        <div>
          <button>About</button>
          <button>My Profile</button>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {message && <div className="message-banner">{message}</div>}

      {/* Tabs */}
      {!questionDetails && (
        <div className="tabs-wrapper">
          <div className="tabs-scroll">
            {categories.map((cat, index) => (
              <button
                key={index}
                className={selectedCategory === cat.name ? "active" : ""}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory(cat.name);
                  setSelectedQuestionId(null);
                  setQuestionDetails(null);
                }}
              >
                {cat.name.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Questions List */}
      {!questionDetails && (
        <div className="questions">
          {questions.length > 0 ? (
            questions.map((q) => (
              <div
                key={q.id}
                className={`question ${selectedQuestionId === q.id ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuestionClick(q.id);
                }}
              >
                <div className="question-card">
                <h3>{q.title}</h3>
                <p className="text-muted">{q.description.slice(0, 40)}...</p>

                {/* Vote display to the right */}
                <div className="vote-display">
                  <span role="img" aria-label="thumb">👍</span>
                  <span>{q.vote_count}</span>
                </div>
              </div>

              </div>
            ))
          ) : (
            <p>No questions available.</p>
          )}
        </div>
      )}

      {/* Full-Screen Detailed Question View */}
      {questionDetails && (
        <div className="answers" onClick={(e) => e.stopPropagation()}>
          <button className="back-button" onClick={() => setQuestionDetails(null)}>
            ← Back to Questions
          </button>

          <h3>{questionDetails.question.title}</h3>
          <p className="answer-box">{questionDetails.question.description}</p>

          {/* Voting */}
          <div className="vote-box">
            <button className="vote-button upvote" onClick={() => handleVote('up')}>
              ▲
            </button>
            <span>{questionDetails.question.vote_count}</span>
            <button className="vote-button downvote" onClick={() => handleVote('down')}>
              ▼
            </button>
          </div>

          {/* Question Images */}
          <div className="image-preview">
            {questionDetails.associatedFiles?.map((file) => (
              <img
                key={file.id}
                src={file.url}
                alt="question-img"
                className="thumbnail"
                onClick={() => window.open(file.url, "_blank")}
              />
            ))}
          </div>

          {/* Answer Button */}
          <button
            className="answer-btn"
            onClick={() => setShowAnswerForm(!showAnswerForm)}
          >
            {showAnswerForm ? "Cancel" : "Answer"}
          </button>

          {/* Answer Form */}
          {showAnswerForm && (
            <form className="answer-form" onSubmit={handleAnswerSubmit}>
              <input
                type="text"
                placeholder="Answer Title"
                value={answerTitle}
                onChange={(e) => setAnswerTitle(e.target.value)}
                required
              />
              <textarea
                rows="4"
                placeholder="Answer Description"
                value={answerDescription}
                onChange={(e) => setAnswerDescription(e.target.value)}
                required
              />
              <input
                type="file"
                onChange={(e) => setAnswerFile(e.target.files[0])}
              />
              <button type="submit">Submit Answer</button>
            </form>
          )}

          {/* Answers List */}
          <div className="all-answers">
            {questionDetails.answers.length > 0 ? (
              questionDetails.answers.map((ans, idx) => (
                <div key={idx} className="single-answer">
                  <h4>{ans.answerData.title}</h4>
                  <p>{ans.answerData.description}</p>
                  <div className="image-preview">
                    {ans.answerFiles?.map((img) => (
                      <img
                        key={img.id}
                        src={img.url}
                        alt="answer-img"
                        className="thumbnail"
                        onClick={() => window.open(img.url, "_blank")}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p>Be the first one to answer!</p>
            )}
          </div>
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
