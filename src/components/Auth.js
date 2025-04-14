import React, { useState } from "react";
import "../styles.css";

const Auth = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", username: "", about: "" });

  const toggleAuth = () => {
    setIsLogin(!isLogin);
    setFormData({ email: "", password: "", username: "", about: "" }); // Reset form on toggle
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin
      ? "http://localhost:3001/api/v1/signin"
      : "http://localhost:3001/api/v1/signup";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        console.log(data.data);
        localStorage.setItem("token", data.data);
        setUser(data.data);
        console.log(data);
      } else {
        alert("Authentication failed: " + (data.error?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <textarea
              name="about"
              placeholder="Tell us about yourself"
              value={formData.about}
              onChange={handleChange}
              rows="4"
              className="auth-textarea"
            />
          </>
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
      </form>
      <p className="toggle-auth" onClick={toggleAuth}>
        {isLogin ? "New user? Sign up" : "Already have an account? Login"}
      </p>
    </div>
  );
};

export default Auth;
