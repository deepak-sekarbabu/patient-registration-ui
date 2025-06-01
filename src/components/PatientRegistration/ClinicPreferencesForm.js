import React from 'react';

const ClinicPreferencesForm = ({ formData, handleChange, handleArrayChange }) => {
  const { clinicPreferences } = formData;

  // Safe way to get current selected method
  const selectedMethod =
    Array.isArray(clinicPreferences.communicationMethod) &&
    clinicPreferences.communicationMethod.length > 0
      ? clinicPreferences.communicationMethod[0]
      : 'SMS'; // Default to SMS if no method is selected

  // Handler for radio button changes
  const handleRadioChange = (value) => {
    handleChange('clinicPreferences', 'communicationMethod', [value]);
  };

  return (
    <div className="form-section">
      <p className="text-muted small">Please let us know your communication preferences.</p>
      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label htmlFor="preferredLanguage" className="form-label required-field">
              Preferred Language
            </label>
            <select
              id="preferredLanguage"
              className="form-control"
              value={clinicPreferences.preferredLanguage}
              onChange={(e) =>
                handleChange('clinicPreferences', 'preferredLanguage', e.target.value)
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
        <label className="form-label required-field">Preferred Communication Method</label>
        <p className="text-muted small">Please select your preferred method of communication</p>

        <div className="radio-group">
          <div className="radio-item">
            <input
              type="radio"
              id="email"
              name="communicationMethod"
              checked={selectedMethod === 'Email'}
              onChange={() => handleRadioChange('Email')}
            />
            <label htmlFor="email">Email</label>
          </div>

          <div className="radio-item">
            <input
              type="radio"
              id="sms"
              name="communicationMethod"
              checked={selectedMethod === 'SMS'}
              onChange={() => handleRadioChange('SMS')}
            />
            <label htmlFor="sms">SMS</label>
          </div>

          <div className="radio-item">
            <input
              type="radio"
              id="whatsapp"
              name="communicationMethod"
              checked={selectedMethod === 'Whatsapp'}
              onChange={() => handleRadioChange('Whatsapp')}
            />
            <label htmlFor="whatsapp">WhatsApp</label>
          </div>

          <div className="radio-item">
            <input
              type="radio"
              id="phone"
              name="communicationMethod"
              checked={selectedMethod === 'Phone'}
              onChange={() => handleRadioChange('Phone')}
            />
            <label htmlFor="phone">Phone Call</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicPreferencesForm;
