import PropTypes from 'prop-types';
import React from 'react';

const steps = [
  { label: 'Personal' },
  { label: 'Medical' },
  { label: 'Emergency' },
  { label: 'Insurance' },
  { label: 'Preferences' },
  { label: 'Review' },
];

const StepNavigation = ({ currentStep, setCurrentStep }) => (
  <div className="form-header">
    <h2>Patient Registration</h2>
    <div className="progress-bar">
      <div className="progress" style={{ width: `${(currentStep / steps.length) * 100}%` }}></div>
    </div>
    <div className="step-indicators">
      {steps.map((step, idx) => (
        <div
          key={idx + 1}
          className={`step-indicator ${currentStep >= idx + 1 ? 'active' : ''}`}
          onClick={() => (idx + 1 <= currentStep ? setCurrentStep(idx + 1) : null)}
        >
          {idx + 1}
        </div>
      ))}
    </div>
    <div className="step-labels">
      {steps.map((step, idx) => (
        <span key={step.label} className={currentStep === idx + 1 ? 'active' : ''}>
          {step.label}
        </span>
      ))}
    </div>
  </div>
);

StepNavigation.propTypes = {
  currentStep: PropTypes.number.isRequired,
  setCurrentStep: PropTypes.func.isRequired,
};

export default StepNavigation;
