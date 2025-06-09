import { AlertCircle, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { useAuth } from '../../context/AuthContext';
import { baseApiClient as authAxios } from '../../services/axiosInstance';
import '../../styles/components/Appointment.css';

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
  const [currentTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [clinics, setClinics] = useState([]);
  const formContentRef = useRef(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [isFetchingDates, setIsFetchingDates] = useState(false);
  const [dateError, setDateError] = useState(null);

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
      } else if (availableDates.length > 0 && !availableDates.includes(formData.appointmentDate)) {
        newErrors.appointmentDate =
          'Selected date is not available. Please choose from available dates.';
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
    const fetchDoctors = async () => {
      if (!formData.clinicId) {
        setAvailableDoctors([]);
        // Reset doctor selection when clinic changes or is cleared
        setFormData((prev) => ({
          ...prev,
          doctorId: '',
        }));
        return;
      }

      try {
        console.log(`Starting to fetch doctors for clinic ${formData.clinicId}...`);
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('jwt_token');
        console.log('Using token:', token ? 'Token exists' : 'No token found');

        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await authAxios.get(`/get-clinic/${formData.clinicId}/doctors`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('API response for doctors:', response.data);

        let doctorsData = [];
        if (response.data) {
          doctorsData = Array.isArray(response.data) ? response.data : [response.data];
        }

        // Map the response data to match the expected doctor structure if necessary
        const processedDoctors = doctorsData.map((doc) => ({
          id: doc.doctorId,
          name: doc.doctorName,
          clinicId: formData.clinicId,
        }));

        console.log('Processed doctors:', processedDoctors);
        setAvailableDoctors(processedDoctors);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load doctors';
        setError(`Error loading doctors: ${errorMessage}`);
        setAvailableDoctors([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch doctors if authenticated and a clinic is selected
    if (isAuthenticated && formData.clinicId) {
      fetchDoctors();
    } else {
      setAvailableDoctors([]);
      setFormData((prev) => ({
        ...prev,
        doctorId: '',
      }));
    }
  }, [formData.clinicId, isAuthenticated]); // Only depend on clinicId and isAuthenticated

  // Filter time slots based on selected date and doctor
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.appointmentDate || !formData.doctorId || !formData.clinicId) {
        setAvailableSlots([]);
        if (formData.slotId) {
          setFormData((prev) => ({
            ...prev,
            slotId: '',
          }));
        }
        return;
      }

      try {
        console.log(
          `Starting to fetch available slots for date ${formData.appointmentDate}, clinic ${formData.clinicId}, doctor ${formData.doctorId}...`
        );
        setIsLoading(true); // Use isLoading for overall loading, or create a new state if needed
        setError(null); // Clear previous errors

        const token = localStorage.getItem('jwt_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Construct the API URL dynamically
        const apiUrl = `/clinics/${formData.clinicId}/doctors/${formData.doctorId}/slots?date=${formData.appointmentDate}`;
        console.log('Fetching slots from:', apiUrl);

        const response = await authAxios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('API response for available slots:', response.data);

        let slotsData = [];
        if (response.data && response.data.availableSlots) {
          // Assuming the API returns availableSlots as an object with time periods (e.g., NIGHT)
          // and each period contains an array of slots { time: string, slotId: string }
          // Iterate over the keys (e.g., "EVENING") and collect all slot arrays
          for (const key in response.data.availableSlots) {
            if (Object.hasOwnProperty.call(response.data.availableSlots, key)) {
              slotsData = slotsData.concat(response.data.availableSlots[key]);
            }
          }
        }
        setAvailableSlots(slotsData);
      } catch (err) {
        console.error('Error fetching available slots:', err);
        setError('Failed to load available time slots. Please try again.');
        setAvailableSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch slots if date, clinic, and doctor are selected and authenticated
    if (isAuthenticated && formData.appointmentDate && formData.doctorId && formData.clinicId) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      if (formData.slotId) {
        setFormData((prev) => ({
          ...prev,
          slotId: '',
        }));
      }
    }
  }, [
    formData.appointmentDate,
    formData.doctorId,
    formData.clinicId,
    isAuthenticated,
    formData.slotId,
  ]); // Depend on date, doctorId, clinicId, isAuthenticated, and slotId

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchAvailableDates = async () => {
      if (!formData.clinicId || !formData.doctorId) {
        setAvailableDates([]);
        // Reset date and slot selection when clinic or doctor changes
        if (formData.appointmentDate || formData.slotId) {
          setFormData((prev) => ({
            ...prev,
            appointmentDate: '',
            slotId: '',
          }));
        }
        return;
      }

      try {
        console.log(
          `Starting to fetch available dates for clinic ${formData.clinicId}, doctor ${formData.doctorId}...`
        );
        setIsFetchingDates(true);
        setDateError(null);

        const token = localStorage.getItem('jwt_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await authAxios.get(
          `/clinics/${formData.clinicId}/doctors/${formData.doctorId}/available-dates`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('API response for available dates:', response.data);

        // Assuming the API returns an array of date strings in 'YYYY-MM-DD' format
        let datesData = [];
        if (response.data && Array.isArray(response.data)) {
          // Filter out any non-string or invalid date entries if necessary
          datesData = response.data.filter(
            (dateString) => typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)
          );
        } else {
          console.warn(
            'API response for available dates is not an array or is empty:',
            response.data
          );
        }

        console.log('Processed available dates:', datesData);
        setAvailableDates(datesData);

        // Log doctorId after setting available dates
        console.log('formData.doctorId after setting availableDates:', formData.doctorId);

        // Reset date and slot selection if the previously selected date is not in the new list
        if (formData.appointmentDate && !datesData.includes(formData.appointmentDate)) {
          setFormData((prev) => ({
            ...prev,
            appointmentDate: '',
            slotId: '',
          }));
        }
      } catch (err) {
        console.error('Error fetching available dates:', err);
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to load available dates';
        setDateError(`Error loading available dates: ${errorMessage}`);
        setAvailableDates([]); // Set empty array on error
      } finally {
        setIsFetchingDates(false);
      }
    };

    // Only fetch dates if clinic and doctor are selected and authenticated
    if (isAuthenticated && formData.clinicId && formData.doctorId) {
      fetchAvailableDates();
    } else {
      setAvailableDates([]);
      if (formData.appointmentDate || formData.slotId) {
        setFormData((prev) => ({
          ...prev,
          appointmentDate: '',
          slotId: '',
        }));
      }
    }
  }, [
    formData.clinicId,
    formData.doctorId,
    isAuthenticated,
    formData.appointmentDate,
    formData.slotId,
  ]); // Depend on clinicId, doctorId, isAuthenticated, appointmentDate, and slotId

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
                    {doctor.name}
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
            {isFetchingDates ? (
              <div className="d-flex align-items-center p-3">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading available dates...</span>
              </div>
            ) : dateError ? (
              <div className="alert alert-danger">
                <AlertCircle className="mr-2 h-4 w-4" />
                {dateError}
              </div>
            ) : (
              <div className="form-group">
                <label>Available Dates</label>
                {availableDates.length > 0 ? (
                  <div className="date-selection">
                    <div className="available-dates-grid">
                      {availableDates.map((date) => {
                        const dateObj = new Date(date);
                        const formattedDate = dateObj.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        });

                        return (
                          <button
                            key={date}
                            type="button"
                            className={`date-option-btn ${
                              formData.appointmentDate === date ? 'selected' : ''
                            }`}
                            onClick={() => {
                              handleChange('appointmentDate', date);
                              handleChange('slotId', ''); // Reset slot when date changes
                            }}
                          >
                            <div className="date-display">
                              <span className="date-day">{formattedDate}</span>
                              <span className="date-full">{date}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Alternative: Keep the native date input but with validation */}
                    <div className="mt-3">
                      <label className="form-label">Or select date:</label>
                      <input
                        type="date"
                        className={`form-control ${errors.appointmentDate ? 'is-invalid' : ''}`}
                        value={formData.appointmentDate}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          if (availableDates.includes(selectedDate)) {
                            handleChange('appointmentDate', selectedDate);
                            handleChange('slotId', ''); // Reset slot when date changes
                          } else {
                            // Show error or prevent selection
                            setErrors((prev) => ({
                              ...prev,
                              appointmentDate:
                                'This date is not available. Please select from available dates above.',
                            }));
                          }
                        }}
                        min={
                          availableDates.length > 0
                            ? availableDates[0]
                            : new Date().toISOString().split('T')[0]
                        }
                        max={
                          availableDates.length > 0
                            ? availableDates[availableDates.length - 1]
                            : undefined
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="no-dates-available">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    <p>No available dates for this doctor. Please select a different doctor.</p>
                  </div>
                )}
                {errors.appointmentDate && (
                  <div className="invalid-feedback d-block">{errors.appointmentDate}</div>
                )}
              </div>
            )}

            <div className="form-group">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label>Available Time Slots</label>
                <div className="current-time">
                  <strong>Current time:</strong>{' '}
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {availableSlots.length > 0 ? (
                <div className="time-slots">
                  {availableSlots
                    .filter((slot) => {
                      // Combine appointmentDate and slot.time to create a full Date object
                      const [hours, minutes] = slot.time.split(':').map(Number);
                      const slotDateTime = new Date(formData.appointmentDate);
                      slotDateTime.setHours(hours, minutes, 0, 0);

                      // Only show slots that are in the future or current time if today's date is selected
                      // Also ensure that if the date is today, the slot time is in the future
                      const isToday = slotDateTime.toDateString() === currentTime.toDateString();
                      return !isToday || slotDateTime > currentTime;
                    })
                    .map((slot) => {
                      // Determine if the slot is inherently disabled (booked or expired)
                      const isBaseDisabled = slot.booked || slot.isExpired;
                      // Determine if the slot should be unselectable because another slot is selected
                      const isOtherSlotSelected =
                        formData.slotId && formData.slotId !== slot.slotId;

                      const finalIsDisabled = isBaseDisabled || isOtherSlotSelected;

                      const buttonClassName = `time-slot-btn ${
                        formData.slotId === slot.slotId ? 'selected' : ''
                      } ${slot.booked ? 'booked' : ''} ${slot.isExpired ? 'expired' : ''}`;

                      console.log(
                        `Slot ID: ${slot.slotId}, formData.slotId: ${formData.slotId}, Final Disabled: ${finalIsDisabled}, Class Name: ${buttonClassName}`
                      );

                      return (
                        <button
                          key={slot.slotId}
                          type="button"
                          className={buttonClassName}
                          onClick={() => !finalIsDisabled && handleChange('slotId', slot.slotId)}
                          disabled={finalIsDisabled}
                          title={
                            slot.isExpired
                              ? 'This time slot has passed'
                              : slot.booked
                                ? 'Already booked'
                                : ''
                          }
                        >
                          {slot.time}
                          {slot.booked && <span className="badge">Booked</span>}
                          {slot.isExpired && !slot.booked && <span className="badge">Expired</span>}
                        </button>
                      );
                    })}
                </div>
              ) : (
                <div className="no-slots">
                  {isFetchingDates
                    ? 'Loading time slots...'
                    : dateError
                      ? 'Cannot load time slots due to date fetch error.'
                      : formData.appointmentDate
                        ? availableDates.length === 0
                          ? 'No available dates for this doctor.'
                          : 'No available slots for this date. Please select another date.'
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
