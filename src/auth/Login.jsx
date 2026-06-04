import { useNavigate } from "react-router-dom";
import "../style.css";
import { useState } from "react";
import { API_BASE_URL } from "../connections";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Login Successful");

        await localStorage.setItem("token", data.data.token);
        await localStorage.setItem(
          "student",
          JSON.stringify(data.data.student),
        );
        setLoading(false);
        navigate("/profile");
      } else {
        alert(data.message);
        setLoading(false);
      }
    } catch (error) {
      alert("Login Failed");
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
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <button className="orange-button" type="submit">
            {loading ? "Logging In..." : "Login"}
          </button>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "1rem",
              fontSize: "0.9rem",
            }}
          >
            <div>
              <a href="/signup">Sign Up</a>
            </div>
            <div>
              <a href="/forgot-password"> Forgot Password </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
