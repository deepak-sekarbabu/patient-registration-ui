import PropTypes from 'prop-types';
import React from 'react';
import ClinicPreferencesForm from '../PatientRegistration/ClinicPreferencesForm';
import EmergencyContactForm from '../PatientRegistration/EmergencyContactForm';
import InsuranceDetailsForm from '../PatientRegistration/InsuranceDetailsForm';
import MedicalInfoForm from '../PatientRegistration/MedicalInfoForm';
import PersonalDetailsForm from '../PatientRegistration/PersonalDetailsForm';

const PatientFullEditForm = ({
  formData,
  handleNestedChange,
  handleAddressChange,
  handleFullSubmit,
  currentStep,
  setCurrentStep,
  nextStep,
  prevStep,
  errors,
  loading,
  setFullEditMode,
  handleFamilyHistoryChange,
  handleArrayChange,
  handleAddItem,
  handleRemoveItem,
}) => {
  const totalSteps = 5;
  const stepLabels = ['Personal', 'Medical', 'Emergency', 'Insurance', 'Preferences'];
  return (
    <>
      <div
        className="logo-container"
        style={{ textAlign: 'left', marginBottom: '20px', cursor: 'pointer' }}
      >
        <img
          src="/logo192.png"
          alt="Clinic Logo"
          style={{
            height: '60px',
            width: 'auto',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        />
      </div>
      <div className="form-header">
        <h2>Edit Patient Information</h2>
      </div>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
      </div>
      <div className="step-indicators">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`step-indicator ${currentStep >= step ? 'active' : ''}`}
            onClick={() => step <= currentStep && setCurrentStep(step)}
          >
            {step}
          </div>
        ))}
      </div>
      <div className="step-labels">
        {stepLabels.map((label, idx) => (
          <span key={label} className={currentStep === idx + 1 ? 'active' : ''}>
            {label}
          </span>
        ))}
      </div>
      <div className="form-content">
        {(() => {
          switch (currentStep) {
            case 1:
              return (
                <div className="form-step">
                  <h3>Personal Details</h3>
                  <PersonalDetailsForm
                    formData={formData}
                    handleChange={handleNestedChange}
                    handleAddressChange={handleAddressChange}
                    errors={errors}
                    disablePhoneNumber={true}
                  />
                  <div className="form-navigation">
                    <div></div>
                    <button type="button" className="btn btn-primary" onClick={nextStep}>
                      Next
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        setFullEditMode(false);
                        setCurrentStep(1);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            case 2:
              return (
                <div className="form-step">
                  <h3>Medical Information</h3>
                  <MedicalInfoForm
                    formData={formData}
                    handleChange={handleNestedChange}
                    handleFamilyHistoryChange={handleFamilyHistoryChange}
                    handleArrayChange={handleArrayChange}
                    handleAddItem={handleAddItem}
                    handleRemoveItem={handleRemoveItem}
                  />
                  <div className="form-navigation">
                    <button type="button" className="btn btn-secondary" onClick={prevStep}>
                      Previous
                    </button>
                    <button type="button" className="btn btn-primary" onClick={nextStep}>
                      Next
                    </button>
                  </div>
                </div>
              );
            case 3:
              return (
                <div className="form-step">
                  <h3>Emergency Contact</h3>
                  <EmergencyContactForm formData={formData} handleChange={handleNestedChange} />
                  <div className="form-navigation">
                    <button type="button" className="btn btn-secondary" onClick={prevStep}>
                      Previous
                    </button>
                    <button type="button" className="btn btn-primary" onClick={nextStep}>
                      Next
                    </button>
                  </div>
                </div>
              );
            case 4:
              return (
                <div className="form-step">
                  <h3>Insurance Details</h3>
                  <InsuranceDetailsForm formData={formData} handleChange={handleNestedChange} />
                  <div className="form-navigation">
                    <button type="button" className="btn btn-secondary" onClick={prevStep}>
                      Previous
                    </button>
                    <button type="button" className="btn btn-primary" onClick={nextStep}>
                      Next
                    </button>
                  </div>
                </div>
              );
            case 5:
              return (
                <div className="form-step">
                  <h3>Clinic Preferences</h3>
                  <ClinicPreferencesForm
                    formData={formData}
                    handleChange={handleNestedChange}
                    handleArrayChange={handleArrayChange}
                  />
                  <div className="form-navigation">
                    <button type="button" className="btn btn-secondary" onClick={prevStep}>
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleFullSubmit}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save All Changes'}
                    </button>
                  </div>
                </div>
              );
            default:
              return null;
          }
        })()}
      </div>
    </>
  );
};

PatientFullEditForm.propTypes = {
  formData: PropTypes.object.isRequired,
  handleNestedChange: PropTypes.func.isRequired,
  handleAddressChange: PropTypes.func.isRequired,
  handleFullSubmit: PropTypes.func.isRequired,
  currentStep: PropTypes.number.isRequired,
  setCurrentStep: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired,
  errors: PropTypes.object,
  loading: PropTypes.bool,
  setFullEditMode: PropTypes.func.isRequired,
  handleFamilyHistoryChange: PropTypes.func.isRequired,
  handleArrayChange: PropTypes.func.isRequired,
  handleAddItem: PropTypes.func.isRequired,
  handleRemoveItem: PropTypes.func.isRequired,
};

export default PatientFullEditForm;
