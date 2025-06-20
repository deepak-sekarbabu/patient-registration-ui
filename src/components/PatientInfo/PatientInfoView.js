import PropTypes from 'prop-types';
import React from 'react';

const PatientInfoView = ({ patient }) => (
  <div className="patient-info-view">
    <div className="info-section">
      <h3>Personal Details</h3>
      <div className="patient-info-detail">
        <strong>Full Name:</strong> {patient.fullName}
      </div>
      <div className="patient-info-detail">
        <strong>Phone Number:</strong> {patient.phone}
      </div>
      <div className="patient-info-detail">
        <strong>Email:</strong> {patient.email || 'Not provided'}
      </div>
      <div className="patient-info-detail">
        <strong>Date of Birth:</strong> {patient.birthdate || 'Not provided'}
      </div>
      <div className="patient-info-detail">
        <strong>Age:</strong> {patient.age || 'Not calculated'}
      </div>
      <div className="patient-info-detail">
        <strong>Sex:</strong>{' '}
        {patient.personalDetails?.sex === 'M'
          ? 'Male'
          : patient.personalDetails?.sex === 'F'
            ? 'Female'
            : patient.personalDetails?.sex === 'O'
              ? 'Other'
              : 'Not specified'}
      </div>
      <div className="patient-info-detail">
        <strong>Occupation:</strong> {patient.personalDetails?.occupation || 'Not provided'}
      </div>
      {patient.address && (
        <div className="patient-info-detail">
          <strong>Address:</strong>{' '}
          {`${patient.address.street || ''}, ${patient.address.city || ''}, ${patient.address.state || ''} ${patient.address.postalCode || ''}, ${patient.address.country || ''}`}
        </div>
      )}
    </div>
    <div className="info-section">
      <h3>Medical Information</h3>
      {patient.medicalInfo ? (
        <>
          <div className="patient-info-detail">
            <strong>Blood Group:</strong> {patient.medicalInfo.bloodGroup || 'Not provided'}
          </div>
          <div className="patient-info-detail">
            <strong>Allergies:</strong>{' '}
            {patient.medicalInfo.allergies && patient.medicalInfo.allergies.length > 0
              ? patient.medicalInfo.allergies.join(', ')
              : 'None'}
          </div>
          <div className="patient-info-detail">
            <strong>Existing Conditions:</strong>{' '}
            {patient.medicalInfo.existingConditions &&
            patient.medicalInfo.existingConditions.length > 0
              ? patient.medicalInfo.existingConditions.join(', ')
              : 'None'}
          </div>
          <div className="patient-info-detail">
            <strong>Current Medications:</strong>{' '}
            {patient.medicalInfo.currentMedications &&
            patient.medicalInfo.currentMedications.length > 0
              ? patient.medicalInfo.currentMedications.join(', ')
              : 'None'}
          </div>
        </>
      ) : (
        <div className="patient-info-detail">No medical information provided</div>
      )}
    </div>
    <div className="info-section">
      <h3>Emergency Contact</h3>
      {patient.emergencyContact ? (
        <>
          <div className="patient-info-detail">
            <strong>Name:</strong> {patient.emergencyContact.name || 'Not provided'}
          </div>
          <div className="patient-info-detail">
            <strong>Relationship:</strong> {patient.emergencyContact.relationship || 'Not provided'}
          </div>
          <div className="patient-info-detail">
            <strong>Phone Number:</strong> {patient.emergencyContact.phoneNumber || 'Not provided'}
          </div>
          <div className="patient-info-detail">
            <strong>Address:</strong> {patient.emergencyContact.address || 'Not provided'}
          </div>
        </>
      ) : (
        <div className="patient-info-detail">No emergency contact information provided</div>
      )}
    </div>
    <div className="info-section">
      <h3>Insurance Details</h3>
      {patient.insuranceDetails ? (
        <>
          <div className="patient-info-detail">
            <strong>Provider:</strong> {patient.insuranceDetails.provider || 'Not provided'}
          </div>
          <div className="patient-info-detail">
            <strong>Policy Number:</strong>{' '}
            {patient.insuranceDetails.policyNumber || 'Not provided'}
          </div>
          <div className="patient-info-detail">
            <strong>Valid Till:</strong> {patient.insuranceDetails.validTill || 'Not provided'}
          </div>
        </>
      ) : (
        <div className="patient-info-detail">No insurance information provided</div>
      )}
    </div>
    <div className="info-section">
      <h3>Clinic Preferences</h3>
      {patient.clinicPreferences ? (
        <>
          <div className="patient-info-detail">
            <strong>Preferred Language:</strong>{' '}
            {patient.clinicPreferences.preferredLanguage || 'Not provided'}
          </div>
          <div className="patient-info-detail">
            <strong>Communication Method:</strong>{' '}
            {patient.clinicPreferences.communicationMethod &&
            Array.isArray(patient.clinicPreferences.communicationMethod) &&
            patient.clinicPreferences.communicationMethod.length > 0
              ? patient.clinicPreferences.communicationMethod[0]
              : 'Not provided'}
          </div>
        </>
      ) : (
        <div className="patient-info-detail">No clinic preferences provided</div>
      )}
    </div>
  </div>
);

PatientInfoView.propTypes = {
  patient: PropTypes.object.isRequired,
};

export default PatientInfoView;
