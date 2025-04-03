import { useState } from "react";
import axios from "axios";
import "../styles.css";

const AddQuestion = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState("");
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("User not authenticated.");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      // Append categories correctly
      categories.split(",").forEach(cat => formData.append("categories", cat.trim()));

      for (let i = 0; i < files.length; i++) {
        formData.append("quesFiles", files[i]);
      }

      console.log([...formData]);

      const response = await axios.post(
        "http://localhost:3000/api/v1/questions",
        formData,
        {
          headers: {
            "x-access-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        setMessage("Question added successfully!");
        setTitle("");
        setDescription("");
        setCategories("");
        setFiles([]);
      }
    } catch (error) {
      setMessage("Failed to add question.");
      console.error("Error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="add-question-container">
      <h2>Add a Question</h2>
      {message && <p className={`message ${message.includes("successfully") ? "success" : "error"}`}>{message}</p>}
      <form onSubmit={handleSubmit} className="add-question-form">
        <input
          type="text"
          placeholder="Enter question title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Enter question description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
        <input
          type="text"
          placeholder="Enter categories (comma separated)"
          value={categories}
          onChange={(e) => setCategories(e.target.value)}
          required
        />
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
        <button type="submit">Submit Question</button>
      </form>
    </div>
  );
};

export default AddQuestion;
