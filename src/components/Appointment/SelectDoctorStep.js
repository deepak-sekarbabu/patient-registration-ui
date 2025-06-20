import { AlertCircle, Loader2 } from 'lucide-react';
import React from 'react';

const SelectDoctorStep = ({
  formData,
  errors,
  handleChange,
  clinics,
  availableDoctors,
  isLoading,
  error,
}) => (
  <div className="form-step">
    <h3>Select Doctor</h3>
    <div className="form-group">
      <label>Clinic</label>
      {isLoading ? (
        <div className="d-flex align-items-center p-3">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Loading clinics...</span>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <AlertCircle className="mr-2 h-4 w-4" />
          {error}
          <button
            className="btn btn-sm btn-outline-primary ml-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <select
            className={`form-control ${errors.clinicId ? 'is-invalid' : ''}`}
            value={formData.clinicId}
            onChange={(e) => {
              handleChange('clinicId', e.target.value);
              handleChange('doctorId', '');
            }}
            disabled={clinics.length === 0}
          >
            <option value="">
              {clinics.length === 0 ? 'No clinics available' : 'Select a clinic'}
            </option>
            {clinics.map((clinic) => (
              <option key={clinic.clinicId} value={clinic.clinicId}>
                {clinic.clinicName}
              </option>
            ))}
          </select>
          {errors.clinicId && <div className="invalid-feedback">{errors.clinicId}</div>}
        </>
      )}
    </div>
    <div className="form-group">
      <label>Doctor</label>
      <select
        className={`form-control ${errors.doctorId ? 'is-invalid' : ''}`}
        value={formData.doctorId}
        onChange={(e) => handleChange('doctorId', e.target.value)}
        disabled={!formData.clinicId || availableDoctors.length === 0}
      >
        <option value="">
          {!formData.clinicId
            ? 'Please select a clinic first'
            : availableDoctors.length === 0
              ? 'No doctors available for this clinic'
              : 'Select a doctor'}
        </option>
        {availableDoctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.name}
          </option>
        ))}
      </select>
      {errors.doctorId && <div className="invalid-feedback">{errors.doctorId}</div>}
    </div>
  </div>
);

export default SelectDoctorStep;
