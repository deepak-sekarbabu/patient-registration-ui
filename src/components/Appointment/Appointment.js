import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { useAuth } from '../../context/AuthContext';
import { baseApiClient as authAxios } from '../../services/axiosInstance';
import '../../styles/components/Appointment.css';
import { useToast } from '../shared/ToastProvider';
import AppointmentDetailsStep from './AppointmentDetailsStep';
import AppointmentProgress from './AppointmentProgress';
import AppointmentSuccess from './AppointmentSuccess';
import BookSlotStep from './BookSlotStep';
import SelectDoctorStep from './SelectDoctorStep';

const AppointmentForm = ({ onAppointmentBooked }) => {
  const { isAuthenticated, patient } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { showToast } = useToast();

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
      appointmentType: 'CONSULTATION',
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
    { value: 'CONSULTATION', label: 'Consultation' },
    { value: 'FOLLOW_UP', label: 'Follow-up Visit' },
    { value: 'ROUTINE_CHECKUP', label: 'Routine Checkup' },
    { value: 'EMERGENCY', label: 'Emergency' },
    { value: 'VACCINATION', label: 'Vaccination' },
    { value: 'DIAGNOSTIC_TEST', label: 'Diagnostic Test' },
    { value: 'PROCEDURE', label: 'Procedure' },
    { value: 'OTHER', label: 'Other' },
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
    setError(null);

    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare payload: omit appointmentForAge if empty
      const payload = { ...formData };
      if (!payload.appointmentForAge) {
        delete payload.appointmentForAge;
      }

      const response = await authAxios.post('/appointments', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Appointment booked successfully:', response.data);

      // Update formData with the appointment ID from response
      setFormData((prev) => ({
        ...prev,
        appointmentId: response.data.appointmentId,
      }));

      if (onAppointmentBooked) {
        onAppointmentBooked(response.data);
      }

      setSubmitSuccess(true);
      showToast('success', 'Appointment booked successfully!');
    } catch (error) {
      console.error('Error booking appointment:', error);

      // Enhanced error handling
      let errorMessage = 'Failed to book appointment. ';

      if (error.response) {
        // Server responded with an error status
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 401:
            errorMessage = 'Your session has expired. Please log in again.';
            // Optionally redirect to login
            setTimeout(() => navigate('/login'), 2000);
            break;
          case 403:
            errorMessage = 'You do not have permission to book appointments.';
            break;
          case 404:
            errorMessage = 'The selected slot or doctor is no longer available.';
            break;
          case 409:
            errorMessage = 'This time slot has already been booked. Please select another slot.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = data?.message || 'An unexpected error occurred. Please try again.';
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else {
        // Something else happened
        errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      }

      setError(errorMessage);
      showToast('error', errorMessage);

      // If it's a session/authentication error, clear the token
      if (error.response?.status === 401) {
        localStorage.removeItem('jwt_token');
      }
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
          <AppointmentDetailsStep
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            getPatientFullName={getPatientFullName}
            appointmentTypes={appointmentTypes}
            appointmentForOptions={appointmentForOptions}
            symptoms={symptoms}
          />
        );
      case 2:
        return (
          <SelectDoctorStep
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            clinics={clinics}
            availableDoctors={availableDoctors}
            isLoading={isLoading}
            error={error}
          />
        );
      case 3:
        return (
          <BookSlotStep
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            availableDates={availableDates}
            availableSlots={availableSlots}
            isFetchingDates={isFetchingDates}
            dateError={dateError}
            currentTime={currentTime}
            setErrors={setErrors}
          />
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
    return <AppointmentSuccess appointmentId={formData.appointmentId} navigate={navigate} />;
  }

  return (
    <div className="appointment-container">
      <div className="appointment-form">
        <div className="form-header">
          <h2>Book an Appointment</h2>
          <p>Schedule your visit with our specialists</p>
        </div>
        <AppointmentProgress
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepLabels={stepLabels}
          setCurrentStep={setCurrentStep}
        />
        <div
          className="form-content"
          ref={formContentRef}
          role="tabpanel"
          aria-labelledby={`step-label-${currentStep}`}
        >
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
              aria-label="Cancel and return to dashboard"
            >
              Cancel
            </button>
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={prevStep}
                disabled={isSubmitting}
                aria-label="Go to previous step"
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
                aria-label="Go to next step"
              >
                Next <ChevronRight size={16} className="ms-1" />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={isSubmitting}
                aria-label="Confirm and book appointment"
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
