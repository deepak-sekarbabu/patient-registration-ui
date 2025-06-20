import PropTypes from 'prop-types';
import React from 'react';

const ReviewSummary = ({ formData }) => (
  <div className="form-summary">
    <h3>Review Your Information</h3>
    <div className="summary-section">
      <h4>Personal Details</h4>
      <p>
        <strong>Name:</strong> {formData.personalDetails.name}
      </p>
      <p>
        <strong>Phone:</strong> {formData.personalDetails.phoneNumber}
      </p>
      <p>
        <strong>Email:</strong> {formData.personalDetails.email}
      </p>
      <p>
        <strong>Birthdate:</strong> {formData.personalDetails.birthdate}
      </p>
      <p>
        <strong>Sex:</strong> {formData.personalDetails.sex}
      </p>
      <p>
        <strong>Occupation:</strong> {formData.personalDetails.occupation}
      </p>
      <p>
        <strong>Address:</strong> {formData.personalDetails.address.street},{' '}
        {formData.personalDetails.address.city}, {formData.personalDetails.address.state},{' '}
        {formData.personalDetails.address.postalCode}, {formData.personalDetails.address.country}
      </p>
    </div>
    <div className="summary-section">
      <h4>Medical Information</h4>
      <p>
        <strong>Blood Group:</strong> {formData.medicalInfo.bloodGroup}
      </p>
      <p>
        <strong>Allergies:</strong> {formData.medicalInfo.allergies.join(', ') || 'None'}
      </p>
      <p>
        <strong>Existing Conditions:</strong>{' '}
        {formData.medicalInfo.existingConditions.join(', ') || 'None'}
      </p>
      <p>
        <strong>Current Medications:</strong>{' '}
        {formData.medicalInfo.currentMedications.join(', ') || 'None'}
      </p>
      <p>
        <strong>Family History:</strong>
      </p>
      <ul>
        <li>Diabetes: {formData.medicalInfo.familyHistory.diabetes ? 'Yes' : 'No'}</li>
        <li>Hypertension: {formData.medicalInfo.familyHistory.hypertension ? 'Yes' : 'No'}</li>
        <li>Heart Disease: {formData.medicalInfo.familyHistory.heartDisease ? 'Yes' : 'No'}</li>
      </ul>
    </div>
    <div className="summary-section">
      <h4>Emergency Contact</h4>
      <p>
        <strong>Name:</strong> {formData.emergencyContact.name}
      </p>
      <p>
        <strong>Relationship:</strong> {formData.emergencyContact.relationship}
      </p>
      <p>
        <strong>Phone:</strong> {formData.emergencyContact.phoneNumber}
      </p>
      <p>
        <strong>Address:</strong> {formData.emergencyContact.address}
      </p>
    </div>
    <div className="summary-section">
      <h4>Insurance Details</h4>
      <p>
        <strong>Provider:</strong> {formData.insuranceDetails.provider}
      </p>
      <p>
        <strong>Policy Number:</strong> {formData.insuranceDetails.policyNumber}
      </p>
      <p>
        <strong>Valid Till:</strong> {formData.insuranceDetails.validTill}
      </p>
    </div>
    <div className="summary-section">
      <h4>Clinic Preferences</h4>
      <p>
        <strong>Preferred Language:</strong>{' '}
        {formData.clinicPreferences.preferredLanguage || 'None selected'}
      </p>
      <p>
        <strong>Communication Method:</strong>{' '}
        {Array.isArray(formData.clinicPreferences.communicationMethod) &&
        formData.clinicPreferences.communicationMethod.length > 0
          ? formData.clinicPreferences.communicationMethod[0]
          : 'None selected'}
      </p>
    </div>
  </div>
);

ReviewSummary.propTypes = {
  formData: PropTypes.object.isRequired,
};

export default ReviewSummary;
