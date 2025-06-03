import React from 'react';
import relationships from '../shared/RelationshipsData';

const EmergencyContactForm = ({ formData, handleChange }) => {
  const { emergencyContact } = formData;
  const [sameAsPersonal, setSameAsPersonal] = React.useState(false);

  // Add useEffect to react to relationship changes
  React.useEffect(() => {
    if (emergencyContact.relationship === 'Self') {
      setSameAsPersonal(true);
      // Also update the address field in formData when relationship is Self
      if (formData.personalDetails && formData.personalDetails.address) {
        const personalAddress = formData.personalDetails.address;
        const addressString = `${personalAddress.street || ''}, ${
          personalAddress.city || ''
        }, ${personalAddress.state || ''}, ${personalAddress.postalCode || ''}, ${
          personalAddress.country || ''
        }`
          .replace(/(, )+/g, ', ')
          .replace(/^, |, $/g, '')
          .trim();
        handleChange('emergencyContact', 'address', addressString);
      }
    }
  }, [emergencyContact.relationship, formData.personalDetails.address, handleChange]); // Add dependencies

  // Handler for name input with max 100 characters
  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value.length <= 100) {
      handleChange('emergencyContact', 'name', value);
    }
  };

  // Handler for phone number input: only allow 10 digits, add +91 if valid
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 10) value = value.slice(0, 10);
    // Update with the raw digits, we'll handle the +91 prefix in the display
    handleChange('emergencyContact', 'phoneNumber', value);
  };

  // Handler for 'Same as Address in Personal Details' checkbox
  const handleSameAsPersonalChange = (e) => {
    const checked = e.target.checked;
    setSameAsPersonal(checked);
    if (checked && formData.personalDetails && formData.personalDetails.address) {
      const personalAddress = formData.personalDetails.address;
      // Compose address string from personal details
      const addressString = `${personalAddress.street || ''}, ${
        personalAddress.city || ''
      }, ${personalAddress.state || ''}, ${personalAddress.postalCode || ''}, ${
        personalAddress.country || ''
      }`
        .replace(/(, )+/g, ', ')
        .replace(/^, |, $/g, '')
        .trim();
      handleChange('emergencyContact', 'address', addressString);
    }
  };

  return (
    <div className="form-section">
      <p className="text-muted small">
        Please provide details of a person we can contact in case of an emergency.
      </p>

      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label htmlFor="emergencyName" className="form-label required-field">
              Full Name
            </label>
            <input
              type="text"
              id="emergencyName"
              className="form-control"
              value={emergencyContact.name}
              onChange={handleNameChange}
              placeholder="e.g., Dinesh Kumar"
              maxLength={100}
              required
            />
            <small className="form-text text-muted">Maximum 100 characters allowed</small>
          </div>
        </div>

        <div className="form-col">
          <div className="form-group">
            <label htmlFor="relationship" className="form-label required-field">
              Relationship to Patient
            </label>
            <select
              id="relationship"
              className="form-control"
              value={emergencyContact.relationship}
              onChange={(e) => handleChange('emergencyContact', 'relationship', e.target.value)}
              required
            >
              <option value="">Select Relationship</option>
              {relationships.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label htmlFor="emergencyPhone" className="form-label required-field">
              Phone Number
            </label>
            <input
              type="tel"
              id="emergencyPhone"
              className="form-control"
              value={emergencyContact.phoneNumber.replace(/^\+91/, '')}
              onChange={handlePhoneChange}
              placeholder="e.g., 9876543210"
              maxLength={10}
              pattern="[0-9]{10}"
              required
            />
            {emergencyContact.phoneNumber &&
              !/^(\+91\d{10}|\d{10})$/.test(emergencyContact.phoneNumber) && (
                <div className="input-error">Please enter a valid 10-digit phone number.</div>
              )}
            <small className="form-text text-muted">
              Enter a valid 10-digit number. +91 will be added automatically.
            </small>
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="d-flex align-items-start mb-2">
          <div className="d-flex align-items-center" style={{ minWidth: '80px' }}>
            <label htmlFor="emergencyAddress" className="form-label required-field mb-0">
              Address
            </label>
          </div>
          <div className="checkbox-inline-wrapper">
            <label className="checkbox-inline" htmlFor="sameAsPersonal">
              <input
                type="checkbox"
                id="sameAsPersonal"
                checked={sameAsPersonal}
                onChange={handleSameAsPersonalChange}
              />
              Same as Address Info in Personal Details
            </label>
          </div>
        </div>
        <textarea
          id="emergencyAddress"
          className="form-control"
          value={emergencyContact.address}
          onChange={(e) => {
            if (e.target.value.length <= 250) {
              handleChange('emergencyContact', 'address', e.target.value);
              if (sameAsPersonal) setSameAsPersonal(false); // Uncheck if user edits
            }
          }}
          placeholder="Full address or 'Same as patient'"
          rows="3"
          maxLength={250}
          required
        ></textarea>
        <small className="form-text text-muted">Maximum 250 characters allowed</small>
      </div>
    </div>
  );
};

export default EmergencyContactForm;
