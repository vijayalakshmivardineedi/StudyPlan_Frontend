import { useEffect, useState } from "react";
import "../style.css";
import { API_BASE_URL } from "../connections";

const Profile = () => {
  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  const calculateCompletion = (data) => {
    const fields = [
      "name",
      "email",
      "country",
      "class",
      "board",
      "targetExam",
      "studyHoursPerDay",
      "preferredTime",
      "subjects",
      "examDate",
    ];

    let completed = 0;

    fields.forEach((field) => {
      const value = data[field];

      if (
        value &&
        value !== "" &&
        (!Array.isArray(value) || value.length > 0)
      ) {
        completed++;
      }
    });

    return Math.round((completed / fields.length) * 100);
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        const studentData = data.data.student;
        // Convert subjects array to string for display
        if (Array.isArray(studentData.subjects)) {
          studentData.subjects = studentData.subjects.join(", ");
        }
        setStudent(data.data.student);
        setFormData(studentData);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubjectsChange = (e) => {
    const value = e.target.value;

    // Store the raw string value to allow typing commas
    setFormData((prev) => ({
      ...prev,
      subjects: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Convert subjects string to array before sending
      const subjectsArray =
        typeof formData.subjects === "string"
          ? formData.subjects
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : formData.subjects;

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          country: formData.country,
          class: formData.class,
          board: formData.board,
          targetExam: formData.targetExam,
          studyHoursPerDay: formData.studyHoursPerDay,
          preferredTime: formData.preferredTime,
          subjects: subjectsArray,
          examDate: formData.examDate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Profile updated successfully");
        const studentData = data.data.student;
        // Convert subjects array to string for display
        if (Array.isArray(studentData.subjects)) {
          studentData.subjects = studentData.subjects.join(", ");
        }
        setStudent(data.data.student);
        setFormData(studentData);
        localStorage.setItem("student", JSON.stringify(data.data.student));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const completion = calculateCompletion(formData);

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>My Profile</h1>

        <div className="completion-section">
          <h3>Profile Completion: {completion}%</h3>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleUpdate} className="profile-form">
          <div className="form-group">
            <label>Name</label>
            <input
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input value={formData.email || ""} disabled />
          </div>

          <div className="form-group">
            <label>Country</label>
            <input
              name="country"
              value={formData.country || ""}
              onChange={handleChange}
              placeholder="Enter your country"
            />
          </div>

          <div className="form-group">
            <label>Class</label>
            <input
              name="class"
              value={formData.class || ""}
              onChange={handleChange}
              placeholder="e.g., 10, 12, Undergraduate"
            />
          </div>

          <div className="form-group">
            <label>Board</label>
            <input
              name="board"
              value={formData.board || ""}
              onChange={handleChange}
              placeholder="e.g., CBSE, ICSE, State Board"
            />
          </div>

          <div className="form-group">
            <label>Target Exam</label>
            <input
              name="targetExam"
              value={formData.targetExam || ""}
              onChange={handleChange}
              placeholder="e.g., JEE, NEET, Board Exams"
            />
          </div>

          <div className="form-group">
            <label>Study Hours Per Day</label>
            <input
              type="number"
              name="studyHoursPerDay"
              value={formData.studyHoursPerDay || ""}
              onChange={handleChange}
              placeholder="How many hours per day?"
              min="1"
              max="24"
            />
          </div>

          <div className="form-group">
            <label>Preferred Time</label>
            <input
              name="preferredTime"
              value={formData.preferredTime || ""}
              onChange={handleChange}
              placeholder="e.g., Morning, Evening, Night"
            />
          </div>

          <div className="form-group">
            <label>Subjects (comma separated)</label>
            <input
              type="text"
              value={formData.subjects || ""}
              onChange={handleSubjectsChange}
              placeholder="e.g., Math, Physics, Chemistry"
            />
          </div>

          <div className="form-group">
            <label>Exam Date</label>
            <input
              type="date"
              name="examDate"
              value={formData.examDate ? formData.examDate.split("T")[0] : ""}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="orange-button">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
