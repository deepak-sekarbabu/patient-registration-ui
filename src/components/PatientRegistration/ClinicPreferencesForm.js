import React from "react";

const ClinicPreferencesForm = ({
  formData,
  handleChange,
  handleArrayChange,
}) => {
  const { clinicPreferences } = formData;

  return (
    <div className="form-section">
      <h3 className="form-section-title">Clinic Preferences</h3>
      <p className="text-muted small">
        Please let us know your communication preferences.
      </p>

      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label
              htmlFor="preferredLanguage"
              className="form-label required-field"
            >
              Preferred Language
            </label>
            <select
              id="preferredLanguage"
              className="form-control"
              value={clinicPreferences.preferredLanguage}
              onChange={(e) =>
                handleChange(
                  "clinicPreferences",
                  "preferredLanguage",
                  e.target.value
                )
              }
              required
            >
              <option value="">Select Language</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Kannada">Kannada</option>
              <option value="Tamil">Tamil</option>
              <option value="Telugu">Telugu</option>
              <option value="Malayalam">Malayalam</option>
              <option value="Marathi">Marathi</option>
              <option value="Gujarati">Gujarati</option>
              <option value="Bengali">Bengali</option>
              <option value="Punjabi">Punjabi</option>
              <option value="Urdu">Urdu</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label required-field">
          Preferred Communication Method
        </label>
        <p className="text-muted small">
          Please select at least one method of communication
        </p>

        <div className="checkbox-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="email"
              checked={clinicPreferences.communicationMethod.includes("Email")}
              onChange={() =>
                handleArrayChange(
                  "clinicPreferences",
                  "communicationMethod",
                  "Email"
                )
              }
            />
            <label htmlFor="email">Email</label>
          </div>

          <div className="checkbox-item">
            <input
              type="checkbox"
              id="sms"
              checked={clinicPreferences.communicationMethod.includes("SMS")}
              onChange={() =>
                handleArrayChange(
                  "clinicPreferences",
                  "communicationMethod",
                  "SMS"
                )
              }
            />
            <label htmlFor="sms">SMS</label>
          </div>

          <div className="checkbox-item">
            <input
              type="checkbox"
              id="whatsapp"
              checked={clinicPreferences.communicationMethod.includes(
                "Whatsapp"
              )}
              onChange={() =>
                handleArrayChange(
                  "clinicPreferences",
                  "communicationMethod",
                  "Whatsapp"
                )
              }
            />
            <label htmlFor="whatsapp">WhatsApp</label>
          </div>

          <div className="checkbox-item">
            <input
              type="checkbox"
              id="phone"
              checked={clinicPreferences.communicationMethod.includes("Phone")}
              onChange={() =>
                handleArrayChange(
                  "clinicPreferences",
                  "communicationMethod",
                  "Phone"
                )
              }
            />
            <label htmlFor="phone">Phone Call</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicPreferencesForm;
