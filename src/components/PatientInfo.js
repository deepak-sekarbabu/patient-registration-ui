import React, { useEffect, useState } from "react";
import "./PatientInfo.css";

const PatientInfo = ({ patient, onUpdate, onLogout }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(patient || {});
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFormData(patient || {});
  }, [patient]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(formData);
      setMessage("Information updated successfully.");
      setEditMode(false);
    } catch (err) {
      setMessage("Failed to update information.");
    }
  };

  if (!patient) return <div>Loading...</div>;

  return (
    <div className="patient-info-container">
      <div className="patient-info-header">
        <h2>Patient Information</h2>
        <button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>
          Logout
        </button>
      </div>

      {message && (
        <div className="alert alert-success patient-info-message">
          {message}
        </div>
      )}

      <div className="patient-info-content">
        {editMode ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                name="fullName"
                value={formData.fullName || ""}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                name="birthdate"
                value={formData.birthdate || ""}
                onChange={handleChange}
              />
            </div>
            {/* Add more fields as needed */}
            <div className="patient-info-actions">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="patient-info-detail">
              <strong>Full Name:</strong> {patient.fullName}
            </div>
            <div className="patient-info-detail">
              <strong>Phone Number:</strong> {patient.phone}
            </div>
            <div className="patient-info-detail">
              <strong>Email:</strong> {patient.email || "Not provided"}
            </div>
            <div className="patient-info-detail">
              <strong>Date of Birth:</strong>{" "}
              {patient.birthdate || "Not provided"}
            </div>
            <div className="patient-info-detail">
              <strong>Age:</strong> {patient.age || "Not calculated"}
            </div>
            {patient.address && (
              <div className="patient-info-detail">
                <strong>Address:</strong>{" "}
                {`${patient.address.street || ""}, ${
                  patient.address.city || ""
                }, ${patient.address.state || ""} ${
                  patient.address.postalCode || ""
                }, ${patient.address.country || ""}`}
              </div>
            )}
            {patient.medicalInfo && (
              <div className="patient-info-detail">
                <strong>Blood Group:</strong>{" "}
                {patient.medicalInfo.bloodGroup || "Not provided"}
              </div>
            )}
            <div className="patient-info-actions">
              <button
                className="btn btn-primary"
                onClick={() => setEditMode(true)}
              >
                Edit Information
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientInfo;
