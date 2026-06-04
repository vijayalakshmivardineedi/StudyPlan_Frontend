import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";
import { API_BASE_URL } from "../connections";

const Text = () => {
  const navigate = useNavigate();
  const [textInput, setTextInput] = useState("");
  const [studentPersonalize, setStudentPersonalize] = useState(false);
  const [loading, setLoading] = useState(false);
  const [journey, setJourney] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setJourney(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to create a journey");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/ai/create-journey`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: textInput,
            studentPersonalize: studentPersonalize,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setJourney(data.data.journey);
        setTextInput("");
        // Navigate to journey detail page
        const roadmapId = data.data.id || data.data.journey._id;
        navigate(`/journey/${roadmapId}`);
      } else {
        // Show user-friendly error message
        let errorMessage = data.message || "Failed to create journey";

        if (data.retryable) {
          errorMessage +=
            " This is a temporary issue. Please try again in a moment.";
        }

        setError(errorMessage);
      }
    } catch (err) {
      console.error("Error creating journey:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-page">
      <div className="text-container">
        <h1>Create Your Learning Journey</h1>
        <p className="subtitle">
          Describe what you want to learn, and AI will create a personalized
          learning path for you.
        </p>

        <form onSubmit={handleSubmit} className="journey-form">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Example: I want to learn web development with React and Node.js in 3 months"
            className="journey-textarea"
            rows="6"
            required
          />

          <div className="personalize-checkbox">
            <label>
              <input
                type="checkbox"
                checked={studentPersonalize}
                onChange={(e) => setStudentPersonalize(e.target.checked)}
              />
              <span>Student Personalize</span>
            </label>
          </div>

          <button
            type="submit"
            className="orange-button"
            disabled={loading || !textInput.trim()}
          >
            {loading ? "Creating Journey..." : "Create Journey"}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {journey && (
          <div className="journey-result">
            <div className="journey-header">
              <h2>{journey.title || "Your Learning Journey"}</h2>
              {journey.isPersonalized && (
                <span className="personalized-badge">Personalized</span>
              )}
            </div>

            {journey.description && (
              <p className="journey-description">{journey.description}</p>
            )}

            {journey.totalDuration && (
              <div className="duration-badge">
                <strong>Duration:</strong> {journey.totalDuration}
              </div>
            )}

            {journey.learningPath && journey.learningPath.length > 0 && (
              <div className="learning-path">
                <h3>Learning Path</h3>
                {journey.learningPath.map((phase, index) => (
                  <div key={index} className="phase-card">
                    <h4>{phase.milestone}</h4>
                    {phase.description && <p>{phase.description}</p>}

                    {phase.topics && phase.topics.length > 0 && (
                      <div className="topics-list">
                        {phase.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="topic-item">
                            <div className="topic-header">
                              <strong>{topic.topic}</strong>
                              {topic.duration && (
                                <span className="duration-tag">
                                  {topic.duration}
                                </span>
                              )}
                            </div>
                            {topic.description && (
                              <p className="topic-description">
                                {topic.description}
                              </p>
                            )}
                            {topic.resources && topic.resources.length > 0 && (
                              <div className="resources">
                                <strong>Resources:</strong>
                                <ul>
                                  {topic.resources.map((resource, resIndex) => (
                                    <li key={resIndex}>{resource}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {journey.topics && journey.topics.length > 0 && (
              <div className="learning-path">
                <h3>Learning Roadmap</h3>
                {journey.topics
                  .sort((a, b) => a.order - b.order)
                  .map((topic, index) => (
                    <div key={index} className="topic-card">
                      <div className="topic-header-main">
                        <div className="topic-number">{topic.order}</div>
                        <div className="topic-content">
                          <h4>{topic.topicName}</h4>
                          {topic.description && (
                            <p className="topic-desc">{topic.description}</p>
                          )}
                          {topic.duration && (
                            <span className="duration-tag">
                              {topic.duration}
                            </span>
                          )}
                        </div>
                      </div>

                      {topic.subtopics && topic.subtopics.length > 0 && (
                        <div className="subtopics-container">
                          <h5>Subtopics:</h5>
                          {topic.subtopics
                            .sort((a, b) => a.order - b.order)
                            .map((subtopic, subIndex) => (
                              <div key={subIndex} className="subtopic-item">
                                <div className="subtopic-header">
                                  <span className="subtopic-number">
                                    {topic.order}.{subtopic.order}
                                  </span>
                                  <strong>{subtopic.subtopicName}</strong>
                                  {subtopic.duration && (
                                    <span className="duration-tag-small">
                                      {subtopic.duration}
                                    </span>
                                  )}
                                </div>
                                {subtopic.description && (
                                  <p className="subtopic-description">
                                    {subtopic.description}
                                  </p>
                                )}
                                {subtopic.resources &&
                                  subtopic.resources.length > 0 && (
                                    <div className="resources">
                                      <strong>Resources:</strong>
                                      <ul>
                                        {subtopic.resources.map(
                                          (resource, resIndex) => (
                                            <li key={resIndex}>{resource}</li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                  )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {journey.schedule && (
              <div className="schedule-section">
                <h3>Study Schedule</h3>
                {journey.schedule.daily && (
                  <p>
                    <strong>Daily:</strong> {journey.schedule.daily}
                  </p>
                )}
                {journey.schedule.weekly && (
                  <p>
                    <strong>Weekly:</strong> {journey.schedule.weekly}
                  </p>
                )}
              </div>
            )}

            {journey.tips && journey.tips.length > 0 && (
              <div className="tips-section">
                <h3>Tips for Success</h3>
                <ul>
                  {journey.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {journey.motivation && (
              <div className="motivation-section">
                <p className="motivation-text">{journey.motivation}</p>
              </div>
            )}

            {journey.rawResponse && !journey.learningPath && (
              <div className="raw-response">
                <pre>{journey.rawResponse}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Text;
