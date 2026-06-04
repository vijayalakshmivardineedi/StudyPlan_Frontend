import "../style.css";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("student");
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="logo-container">
        <img
          src="../../../public/logo.png"
          alt="Logo"
          className="navbar-logo"
        />
      </div>

      <nav className="nav-links">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Profile
        </NavLink>
        {/* <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Home
        </NavLink> */}
        <NavLink
          to="/text"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Create Journey
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
         History
        </NavLink>
      </nav>

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};
export default Navbar;
