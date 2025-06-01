import React from 'react';

const InsuranceDetailsForm = ({ formData, handleChange }) => {
  const { insuranceDetails } = formData;

  return (
    <div className="form-section">
      <p className="text-muted small">Please provide your health insurance details.</p>
      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label htmlFor="provider" className="form-label required-field">
              Insurance Provider
            </label>
            <input
              type="text"
              id="provider"
              className="form-control"
              value={insuranceDetails.provider}
              onChange={(e) => {
                if (e.target.value.length <= 100) {
                  handleChange('insuranceDetails', 'provider', e.target.value);
                }
              }}
              placeholder="e.g., Star Health"
              maxLength={100}
              required
            />
            <small className="form-text text-muted">Maximum 100 characters allowed</small>
          </div>
        </div>

        <div className="form-col">
          <div className="form-group">
            <label htmlFor="policyNumber" className="form-label required-field">
              Policy Number
            </label>
            <input
              type="text"
              id="policyNumber"
              className="form-control"
              value={insuranceDetails.policyNumber}
              onChange={(e) => {
                if (e.target.value.length <= 20) {
                  handleChange('insuranceDetails', 'policyNumber', e.target.value);
                }
              }}
              placeholder="e.g., STAR123456"
              maxLength={20}
              required
            />
            <small className="form-text text-muted">Maximum 20 characters allowed</small>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-col">
          <div className="form-group">
            <label htmlFor="validTill" className="form-label required-field">
              Valid Till
            </label>
            <input
              type="date"
              id="validTill"
              className="form-control"
              value={insuranceDetails.validTill}
              onChange={(e) => handleChange('insuranceDetails', 'validTill', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceDetailsForm;
