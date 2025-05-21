import React from "react";

const EmergencyContactForm = ({ formData, handleChange }) => {
  const { emergencyContact } = formData;

  return (
    <div className="form-section">
      <h3 className="form-section-title">Emergency Contact Information</h3>
      <p className="text-muted small">
        Please provide details of a person we can contact in case of an
        emergency.
      </p>

      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label
              htmlFor="emergencyName"
              className="form-label required-field"
            >
              Full Name
            </label>
            <input
              type="text"
              id="emergencyName"
              className="form-control"
              value={emergencyContact.name}
              onChange={(e) =>
                handleChange("emergencyContact", "name", e.target.value)
              }
              placeholder="e.g., Jane Doe"
              required
            />
          </div>
        </div>

        <div className="form-col">
          <div className="form-group">
            <label htmlFor="relationship" className="form-label required-field">
              Relationship to Patient
            </label>
            <input
              type="text"
              id="relationship"
              className="form-control"
              value={emergencyContact.relationship}
              onChange={(e) =>
                handleChange("emergencyContact", "relationship", e.target.value)
              }
              placeholder="e.g., Spouse, Parent, Child"
              required
            />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label
              htmlFor="emergencyPhone"
              className="form-label required-field"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="emergencyPhone"
              className="form-control"
              value={emergencyContact.phoneNumber}
              onChange={(e) =>
                handleChange("emergencyContact", "phoneNumber", e.target.value)
              }
              placeholder="e.g., +919876543211"
              required
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="emergencyAddress" className="form-label required-field">
          Address
        </label>
        <textarea
          id="emergencyAddress"
          className="form-control"
          value={emergencyContact.address}
          onChange={(e) =>
            handleChange("emergencyContact", "address", e.target.value)
          }
          placeholder="Full address or 'Same as patient'"
          rows="3"
          required
        ></textarea>
      </div>
    </div>
  );
};

export default EmergencyContactForm;
