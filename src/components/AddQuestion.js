import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../styles.css";

const AddQuestion = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState("");
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");

  const [allCategories, setAllCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/v1/categories");
        if (response.status === 200) {
          setAllCategories(response.data.data); // expecting [{id, name}, ...]
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // 🧠 handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategorySelect = (categoryName) => {
    const current = categories.split(",").map((c) => c.trim()).filter(Boolean);
    if (!current.includes(categoryName)) {
      const updated = [...current, categoryName].join(",");
      setCategories(updated);
    }
  };

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
      categories.split(",").forEach((cat) => formData.append("categories", cat.trim()));
      for (let i = 0; i < files.length; i++) {
        formData.append("quesFiles", files[i]);
      }

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
      {message && (
        <p className={`message ${message.includes("successfully") ? "success" : "error"}`}>
          {message}
        </p>
      )}
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

        {/* Category field with dropdown */}
        <div className="dropdown-container" ref={dropdownRef}>
          <div className="dropdown-input" onClick={() => setShowDropdown(!showDropdown)}>
            <input
              type="text"
              value={categories}
              readOnly
              placeholder="Select categories"
              className="category-input"
            />
            <span className="dropdown-arrow">▼</span>
          </div>
          {showDropdown && (
            <ul className="dropdown-menu">
              {allCategories.map((cat) => (
                <li key={cat.id} onClick={() => handleCategorySelect(cat.name)}>
                  {cat.name}
                </li>
              ))}
            </ul>
          )}
        </div>

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
