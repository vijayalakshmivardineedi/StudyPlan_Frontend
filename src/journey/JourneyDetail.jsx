import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../style.css";
import { API_BASE_URL } from "../connections";

const JourneyDetail = () => {
  const { roadmapId } = useParams();
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [expandedSubtopic, setExpandedSubtopic] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState({});
  const [detailedContent, setDetailedContent] = useState({});
  const [generatingTest, setGeneratingTest] = useState({});
  const [testPaper, setTestPaper] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    fetchJourney();
  }, [roadmapId]);

  const fetchJourney = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/ai/journey/${roadmapId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setJourney(data.data.journey);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch journey");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicDetails = async (topicName, subtopicName = null) => {
    const key = subtopicName ? `${topicName}-${subtopicName}` : topicName;

    // Check if already loaded
    if (detailedContent[key]) {
      return;
    }

    setLoadingDetails((prev) => ({ ...prev, [key]: true }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/ai/generate-topic-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roadmapId: roadmapId,
            topicName: topicName,
            subtopicName: subtopicName,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setDetailedContent((prev) => ({
          ...prev,
          [key]: data.data.detailedContent,
        }));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch detailed content");
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [key]: false }));
    }
  };

  const toggleTopic = (topicName, index) => {
    if (expandedTopic === topicName) {
      setExpandedTopic(null);
    } else {
      setExpandedTopic(topicName);
      fetchTopicDetails(topicName);
    }
  };

  const toggleSubtopic = (topicName, subtopicName) => {
    const key = `${topicName}-${subtopicName}`;
    if (expandedSubtopic === key) {
      setExpandedSubtopic(null);
    } else {
      setExpandedSubtopic(key);
      fetchTopicDetails(topicName, subtopicName);
    }
  };

  const generateTest = async (
    topicName,
    subtopicName = null,
    regenerate = false,
  ) => {
    const key = subtopicName ? `${topicName}-${subtopicName}` : topicName;
    setGeneratingTest((prev) => ({ ...prev, [key]: true }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/ai/generate-test`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roadmapId: roadmapId,
            topicName: topicName,
            subtopicName: subtopicName,
            regenerate: regenerate,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setTestPaper({
          ...data.data,
          isExisting: data.isExisting,
          topicName: topicName,
          subtopicName: subtopicName,
        });
        setShowTestModal(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate test");
    } finally {
      setGeneratingTest((prev) => ({ ...prev, [key]: false }));
    }
  };

  const regenerateTest = async () => {
    if (!testPaper) return;
    closeTestModal();
    await generateTest(testPaper.topicName, testPaper.subtopicName, true);
  };

  const closeTestModal = () => {
    setShowTestModal(false);
    setTestPaper(null);
  };

  if (loading) {
    return (
      <div className="journey-detail-page">
        <div className="loading-spinner">Loading journey...</div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="journey-detail-page">
        <div className="error-message">Journey not found</div>
      </div>
    );
  }

  return (
    <div className="journey-detail-page">
      <div className="journey-header">
        <h1>{journey.title}</h1>
        {journey.isPersonalized && (
          <span className="personalized-badge">Personalized</span>
        )}
        <p className="journey-description">{journey.description}</p>
        {journey.totalDuration && (
          <p className="journey-duration">
            Total Duration: {journey.totalDuration}
          </p>
        )}
      </div>

      <div className="journey-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${journey.progress || 0}%` }}
          />
        </div>
        <p>Progress: {journey.progress || 0}%</p>
      </div>

      <div className="journey-topics">
        {journey.topics.map((topic, topicIndex) => (
          <div key={topicIndex} className="topic-card">
            <div
              className="topic-header"
              onClick={() => toggleTopic(topic.topicName, topicIndex)}
            >
              <div className="topic-title-row">
                <span className="topic-number">
                  {topic.order || topicIndex + 1}
                </span>
                <h2>{topic.topicName}</h2>
                <button
                  className="generate-test-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    generateTest(topic.topicName);
                  }}
                  disabled={generatingTest[topic.topicName]}
                >
                  {generatingTest[topic.topicName]
                    ? "Generating..."
                    : "📝 Test"}
                </button>
                <span
                  className={`expand-icon ${expandedTopic === topic.topicName ? "expanded" : ""}`}
                >
                  ▼
                </span>
              </div>
              {topic.description && (
                <p className="topic-brief">{topic.description}</p>
              )}
              {topic.duration && (
                <span className="duration-badge">{topic.duration}</span>
              )}
            </div>

            {expandedTopic === topic.topicName && (
              <div className="topic-content">
                {loadingDetails[topic.topicName] ? (
                  <div className="loading-details">
                    <div className="spinner"></div>
                    <p>Generating detailed content...</p>
                  </div>
                ) : detailedContent[topic.topicName] ? (
                  <div
                    className="detailed-content"
                    dangerouslySetInnerHTML={{
                      __html: detailedContent[topic.topicName]
                        .replace(/\n/g, "<br/>")
                        .replace(/## (.*)/g, "<h2>$1</h2>")
                        .replace(/### (.*)/g, "<h3>$1</h3>")
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\*(.*?)\*/g, "<em>$1</em>"),
                    }}
                  />
                ) : null}

                {topic.subtopics && topic.subtopics.length > 0 && (
                  <div className="subtopics-section">
                    <h3>Subtopics:</h3>
                    {topic.subtopics.map((subtopic, subtopicIndex) => (
                      <div key={subtopicIndex} className="subtopic-card">
                        <div
                          className="subtopic-header"
                          onClick={() =>
                            toggleSubtopic(
                              topic.topicName,
                              subtopic.subtopicName,
                            )
                          }
                        >
                          <div className="subtopic-title-row">
                            <span className="subtopic-number">
                              {subtopic.order || subtopicIndex + 1}
                            </span>
                            <h4>{subtopic.subtopicName}</h4>
                            <button
                              className="generate-test-btn subtopic-test-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                generateTest(
                                  topic.topicName,
                                  subtopic.subtopicName,
                                );
                              }}
                              disabled={
                                generatingTest[
                                  `${topic.topicName}-${subtopic.subtopicName}`
                                ]
                              }
                            >
                              {generatingTest[
                                `${topic.topicName}-${subtopic.subtopicName}`
                              ]
                                ? "..."
                                : "📝"}
                            </button>
                            <span
                              className={`expand-icon ${expandedSubtopic === `${topic.topicName}-${subtopic.subtopicName}` ? "expanded" : ""}`}
                            >
                              ▼
                            </span>
                          </div>
                          {subtopic.description && (
                            <p className="subtopic-brief">
                              {subtopic.description}
                            </p>
                          )}
                          {subtopic.duration && (
                            <span className="duration-badge">
                              {subtopic.duration}
                            </span>
                          )}
                        </div>

                        {expandedSubtopic ===
                          `${topic.topicName}-${subtopic.subtopicName}` && (
                          <div className="subtopic-content">
                            {loadingDetails[
                              `${topic.topicName}-${subtopic.subtopicName}`
                            ] ? (
                              <div className="loading-details">
                                <div className="spinner"></div>
                                <p>Generating detailed content...</p>
                              </div>
                            ) : detailedContent[
                                `${topic.topicName}-${subtopic.subtopicName}`
                              ] ? (
                              <div
                                className="detailed-content"
                                dangerouslySetInnerHTML={{
                                  __html: detailedContent[
                                    `${topic.topicName}-${subtopic.subtopicName}`
                                  ]
                                    .replace(/\n/g, "<br/>")
                                    .replace(/## (.*)/g, "<h2>$1</h2>")
                                    .replace(/### (.*)/g, "<h3>$1</h3>")
                                    .replace(
                                      /\*\*(.*?)\*\*/g,
                                      "<strong>$1</strong>",
                                    )
                                    .replace(/\*(.*?)\*/g, "<em>$1</em>"),
                                }}
                              />
                            ) : null}

                            {subtopic.resources &&
                              subtopic.resources.length > 0 && (
                                <div className="resources-section">
                                  <h5>Resources:</h5>
                                  <ul>
                                    {subtopic.resources.map((resource, idx) => (
                                      <li key={idx}>{resource}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {journey.tips && journey.tips.length > 0 && (
        <div className="journey-tips">
          <h3>Tips:</h3>
          <ul>
            {journey.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {journey.motivation && (
        <div className="journey-motivation">
          <h3>Motivation:</h3>
          <p>{journey.motivation}</p>
        </div>
      )}

      {showTestModal && testPaper && (
        <div className="test-modal-overlay" onClick={closeTestModal}>
          <div className="test-modal" onClick={(e) => e.stopPropagation()}>
            <div className="test-modal-header">
              <div>
                <h2>{testPaper.title}</h2>
                {testPaper.isExisting && (
                  <span className="existing-test-badge">
                    📋 Existing Test (Version {testPaper.version || 1})
                  </span>
                )}
              </div>
              <button className="close-modal-btn" onClick={closeTestModal}>
                ✕
              </button>
            </div>
            <div className="test-modal-content">
              {testPaper.instructions && (
                <div className="test-instructions">
                  <h3>Instructions:</h3>
                  <p>{testPaper.instructions}</p>
                </div>
              )}
              {testPaper.examType && (
                <div className="exam-type-badge">
                  Exam Type: {testPaper.examType}
                </div>
              )}
              <div className="test-questions">
                {testPaper.questions.map((question, index) => (
                  <div key={index} className="test-question">
                    <h4>Question {index + 1}:</h4>
                    <p className="question-text">{question.question}</p>
                    {question.options && question.options.length > 0 && (
                      <div className="question-options">
                        {question.options.map((option, optIdx) => (
                          <div key={optIdx} className="option">
                            <input
                              type={
                                question.type === "multiple-choice"
                                  ? "radio"
                                  : "checkbox"
                              }
                              name={`question-${index}`}
                              id={`q${index}-opt${optIdx}`}
                            />
                            <label htmlFor={`q${index}-opt${optIdx}`}>
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    {question.type === "short-answer" && (
                      <textarea
                        className="answer-input short-answer"
                        placeholder="Write your answer here..."
                        rows="3"
                      />
                    )}
                    {question.type === "essay" && (
                      <textarea
                        className="answer-input essay-answer"
                        placeholder="Write your essay here..."
                        rows="8"
                      />
                    )}
                    {question.marks && (
                      <span className="question-marks">
                        [{question.marks} marks]
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {testPaper.totalMarks && (
                <div className="test-total-marks">
                  Total Marks: {testPaper.totalMarks}
                </div>
              )}
            </div>
            <div className="test-modal-footer">
              <button className="print-test-btn" onClick={() => window.print()}>
                🖨️ Print Test
              </button>
              {testPaper.isExisting && (
                <button
                  className="regenerate-test-btn"
                  onClick={regenerateTest}
                >
                  🔄 Regenerate Test
                </button>
              )}
              <button className="close-modal-btn" onClick={closeTestModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyDetail;
