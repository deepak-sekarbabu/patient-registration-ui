import PropTypes from 'prop-types';
import React from 'react';

const FormNavigation = ({ currentStep, isSubmitting, formData, prevStep, nextStep }) => (
  <div className="form-navigation">
    {currentStep > 1 && (
      <button
        type="button"
        className="btn btn-secondary"
        onClick={prevStep}
        disabled={isSubmitting}
      >
        Previous
      </button>
    )}
    {currentStep < 6 && (
      <button
        type="button"
        className="btn btn-primary"
        onClick={nextStep}
        title={
          currentStep === 1 ? 'Primary Phone Number and Full Name are mandatory to proceed' : ''
        }
        style={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {currentStep === 1 ? 'Next (Requires Phone & Name)' : 'Next'}
        {currentStep === 1 && (!formData.phoneNumber || !formData.personalDetails.name) && (
          <span
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              backgroundColor: 'rgba(231, 76, 60, 0.15)',
              pointerEvents: 'none',
            }}
          />
        )}
      </button>
    )}
    {currentStep === 6 && (
      <button type="submit" className="btn btn-success" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Registration'}
      </button>
    )}
  </div>
);

FormNavigation.propTypes = {
  currentStep: PropTypes.number.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  formData: PropTypes.object.isRequired,
  prevStep: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
};

export default FormNavigation;
