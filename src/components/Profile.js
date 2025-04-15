import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles.css";

export default function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState("");
  const [activeCategories, setActiveCategories] = useState([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [selectedQuestionDetails, setSelectedQuestionDetails] = useState(null);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerTitle, setAnswerTitle] = useState("");
  const [answerDescription, setAnswerDescription] = useState("");
  const [answerFile, setAnswerFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated");
        return;
      }

      try {
        const [userResponse, categoriesResponse, unansweredResponse] = await Promise.all([
          axios.get("http://localhost:3001/api/v1/user", {
            headers: { "x-access-token": token },
          }),
          axios.get("http://localhost:3000/api/v1/user/active-categories", {
            headers: { "x-access-token": token },
          }),
          axios.get("http://localhost:3000/api/v1/user/unanswered-from-active-categories", {
            headers: { "x-access-token": token },
          }),
        ]);

        if (userResponse.data?.success) {
          setUserInfo(userResponse.data.data);
        } else {
          setError("Failed to fetch user information");
        }

        setActiveCategories(categoriesResponse.data?.data || []);
        setUnansweredQuestions(unansweredResponse.data?.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while fetching user information");
      }
    };

    fetchUserInfo();
  }, []);

  const navigateToQuestion = (questionId) => {
    window.location.href = `/forum?questionId=${questionId}`;
  };

  const fetchQuestionDetails = async (questionId) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/v1/questions/${questionId}`);
      if (res.data?.success) {
        setSelectedQuestionDetails(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching question details:", err);
    }
  };

  const handleVote = async (voteType) => {
    const token = localStorage.getItem("token");
    if (!token || !selectedQuestionDetails?.question?.id) return;

    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/questions/${selectedQuestionDetails.question.id}/vote`,
        { voteType },
        { headers: { "x-access-token": token } }
      );
      if (res.data?.data) {
        setSelectedQuestionDetails(res.data.data);
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
        setSelectedQuestionDetails((prevDetails) => ({
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

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("User not authenticated");
      setTimeout(() => setMessage(""), 4000);
      return;
    }
    if (!selectedQuestionDetails?.question?.id) return;

    const formData = new FormData();
    formData.append("questionId", selectedQuestionDetails.question.id);
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
      fetchQuestionDetails(selectedQuestionDetails.question.id); // Refresh
    } catch (err) {
      setMessage("Failed to submit answer");
      setTimeout(() => setMessage(""), 4000);
    }
  };

  if (error) {
    return <div className="profile-container"><p className="error-message">{error}</p></div>;
  }

  if (!userInfo) {
    return <div className="profile-container"><p>Loading...</p></div>;
  }

  return (
    <div className="profile-container">
      <button className="back-button" onClick={() => window.history.back()}>
        ← Back
      </button>
      {!selectedQuestionDetails ? (
        <div className="profile-card" style={{ maxWidth: "1000px", width: "95%" }}>
          <div className="profile-header">
            <h2>Welcome, {userInfo.username}!</h2>
            <p className="profile-subtitle">Here's a quick overview of your profile.</p>
          </div>
          <div className="profile-content">
            <div className="profile-info">
              <h3>Personal Information</h3>
              <p><span className="field-label">Email:</span> <span className="field-value">{userInfo.email}</span></p>
              <p><span className="field-label">User ID:</span> <span className="field-value">{userInfo.id}</span></p>
              <p><span className="field-label">Level ID:</span> <span className="field-value">{userInfo.level_id}</span></p>
              <p><span className="field-label">Last Login:</span> <span className="field-value">{new Date(userInfo.last_login_at).toLocaleString()}</span></p>
              <p><span className="field-label">About:</span> <span className="field-value">{userInfo.about || "N/A"}</span></p>
            </div>
            <div className="profile-categories">
              <h3>Active Categories</h3>
              <div className="categories-container">
                {activeCategories.length > 0 ? (
                  activeCategories.map((cat, index) => (
                    <span key={index} className="category-badge">
                      {cat.name.replace(/_/g, " ")}
                    </span>
                  ))
                ) : (
                  <p>No active categories</p>
                )}
              </div>
            </div>
            <div className="profile-categories">
              <h3>Unanswered Questions in Active Categories</h3>
              <div className="questions-container">
                {unansweredQuestions.length > 0 ? (
                  unansweredQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="question-preview"
                      onClick={() => fetchQuestionDetails(q.id)}
                    >
                      <h4>{q.title}</h4>
                      <p className="preview">{q.description.slice(0, 50)}...</p>
                    </div>
                  ))
                ) : (
                  <p>No unanswered questions available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="answers">
          <button className="back-button" onClick={() => setSelectedQuestionDetails(null)}>
            ← Back to Questions
          </button>
          <h3>{selectedQuestionDetails.question.title}</h3>
          <div className="question-details">
            <div className="question-vote-box">
              <button className="vote-button upvote" onClick={() => handleVote("up")}>
                ▲
              </button>
              <span>{selectedQuestionDetails.question.vote_count}</span>
              <button className="vote-button downvote" onClick={() => handleVote("down")}>
                ▼
              </button>
            </div>
            <div className="question-description">
              <p>{selectedQuestionDetails.question.description}</p>
            </div>
          </div>
          <div className="image-preview">
            {selectedQuestionDetails.associatedFiles?.map((file) => (
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
            {selectedQuestionDetails.answers.length > 0 ? (
              selectedQuestionDetails.answers.map((ans, idx) => (
                <div key={idx} className="single-answer">
                  <div className="answer-details">
                    <div className="answer-vote-box">
                      <button className="vote-button upvote" onClick={() => handleAnswerVote(ans.answerData.id, "up")}>
                        ▲
                      </button>
                      <span>{ans.answerData.vote_count}</span>
                      <button className="vote-button downvote" onClick={() => handleAnswerVote(ans.answerData.id, "down")}>
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
    </div>
  );
}
