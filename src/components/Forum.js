import React, { useState } from "react";
import Chatbot from "./Chatbot";

const categories = ["GATE", "GRE", "CAT", "CP", "Development", "AI", "ML"];
const dummyQuestions = {
  GATE: [
    {
      id: 1,
      question: "What is the best strategy for GATE preparation?",
      answers: [
        "One of the most effective strategies for GATE preparation is to focus on solving the past 10 years' question papers. This helps in understanding the exam pattern, the types of questions asked, and the weightage given to different topics. By practicing these papers, you can identify frequently tested concepts and gain insights into how questions are framed. Additionally, solving previous years papers under timed conditions improves time management skills, allowing you to gauge how much time to allocate for each section. Analyzing mistakes from these papers also helps in recognizing weak areas, enabling focused revision. Furthermore, many questions in GATE are conceptually similar to previous ones, so this practice increases the chances of encountering familiar problems on the actual exam day.",
        "Revise key concepts daily and practice time management.",
        "Attempt full-length mock tests regularly and analyze mistakes.",
      ],
    },
    {
      id: 2,
      question: "Which books are best for GATE Computer Science?",
      answers: [
        "For Algorithms: Introduction to Algorithms by Cormen.",
        "For Operating Systems: Galvin's Operating System Concepts.",
        "For Theory of Computation: Michael Sipser's Introduction to the Theory of Computation.",
      ],
    },
  ],
  GRE: [
    {
      id: 3,
      question: "How to improve GRE vocabulary?",
      answers: [
        "Read a variety of sources like newspapers and academic articles.",
        "Use flashcards (Anki, Quizlet) to reinforce new words.",
        "Practice contextual usage by forming your own sentences.",
      ],
    },
    {
      id: 4,
      question: "What are the best resources for GRE Quant preparation?",
      answers: [
        "Official GRE Guide by ETS provides real exam questions and strategies.",
        "Manhattan 5 lb book has a huge collection of practice questions.",
        "Khan Academy offers great free video explanations for GRE topics.",
      ],
    },
  ],
  CAT: [
    {
      id: 5,
      question: "How to crack CAT with 99 percentile?",
      answers: [
        "Maintain a strict study schedule with dedicated hours for each section.",
        "Analyze mock tests extensively to identify weak areas and improve them.",
        "Develop speed and accuracy by solving questions under timed conditions.",
      ],
    },
    {
      id: 6,
      question: "What is the best approach for CAT Reading Comprehension?",
      answers: [
        "Read editorials and books regularly to build reading speed and comprehension.",
        "Practice with different passage types: philosophy, science, history, and fiction.",
        "Avoid fixating on difficult words; focus on understanding the main idea.",
      ],
    },
  ],
  CP: [
    {
      id: 7,
      question: "How to get started with Competitive Programming?",
      answers: [
        "Start with basic problems on platforms like Codeforces, Leetcode, and Atcoder.",
        "Understand fundamental concepts: sorting, recursion, and binary search.",
        "Progress to advanced topics like dynamic programming and graph algorithms.",
      ],
    },
    {
      id: 8,
      question: "What are some must-know algorithms for CP?",
      answers: [
        "Graph algorithms: BFS, DFS, Dijkstra’s shortest path.",
        "Dynamic Programming: Knapsack, LCS, and DP on Trees.",
        "Greedy techniques, segment trees, and bitwise operations.",
      ],
    },
  ],
  Development: [
    {
      id: 9,
      question: "What are the best full-stack development frameworks?",
      answers: [
        "For JavaScript: React.js for frontend and Node.js with Express for backend.",
        "For Python: Django or Flask for backend and React or Vue for frontend.",
        "For Java: Spring Boot is a powerful backend framework.",
      ],
    },
    {
      id: 10,
      question: "How to improve problem-solving in web development?",
      answers: [
        "Build small projects like a To-Do app or blog to practice fundamentals.",
        "Learn debugging techniques and use browser DevTools efficiently.",
        "Follow best coding practices: clean code, modular structure, and documentation.",
      ],
    },
  ],
  AI: [
    {
      id: 11,
      question: "What is the best way to learn Machine Learning?",
      answers: [
        "Start with Andrew Ng’s Machine Learning course on Coursera.",
        "Practice with datasets using Python libraries like Pandas and Scikit-Learn.",
        "Work on small projects like spam detection or stock price prediction.",
      ],
    },
    {
      id: 12,
      question: "What are the key differences between AI, ML, and Deep Learning?",
      answers: [
        "AI is the broader concept of machines simulating human intelligence.",
        "ML is a subset of AI where machines learn from data and improve over time.",
        "Deep Learning is a subset of ML that uses neural networks to analyze data deeply.",
      ],
    },
  ],
  ML: [
    {
      id: 13,
      question: "What is overfitting in Machine Learning?",
      answers: [
        "Overfitting occurs when a model learns noise instead of patterns in the data.",
        "It performs well on training data but poorly on unseen data.",
        "Regularization techniques like L1/L2 penalties help prevent overfitting.",
      ],
    },
    {
      id: 14,
      question: "What are the best Python libraries for Machine Learning?",
      answers: [
        "Scikit-Learn: Best for classical ML algorithms like regression and classification.",
        "TensorFlow & PyTorch: Powerful for Deep Learning and Neural Networks.",
        "Pandas & NumPy: Essential for data manipulation and numerical computations.",
      ],
    },
  ],
};

export default function Forum() {
    const [selectedCategory, setSelectedCategory] = useState("GATE");
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [showChatbot, setShowChatbot] = useState(false);
  
    // Function to handle clicks outside question/answer box
    const handleClickOutside = (event) => {
      if (!event.target.closest(".question") && !event.target.closest(".answers")) {
        setSelectedQuestion(null);
      }
    };
  
    return (
      <div className="forum-container" onClick={handleClickOutside}>
        <nav className="navbar">
          <h1>Discussion Forum</h1>
          <div>
            <button>About</button>
            <button>My Profile</button>
          </div>
        </nav>
  
        {/* Category Tabs */}
        <div className="tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={selectedCategory === cat ? "active" : ""}
              onClick={(e) => {
                e.stopPropagation(); // Prevent this click from closing the question
                setSelectedCategory(cat);
                setSelectedQuestion(null);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
  
        {/* Questions List */}
        <div className="questions">
          {dummyQuestions[selectedCategory]?.map((q) => (
            <div
              key={q.id}
              className={`question ${selectedQuestion?.id === q.id ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent closing when clicking a question
                setSelectedQuestion(selectedQuestion?.id === q.id ? null : q);
              }}
            >
              <strong>{q.question}</strong>
              <p className="preview">{q.answers.slice(0, 2).join(", ")}...</p>
            </div>
          ))}
        </div>
  
        {/* Answers Section */}
        {selectedQuestion && (
          <div className="answers" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedQuestion.question}</h3>
            {selectedQuestion.answers.map((ans, idx) => (
              <p key={idx} className="answer-box">{ans}</p>
            ))}
          </div>
        )}
  
        {/* Buttons */}
        <button className="add-question">Add Question</button>
        <button className="chatbot-button" onClick={(e) => {
          e.stopPropagation();
          setShowChatbot(true);
        }}>
          Resource Chatbot
        </button>
  
        {showChatbot && <Chatbot />}
      </div>
    );
  }