import React, { useState } from "react";
import Message from "./Message";
import OptionButton from "./OptionButton";
import { fetchResources, fetchSubjects } from "../utils/api";

const Chatbot = () => {
  const [messages, setMessages] = useState([{ text: "Select your year:", type: "bot" }]);
  const [options, setOptions] = useState(["First year", "Second year", "Third year", "Fourth year"]);
  const [selectedData, setSelectedData] = useState({});

  const handleOptionClick = async (option) => {
    const newMessages = [...messages, { text: option, type: "user" }];
    let newOptions = [];

    if (!selectedData.year) {
      setSelectedData({ ...selectedData, year: option });
      newOptions = ["Computer Engineering", "Information Technology", "Electronics and Telecommunication Engineering"];
      newMessages.push({ text: "Select your branch:", type: "bot" });
    } else if (!selectedData.branch) {
      setSelectedData({ ...selectedData, branch: option });
      newOptions = await fetchSubjects(selectedData.year, option);
      newMessages.push({ text: "Select your subject:", type: "bot" });
    } else if (!selectedData.subject) {
      setSelectedData({ ...selectedData, subject: option });
      newOptions = ["Textbook", "Decode", "Lab manual"];
      newMessages.push({ text: "Select category:", type: "bot" });
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

  return (
    <div className="chat-container">
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
    </div>
  );
};

export default Chatbot;
