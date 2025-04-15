import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles.css";

const AdminPanel = () => {
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    branch: "",
    category: "",
    subject: "",
    file: null,
  });
  const [years, setYears] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const yearsResponse = await axios.get("http://localhost:5000/api/years");
        const branchesResponse = await axios.get("http://localhost:5000/api/branches");
        const categoriesResponse = await axios.get("http://localhost:5000/api/categories");
        setYears(yearsResponse.data);
        setBranches(branchesResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, []);

  const fetchSubjects = async () => {
    const { year, branch } = formData;
    if (!year || !branch) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/subjects?year=${encodeURIComponent(year)}&branch=${encodeURIComponent(branch)}`
      );
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Fetch subjects when year, branch, and category are filled
    if (name === "year" || name === "branch" || name === "category") {
      setFormData((prev) => {
        const updatedFormData = { ...prev, [name]: value };
        if (updatedFormData.year && updatedFormData.branch && updatedFormData.category) {
          fetchSubjects();
        } else {
          setSubjects([]); // Clear subjects if any of the fields are incomplete
        }
        return updatedFormData;
      });
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, year, branch, category, subject, file } = formData;

    if (!name || !year || !branch || !category || !subject || !file) {
      setMessage("All fields are required.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", name);
    formDataToSend.append("year", year);
    formDataToSend.append("branch", branch);
    formDataToSend.append("category", category);
    formDataToSend.append("subject", subject);
    formDataToSend.append("resource", file); // Updated field name to 'resource'

    try {
      const response = await axios.post("http://localhost:5000/api/upload", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message || "Resource uploaded successfully.");
    } catch (error) {
      console.error("Error uploading resource:", error);
      setMessage("Failed to upload resource.");
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel - Upload Resource</h2>
      <form className="upload-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Resource Name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <select name="year" value={formData.year} onChange={handleInputChange} required>
          <option value="">Select Year</option>
          {years.map((year) => (
            <option key={year.y_id} value={year.y_name}>
              {year.y_name}
            </option>
          ))}
        </select>
        <select name="branch" value={formData.branch} onChange={handleInputChange} required>
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch.b_id} value={branch.b_name}>
              {branch.b_name}
            </option>
          ))}
        </select>
        <select name="category" value={formData.category} onChange={handleInputChange} required>
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.c_id} value={category.c_name}>
              {category.c_name}
            </option>
          ))}
        </select>
        <select
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          disabled={!formData.year || !formData.branch || !formData.category} // Disable until prerequisites are filled
          required
        >
          <option value="">Select Subject</option>
          {subjects.map((subject) => (
            <option key={subject.s_id} value={subject.s_name}>
              {subject.s_name}
            </option>
          ))}
        </select>
        <input type="file" onChange={handleFileChange} required />
        <button type="submit">Upload Resource</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AdminPanel;
