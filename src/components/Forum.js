import React, { useState, useEffect } from "react";
import { FaPlus, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Chatbot from "./Chatbot";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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
  const [trending, setTrending] = useState([]);
  const navigate = useNavigate();

  const COLORS = ["#255F38", "#1DCD9F", "#169976"];



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
    axios
      .get("http://localhost:3000/api/v1/trending")
      .then((res) => {
        const trendingData = res.data?.data || [];
        const totalUpvotes = trendingData.reduce((sum, cat) => sum + cat.totalUpvotes, 0);
        const withPercent = trendingData.map((cat) => ({
          ...cat,
          name: cat.name.replace(/_/g, " "),
          value: Math.round((cat.totalUpvotes / totalUpvotes) * 100),
        }));
        setTrending(withPercent);
      })
      .catch((err) => {
        console.error("TRENDING FETCH ERROR:", err);
        setTrending([]);
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

  const handleAnswerVote = async (answerId, voteType) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/answers/${answerId}/vote`,
        { voteType },
        { headers: { "x-access-token": token } }
      );
      if (res.data?.data) {
        // Update the specific answer's vote count with the server response
        setQuestionDetails((prevDetails) => ({
          ...prevDetails,
          answers: prevDetails.answers.map((ans) =>
            ans.answerData.id === answerId
              ? { ...ans, answerData: res.data.data }
              : ans
          ),
        }));
      }
    } catch (err) {
      console.error("Answer vote error:", err);
    }
  };

  return (
    <div className="forum-container" onClick={handleClickOutside}>
      <nav className="navbar">
        <h1>Discussion Forum</h1>
        <div>
          <button>About</button>
          <button onClick={() => navigate("/profile")}>My Profile</button>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {message && <div className="message-banner">{message}</div>}

      <div className="content-wrapper">
        {/* Left Section */}
        <div className="left-section">
          {/* Tabs */}
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

          {/* Questions List */}
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
        </div>

        {/* Right Section */}
        <div className="right-section">
          {trending.length > 0 && (
            <div className="trending-box">
              <h2>Most popular categories</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={trending}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    nameKey="name"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {trending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Question View */}
      {questionDetails && (
        <div className="answers" onClick={(e) => e.stopPropagation()}>
          <button className="back-button" onClick={() => setQuestionDetails(null)}>
            ← Back to Questions
          </button>

          <h3>{questionDetails.question.title}</h3>

          <div className="question-details">
            <div className="question-vote-box">
              <button
                className="vote-button upvote"
                onClick={() => handleVote("up")}
              >
                ▲
              </button>
              <span>{questionDetails.question.vote_count}</span>
              <button
                className="vote-button downvote"
                onClick={() => handleVote("down")}
              >
                ▼
              </button>
            </div>
            <div className="question-description">
              <p>{questionDetails.question.description}</p>
            </div>
          </div>

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

          <button className="answer-btn" onClick={() => setShowAnswerForm(!showAnswerForm)}>
            {showAnswerForm ? "Cancel" : "Answer"}
          </button>

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

          <div className="all-answers">
            {questionDetails.answers.length > 0 ? (
              questionDetails.answers.map((ans, idx) => (
                <div key={idx} className="single-answer">
                  <div className="answer-details">
                    <div className="answer-vote-box">
                      <button
                        className="vote-button upvote"
                        onClick={() => handleAnswerVote(ans.answerData.id, "up")}
                      >
                        ▲
                      </button>
                      <span>{ans.answerData.vote_count}</span>
                      <button
                        className="vote-button downvote"
                        onClick={() => handleAnswerVote(ans.answerData.id, "down")}
                      >
                        ▼
                      </button>
                    </div>
                    <div className="answer-description">
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
          navigate("/chatbot");
        }}
      >
        <FaRobot />
      </button>

      {showChatbot && <Chatbot />}
    </div>
  );
}
