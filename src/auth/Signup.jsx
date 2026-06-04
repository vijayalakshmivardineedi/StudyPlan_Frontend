import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../connections";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Registration Successful");
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("student", JSON.stringify(data.data.student));
        setLoading(false);
        navigate("/home");
      } else {
        alert(data.message);
        setLoading(false);
      }
    } catch (error) {
      alert("Registration Failed");
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="left-section">
        {/* You can add a logo, image, or welcome text here */}
        <div style={{ color: "white", fontSize: "3rem", fontWeight: "bold" }}>
          Welcome Back
        </div>
      </div>
      <div className="right-section">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
          />

          <button className="orange-button" type="submit">
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          <div>
            <a href="/login">Login</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
