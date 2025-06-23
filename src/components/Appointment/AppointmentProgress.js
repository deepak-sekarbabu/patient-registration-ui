import { Check } from 'lucide-react';
import React from 'react';

const AppointmentProgress = ({ currentStep, totalSteps, stepLabels, setCurrentStep }) => (
  <>
    <div className="progress-bar">
      <div className="progress" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
    </div>
    <div className="step-indicators" role="tablist" aria-label="Appointment Steps">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`step-indicator ${currentStep > index + 1 ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
          role="tab"
          aria-selected={currentStep === index + 1}
          aria-controls={`step-panel-${index + 1}`}
          tabIndex={0}
          aria-label={`Step ${index + 1}: ${stepLabels[index]}`}
          onClick={() => currentStep > index + 1 && setCurrentStep(index + 1)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && currentStep > index + 1) {
              setCurrentStep(index + 1);
            }
          }}
        >
          {currentStep > index + 1 ? <Check size={16} /> : index + 1}
        </div>
      ))}
    </div>
    <div className="step-labels">
      {stepLabels.map((label, idx) => (
        <span
          key={label}
          className={currentStep === idx + 1 ? 'active' : ''}
          id={`step-label-${idx + 1}`}
        >
          {label}
        </span>
      ))}
    </div>
  </>
);

export default AppointmentProgress;
