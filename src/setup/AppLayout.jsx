import { Outlet } from "react-router-dom";
import Navbar from "../navbar/Navbar";

const AppLayout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="outlet-container">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
