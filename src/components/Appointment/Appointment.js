import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AlertCircle, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { useNavigate } from 'react-router-dom';
import { baseApiClient as authAxios } from '../../services/axiosInstance';
import './Appointment.css';

const AppointmentForm = ({ onAppointmentBooked }) => {
  const { isAuthenticated, patient } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const handleLogoClick = () => {
    navigate('/info');
  };

  // Get patient's full name from the patient object
  const getPatientFullName = useCallback(() => {
    if (patient?.fullName) {
      return patient.fullName;
    } else if (patient?.personalDetails?.name) {
      return patient.personalDetails.name;
    } else if (patient?.name) {
      return patient.name;
    }
    return '';
  }, [patient]);

  // Initialize form data with patient's name if available
  const [formData, setFormData] = useState(() => {
    const patientName = getPatientFullName();
    return {
      patientId: patient?.id || 1,
      appointmentType: 'GENERAL',
      appointmentFor: 'SELF',
      appointmentForName: patientName,
      appointmentForAge: '',
      symptom: '',
      otherSymptoms: '',
      appointmentDate: '',
      clinicId: '',
      doctorId: '',
      slotId: '',
    };
  });

  const [errors, setErrors] = useState({});
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [clinics, setClinics] = useState([]);
  const formContentRef = useRef(null);

  const totalSteps = 3;
  const stepLabels = ['Appointment Details', 'Select Doctor', 'Book Slot'];

  // Form options
  const appointmentTypes = [
    { value: 'GENERAL', label: 'General Consultation' },
    { value: 'FOLLOW_UP', label: 'Follow-up Visit' },
    { value: 'SPECIALIST', label: 'Specialist Consultation' },
    { value: 'TEST', label: 'Diagnostic Test' },
  ];

  const appointmentForOptions = [
    { value: 'SELF', label: 'Self' },
    { value: 'FAMILY', label: 'Family Member' },
    { value: 'OTHER', label: 'Someone Else' },
  ];

  const symptoms = [
    { value: 'FEVER', label: 'Fever' },
    { value: 'COUGH', label: 'Cough' },
    { value: 'HEADACHE', label: 'Headache' },
    { value: 'STOMACH', label: 'Stomach Pain' },
    { value: 'OTHER', label: 'Other' },
  ];

  const doctors = useMemo(
    () => [
      { id: 1, name: 'Dr. Smith', specialization: 'General Medicine', clinicId: 1 },
      { id: 2, name: 'Dr. Johnson', specialization: 'Cardiology', clinicId: 1 },
      { id: 3, name: 'Dr. Williams', specialization: 'Pediatrics', clinicId: 2 },
      { id: 4, name: 'Dr. Brown', specialization: 'Dermatology', clinicId: 3 },
    ],
    []
  );

  // Fetch clinics
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        console.log('Starting to fetch clinics...');
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('jwt_token');
        console.log('Using token:', token ? 'Token exists' : 'No token found');

        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await authAxios.get('/get-clinic-basic', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('API response:', response.data);

        // Process the response data
        let clinicsData = [];
        if (response.data) {
          // Handle both array and single object responses
          clinicsData = Array.isArray(response.data) ? response.data : [response.data];

          // Ensure each clinic has the expected properties
          clinicsData = clinicsData.map((clinic, index) => ({
            clinicId: clinic.clinicId || clinic.id || index + 1,
            clinicName: clinic.clinicName || clinic.name || `Clinic ${index + 1}`,
            ...clinic,
          }));
        }

        console.log('Processed clinics:', clinicsData);
        setClinics(clinicsData);
      } catch (err) {
        console.error('Error fetching clinics:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load clinics';
        setError(errorMessage);

        // Set empty array on error to prevent infinite loading
        setClinics([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch clinics if authenticated
    if (isAuthenticated) {
      fetchClinics();
    }
  }, [isAuthenticated]); // Only depend on authentication status

  // Time slots
  const timeSlots = useMemo(() => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
      ['00', '30'].forEach((minutes) => {
        const time = `${hour.toString().padStart(2, '0')}:${minutes}`;
        slots.push({
          id: `slot-${time}`,
          time,
          booked: Math.random() > 0.8, // 20% chance of being booked
        });
      });
    }

    return slots;
  }, []);

  const handleChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when field is updated
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: '',
        }));
      }
    },
    [errors]
  );

  // Set patient name when appointmentFor changes or when patient data loads
  useEffect(() => {
    const fullName = getPatientFullName();
    if (formData.appointmentFor === 'SELF' && fullName) {
      handleChange('appointmentForName', fullName);
    } else if (
      formData.appointmentFor !== 'SELF' &&
      formData.appointmentForName === getPatientFullName()
    ) {
      handleChange('appointmentForName', '');
    }
  }, [formData.appointmentFor, formData.appointmentForName, getPatientFullName, handleChange]);

  const validateCurrentStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.appointmentType) {
        newErrors.appointmentType = 'Appointment type is required';
      }
      if (!formData.appointmentFor) {
        newErrors.appointmentFor = 'Please select who the appointment is for';
      }
      if (formData.appointmentFor !== 'SELF' && !formData.appointmentForName) {
        newErrors.appointmentForName = 'Patient name is required';
      }
      if (!formData.symptom) {
        newErrors.symptom = 'Please select a symptom';
      }
    } else if (currentStep === 2) {
      if (!formData.clinicId) {
        newErrors.clinicId = 'Please select a clinic';
      }
      if (!formData.doctorId) {
        newErrors.doctorId = 'Please select a doctor';
      }
    } else if (currentStep === 3) {
      if (!formData.appointmentDate) {
        newErrors.appointmentDate = 'Please select a date';
      }
      if (!formData.slotId) {
        newErrors.slotId = 'Please select a time slot';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCurrentStep()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, you would make an API call here
      console.log('Submitting appointment:', formData);

      if (onAppointmentBooked) {
        onAppointmentBooked(formData);
      }

      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error booking appointment:', error);
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter doctors based on selected clinic
  useEffect(() => {
    if (formData.clinicId) {
      const filteredDoctors = doctors.filter(
        (doctor) => doctor.clinicId === parseInt(formData.clinicId)
      );
      setAvailableDoctors(filteredDoctors);

      // Reset doctor selection when clinic changes
      if (formData.doctorId) {
        const selectedDoctor = filteredDoctors.find(
          (doc) => doc.id === parseInt(formData.doctorId)
        );

        if (!selectedDoctor) {
          setFormData((prev) => ({
            ...prev,
            doctorId: '',
          }));
        }
      }
    } else {
      setAvailableDoctors([]);

      if (formData.doctorId) {
        setFormData((prev) => ({
          ...prev,
          doctorId: '',
        }));
      }
    }
  }, [formData.clinicId, formData.doctorId, doctors]);

  // Filter time slots based on selected date and doctor
  useEffect(() => {
    if (formData.appointmentDate && formData.doctorId) {
      // In a real app, you would fetch available slots from an API
      // For now, we'll use the mock timeSlots with some randomization
      const filteredSlots = timeSlots.map((slot) => ({
        ...slot,
        booked: Math.random() > 0.8, // 20% chance of being booked
      }));

      setAvailableSlots(filteredSlots);
    } else {
      setAvailableSlots([]);

      if (formData.slotId) {
        setFormData((prev) => ({
          ...prev,
          slotId: '',
        }));
      }
    }
  }, [formData.appointmentDate, formData.doctorId, formData.slotId, timeSlots]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
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
              {errors.appointmentType && (
                <div className="invalid-feedback">{errors.appointmentType}</div>
              )}
            </div>

            <div className="form-group">
              <label>Appointment For</label>
              <div className="radio-group">
                {appointmentForOptions.map((option) => (
                  <div key={option.value} className="radio-item">
                    <input
                      type="radio"
                      id={`appointmentFor-${option.value}`}
                      name="appointmentFor"
                      value={option.value}
                      checked={formData.appointmentFor === option.value}
                      onChange={(e) => handleChange('appointmentFor', e.target.value)}
                    />
                    <label htmlFor={`appointmentFor-${option.value}`}>{option.label}</label>
                  </div>
                ))}
              </div>
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

      case 2:
        return (
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
                      console.log('Selected clinic ID:', e.target.value);
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
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
              {errors.doctorId && <div className="invalid-feedback">{errors.doctorId}</div>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h3>Select Date & Time</h3>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className={`form-control ${errors.appointmentDate ? 'is-invalid' : ''}`}
                value={formData.appointmentDate}
                onChange={(e) => {
                  handleChange('appointmentDate', e.target.value);
                  handleChange('slotId', '');
                }}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.appointmentDate && (
                <div className="invalid-feedback">{errors.appointmentDate}</div>
              )}
            </div>

            <div className="form-group">
              <label>Available Time Slots</label>
              {availableSlots.length > 0 ? (
                <div className="time-slots">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      className={`time-slot-btn ${
                        formData.slotId === slot.id ? 'selected' : ''
                      } ${slot.booked ? 'booked' : ''}`}
                      onClick={() => !slot.booked && handleChange('slotId', slot.id)}
                      disabled={slot.booked}
                    >
                      {slot.time}
                      {slot.booked && <span className="booked-badge">Booked</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="no-slots">
                  {formData.appointmentDate
                    ? 'No available slots for this date. Please select another date.'
                    : 'Please select a date to see available time slots.'}
                </div>
              )}
              {errors.slotId && <div className="invalid-feedback d-block">{errors.slotId}</div>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="login-prompt">
        <AlertCircle size={48} className="alert-icon" />
        <h3>Please log in to book an appointment</h3>
        <p>You need to be logged in to book an appointment.</p>
        <button className="btn btn-primary" onClick={() => (window.location.href = '/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="appointment-success">
        <div className="success-icon">
          <Check size={48} />
        </div>
        <h3>Appointment Booked Successfully!</h3>
        <p>Your appointment has been scheduled successfully.</p>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSubmitSuccess(false);
            setCurrentStep(1);
            setFormData({
              ...formData,
              appointmentType: '',
              appointmentFor: 'SELF',
              appointmentForName: '',
              symptom: '',
              otherSymptoms: '',
              appointmentDate: '',
              clinicId: '',
              doctorId: '',
              slotId: '',
            });
          }}
        >
          Book Another Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="appointment-container">
      <div
        className="logo-container"
        style={{
          textAlign: 'left',
          marginBottom: '20px',
          cursor: 'pointer',
        }}
        onClick={handleLogoClick}
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
      <div className="appointment-form">
        <div className="form-header">
          <h2>Book an Appointment</h2>
          <p>Schedule your visit with our specialists</p>
        </div>

        <div className="progress-bar">
          <div className="progress" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
        </div>

        <div className="step-indicators">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`step-indicator ${currentStep > index + 1 ? 'completed' : ''} ${
                currentStep === index + 1 ? 'active' : ''
              }`}
              onClick={() => currentStep > index + 1 && setCurrentStep(index + 1)}
            >
              {currentStep > index + 1 ? <Check size={16} /> : index + 1}
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

        <div className="form-content" ref={formContentRef}>
          <SwitchTransition mode="out-in">
            <CSSTransition
              key={currentStep}
              nodeRef={formContentRef}
              timeout={300}
              classNames="fade-slide"
            >
              {renderStepContent()}
            </CSSTransition>
          </SwitchTransition>
        </div>

        <div className="form-navigation">
          <div className="nav-buttons">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => navigate('/dashboard')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={prevStep}
                disabled={isSubmitting}
                style={{
                  borderColor: '#4a89dc',
                  color: '#4a89dc',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease-in-out',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f7ff';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.transform = '';
                }}
              >
                <ChevronLeft size={16} className="me-1" /> Previous
              </button>
            )}
          </div>

          <div className="action-buttons">
            {currentStep < totalSteps ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={nextStep}
                disabled={isSubmitting}
              >
                Next <ChevronRight size={16} className="ms-1" />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Booking...
                  </>
                ) : (
                  'Confirm Appointment'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
