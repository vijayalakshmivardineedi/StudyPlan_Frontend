import React from "react";
import "../style.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../connections";

const History = () => {
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = React.useState([]);
  const [togglingNotification, setTogglingNotification] = React.useState({});

  useEffect(() => {
    getAllRoadmaps();
  }, []);

  const getAllRoadmaps = async () => {
    try {
      const student = JSON.parse(localStorage.getItem("student"));
      const token = localStorage.getItem("token");
      const studentId = student?._id;

      if (!studentId || !token) {
        console.error("Missing student ID or token");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/journeys/all/${studentId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        console.log("Roadmaps:", data.data.roadmaps);
        setRoadmaps(data.data.roadmaps);
      } else {
        console.error("Failed to fetch roadmaps:", data.message);
      }
    } catch (error) {
      console.error("Error fetching roadmaps:", error);
    }
  };

  const toggleNotifications = async (roadmapId, currentStatus) => {
    setTogglingNotification((prev) => ({ ...prev, [roadmapId]: true }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/journeys/${roadmapId}/notifications`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            enabled: !currentStatus,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        // Update the local state
        setRoadmaps((prev) =>
          prev.map((roadmap) =>
            roadmap._id === roadmapId
              ? { ...roadmap, notificationsEnabled: !currentStatus }
              : roadmap,
          ),
        );
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      alert("Failed to toggle notifications");
    } finally {
      setTogglingNotification((prev) => ({ ...prev, [roadmapId]: false }));
    }
  };

  return (
    <div className="history-container">
      <h2>My Learning Journeys</h2>

      {roadmaps.length === 0 ? (
        <p>No roadmaps found.</p>
      ) : (
        roadmaps.map((roadmap) => {
          const totalTopics = roadmap.topics?.length || 0;

          const totalSubTopics =
            roadmap.topics?.reduce(
              (acc, topic) => acc + (topic.subtopics?.length || 0),
              0,
            ) || 0;

          return (
            <div key={roadmap._id} className="roadmap-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3>{roadmap.title}</h3>
                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <div className="notification-toggle-container">
                    <label className="notification-toggle">
                      <input
                        type="checkbox"
                        checked={roadmap.notificationsEnabled || false}
                        onChange={() =>
                          toggleNotifications(
                            roadmap._id,
                            roadmap.notificationsEnabled,
                          )
                        }
                        disabled={togglingNotification[roadmap._id]}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">
                        {roadmap.notificationsEnabled
                          ? "🔔 Notifications On"
                          : "🔕 Notifications Off"}
                      </span>
                    </label>
                  </div>
                  <div
                    style={{
                      cursor: "pointer",
                      color: "#1976d2",
                      fontWeight: "600",
                    }}
                    onClick={() => navigate(`/journey/${roadmap._id}`)}
                  >
                    Open →
                  </div>
                </div>
              </div>

              <p>
                <strong>Duration:</strong> {roadmap.totalDuration}
              </p>

              <p>
                <strong>Progress:</strong> {roadmap.progress}%
              </p>

              <p>
                <strong>Total Topics:</strong> {totalTopics}
              </p>

              <p>
                <strong>Total Subtopics:</strong> {totalSubTopics}
              </p>

              <p>
                <strong>Description:</strong> {roadmap.description}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default History;
