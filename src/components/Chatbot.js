import React, { useState } from "react";
import Message from "./Message";
import OptionButton from "./OptionButton";
import { fetchResources, fetchSubjects } from "../utils/api";
import AdminPanel from "./AdminPanel"; // Import the AdminPanel component
import axios from "axios"; // Import axios for API calls
import "../styles.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([{ text: "Select your year:", type: "bot" }]);
  const [options, setOptions] = useState([]);
  const [selectedData, setSelectedData] = useState({});
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const fetchYears = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/years");
      return response.data.map((year) => year.y_name);
    } catch (error) {
      console.error("Error fetching years:", error);
      return [];
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/branches");
      return response.data.map((branch) => branch.b_name);
    } catch (error) {
      console.error("Error fetching branches:", error);
      return [];
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/categories");
      return response.data.map((category) => category.c_name);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  };

  const handleOptionClick = async (option) => {
    const newMessages = [...messages, { text: option, type: "user" }];
    let newOptions = [];

    if (!selectedData.year) {
      setSelectedData({ ...selectedData, year: option });
      newMessages.push({ text: "Select your branch:", type: "bot" });
      newOptions = await fetchBranches();
    } else if (!selectedData.branch) {
      setSelectedData({ ...selectedData, branch: option });
      newMessages.push({ text: "Select your subject:", type: "bot" });
      newOptions = await fetchSubjects(selectedData.year, option);
    } else if (!selectedData.subject) {
      setSelectedData({ ...selectedData, subject: option });
      newMessages.push({ text: "Select category:", type: "bot" });
      newOptions = await fetchCategories();
    } else if (!selectedData.category) {
      const finalSelection = { ...selectedData, category: option };
      setSelectedData(finalSelection);
      newMessages.push({ text: "Fetching resource...", type: "bot" });

      const resource = await fetchResources(finalSelection);
      newMessages.push({ text: resource ? "Here is your document:" : "No resource found.", type: "bot", file: resource });
      newOptions = [];
    }

    setMessages(newMessages);
    setOptions(newOptions);
  };

  const handleReset = async () => {
    setMessages([{ text: "Select your year:", type: "bot" }]);
    setOptions(await fetchYears());
    setSelectedData({});
  };

  React.useEffect(() => {
    const initializeChatbot = async () => {
      const years = await fetchYears();
      setOptions(years);
    };
    initializeChatbot();
  }, []);

  return (
    <div className="chatbot-container">
      <div className="chatbox">
        {messages.map((msg, index) => (
          <Message key={index} text={msg.text} type={msg.type} file={msg.file} />
        ))}
      </div>
      <div className="options-container">
        {options.map((option, index) => (
          <OptionButton key={index} text={option} onClick={() => handleOptionClick(option)} />
        ))}
      </div>
      <div className="chatbot-buttons">
        <button
          className="reset-button"
          onClick={handleReset}
        >
          Reset
        </button>
        <button
          className="admin-panel-button"
          onClick={() => setShowAdminPanel(true)}
        >
          Open Admin Panel
        </button>
      </div>
      {showAdminPanel && (
        <div className="admin-panel-modal">
          <div className="admin-panel-content">
            <button
              className="close-button"
              onClick={() => setShowAdminPanel(false)}
            >
              X
            </button>
            <AdminPanel />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
