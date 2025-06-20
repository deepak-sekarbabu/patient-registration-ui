import DOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import '../../styles/components/PatientRegistrationForm.css';
import ClinicPreferencesForm from './ClinicPreferencesForm';
import EmergencyContactForm from './EmergencyContactForm';
import FormMessages from './FormMessages';
import FormNavigation from './FormNavigation';
import InsuranceDetailsForm from './InsuranceDetailsForm';
import MedicalInfoForm from './MedicalInfoForm';
import PersonalDetailsForm from './PersonalDetailsForm';
import ReviewSummary from './ReviewSummary';
import StepNavigation from './StepNavigation';
import usePatientRegistrationForm from './usePatientRegistrationForm';

const PatientRegistrationForm = ({ onRegisterSuccess }) => {
  const {
    formData,
    errors,
    currentStep,
    setCurrentStep,
    isSubmitting,
    submitSuccess,
    submitError,
    showMissingFieldsError,
    formContentRef,
    handlePhoneNumberBlur,
    handleChange,
    handleAddressChange,
    handleFamilyHistoryChange,
    handleArrayChange,
    handleAddItem,
    handleRemoveItem,
    nextStep,
    prevStep,
    handleSubmit,
  } = usePatientRegistrationForm(onRegisterSuccess);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (submitSuccess) {
      setToastMessage('Registration successful! Redirecting to login...');
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        // Redirect to login after toast disappears
        window.location.href = '/login';
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  const displayMandatoryFieldsError = () => {
    if (
      currentStep === 1 &&
      (showMissingFieldsError || !formData.phoneNumber || !formData.personalDetails.name)
    ) {
      return (
        <div
          className="error-message"
          style={{
            marginBottom: '20px',
            textAlign: 'left',
            padding: '15px',
            border: '2px solid #e74c3c',
            animation: showMissingFieldsError ? 'shake 0.5s' : 'none',
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', color: '#e74c3c' }}>
            {DOMPurify.sanitize('Required Fields Missing')}
          </h4>
          <p>{DOMPurify.sanitize('You must fill in the following mandatory fields to proceed:')}</p>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {!formData.phoneNumber && (
              <li>
                <strong>{DOMPurify.sanitize('Primary Phone Number')}</strong> -{' '}
                {DOMPurify.sanitize('Please enter a valid 10-digit phone number')}
              </li>
            )}
            {!formData.personalDetails.name && (
              <li>
                <strong>{DOMPurify.sanitize('Full Name')}</strong> -{' '}
                {DOMPurify.sanitize('Please enter your full name')}
              </li>
            )}
          </ul>
        </div>
      );
    }
    return null;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalDetailsForm
            formData={formData}
            handleChange={handleChange}
            handleAddressChange={handleAddressChange}
            errors={errors}
            handlePhoneNumberBlur={handlePhoneNumberBlur}
          />
        );
      case 2:
        return (
          <MedicalInfoForm
            formData={formData}
            handleChange={handleChange}
            handleFamilyHistoryChange={handleFamilyHistoryChange}
            handleArrayChange={handleArrayChange}
            handleAddItem={handleAddItem}
            handleRemoveItem={handleRemoveItem}
          />
        );
      case 3:
        return <EmergencyContactForm formData={formData} handleChange={handleChange} />;
      case 4:
        return <InsuranceDetailsForm formData={formData} handleChange={handleChange} />;
      case 5:
        return (
          <ClinicPreferencesForm
            formData={formData}
            handleChange={handleChange}
            handleArrayChange={handleArrayChange}
          />
        );
      case 6:
        return <ReviewSummary formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="patient-registration-container">
      {showToast && (
        <div className="toast-message success-toast" role="alert" aria-live="polite">
          {toastMessage}
        </div>
      )}
      <StepNavigation currentStep={currentStep} setCurrentStep={setCurrentStep} />
      <FormMessages submitSuccess={submitSuccess} submitError={submitError}>
        {displayMandatoryFieldsError()}
      </FormMessages>
      <form onSubmit={handleSubmit}>
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={currentStep}
            classNames="fade-slide"
            timeout={400}
            nodeRef={formContentRef}
          >
            <div className="form-content" ref={formContentRef}>
              {renderStep()}
            </div>
          </CSSTransition>
        </SwitchTransition>
        <FormNavigation
          currentStep={currentStep}
          isSubmitting={isSubmitting}
          formData={formData}
          prevStep={prevStep}
          nextStep={nextStep}
        />
      </form>
    </div>
  );
};

export default PatientRegistrationForm;
