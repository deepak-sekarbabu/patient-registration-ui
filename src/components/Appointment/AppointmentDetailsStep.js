import React from 'react';

const AppointmentDetailsStep = ({
  formData,
  errors,
  handleChange,
  getPatientFullName,
  appointmentTypes,
  appointmentForOptions,
  symptoms,
}) => (
  <div className="form-step">
    <h3>Appointment Details</h3>
    <div className="form-group">
      <label>Appointment Type</label>
      <select
        className={`form-control ${errors.appointmentType ? 'is-invalid' : ''}`}
        value={formData.appointmentType}
        onChange={(e) => handleChange('appointmentType', e.target.value)}
      >
        <option value="">Select appointment type</option>
        {appointmentTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
      {errors.appointmentType && <div className="invalid-feedback">{errors.appointmentType}</div>}
    </div>
    <div className="form-group">
      <label>Appointment For</label>
      <fieldset
        className="radio-group"
        role="radiogroup"
        aria-labelledby="appointment-for-legend"
        aria-required="true"
      >
        <legend id="appointment-for-legend" className="form-label">
          Appointment For
        </legend>
        {appointmentForOptions.map((option) => (
          <div key={option.value} className="radio-item">
            <input
              type="radio"
              id={`appointmentFor-${option.value}`}
              name="appointmentFor"
              value={option.value}
              checked={formData.appointmentFor === option.value}
              onChange={(e) => handleChange('appointmentFor', e.target.value)}
              aria-checked={formData.appointmentFor === option.value}
              aria-labelledby={`appointment-for-legend appointmentFor-${option.value}-label`}
            />
            <label
              id={`appointmentFor-${option.value}-label`}
              htmlFor={`appointmentFor-${option.value}`}
            >
              {option.label}
            </label>
          </div>
        ))}
      </fieldset>
      {errors.appointmentFor && (
        <div className="invalid-feedback d-block">{errors.appointmentFor}</div>
      )}
    </div>
    <div className="form-group">
      <label>Patient Name</label>
      {formData.appointmentFor === 'SELF' ? (
        <input type="text" className="form-control" value={getPatientFullName()} readOnly />
      ) : (
        <input
          type="text"
          className={`form-control ${errors.appointmentForName ? 'is-invalid' : ''}`}
          placeholder="Enter patient's full name"
          value={formData.appointmentForName}
          onChange={(e) => handleChange('appointmentForName', e.target.value)}
        />
      )}
      {errors.appointmentForName && (
        <div className="invalid-feedback">{errors.appointmentForName}</div>
      )}
    </div>
    <div className="form-group">
      <label>Main Symptom</label>
      <select
        className={`form-control ${errors.symptom ? 'is-invalid' : ''}`}
        value={formData.symptom}
        onChange={(e) => handleChange('symptom', e.target.value)}
      >
        <option value="">Select main symptom</option>
        {symptoms.map((symptom) => (
          <option key={symptom.value} value={symptom.value}>
            {symptom.label}
          </option>
        ))}
      </select>
      {errors.symptom && <div className="invalid-feedback">{errors.symptom}</div>}
    </div>
    {formData.symptom === 'OTHER' && (
      <div className="form-group">
        <label>Describe Your Symptoms</label>
        <textarea
          className="form-control"
          rows="3"
          placeholder="Please describe your symptoms in detail"
          value={formData.otherSymptoms}
          onChange={(e) => handleChange('otherSymptoms', e.target.value)}
        ></textarea>
      </div>
    )}
  </div>
);

export default AppointmentDetailsStep;
